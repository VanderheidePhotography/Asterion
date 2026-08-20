import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { LEAN_TEXTURES, leanModelPath } from './textureBudget';
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
/** seconds for a streamed carving to come up through the figure standing for it */
const FADE_S = 0.55;

export function GLBModel({
  src,
  targetHeight,
  position,
  rotationY = 0,
  still = false,
  animate = true,
  highlightRef,
  beneath,
  fadeIn = false,
  onReady,
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
  /** what stood here while the model streamed — kept underneath and dissolved
   *  through, rather than cut away the frame the glTF resolves */
  beneath?: ReactNode;
  /** dissolve up from nothing rather than cutting in, with no stand-in under
   *  it. `beneath` implies this; a caller that shows nothing while the model
   *  streams — every figure on a phone, see statues.tsx — asks for it here. */
  fadeIn?: boolean;
  /** the glTF has landed and this component is mounted — how the download
   *  queue learns its slot is free (see modelQueue) */
  onReady?: () => void;
}) {
  // a phone gets the decimated twin where one was built — see leanModelPath.
  // Done here rather than at every call site so no future figure can be added
  // that quietly serves a desktop's megabyte to a phone.
  const { scene, animations } = useGLTF(leanModelPath(src));
  // `beneath` is a fresh element on every parent render, so it can never be a
  // dependency: as one it re-ran the dissolve's setup (re-capturing the target
  // opacity as the 0 it had just written, leaving every carving permanently
  // invisible) and re-ran the material-dispose cleanup under a live model.
  // Only whether there IS something beneath is stable, and it is all that
  // either of them actually needs to know.
  // `beneath` still implies a dissolve, so no desktop caller changes; `fadeIn`
  // is the same dissolve with nothing standing under it
  const dissolving = Boolean(beneath) || fadeIn;

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
      // own the materials so neither a hover tint nor the arrival dissolve
      // bleeds into the shared glTF cache — both write to them per instance
      if (highlightRef || dissolving) {
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
    if (!highlightRef && !dissolving) return;
    return () => {
      model.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        (Array.isArray(m.material) ? m.material : [m.material]).forEach((mm) => mm.dispose());
      });
    };
  }, [model, highlightRef, dissolving]);

  /*
   * We only reach here once `useGLTF` has resolved, so this effect firing IS
   * the model having been fetched, decoded and built — which is exactly when
   * the queue behind us can start the next one. Deliberately not waiting for
   * the dissolve to finish: the download is over, and holding the slot for
   * another half second of fading would idle the connection.
   */
  useEffect(() => {
    onReady?.();
    // once per mounted model. `onReady` is a fresh closure every render and
    // re-firing it would hand the same slot back again and again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  /**
   * A CARVING ARRIVES BY DISSOLVING INTO THE STONE THAT STOOD FOR IT.
   *
   * Ten of the fourteen figures now stream in after the doors open (see
   * PRELOAD), and a glTF resolving used to be a hard cut: the procedural stone
   * figure was the Suspense fallback, so the moment the model landed the
   * fallback was unmounted and the carving appeared in its place, in view, in
   * one frame. That single-frame swap is most of what "it loads in while it is
   * still rendering" looks like.
   *
   * So the model comes up from nothing over FADE_S while the figure it replaces
   * is still standing underneath it — `beneath` is that figure, handed in by
   * the caller rather than left to Suspense, and dropped once the carving is
   * opaque. The two occupy the same volume, so what the eye gets is a statue
   * gaining its detail rather than a statue being swapped.
   */
  const fade = useRef(0);
  const [arrived, setArrived] = useState(!dissolving);
  const faded = useMemo(() => {
    const out: { mat: THREE.Material; wasTransparent: boolean; opacity: number }[] = [];
    if (!dissolving) return out;
    model.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      for (const mm of Array.isArray(m.material) ? m.material : [m.material]) {
        out.push({ mat: mm, wasTransparent: mm.transparent, opacity: mm.opacity });
        mm.transparent = true;
        mm.opacity = 0;
      }
    });
    return out;
  }, [model, dissolving]);

  const lastK = useRef(-1);
  useFrame((_, delta) => {
    if (animate && !still) mixer.update(delta);
    if (faded.length && fade.current < 1) {
      fade.current = Math.min(1, fade.current + delta / FADE_S);
      for (const f of faded) f.mat.opacity = f.opacity * fade.current;
      if (fade.current >= 1) {
        // sorting a transparent material costs every frame forever; the flag
        // only ever existed for the dissolve, so it goes back the way it was
        for (const f of faded) f.mat.transparent = f.wasTransparent;
        setArrived(true);
      }
    }
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
      {!arrived && beneath}
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
/**
 * AND ON A DESKTOP, ONLY WHAT STANDS IN THE ARRIVAL SIGHTLINE.
 *
 * The list below used to be all fourteen on anything that was not a phone —
 * about 13 MB fetched and meshopt-decoded at module evaluation, which is to
 * say in the same stretch of main thread that is trying to build the hall.
 * A desktop on a fast line swallows it; a desktop on a hotel connection wears
 * the whole 13 MB before the doors open, for statues that are behind the
 * visitor or across the building.
 *
 * Four are kept, and they are the ones you are looking at while it loads: the
 * wizard at the hearth, Hermes and Enoch on the two entrance piers you walk
 * between, and the librarian whose desk closes the view straight ahead. Every
 * other figure streams as you turn toward it — and none of them pops in from
 * nothing, because the procedural stone figure stands on the pier as the
 * Suspense fallback until its model lands (see statues.tsx).
 */
const PRELOAD = LEAN_TEXTURES ? ['wizard'] : ['wizard', 'hermes', 'enoch', 'librarian'];

for (const m of PRELOAD) {
  useGLTF.preload(leanModelPath(`/models/${m}.glb`));
}
