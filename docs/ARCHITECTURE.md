# Architecture

## Layers

```
src/
  domain/        pure TypeScript — types, graph, search, retrieval, timeline
  data/          the curated collection: entities by cluster + bibliography
  app/           chrome (header), global stores (zustand)
  features/
    explorer/    the Grand Library rotunda (React Three Fiber) — the museum
      three/     scene modules: layout, structure (rotunda/wings), shelves,
                 furniture, greenery, creatures, characters, sigils, artwork,
                 text, picking, grimoire page baking, dust, sky
    research/    encyclopedia mode — plain semantic HTML routes
    search/      ⌘K palette (Fuse.js)
    companion/   the Archivist panel (deterministic retrieval)
    audio/       synthesized ambience (WebAudio)
  lib/           small hooks (reduced motion)
```

Dependency rule: `domain` imports nothing above it; `data` imports only
`domain`; features import both. The 3D scene is one lazy route — research
mode never pays for three.js.

## Key decisions

**Everything procedural.** No glTF, no texture downloads. Shelves and books
are two instanced draw calls (~10k instances); text in the scene is baked
onto canvas textures (`TextSprite`) using the page's own fonts; the grimoire
pages are typeset by a canvas "press" (`grimoirePages.ts`); the rose window,
glows, and parchment are canvases; flames and light shafts are small GLSL
shaders. This keeps first paint fast, works offline, and means the whole
museum is code-reviewable.

**Hand-rolled interaction where it must not fail.** Picking is a raycaster
driven by real DOM pointer events over an explicit registry
(`three/ManualPicker.tsx`) — framework pointer-event plumbing proved
unreliable in embedded browsers, and picking is the core interaction.
Same for the first-person rig: plain keyboard/pointer listeners, axis-
separated collision against a walkable-space function, so the player slides
along shelves.

**Determinism.** All layout jitter (book spines, grimoire slots, dust,
parchment foxing) comes from seeded PRNGs (`domain/random.ts`). The museum
is a place, not a slot machine; tests can assert on layout.

**The Archivist is honest by construction.** `domain/retrieval.ts` composes
answers only from `Claim` objects in the dataset. Citations are ids into the
bibliography, validated by tests. `CompanionEngine` is the seam where a
hosted LLM could later *rephrase* retrieved passages — never add to them —
if a backend is introduced.

**Accessibility is a parallel path, not a retrofit.** Research mode carries
the identical data in semantic HTML. The scene honours reduced motion (OS
preference or the header's "Calm" toggle): camera sway, creature motion, and
pulses all stop. Every 3D affordance has a DOM equivalent (section teleport
list, "Read as text" on every open book, search palette).

## Performance profile

- Initial route (research): ~115 KB gzip JS, no WebGL.
- Library route: lazy chunks — scene ~15 KB + three/r3f ~238 KB gzip.
- Scene budget: 2 instanced draws for ~10k books/shelves, ~70 grimoire
  meshes, sprites for glows, ≤10 point lights, `dpr` clamped at 1.75.
- Layout is precomputed at module load; per-frame work is damping, label
  visibility distance checks, and the creatures' splines.

## Testing & CI

`vitest` covers the domain and, crucially, **collection integrity**:
unique ids, no dangling relations, no phantom citations, no orphaned
entities, timeline monotonicity, and the companion's no-invented-references
guarantee. GitHub Actions (`.github/workflows/ci.yml`) runs lint,
typecheck, tests, and build on every push/PR.
