import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

/**
 * WHAT A VISITOR SEES WHEN THE HALL CANNOT BE BUILT.
 *
 * Until this, the answer was: a black rectangle, silently, forever. The
 * explorer is one `<Canvas>` and a large tree under it, so anything that
 * throws during its render — a driver that will not give us WebGL2, a context
 * lost when a laptop switches GPUs, a texture that fails to decode on an old
 * browser — unmounts the whole subtree and React renders nothing in its place.
 * The page stays up, the title bar says ASTERION, and the visitor concludes
 * the site is broken. Which it is, but silently, which is worse.
 *
 * It matters more here than in most apps because the fallback is genuinely
 * good: every word of the museum — every entity, every claim, every citation —
 * is also served as plain documents in the Research Hall, which needs no GPU
 * at all. A visitor whose machine cannot draw the building has lost the
 * building, not the museum, and should be told exactly that and pointed at the
 * door.
 *
 * This is a class component because that is still the only way to catch a
 * render error in React; there is no hook equivalent of `componentDidCatch`.
 */
export class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // one line, deliberately: enough to debug a report from a stranger's
    // machine, not enough to fill their console with a wall of red
    console.error('[asterion] the hall failed to render —', error.message, info.componentStack?.slice(0, 400));
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return <SceneUnavailable reason="something went wrong while building the hall" />;
  }
}

export function SceneUnavailable({ reason }: { reason: string }) {
  return (
    <div className="scene-unavailable" role="alert">
      <div className="scene-unavailable-card">
        <span className="scene-unavailable-kicker">The doors are shut</span>
        <h1>The Grand Library needs 3D graphics</h1>
        <p>
          This browser could not open the hall — {reason}. On an iPhone or iPad that usually means
          iOS 15 or newer is needed; elsewhere it is the graphics driver. Either way it is a limit
          of the machine, not of your collection.
        </p>
        <p className="scene-unavailable-note">
          Every word of the museum is also kept as plain text: the same people, books, symbols and
          events, with their sources and citations, and nothing to render.
        </p>
        <div className="scene-unavailable-doors">
          <Link className="btn btn-gold" to="/research">
            Enter the Research Hall instead
          </Link>
          {/* reloading is worth offering: a browser that has just refused a
              GPU context will usually grant one on a fresh page */}
          <button className="btn" onClick={() => window.location.reload()}>
            Try the hall again
          </button>
        </div>
      </div>
    </div>
  );
}
