import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { getMaterial } from '../../../materials';
import { mulberry32 } from '../../../domain/random';
import { DRUM_FACE_R } from './structure';

/**
 * THE UPPER GALLERY.
 *
 * The drum used to run from the shelves straight to the dome springing — eight
 * metres of blank wall doing nothing. A room only reads as tall if the eye is
 * given somewhere to stop on the way up, and there was nothing between the
 * bookcases and the sky.
 *
 * A mezzanine fixes that better than any amount of decoration, because it is
 * INHABITED space. From the floor you see the underside of a walkway, the
 * silhouettes of more shelving above you, and the fact that the collection
 * continues past where you can reach. That is what makes a library feel like it
 * belongs to generations rather than to a display budget.
 *
 * ── where it sits ──────────────────────────────────────────────────────────
 * Not two-thirds up, though that was the instinct. The ten drum openings are
 * true semicircles springing at 9.40 m, and the widest of them — a wing mouth,
 * half-width 3.69 m — crowns at 13.09 m. A deck at 11 m would have sliced
 * through every arch in the building.
 *
 * So the gallery sits ON the order rather than through it: a moulded cornice at
 * 13.10–13.42 closing the arcade, the deck soffit starting exactly where that
 * cornice ends, and the walking surface at 13.78. That is how a real arcaded
 * rotunda stacks, and it leaves 2.2 m of headroom to the drum head at 17 —
 * tight, correct, and the reason the upper level feels like a place you could
 * stand rather than a shelf glued to a wall.
 */

/** top of the walking surface */
const DECK_Y = 13.78;
/** underside of the deck slab — the cornice below runs up to meet it */
const SOFFIT_Y = 13.42;
/** how far the gallery projects in from the drum face */
const DEPTH = 1.95;
/** the balustrade's line: the deck's inner edge */
const RAIL_R = DRUM_FACE_R - DEPTH;
const RAIL_H = 1.02;

/** The handrail's line and its top, exported so the creepers that spill over it
 *  hang on the rail itself rather than on a number copied out of this file. */
export const GALLERY_RAIL_R = RAIL_R;
export const GALLERY_RAIL_Y = DECK_Y + RAIL_H;

const SEG = 96;

/* ————— the deck slab ————— */

/**
 * Deck, outer edge and soffit as ONE lathe. The profile is a closed C traced
 * inner-soffit → outer-soffit → outer-edge → deck-top, revolved — so the
 * underside a visitor actually looks at from the rotunda floor is real
 * geometry, not a hole. A ring drawn as a single annulus is invisible from
 * below, which is precisely the view that matters here.
 */
function deckGeometry(): THREE.LatheGeometry {
  const profile = [
    new THREE.Vector2(RAIL_R, SOFFIT_Y),
    new THREE.Vector2(DRUM_FACE_R, SOFFIT_Y),
    new THREE.Vector2(DRUM_FACE_R, DECK_Y),
    new THREE.Vector2(RAIL_R, DECK_Y),
    new THREE.Vector2(RAIL_R, SOFFIT_Y),
  ];
  return new THREE.LatheGeometry(profile, SEG);
}

/** the moulded cornice closing the arcade below, in three diminishing stages */
function corniceGeometry(): THREE.LatheGeometry {
  const profile = [
    new THREE.Vector2(DRUM_FACE_R - 0.02, 12.98),
    new THREE.Vector2(DRUM_FACE_R - 0.46, 13.06),
    new THREE.Vector2(DRUM_FACE_R - 0.44, 13.2),
    new THREE.Vector2(DRUM_FACE_R - 0.66, 13.28),
    new THREE.Vector2(DRUM_FACE_R - 0.64, 13.42),
    new THREE.Vector2(DRUM_FACE_R - 0.02, 13.42),
  ];
  return new THREE.LatheGeometry(profile, SEG);
}

/** the rails: a moulded handrail and the shoe the balusters stand in */
function railGeometry(y: number, r: number, h: number, thick: number): THREE.LatheGeometry {
  const profile = [
    new THREE.Vector2(r - thick, y),
    new THREE.Vector2(r + thick, y),
    new THREE.Vector2(r + thick, y + h),
    new THREE.Vector2(r - thick, y + h),
    new THREE.Vector2(r - thick, y),
  ];
  return new THREE.LatheGeometry(profile, SEG);
}

/* ————— instanced parts ————— */

function Instanced({
  geom,
  mat,
  items,
}: {
  geom: THREE.BufferGeometry;
  mat: THREE.Material;
  items: { pos: [number, number, number]; rotY: number; scale?: [number, number, number] }[];
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const d = new THREE.Object3D();
    items.forEach((it, i) => {
      d.position.set(...it.pos);
      d.rotation.set(0, it.rotY, 0);
      if (it.scale) d.scale.set(...it.scale);
      else d.scale.set(1, 1, 1);
      d.updateMatrix();
      ref.current!.setMatrixAt(i, d.matrix);
    });
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [items]);
  return <instancedMesh ref={ref} args={[geom, mat, items.length]} frustumCulled={false} castShadow={false} />;
}

export function RotundaGallery() {
  const oak = useMemo(() => getMaterial('wood_rotunda_timber', { repeat: [12, 1] }), []);
  const walnut = useMemo(() => getMaterial('wood_walnut_ancient', { repeat: [16, 1] }), []);
  const wainscot = useMemo(() => getMaterial('wood_rotunda_wainscot', { repeat: [24, 1] }), []);

  const deck = useMemo(deckGeometry, []);
  const cornice = useMemo(corniceGeometry, []);
  const handrail = useMemo(() => railGeometry(DECK_Y + RAIL_H, RAIL_R, 0.1, 0.075), []);
  const shoe = useMemo(() => railGeometry(DECK_Y + 0.04, RAIL_R, 0.11, 0.06), []);

  const balusterGeom = useMemo(() => new THREE.CylinderGeometry(0.038, 0.05, RAIL_H - 0.15, 7), []);
  const corbelGeom = useMemo(() => new THREE.BoxGeometry(0.22, 0.62, 0.72), []);

  /**
   * The balusters — and the point at which this stops being a CAD model.
   *
   * A perfect ring of 168 identical turned posts is the single most synthetic
   * thing that could go here. So: every post is nudged a few millimetres off
   * its station and a few percent off its height, three of them are missing
   * outright, and the gaps are not evenly spaced. Someone broke those and
   * nobody has got round to it. The deterministic seed means the same three are
   * missing every visit, which is what makes it read as damage rather than as
   * noise.
   */
  const balusters = useMemo(() => {
    const rng = mulberry32(4211);
    const N = 168;
    const out: { pos: [number, number, number]; rotY: number; scale?: [number, number, number] }[] = [];
    const missing = new Set([37, 38, 119]);
    for (let i = 0; i < N; i++) {
      if (missing.has(i)) continue;
      const a = (i / N) * Math.PI * 2 + (rng() - 0.5) * 0.004;
      const r = RAIL_R + (rng() - 0.5) * 0.012;
      out.push({
        pos: [Math.cos(a) * r, DECK_Y + 0.09 + (RAIL_H - 0.15) / 2, Math.sin(a) * r],
        rotY: -a,
        scale: [1, 0.985 + rng() * 0.03, 1],
      });
    }
    return out;
  }, []);

  /** carved brackets carrying the deck. A gallery with no visible means of
   *  support reads as a floating disc — these are what make it weigh something. */
  const corbels = useMemo(() => {
    const rng = mulberry32(907);
    const N = 40;
    const out: { pos: [number, number, number]; rotY: number; scale?: [number, number, number] }[] = [];
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const r = DRUM_FACE_R - 0.34;
      out.push({
        pos: [Math.cos(a) * r, 12.68, Math.sin(a) * r],
        rotY: -a,
        scale: [1, 0.94 + rng() * 0.12, 1],
      });
    }
    return out;
  }, []);

  /**
   * The shelving on the gallery. Deliberately NOT modelled as books — from the
   * floor, fourteen metres below and mostly in shadow, an upper stack reads as
   * a dark mass with a lit top edge and nothing more. Boxes with a brass nosing
   * give exactly that silhouette for 26 instances instead of several thousand,
   * and the ambiguity is the point: you cannot quite make out what is up there,
   * which is the whole reason to put it there.
   */
  const stacks = useMemo(() => {
    const rng = mulberry32(1553);
    const out: { pos: [number, number, number]; rotY: number; scale?: [number, number, number] }[] = [];
    const N = 26;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2 + 0.06;
      // leave the four wing axes clear so the gallery reads as walkable through
      const nearAxis = [0, 1, 2, 3].some((k) => Math.abs(((a - (Math.PI / 4 + (k * Math.PI) / 2) + Math.PI) % (Math.PI * 2)) - Math.PI) < 0.12);
      if (nearAxis) continue;
      const r = DRUM_FACE_R - 0.52;
      const h = 1.6 + rng() * 0.5;
      out.push({
        pos: [Math.cos(a) * r, DECK_Y + h / 2, Math.sin(a) * r],
        rotY: -a,
        scale: [1, h / 1.85, 0.86 + rng() * 0.28],
      });
    }
    return out;
  }, []);
  const stackGeom = useMemo(() => new THREE.BoxGeometry(1.15, 1.85, 0.5), []);

  /**
   * Lamps along the rail. Without them the gallery was architecturally correct
   * and visually absent — a dark band against a dark wall, which is a level
   * nobody registers as a level.
   *
   * Only every third one carries a real light. Lights are the scene's most
   * expensive resource and eleven more of them around the drum is not affordable
   * — but an unlit emissive bead reads as the SOURCE perfectly well from
   * fourteen metres below, and what sells a lit gallery is seeing the line of
   * points receding round the curve, not their falloff.
   */
  const lamps = useMemo(() => {
    const rng = mulberry32(3307);
    const N = 12;
    return Array.from({ length: N }, (_, i) => {
      const a = (i / N) * Math.PI * 2 + 0.26;
      const r = RAIL_R - 0.06;
      return {
        key: i,
        pos: [Math.cos(a) * r, DECK_Y + RAIL_H + 0.3, Math.sin(a) * r] as [number, number, number],
        // Only every third lamp is a real light, and even that is a concession:
        // the scene already carries 33, and in a forward renderer every lit
        // pixel of all 1600-odd draw calls pays for every one of them.
        lit: i % 3 === 0,
        // not every lamp is trimmed to the same height; someone does these by hand
        warm: 0.85 + rng() * 0.3,
      };
    });
  }, []);

  const lampMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#ffcf8a', toneMapped: false }),
    [],
  );
  const lampGeom = useMemo(() => new THREE.SphereGeometry(0.075, 8, 8), []);

  useLayoutEffect(
    () => () => {
      [deck, cornice, handrail, shoe, balusterGeom, corbelGeom, stackGeom, lampGeom].forEach((g) =>
        g.dispose(),
      );
      lampMat.dispose();
    },
    [deck, cornice, handrail, shoe, balusterGeom, corbelGeom, stackGeom, lampGeom, lampMat],
  );

  return (
    <group>
      {/* the arcade's cornice, and the deck sitting on it */}
      <mesh geometry={cornice} material={oak} />
      <mesh geometry={deck} material={wainscot} />
      <Instanced geom={corbelGeom} mat={oak} items={corbels} />

      {/* the balustrade */}
      <mesh geometry={shoe} material={walnut} />
      <Instanced geom={balusterGeom} mat={walnut} items={balusters} />
      <mesh geometry={handrail} material={walnut} />

      {/* what is up there, mostly unreadable on purpose */}
      <Instanced geom={stackGeom} mat={wainscot} items={stacks} />

      {/* the lamps that make the level exist */}
      {lamps.map((l) => (
        <group key={l.key} position={l.pos}>
          <mesh geometry={lampGeom} material={lampMat} />
          {l.lit && (
            <pointLight color="#ffbe72" intensity={13 * l.warm} distance={11} decay={2} />
          )}
        </group>
      ))}
    </group>
  );
}
