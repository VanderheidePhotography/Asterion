import { useRef } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { useFrame, useThree } from '@react-three/fiber';
import { isPickable } from './ManualPicker';

/**
 * Collapse the building's static dressing into a handful of draw calls.
 *
 * This is the fix for the sustained frame cost. The scene is draw-call bound —
 * rendering it at 3.3× the pixels costs only ~50% more — and from the middle of
 * the rotunda a frame submits ~1500 draws, of which roughly 72% carry FEWER
 * THAN FIFTY TRIANGLES. Candlesticks, inkwells, book spines, ivy sprigs: each
 * one a full material bind and uniform upload to put a thumbnail of geometry on
 * screen. Nothing about that is fixable by lowering resolution or cutting
 * lights; the only cure is to stop issuing the calls.
 *
 * So once the scene has settled, every small mesh that is provably STATIC and
 * provably NOT INTERACTIVE is baked into a shared geometry with its neighbours
 * and drawn as one object. The originals stay in the graph but hidden, so
 * nothing that holds a reference to them breaks.
 *
 * Four conditions have to hold before a mesh is taken, and each one exists
 * because violating it produced a real bug:
 *
 *   STATIC     — its world matrix must be unchanged across several checks.
 *                A flickering candle or a turning orrery wheel baked into a
 *                shared buffer would freeze in place.
 *   UNPICKABLE — `isPickable` must be false for it and all its ancestors.
 *                ManualPicker raycasts an explicit registry non-recursively, so
 *                a merged mesh could no longer say WHICH prop was clicked.
 *   PLAIN      — no skinning, no morph targets, no instancing: those carry
 *                per-object GPU state that a merge cannot represent.
 *   CLUSTERED  — merging is per material AND per spatial cell, never
 *                building-wide. One giant mesh spanning the whole museum can
 *                never be frustum-culled, which trades a draw-call win for a
 *                far worse vertex cost. Cells keep culling meaningful.
 */

/**
 * Only small meshes are worth taking; a big one already earns its draw call.
 *
 * Raised hard (3000 -> 20000) once an ablation sweep settled what a draw
 * actually costs here (that probe has since been removed with the rest of the
 * dev instrumentation; the numbers it produced are recorded below). On the user's machine: BASELINE 26.6 ms, UNLIT 8.3 ms at the SAME
 * draw count, and HALF-PIXELS 26.0 ms — i.e. essentially nothing in this frame
 * is per-pixel, and ~18 ms of it is the light-uniform block being re-uploaded on
 * every distinct material bind. That cost is `lights × binds`. Halving the
 * lights (see lightPool.tsx) bought 2.5×; halving the BINDS is the same size of
 * win, and unlike the lights it is completely invisible.
 *
 * Triangles remain nearly free — 1.2 M of them is nothing for this GPU, which
 * the probe shows sitting idle while the CPU drowns in submissions. So trading
 * triangles for draws is the right trade at almost any exchange rate.
 */
const MAX_TRIS = 20000;

/**
 * Edge of the spatial bucket, in metres. Also raised (45 -> 70).
 *
 * Cells exist to keep frustum culling meaningful: one building-wide mesh can
 * never be culled. But culling saves VERTEX and FRAGMENT work, and the probe
 * says this scene is bound by neither — HALF-PIXELS moved the frame by 0.6 ms.
 * So coarser cells trade something worth nothing here for draws, which are the
 * only thing worth anything.
 */
const CELL = 70;

/** a group must save at least this many draws to be worth merging at all */
const MIN_GROUP = 2;

/** how many stable checks before an object counts as static */
const STABLE_CHECKS = 3;

/** seconds between checks */
const INTERVAL = 1.2;

/** give the scene this long to finish streaming before the first merge */
const SETTLE_AFTER = 6;

type Candidate = { mesh: THREE.Mesh; key: string };

function triCount(g: THREE.BufferGeometry): number {
  return g.index ? g.index.count / 3 : (g.attributes.position?.count ?? 0) / 3;
}

/** geometries can only merge when they carry the SAME attribute set, so the
 *  attribute names are part of the grouping key */
function attrKey(g: THREE.BufferGeometry): string {
  return Object.keys(g.attributes).sort().join(',') + (g.index ? '|i' : '');
}

function eligible(m: THREE.Mesh): boolean {
  if (!m.isMesh) return false;
  const anyM = m as THREE.Mesh & { isInstancedMesh?: boolean; isSkinnedMesh?: boolean; isBatchedMesh?: boolean };
  if (anyM.isInstancedMesh || anyM.isSkinnedMesh || anyM.isBatchedMesh) return false;
  if (Array.isArray(m.material)) return false; // multi-material needs groups
  const g = m.geometry;
  if (!g || !g.attributes.position) return false;
  if (g.morphAttributes && Object.keys(g.morphAttributes).length > 0) return false;
  if (triCount(g) > MAX_TRIS) return false;
  if (m.userData.noMerge) return false;
  return !isPickable(m);
}

export function StaticMerge({ enabled = true }: { enabled?: boolean }) {
  const { scene } = useThree();
  const elapsed = useRef(0);
  const sinceCheck = useRef(0);
  const done = useRef(false);
  /** world-matrix fingerprint per mesh, and how many checks it has held */
  const seen = useRef(new Map<THREE.Mesh, { sig: string; hits: number }>());

  useFrame((_, delta) => {
    if (!enabled || done.current) return;
    elapsed.current += delta;
    if (elapsed.current < SETTLE_AFTER) return;
    sinceCheck.current += delta;
    if (sinceCheck.current < INTERVAL) return;
    sinceCheck.current = 0;

    // ——— pass 1: find meshes whose transform has stopped moving ———
    const stable: THREE.Mesh[] = [];
    scene.updateMatrixWorld(true);
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!eligible(m)) return;
      const sig = m.matrixWorld.elements.map((n) => n.toFixed(3)).join(',');
      const prev = seen.current.get(m);
      if (prev && prev.sig === sig) {
        prev.hits++;
        if (prev.hits >= STABLE_CHECKS) stable.push(m);
      } else {
        seen.current.set(m, { sig, hits: 1 });
      }
    });
    if (stable.length === 0) return;

    // ——— pass 2: bucket by material, attribute set and spatial cell ———
    const groups = new Map<string, Candidate[]>();
    const p = new THREE.Vector3();
    for (const m of stable) {
      const mat = m.material as THREE.Material;
      m.getWorldPosition(p);
      const cell = `${Math.floor(p.x / CELL)}_${Math.floor(p.y / CELL)}_${Math.floor(p.z / CELL)}`;
      const key = `${mat.uuid}|${attrKey(m.geometry)}|${cell}`;
      const list = groups.get(key);
      if (list) list.push({ mesh: m, key });
      else groups.set(key, [{ mesh: m, key }]);
    }

    // ——— pass 3: bake each worthwhile group into one mesh ———
    for (const list of groups.values()) {
      if (list.length < MIN_GROUP) continue;
      const parts: THREE.BufferGeometry[] = [];
      const taken: THREE.Mesh[] = [];
      for (const { mesh } of list) {
        // bake the world transform in; the merged mesh sits at the origin
        const g = mesh.geometry.clone().applyMatrix4(mesh.matrixWorld);
        // merging needs identical attribute sets — drop anything extra
        for (const name of Object.keys(g.attributes)) {
          if (!['position', 'normal', 'uv'].includes(name)) g.deleteAttribute(name);
        }
        if (!g.attributes.normal) g.computeVertexNormals();
        parts.push(g);
        taken.push(mesh);
      }
      const combined = parts.length > 1 ? mergeGeometries(parts, false) : null;
      parts.forEach((g) => g.dispose());
      if (!combined) continue;

      const mesh = new THREE.Mesh(combined, taken[0].material as THREE.Material);
      mesh.name = 'merged-static';
      mesh.matrixAutoUpdate = false;
      mesh.castShadow = false;
      mesh.receiveShadow = taken[0].receiveShadow;
      mesh.renderOrder = taken[0].renderOrder;
      scene.add(mesh);

      for (const m of taken) {
        m.visible = false;
        // so SceneWarmup does not un-hide these when it force-reveals the graph
        m.userData.mergedAway = true;
      }
    }

    done.current = true;
    seen.current.clear();
  });

  return null;
}
