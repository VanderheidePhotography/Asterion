import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

/**
 * Pay the first-render costs during the intro card instead of mid-walk.
 *
 * WebGL does two expensive things lazily, both at the moment an object is first
 * drawn: it links the material's shader PROGRAM, and it uploads the TEXTURE to
 * the GPU. Neither is charged when the object is created — they are charged the
 * first frame it appears on screen. In a building you walk through, "the first
 * frame it appears on screen" is precisely the moment you round a corner into a
 * hallway or step up to a statue, so every cost lands as a freeze exactly when
 * the visitor is moving and least able to tolerate it.
 *
 * Measured on this scene: a single walk from the entrance, through the rotunda
 * and out along a wing compiled 35 new programs. Program links here cost on the
 * order of 100 ms each, so that walk was seconds of accumulated stutter, and
 * approaching a statue for the first time added its ~12 MB of texture upload on
 * top.
 *
 * `WebGLRenderer.compile()` does the same work up front for the whole graph,
 * regardless of what is on screen, and `initTexture()` forces the upload. This
 * runs both behind the intro card, then keeps watching, because the statues and
 * the baked book pages arrive later over Suspense — a single pass at mount would
 * miss everything that streams in.
 *
 * The work is SPREAD rather than done in one go. Compiling everything in one
 * frame is itself a multi-second block, and the intro is a live scene, not a
 * loading screen — the visitor is looking at it.
 */

/** how long to keep watching for late arrivals (statues, baked pages) */
const WATCH_SECONDS = 45;

/** re-check for new content this often */
const CHECK_INTERVAL = 0.75;

/** textures uploaded per frame once a batch is queued — small enough that the
 *  upload never costs more than a frame, big enough to drain in a few seconds */
const UPLOADS_PER_FRAME = 4;

export function SceneWarmup() {
  const { gl, scene, camera } = useThree();
  const elapsed = useRef(0);
  const sinceCheck = useRef(CHECK_INTERVAL); // check immediately on the first frame
  const lastCount = useRef(-1);
  const queue = useRef<THREE.Texture[]>([]);
  const uploaded = useRef(new WeakSet<THREE.Texture>());
  const compiling = useRef(false);

  // a compile pass costs whatever it costs; keep it off the very first frames
  // so the intro card has actually painted before we start blocking
  useFrame((_, delta) => {
    // drain any pending texture uploads first, a few per frame
    const q = queue.current;
    if (q.length > 0) {
      for (let i = 0; i < UPLOADS_PER_FRAME && q.length > 0; i++) {
        const tex = q.pop();
        if (!tex || !tex.image) continue;
        try {
          gl.initTexture(tex);
        } catch {
          // a texture whose image is not decodable yet simply gets skipped;
          // it will be uploaded the ordinary way on first draw
        }
      }
      return; // one kind of work per frame
    }

    elapsed.current += delta;
    if (elapsed.current > WATCH_SECONDS) return;

    sinceCheck.current += delta;
    if (sinceCheck.current < CHECK_INTERVAL || compiling.current) return;
    sinceCheck.current = 0;

    // cheap change detector: has anything new been added to the graph?
    let count = 0;
    scene.traverse(() => count++);
    if (count === lastCount.current) return;
    lastCount.current = count;

    // compile every material in the graph for the current lighting state, not
    // just what the camera can see. This is the whole point: the hallway we
    // have not walked into yet is exactly what needs compiling.
    //
    // `compile()` walks the VISIBLE graph, so anything currently switched off —
    // an idle station, a proximity-revealed prop, a pick proxy — is skipped and
    // then compiles later, on the frame it is switched on. That is precisely
    // the hitch we are trying to remove, so the graph is force-revealed for the
    // enumeration and restored immediately afterwards. Nothing is drawn in
    // between: `compile()` only builds programs, and `compileAsync` does its
    // enumeration synchronously before returning its promise, so the scene is
    // never presented to the visitor in this state.
    const hidden: THREE.Object3D[] = [];
    scene.traverse((o) => {
      // objects the static merger has baked into a shared mesh are hidden for
      // good; revealing them would compile programs for draws that will never
      // be issued (and StaticMerge re-hides them anyway)
      if (!o.visible && !o.userData.mergedAway) {
        hidden.push(o);
        o.visible = true;
      }
    });

    compiling.current = true;
    const done = () => {
      compiling.current = false;
      // queue every texture the graph now holds; the WeakSet keeps us from
      // re-uploading one we have already pushed through
      scene.traverse((o) => {
        const mats = (o as THREE.Mesh).material;
        if (!mats) return;
        for (const m of Array.isArray(mats) ? mats : [mats]) {
          for (const key of Object.keys(m) as (keyof typeof m)[]) {
            const t = m[key] as unknown as THREE.Texture | undefined;
            if (!t || !(t as THREE.Texture).isTexture) continue;
            if (uploaded.current.has(t)) continue;
            uploaded.current.add(t);
            queue.current.push(t);
          }
        }
      });
    };

    let maybe: Promise<unknown> | undefined;
    try {
      maybe = gl.compileAsync?.(scene, camera) as Promise<unknown> | undefined;
      if (!maybe) gl.compile(scene, camera);
    } finally {
      // restore before anything can be drawn — see the note above
      for (const o of hidden) o.visible = false;
    }
    if (maybe?.then) maybe.then(done, done);
    else done();
  });

  return null;
}
