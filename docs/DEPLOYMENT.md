# Deployment

Asterion builds to a fully static site — no backend, no database, no keys.

## Build

```bash
npm ci
npm run build   # emits dist/
```

Node ≥ 20.19 (`engines` in package.json). CI runs lint, typecheck, the test
suite (including collection integrity), and the build on every push.

## Hosting

Any static host works (Netlify, Vercel, Cloudflare Pages, S3+CloudFront,
GitHub Pages with a SPA fallback). Two requirements:

1. **SPA fallback** — serve `index.html` for unknown paths (routes like
   `/research/entity/golden-dawn` are client-side).
   - Vercel: **already configured** in `vercel.json` at the repo root. Note the
     rewrite deliberately EXCLUDES `assets/`, `models/`, `textures/`, `art/`
     and `tarot/`: a catch-all `/(.*)` would answer a missing texture with the
     HTML document, and a GLB loader handed 12 KB of `<!doctype html>` fails
     with a parse error that looks nothing like the 404 it actually is.
   - Netlify: `/* /index.html 200` in `_redirects`, with the same caveat —
     put asset paths above the catch-all.
2. **Long-cache hashed assets** — everything under `dist/assets/` is
   content-hashed; cache immutable. `index.html` should be `no-cache`.

## Weight & loading behaviour

- `/research/**` loads ~120 KB gzip of JS and never touches WebGL.
- `/` lazily pulls the 3D chunks (~250 KB gzip) while showing a loading
  line. All geometry, textures, and type are generated at runtime — there
  are no further asset requests.
- Google Fonts is the only external request and degrades gracefully to
  system serif/sans if offline.

## Monitoring & analytics hooks

The app is instrumentation-agnostic. The natural seams:

- route changes — wrap the router or subscribe in `App.tsx`;
- companion queries — `CompanionEngine.ask` in `src/domain/retrieval.ts`;
- grimoire opens — `openBook` in `src/features/explorer/GrandLibrary.tsx`;
- errors — add a boundary around `<Routes>` and report from there.

Keep any analytics privacy-respecting; this is a museum, not a funnel.
