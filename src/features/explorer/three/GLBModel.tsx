import { useEffect, useMemo, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { LEAN_TEXTURES } from './textureBudget';
import { useFrame } from '@react-three/fiber';

/**
 * Generic loader for the real glTF props (wizard, cat, statue, …).
 * Sourced as CC0 / CC-BY low-poly models — see public/models/CREDITS.md.
 *
 * Poly models come in wildly different scales and origins, so every model is
 * auto-normalised: scaled to a target height and dropped so its feet rest on
 * the floor and it is centred over its (x,z) spot. The AnimationMixer is
 * driven by hand (drei's useAnimations warns under React 19). Always mount
 * inside <Suspense> with a procedural fallback so a slow load never breaks
 * the scene.
 */
export function GLBModel({
  src,
  targetHeight,
  position,
  rotationY = 0,
  still = false,
  animate = true,
  highlightRef,
}: {
  src: string;
  targetHeight: number;
  position: [number, number];
  rotationY?: number;
  still?: boolean;
  animate?: boolean;
  /** 0‥1 warmth to wash the model in — a hover/selection highlight. When set,
   *  the model's materials are cloned so this instance can be tinted without
   *  touching the shared glTF cache. */
  highlightRef?: RefObject<number>;
}) {
  const { scene, animations } = useGLTF(src);

  const model = useMemo(() => {
    const root = scene.clone(true);
    root.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3();
    box.getSize(size);
    const s = targetHeight / (size.y || 1);
    root.scale.setScalar(s);
    root.updateMatrixWorld(true);
    const box2 = new THREE.Box3().setFromObject(root);
    root.position.y -= box2.min.y; // feet on the floor
    root.position.x -= (box2.min.x + box2.max.x) / 2; // centre over the spot
    root.position.z -= (box2.min.z + box2.max.z) / 2;
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.frustumCulled = false;
      // own the materials so a hover tint never bleeds into the shared cache
      if (highlightRef) {
        m.material = Array.isArray(m.material)
          ? m.material.map((mm) => mm.clone())
          : m.material.clone();
      }
    });
    return root;
    // highlightRef is a stable ref; cloning only needs to react to model swaps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, targetHeight]);

  // free the cloned materials when the model is swapped out or unmounted
  useEffect(() => {
    if (!highlightRef) return;
    return () => {
      model.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        (Array.isArray(m.material) ? m.material : [m.material]).forEach((mm) => mm.dispose());
      });
    };
  }, [model, highlightRef]);

  const mixer = useMemo(() => new THREE.AnimationMixer(model), [model]);
  useEffect(() => {
    if (!animate || animations.length === 0) return;
    const action = mixer.clipAction(animations[0]);
    action.reset().play();
    return () => {
      action.stop();
      mixer.stopAllAction();
    };
  }, [mixer, animations, animate]);
  /** the emissive materials, gathered once, so the hover wash does not re-walk
   *  the carving's whole node tree on every frame of every statue */
  const tinted = useMemo(() => {
    if (!highlightRef) return [];
    const out: THREE.MeshStandardMaterial[] = [];
    model.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      for (const mm of Array.isArray(m.material) ? m.material : [m.material]) {
        const sm = mm as THREE.MeshStandardMaterial;
        if (sm.emissive) out.push(sm);
      }
    });
    return out;
  }, [model, highlightRef]);

  const lastK = useRef(-1);
  useFrame((_, delta) => {
    if (animate && !still) mixer.update(delta);
    // wash the carving in a warm glow proportional to the hover value. Writing
    // it only when the value actually moves keeps a statue nobody is looking at
    // — which is nearly all of them, nearly all the time — entirely free.
    if (!highlightRef) return;
    const k = highlightRef.current;
    if (k === lastK.current) return;
    lastK.current = k;
    for (const sm of tinted) {
      // a gentle warm lift — enough to read as "selected", not so much it
      // blows the textured carving out to a white silhouette
      sm.emissive.setRGB(0.14 * k, 0.1 * k, 0.05 * k);
      sm.emissiveIntensity = 1;
    }
  });

  return (
    <group position={[position[0], 0, position[1]]} rotation-y={rotationY}>
      <primitive object={model} />
    </group>
  );
}

/**
 * Every carved figure in the building, fetched up front.
 *
 * This used to list eight of them, because the models were 30–50 MB each and
 * preloading the set would have meant a third of a gigabyte before the first
 * frame. Now that their textures are re-encoded (scripts/optimize-models.mjs)
 * they are under 2 MB apiece, so the whole statuary is ~25 MB — cheap enough to
 * take at load, and worth taking there: a figure that arrives while the visitor
 * is walking toward it lands as a hitch, because its shader links and its
 * textures upload on the frame it first draws.
 *
 * `statue` and `cat` came off this list with the figures themselves: the two
 * entrance guardians (statue.glb reads as an armoured knight) and the house cat
 * are gone from the scene, and preloading a model nothing mounts is 2 MB of
 * download spent before the first frame for nothing.
 */
/**
 * ON A PHONE, PRELOAD ONLY THE FIGURE YOU MEET FIRST.
 *
 * Preloading all fourteen is 13 MB fetched, parsed and uploaded before the
 * first frame — on a laptop that is a moment nobody notices, and on a phone
 * over cellular it is most of the wait before the doors open. The warmup is
 * already off on lean devices for the same reason (the peak it creates), so
 * the models stream too: the wizard by the hearth is the only one visible
 * from the arrival, and the rest arrive as you turn to them.
 *
 * The cost is a possible pop-in on first approach. The alternative is a
 * visitor who leaves before the building loads, which is not a trade.
 */
const PRELOAD = LEAN_TEXTURES
  ? ['wizard']
  : [
  'wizard',
  // the card-catalogue station in the north apse
  'librarian',
  // the drum piers
  'hermes',
  'enoch',
  'leontocephaline',
  'prometheus',
  'sophia',
  'melchizedek',
  'zoroaster',
  'orpheus',
  // the apse pair and the two great pillars
  'isis',
  'serapis',
  'boaz',
  'jachin',
];

for (const m of PRELOAD) {
  useGLTF.preload(`/models/${m}.glb`);
}
