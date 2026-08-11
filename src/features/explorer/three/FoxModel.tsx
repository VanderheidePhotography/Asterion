import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

/**
 * A real, rigged glTF model — the pipeline for "proper models" in the world.
 * Mesh: low-poly Fox by PixelMannen (CC0); rig & animation by @tomkranis
 * (CC-BY 4.0), from the Khronos glTF sample assets. Served locally from
 * /models so it loads same-origin. Rendered inside <Suspense> with the
 * procedural creature as the fallback, so a slow/failed load never breaks
 * the scene. Drop more CC0 models in beside it to replace the wizards & cat.
 *
 * The AnimationMixer is driven by hand (not drei's useAnimations) to sidestep
 * a hook-deps warning in drei v10 under React 19.
 */
const URL = '/models/fox.glb';

export function FoxModel({
  position = [0, 0, 0],
  rotationY = 0,
  scale = 0.021,
  still = false,
}: {
  position?: [number, number, number];
  rotationY?: number;
  scale?: number;
  still?: boolean;
}) {
  const { scene, animations } = useGLTF(URL);

  // clone so multiple instances (and HMR) don't share one skinned graph
  const model = useMemo(() => {
    const root = scene.clone(true);
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) m.frustumCulled = false;
    });
    return root;
  }, [scene]);

  const mixer = useMemo(() => new THREE.AnimationMixer(model), [model]);
  const actionRef = useRef<THREE.AnimationAction | null>(null);

  useEffect(() => {
    // "Survey" is the calm look-around idle; fall back to the first clip
    const clip = animations.find((c) => c.name === 'Survey') ?? animations[0];
    if (!clip) return;
    const action = mixer.clipAction(clip);
    action.reset().play();
    actionRef.current = action;
    return () => {
      action.stop();
      mixer.stopAllAction();
    };
  }, [mixer, animations]);

  useFrame((_, delta) => {
    if (!still) mixer.update(delta);
  });

  return (
    <group position={position} rotation-y={rotationY} scale={scale}>
      <primitive object={model} />
    </group>
  );
}

useGLTF.preload(URL);
