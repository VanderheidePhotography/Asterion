import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * START FETCHING THE HALL WITH THE PAGE, NOT AFTER IT.
 *
 * The library is behind `React.lazy`, which means its chunks are not requested
 * until React has booted, rendered App and reached the route — so a cold visit
 * ran a WATERFALL: fetch and parse the entry chunk, then discover ~740 kB of
 * hall, ~750 kB of corpus and the three/r3f bundles and go back for them. On a
 * desktop that second trip is invisible. On a phone on cellular it is a whole
 * round trip's latency plus the transfer, in front of a loading screen.
 *
 * `modulepreload` in the head starts all of them in parallel with the entry
 * chunk, at the same priority, before a line of application code has run. The
 * lazy import then resolves against an already-warm cache. Nothing about the
 * splitting changes — research mode still never EVALUATES the 3D stack, it
 * just no longer waits to hear that it exists.
 *
 * Deliberately only the hall's own chunks: it is the front door (route `/`),
 * so this is the overwhelmingly common path. A visitor who lands directly on
 * /research pays for bytes they will not evaluate, which is the trade this
 * makes on purpose.
 */
function preloadHall(): Plugin {
  const WANTED = /^(GrandLibrary|data|r3f|three)-/;
  return {
    name: 'asterion-preload-hall',
    enforce: 'post',
    transformIndexHtml(_html, ctx) {
      if (!ctx.bundle) return;
      return Object.keys(ctx.bundle)
        .filter(
          (file) =>
            file.startsWith('assets/') &&
            file.endsWith('.js') &&
            WANTED.test(file.slice('assets/'.length)) &&
            // Vite preloads what the entry statically imports; adding a second
            // link for the same file is harmless but noisy in the head
            !_html.includes(file),
        )
        .map((file) => ({
          tag: 'link',
          attrs: { rel: 'modulepreload', crossorigin: '', href: `/${file}` },
          injectTo: 'head' as const,
        }));
    },
  };
}

export default defineConfig({
  plugins: [react(), preloadHall()],
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // keep the 3D stack in its own chunks so research mode stays featherweight
        manualChunks(id: string) {
          if (id.includes('node_modules/three/')) return 'three';
          if (id.includes('@react-three') || id.includes('three-stdlib') || id.includes('postprocessing')) return 'r3f';
          return undefined;
        },
      },
    },
  },
});
