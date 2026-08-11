import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';

/**
 * Hand-rolled picking for the immersive scenes.
 *
 * Raycasts on real DOM pointer events against an explicit registry of
 * pickable objects — deterministic, easy to test, and independent of any
 * framework event plumbing (which proved unreliable in embedded browsers).
 * Only one Canvas is ever mounted at a time, so a module-level registry is
 * safe; the picker clears it when its scene unmounts.
 */

export interface PickAction {
  onPick?: () => void;
  /** called with true on hover-in, false on hover-out */
  onHover?: (hovering: boolean) => void;
  /** for InstancedMesh registrations: which instance was clicked */
  onInstancePick?: (instanceId: number) => void;
  /** for InstancedMesh registrations: hovered instance, or null on hover-out */
  onInstanceHover?: (instanceId: number | null) => void;
  maxDist?: number;
  /**
   * Part of a SEATED STATION — the tarot layout, the zodiac wheel, the
   * alchemist's bench, the Tree of Life — rather than part of the room.
   *
   * A visitor sitting at a table is looking past it at a hall full of statues,
   * grimoires and pillars, all of them still under the cursor and still
   * answering clicks: you would reach for a sephirah, miss by a few pixels,
   * and be shown a statue's reading instead, from a table you were supposed to
   * be sitting at. While seated the picker looks at these and nothing else.
   */
  station?: boolean;
}

/**
 * How far a visitor may stand from a TABLE-TOP chart and still touch it.
 *
 * The great orrery is nearly eight metres across, so its plates were all given
 * `maxDist: 30` to stop the far rim being unreachable from the near one. But 30
 * metres is wider than the rotunda: the whole room was inside reach, so the
 * centre table answered clicks and lit up under the cursor from anywhere in the
 * building — including from inside a wing, through the wall. A station is
 * supposed to be something you WALK UP TO.
 *
 * `maxDist` is measured along the ray from the camera to the point hit, not
 * between floor positions, so the budget has to cover standing at one rim and
 * reaching across to the other (2 × radius) plus eye height above the top and a
 * little standoff. That is the whole legitimate range and nothing beyond it.
 */
export function tableReach(radius: number): number {
  return radius * 2 + 1.6;
}

const registry = new Map<THREE.Object3D, PickAction>();

/**
 * Does this mesh STOP THE EYE?
 *
 * The occlusion cast walks the whole graph, and most of what it finds is not a
 * wall: glass, alpha-mapped foliage, glows and light cones all stand between
 * the visitor and something readable without hiding it. A thing blocks sight
 * only if it is a real surface — solid, depth-writing, drawn geometry.
 */
function blocksSight(o: THREE.Object3D): boolean {
  const mesh = o as THREE.Mesh;
  if (!(mesh as unknown as { isMesh?: boolean }).isMesh) return false; // sprites, points, lines
  if (o.userData.seeThrough) return false; // opt-out for props that shouldn't block
  const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  return mats.some((m) => {
    if (!m) return false;
    const mat = m as THREE.Material & { opacity?: number };
    return !mat.transparent && mat.depthWrite !== false && (mat.opacity ?? 1) > 0.95;
  });
}

export function registerPickable(obj: THREE.Object3D, action: PickAction): void {
  registry.set(obj, action);
}

export function unregisterPickable(obj: THREE.Object3D): void {
  registry.delete(obj);
}

/** Is this object — or anything it hangs from — a click target? The static
 *  merger uses this to leave interactive furniture alone: a merged mesh is a
 *  single object and could no longer report which prop was hit. */
export function isPickable(obj: THREE.Object3D): boolean {
  for (let o: THREE.Object3D | null = obj; o; o = o.parent) {
    if (registry.has(o)) return true;
  }
  return false;
}

export function ManualPicker({
  onMiss,
  stationOnly = false,
  occluded,
}: {
  onMiss?: () => void;
  /** while the visitor is seated at a station, the rest of the room is inert */
  stationOnly?: boolean;
  /**
   * Does a WALL stand between the eye and this point? The registry is raycast
   * on its own — the building's masonry is not in it — so without this test a
   * grimoire two halls away was as clickable as the one at arm's length, lit
   * under the cursor and openable straight through the drum. The room plan
   * answers this far more cheaply than raycasting the whole scene would.
   */
  occluded?: (from: THREE.Vector3, to: THREE.Vector3) => boolean;
}) {
  const { camera, gl, scene } = useThree();
  const seated = useRef(stationOnly);
  seated.current = stationOnly;
  const occludedRef = useRef(occluded);
  occludedRef.current = occluded;
  /** set by the picker effect so sitting down can drop a stale hover */
  const dropHover = useRef<(() => void) | null>(null);

  useEffect(() => {
    const el = gl.domElement;
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let downAt: [number, number] | null = null;
    let hovered: THREE.Object3D | null = null;
    let hoveredInstance: number | null = null;
    let lastMove = 0;

    const pick = (
      clientX: number,
      clientY: number,
    ): { object: THREE.Object3D; instanceId: number | null } | null => {
      if (registry.size === 0) return null;
      // seated, the ray is only allowed to see the table in front of you
      const targets = seated.current
        ? [...registry.entries()].filter(([, a]) => a.station).map(([o]) => o)
        : [...registry.keys()];
      if (targets.length === 0) return null;
      const rect = el.getBoundingClientRect();
      ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObjects(targets, false)[0];
      if (!hit) return null;
      const action = registry.get(hit.object);
      if (!action || hit.distance > (action.maxDist ?? Infinity)) return null;
      if (occludedRef.current?.(raycaster.ray.origin, hit.point)) return null;
      if (blocked(raycaster, hit)) return null;
      return { object: hit.object, instanceId: hit.instanceId ?? null };
    };

    /**
     * Is a SOLID SURFACE standing in front of the thing we just hit?
     *
     * The registry is raycast on its own, so until this the building was made
     * of glass to the cursor: a grimoire could be opened through the wooden
     * case it stands behind, a statue through the drum, a plate through a hall
     * wall. The room-plan test above catches masonry cheaply, but it knows
     * nothing about FURNITURE — a shelf case's side panel is not a wall — so
     * the last word has to come from the geometry itself.
     *
     * Cost is kept down by capping the ray at the target: `far` prunes every
     * bounding sphere beyond it before a single triangle is tested, which is
     * nearly the whole building for a book at arm's length. The target itself
     * and anything hanging off it are ignored — a thing cannot hide itself.
     */
    const blocked = (
      raycaster: THREE.Raycaster,
      hit: THREE.Intersection,
    ): boolean => {
      const far = raycaster.far;
      raycaster.far = hit.distance - 0.02;
      let out = false;
      try {
        for (const front of raycaster.intersectObjects(scene.children, true)) {
          if (!blocksSight(front.object)) continue;
          let own = false;
          for (let o: THREE.Object3D | null = front.object; o; o = o.parent)
            if (o === hit.object) own = true;
          if (own) continue;
          out = true;
          break;
        }
      } finally {
        raycaster.far = far;
      }
      return out;
    };

    const setHover = (hit: { object: THREE.Object3D; instanceId: number | null } | null) => {
      const obj = hit?.object ?? null;
      const inst = hit?.instanceId ?? null;
      if (obj === hovered && inst === hoveredInstance) return;
      if (hovered) {
        const prev = registry.get(hovered);
        if (prev?.onInstanceHover) prev.onInstanceHover(null);
        else prev?.onHover?.(false);
      }
      if (obj) {
        const next = registry.get(obj);
        if (next?.onInstanceHover) next.onInstanceHover(inst);
        else next?.onHover?.(true);
      }
      document.body.style.cursor = obj ? 'pointer' : 'auto';
      hovered = obj;
      hoveredInstance = inst;
    };

    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastMove < 70) return;
      lastMove = now;
      setHover(pick(e.clientX, e.clientY));
    };
    const onDown = (e: PointerEvent) => {
      downAt = [e.clientX, e.clientY];
    };
    const onUp = (e: PointerEvent) => {
      if (!downAt) return;
      const moved = Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]);
      downAt = null;
      if (moved > 6) return; // a look-drag, not a click
      const hit = pick(e.clientX, e.clientY);
      const action = hit ? registry.get(hit.object) : undefined;
      if (action?.onInstancePick && hit?.instanceId != null) action.onInstancePick(hit.instanceId);
      else if (action?.onPick) action.onPick();
      else onMiss?.();
    };

    dropHover.current = () => setHover(null);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointerup', onUp);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointerup', onUp);
      document.body.style.cursor = 'auto';
      dropHover.current = null;
      registry.clear();
    };
    // deliberately NOT dependent on `stationOnly` — this effect's cleanup
    // clears the whole registry, so re-running it on every sit-down would
    // unregister every pickable in the building. The flag is read live through
    // the ref instead.
    // (`scene` is stable for the life of a Canvas, so listing it cannot cause
    // the registry-clearing re-run described above)
  }, [camera, gl, scene, onMiss]);

  // sitting down (or standing up) lets go of whatever was lit under the cursor
  // — otherwise the statue you were looking at when you sat stays warmed for
  // as long as you are at the table
  useEffect(() => {
    dropHover.current?.();
  }, [stationOnly]);

  return null;
}
