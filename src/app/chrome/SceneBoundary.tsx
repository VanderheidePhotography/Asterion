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

/**
 * Does this browser have what the hall needs, BEFORE we try to build it?
 *
 * Checked by actually asking for a context rather than by sniffing the user
 * agent: locked-down corporate machines, virtual desktops and old integrated
 * drivers all block or fail WebGL2 in ways no UA string reports. The probe
 * canvas is thrown away immediately, and the context with it.
 */
export function hasWebGL2(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2'));
  } catch {
    return false;
  }
}

export function SceneUnavailable({ reason }: { reason: string }) {
  return (
    <div className="scene-unavailable" role="alert">
      <div className="scene-unavailable-card">
        <span className="scene-unavailable-kicker">The doors are shut</span>
        <h1>The Grand Library needs 3D graphics</h1>
        <p>
          This browser could not open the hall — {reason}. That is a limit of the machine or its
          graphics driver, not of your collection.
        </p>
        <p className="scene-unavailable-note">
          Every word of the museum is also kept as plain text: the same people, books, symbols and
          events, with their sources and citations, and nothing to render.
        </p>
        <Link className="btn btn-gold" to="/research">
          Enter the Research Hall instead
        </Link>
      </div>
    </div>
  );
}
