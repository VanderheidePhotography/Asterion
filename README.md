# Asterion — The Grand Library

An immersive digital museum for the documented history of Western esoteric
traditions — imagined as the universal library. You arrive in a great domed
rotunda under an oculus of night sky and simply walk: four wings of towering
stacks radiate on the diagonals, eight sections in all — Hermetica, alchemy,
Kabbalah, Renaissance magic, Rosicrucianism, Freemasonry, the occult revival,
and the scholars who study them — each marked by its own glowing sigil
(square and compasses for the lodge, the rose cross for the brotherhood…).
Every entry in the collection is a **grimoire on a shelf**: click a glowing
spine and it flies into your hands and opens, its pages typeset on parchment
— every claim sealed with an evidence level and citations — with an
**Enlarge** mode that shows the spreads at full screen. Wizards argue over
pipes by the fireplace, a troll and an elf play cards for gold, an owl
glides between balcony rails, chickadees flit out the oculus, a spirit-fox
patrols the compass rug, and framed plates in the manner of old emblem books
hang between the shelves.

This is a digital humanities project, not an occult app. It documents;
it neither practices nor debunks.

## The experience

- **First-person walkthrough** — WASD/arrows to walk, drag to look, Shift to
  hurry. Walk through the far door and you're in the Research Hall.
- **Grimoires** — 900+ entities shelved by tradition. Approach and their
  titles wake; click and read. Arrow keys turn pages. Opening a book also
  draws luminous threads to its related grimoires across the hall.
- **Search that walks you there** — ⌘K, type (typos forgiven), press Enter,
  and you are teleported to that book's shelf with the book open.
  `/?focus=<id>` deep-links the same way.
- **Research mode** — the identical collection as a quiet, semantic-HTML
  encyclopedia: catalogue, articles, timeline, bibliography, methodology.
  Fully usable without WebGL, by keyboard, and by screen reader.
- **The Archivist** — a retrieval-based research companion. Every passage it
  offers is a claim from the curated dataset, quoted with its evidence level
  and citations; it cannot invent references by construction, and it says so
  when the collection has no answer. Supports comparison ("compare Ficino
  and Pico"), chronologies ("timeline of the Golden Dawn"), and reading
  recommendations.
- **Ambient sound** — synthesized wind and distant chimes, off by default.
- **On a phone** — the hall is walkable in portrait: a thumb-stick in the
  lower-left corner, drag anywhere to look, tap to read. The camera solves its
  field of view from the window's shape, so an upright phone is not looking
  down a keyhole and an ultrawide monitor is not looking through a fisheye.

## The evidence rubric

Every factual statement is a `Claim` with a level and citations:

| Level | Meaning |
| --- | --- |
| Documented | corroborated historical record |
| Primary source | asserted in a period source; reported, not verified |
| Scholarship | finding in academic secondary literature |
| Tradition | organizational/received tradition, unverified |
| Legend | legendary or mythic attribution |
| Later interpretation | speculative reading, presented as such |

Tests fail the build if any claim cites a source that is not in the
bibliography, if any relation dangles, or if any entity is an island.

## Engineering notes

A walkable building is an unusual amount of scene to keep at 60 fps in a
browser tab, and most of the work in this repository is the performance of it.
The numbers below are measured, not estimated; the instruments were built for
the purpose, because a frame timing taken from inside a devtools pane or an
embedded browser is throttled and non-monotonic — the same scene measured
twice came back 15% apart.

**Find the real bottleneck before optimising.** The intuitive diagnosis was
fill rate: the frame collapsed when the window went full screen. It was wrong.
An ablation sweep — one suspect disabled at a time, 45 frames each, medians
reported — showed halving the pixel count moved the frame 0.6 ms, while
replacing every material with one flat unlit shader at an *identical* draw
count took it from 26.6 ms to 8.3 ms. The cost was neither pixels nor
geometry: three.js re-uploads the entire light-uniform block on every distinct
material bind, so the frame was `lights × binds`, both CPU-side.

- **A fixed pool of lights.** Only the light *count* is a shader `#define` —
  position and colour are uniforms and free to change per frame. So 18 pooled
  lights are created once and never counted again, each impersonating whichever
  of the ~35 real practicals currently scores highest, cross-fading between
  them. 43 lights → 26, with no shader relink, ever.
- **Never toggle `light.visible`.** It changes the count, which relinks every
  material in the building — measured at a 460 ms freeze, worst case 3 seconds.
  This was the true cause of "it stutters when I walk down a hallway".
- **Deduplicate materials and textures, then merge geometry, in that order.**
  Each pass makes the next one's matches possible. 2452 material instances
  collapse to 524 signatures; `Texture.clone()` turns out to be a second GPU
  upload, so 48 redundant uploads went with them; then 1014 static props bake
  into 139 meshes.
- **Budget pixels, not pixel ratio.** The adaptive-quality controller was
  moving `dpr`, a *ratio*, so its floor still let the pixel count grow 9× with
  the window. It now solves for a target pixel count. Related bug, found the
  same day: `setPixelRatio` had been inert for months, because the
  post-processing composer sizes its render targets independently and nothing
  re-ran it — the scene was shaded at full resolution and merely blitted down.
- **Texture memory, 2.9 GB → 1.2 GB.** Two thirds of it turned out to be
  *text labels*: 969 sprite canvases, each rasterised at 2× a 64px layout
  basis and up to 2006px wide. The fix is density-driven rather than a flat
  cut, because measuring first showed the labels ranged 471–3852 texels per
  world metre and the largest signs were the *worst* provisioned — a uniform
  halving would have starved exactly the ones meant to be read across the room.
- **Offline asset pipeline** (`npm run assets:optimize`) — idempotent scripts
  that re-encode oversized textures, and quantize + meshopt-compress the model
  geometry (28.6 → 15.3 MB). Meshopt rather than Draco because the loader is
  bundled and local, while Draco's default decoder is a CDN fetch, and nothing
  here is allowed to depend on a third-party origin at runtime.

Everything not in `public/` is procedural: the architecture, the floor
mandala, the book spines, the engraved charts and every page of every grimoire
are drawn to canvas at runtime from primitives and seeded noise. The files that
do ship are the statue models and the scanned surface textures.

## Running it

Requires Node ≥ 20.19.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # domain + collection-integrity tests
npm run lint
npm run typecheck
npm run build      # production build in dist/
```

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — how the code is organized and why
- [docs/CONTENT_GUIDELINES.md](docs/CONTENT_GUIDELINES.md) — how to add entities and sources
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — shipping it

## Accessibility

The museum is two front doors onto one collection, and the quiet one is not an
afterthought. Research mode is semantic HTML that needs no GPU, no pointer and
no colour: full keyboard operation, a skip link, live-region announcements of
whatever a station is currently saying, a high-contrast theme, and honoured
`prefers-reduced-motion` (which also stands down the camera sway and the
arrival glide). A browser without WebGL2 is told so plainly and shown the way
through rather than left staring at a black canvas.
