import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { LEAN_TEXTURES, TEXTURE_SCALE } from './textureBudget';

/**
 * WHAT THIS DEVICE IS ACTUALLY DOING — reachable only at `?diag`.
 *
 * Written because the one machine that matters is the one I cannot attach to.
 * A phone that renders a frame and then freezes gives no console, no profiler
 * and no counters, and every diagnosis made from the desk has been a guess.
 * This ships the counters to the device instead: open `?diag` on the phone,
 * photograph the panel, and the argument is settled.
 *
 * It is deliberately not the old HUD, which was a developer's instrument on a
 * keyboard shortcut and was removed for release. This is a support tool: it
 * does not exist unless a query parameter asks for it, so nobody stumbles into
 * it, and it costs a single string per second when they do.
 *
 * The lines that decide things:
 *   LEAN  — did the memory tier engage at all? A phone reporting NO means the
 *           detection is wrong and every number below it is beside the point.
 *   TEX   — live textures. This is what decides whether Safari keeps the GPU.
 *   LOST  — WebGL context-loss events. Anything above zero means the browser
 *           took the context back, which looks exactly like a frozen picture
 *           and is not a hang, not a crash, and not a slow frame.
 */

/** the latest sample, written in the frame loop and read by the overlay */
let latest = 'waiting for the first frame…';

/** true when the visitor asked for the report with `?diag` */
export function diagRequested(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).has('diag');
}

/** lives INSIDE the Canvas — it needs the renderer and the frame loop */
export function DeviceReport() {
  const { gl } = useThree();
  const acc = useRef({ t: 0, frames: 0, lost: 0, restored: 0 });

  useEffect(() => {
    const el = gl.domElement;
    // preventDefault is required: without it the context can never be restored
    const onLost = (e: Event) => {
      e.preventDefault();
      acc.current.lost += 1;
    };
    const onRestored = () => {
      acc.current.restored += 1;
    };
    el.addEventListener('webglcontextlost', onLost);
    el.addEventListener('webglcontextrestored', onRestored);
    return () => {
      el.removeEventListener('webglcontextlost', onLost);
      el.removeEventListener('webglcontextrestored', onRestored);
    };
  }, [gl]);

  useFrame((_, delta) => {
    const a = acc.current;
    a.t += delta;
    a.frames += 1;
    if (a.t < 1) return; // one sample a second
    const fps = a.frames / a.t;
    a.t = 0;
    a.frames = 0;
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    latest = [
      `LEAN ${LEAN_TEXTURES ? 'YES' : 'NO'}   scale ${TEXTURE_SCALE}`,
      `deviceMemory ${mem ?? 'n/a'}   screen ${window.screen.width}×${window.screen.height}`,
      `TEX ${gl.info.memory.textures}   GEO ${gl.info.memory.geometries}`,
      `PROG ${gl.info.programs?.length ?? 0}   dpr ${gl.getPixelRatio().toFixed(2)}`,
      `FPS ${fps.toFixed(0)}`,
      `LOST ${a.lost}   RESTORED ${a.restored}`,
    ].join('\n');
  });

  return null;
}

/** lives OUTSIDE the Canvas — plain DOM, so it survives a lost context */
export function DeviceReportOverlay() {
  const [text, setText] = useState(latest);
  useEffect(() => {
    // polled rather than pushed, deliberately: if the frame loop stops — which
    // is the failure being investigated — a pushed panel would freeze with it
    // and show nothing. This one keeps updating and the stalled FPS is itself
    // the evidence.
    const id = setInterval(() => setText(latest), 500);
    return () => clearInterval(id);
  }, []);
  return <pre className="device-report">{text}</pre>;
}
