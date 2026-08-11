import type { EffectComposer } from 'postprocessing';

/**
 * A handle on the live EffectComposer, so resolution changes can actually take
 * effect.
 *
 * `@react-three/postprocessing` sizes the composer from r3f's CSS size only:
 *
 *     useEffect(() => composer?.setSize(size.width, size.height), [composer, size])
 *
 * and `EffectComposer.setSize` derives its render targets from the renderer's
 * DRAWING BUFFER size at the moment it runs. Nothing re-runs it when the pixel
 * ratio changes. So `gl.setPixelRatio(x)` on its own resizes the canvas and
 * leaves every pass rendering at the old resolution — the scene is still shaded
 * at full size and merely blitted down at the end.
 *
 * That is why `AdaptiveQuality` appeared to do nothing for years of measurement:
 * lowering dpr genuinely did not lower the fill cost, which is also why sweeping
 * five pixel densities produced five identical timings while the user kept
 * reporting, correctly, that full screen was much worse.
 *
 * Anything that changes the pixel ratio must call `setSize` afterwards, through
 * this handle. Passing this object straight to the component's `ref` works —
 * `<EffectComposer ref={composerHandle}>` — because the library exposes the
 * composer through `useImperativeHandle`.
 */
export const composerHandle: { current: EffectComposer | null } = { current: null };

/** Re-derive every pass's render target from the CURRENT drawing buffer size.
 *  Call after any `gl.setPixelRatio`, or the change is cosmetic. */
export function resizeComposer(gl: { domElement: HTMLCanvasElement }): void {
  const c = composerHandle.current;
  if (!c) return;
  const el = gl.domElement;
  // A canvas that has not been laid out yet reports the HTML default, 300×150.
  // Sizing the composer to that pinned every pass at postage-stamp resolution
  // and drew the whole hall into the top-left corner of the window, where it
  // stayed until some later resize happened to re-run this. Refuse the
  // measurement instead — the caller re-runs on r3f's size, which is only
  // published once the element has real dimensions.
  if (el.clientWidth < 2 || el.clientHeight < 2) return;
  c.setSize(el.clientWidth, el.clientHeight);
}
