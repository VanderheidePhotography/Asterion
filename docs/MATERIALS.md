# The material pipeline

## Why it exists

Before this, every surface in the museum was a `MeshStandardMaterial` built
inline at its point of use, wearing a canvas texture painted at runtime — albedo
only, no normal, no roughness, no occlusion. There were 134 such declarations.
Re-dressing the building meant editing 134 places, and there was nowhere to put a
photogrammetric scan even if you had one.

The registry inverts that. Geometry code asks for a surface by name and gets a
material back. What that material is wearing — a 4K scan, a painted stand-in,
half of each — is the registry's business.

```ts
import { getMaterial } from '../../../materials';

const floorMat = useMemo(() => getMaterial('wood_floor_polished', { repeat: [16, 16] }), []);
```

## The four pieces

| file             | role                                                                    |
| ---------------- | ----------------------------------------------------------------------- |
| `library.json`   | the catalogue. Pure data — every surface, its maps, its scalars, its tiling |
| `sources.json`   | which CC0 scan each material pulls from, and at what resolution          |
| `registry.ts`    | builds and caches materials; loads scans; swaps stand-ins out            |
| `fallbacks.ts`   | maps a definition's `fallback.painter` to the canvas painters in `three/textures.ts` |
| `palette.ts`     | the colour script — one set of ten colours for materials, lights and effects |

`public/textures/<Category>/<material-id>/` is the drop zone;
`public/textures/README.md` documents the file-naming rules.

```bash
npm run textures:fetch   # pull the CC0 set named in sources.json
npm run textures:scan    # rebuild the manifest the runtime reads
```

## Where the scans come from

The shipped set is **CC0 (public domain)** from [Poly Haven](https://polyhaven.com)
and [ambientCG](https://ambientcg.com). CC0 carries no attribution obligation;
both are credited here anyway because they earned it.

The book bindings are a hybrid rather than a scan or a painting. `spineSheet`
in `three/textures.ts` bakes eight spines side by side — eight bindings and eight
CONDITIONS (raised cords, pasted label, gilt tooling, sunned cloth, rubbed calf,
water staining, limp vellum, a rebacked hinge) — and each column's ground is a
crop of one of the real book scans above, part-desaturated so the instance tint
still reads. Structure is drawn; grain is photographed. The scans arrive after
the first frame, so the sheet is baked painted and repainted into the same canvas
when they land; `onSpineScansReady` exists so the material clones can be told.

One texture comes from outside that set. `public/textures/Sky/moon.jpg` is a
near-full waning gibbous from NASA/Goddard's
[Scientific Visualization Studio](https://svs.gsfc.nasa.gov), rendered from Lunar
Reconnaissance Orbiter data. NASA imagery is public domain and carries no
attribution obligation; credited here for the same reason as the rest. It is the
face of the moon in the night sky, and it follows the same stand-in rule as
everything else — a painted disc renders until the file loads.

Resolution is per-material on purpose. 2k goes only to surfaces a visitor gets
close to or sees at a grazing angle — floors, walls at eye level, the carpet.
Everything else is 1k, because a coffer 14 m overhead cannot resolve more.

## ARM packing

Poly Haven publishes an `arm` map: occlusion in R, roughness in G, metalness in
B. That is exactly the channel layout three.js already reads for `aoMap`,
`roughnessMap` and `metalnessMap`, so **one texture object goes into all three
slots** — a third of the bytes, a third of the requests, and one GPU upload
instead of three. When an ARM file is present the registry ignores any separate
ao/roughness/metalness on disk, and the scanner says so rather than leaving dead
bytes lying around.

## Roughness is the art direction

Centuries-old architecture is almost entirely diffuse. Stone that was ever
polished has been walked matte, old oak absorbs light rather than returning it,
wool and leather have no specular lobe worth the name. Nothing structural sits
below **0.88 (wood) / 0.95 (stone) / 0.97 (fabric)**, and the only surfaces
allowed a visible highlight are burnished brass, gold leaf, crystal, lenses and
fresh wax.

**The scalar and the map do not mean the same thing.** `roughness` is what the
painted stand-in uses, so it has to carry the whole look alone. But three
*multiplies* `roughness` by the map's green channel — so leaving stone at 0.88
against a scan reading 0.7 would land at 0.62 and make masonry shinier than the
day it was cut. The registry therefore hands the value over to the scan
(`roughness = 1`) whenever a roughness or ARM map lands. `roughnessScale` exists
to push back below 1 for the genuinely polished handful.

## The synchronous contract

`getMaterial` never returns a promise and never returns null. It hands back a
material that is renderable on the frame it was asked for, wearing whatever is
available right now, and upgrades itself in place when scans arrive.

This is the property everything else leans on. The scene graph builds once at
startup; if materials were async, every surface would need a suspense boundary
and a loading state, and a slow network would leave the building half-built.

## Stand-ins are permanent, not scaffolding

A definition without scans falls back to a canvas painter — the same ones the
project has always used. This is not a placeholder to be deleted later:

- a clean checkout renders a fully dressed museum with zero downloads
- one scan upgrades exactly one surface; the other 48 are unaffected
- the texture library can be built over months without the scene ever regressing

Painters supply **albedo only**. There is no honest way to derive a normal or
roughness map from a colour canvas, and a fake one would fight the real one the
moment a scan landed. Un-scanned surfaces run on their scalar `roughness` and
`metalness`, which is what the library's params are tuned for.

## Tiling

Two ways to set it, and the second is usually right:

- `repeat: [x, y]` — fixed. For surfaces with authored UVs: a rug, a niche
  hanging, a stained-glass arch, anything where the texture is a picture rather
  than a pattern.
- `tilesPerMetre` — world scale. Pass the surface's `size` and the registry
  derives the repeat. One limestone definition then serves a 2 m pilaster and a
  40 m wall at the same apparent grain.

`tilesPerMetre` is the first number to reach for when a scan reads as the wrong
size. It is almost always the problem.

## Colour spaces

`albedo` and `emissive` are colour and decode as sRGB. Everything else —
normal, roughness, AO, metalness, height — is measurement data and loads linear.
Getting this backwards is the single most common way a hand-built PBR scene
comes out washed out or muddy, and the registry is the only place in the
codebase that decides it.

## Caching

Materials are cached on id + tiling + overrides. The hundreds of shelves that
want the same walnut at the same scale share one material and therefore one
draw-call state. `useMaterial` exists only so React callers do not rebuild the
request object each render and blow the cache.

Textures are cached per URL, and per-material copies are `clone()`s — which share
`.source`, so a file is downloaded and uploaded to the GPU exactly once no matter
how many materials tile it differently.

---

## Roadmap

The registry is the keystone; the rest of the redesign sits on top of it.

**1. Pipeline — done.** Registry, catalogue of 60 materials, scan manifest,
palette, drop-zone docs.

**2. Conversion — architecture done.** `structure.tsx`, `wingArcade.tsx` and
`furniture.tsx` are fully on the registry: the drum, the dome, the halls, the
vaults, the vestibule, the apse, the arcade order, the tables and the hearth.

Two rules the conversion established, both learned the hard way:

- **Never dispose a registry material.** They are cached and shared
  building-wide, so a component cleanup that disposes one blanks every other
  surface using it on remount. Only geometry and locally-built materials get
  disposed now.
- **Emissive and unlit surfaces stay out.** Stained glass, ward marks and framed
  engravings are light sources dressed as surfaces. They have no business having
  roughness, and they keep their local `MeshBasicMaterial`.

Still inline: the interactive stations (Orrery, PlateConsole, Monochord,
ChladniPlate, the tarot and alchemy tables) and the statuary. These are mostly
one-off instruments rather than architecture, so they benefit least and are
lowest priority.

**Hall timber is deliberately its own definition.** `wood_hall_wainscot` and
`wood_hall_timber` are separate entries from `wood_rotunda_wainscot` and
`wood_rotunda_timber` even where the tones currently match. Walking out of the
drum into a wing should read as a change of room, and the wood is what says so;
one shared definition would silently weld them together the first time either is
retuned.

**3. Lighting — done.** `three/lighting.tsx`. The flat `ambientLight` 0.68 +
`hemisphereLight` 0.82 wash is gone — 1.5 units of directionless fill was the
single reason the building read as evenly-lit brown at every distance, because
an ambient term raises the darkest and brightest surface by the same amount and
so models nothing. Replaced by moonlight (one cool raking directional plus a dim
blue counter-light), a hard silver shaft through the oculus, and 0.26 of
hemisphere bounce stading in for floor light. Practicals — chandeliers, candles,
the hearth — carry the warm 10%.

Two knock-on fixes it forced: the niche damask needed its own brighter
definition to survive the darkness (see `fabric_niche_damask`), and the framed
engravings had `toneMapped: false`, which exempted them from ACES and turned
every white-ground plate into a hole punched through the wall the moment the
ambient came out.

**4. Scans, and the specular pass — done.** 32 materials now wear CC0
photographic scans (see above); the other 34 are still on painted stand-ins and
render fine. Every surface in the building was pushed matte in one pass, and the
lighting budget moved from 85/10/5 to **80/15/5** — hemisphere bounce cut from
0.26 to 0.17, ambient from 0.13 to 0.08. Two dust fields were added: a cold
column standing in the oculus shaft, and a broad faint warm one at head height.

`DustMotes` gained `size` and `opacity`, and its point-size cap dropped from 14px
to 4.5px. That cap is the whole difference between dust and snow — at 14px the
first attempt read as a blizzard.

---

## Known costs, honestly

**First load pulls ~45 MB of texture.** That is too heavy to ship as-is. The fix
is the one the brief already names: **KTX2 / Basis Universal**, which would take
it to roughly 15–25 MB *and* cut GPU memory several-fold, since compressed
textures stay compressed on the card. It needs `toktx` in the asset pipeline and
`KTX2Loader` wired into the registry — a contained job, and the single highest-
value performance work outstanding.

Height maps (17 MB) sit on disk but are never served: displacement only bites on
tessellated geometry and nothing here is tessellated, so the registry skips the
slot entirely rather than downloading and discarding.

### Performance — profiled, then fixed (partly)

Measured on an M1 Pro (ANGLE/Metal), camera at the rotunda centre:

| metric | before | after |
| --- | --- | --- |
| frame rate | 3.6 fps | **28.5 fps** (31.3 before the dome's cove lights) |
| draw calls / frame | 1614 | **1088** |
| loose meshes | 3182 | **1854** |
| triangles / frame | 1.1 M | 1.1 M |
| lights in scene | 33 | 37 |

**What did it: merging the chandeliers.** There are 36 in the building (four
under the dome, four down each of eight halls) and each was built from ~47
separate objects — canopy, stem, cone, two rings, then per arm a scroll, a
bobèche, a candle, a crystal and a flame *sprite*. Roughly 1,700 draw calls for
a fixture the viewer reads as one object.

The parts are identical on every fixture, so they are now built once at module
scope, baked into position and merged by material: six objects per chandelier
instead of forty-seven, geometry shared across all thirty-six.

**The flame sprites mattered more than their count.** Replacing 288 additive
sprites with 36 eight-vertex `Points` accounts for far more of the 8.7× gain
than the draw-call reduction alone explains — additive transparent sprites force
depth sorting and heavy overdraw. `Points` are camera-facing and size-attenuated
by definition, which was the only reason a sprite was used, so the look survives.

The eight wings' vault ribs got the same treatment: fourteen members per wing
(ten transverse hoops, four longitudinal) merged into one buffer, 112 meshes → 8.

Still outstanding: **699 sprites** remain scene-wide (mostly `TextSprite`
labels, each with a unique canvas texture so none of them batch), and the light
count has crept to 37.

**It is not fill-rate bound.** Shrinking the drawing buffer 7× moved it from 2.7
to 4.2 fps — nowhere near proportional. The cost is CPU-side submission and
per-draw shader work, not pixels.

**The dominant factor is 1614 draw calls × 33 lights.** three.js's forward
renderer evaluates every light in the fragment shader of every lit surface, so
those two numbers multiply. A healthy target is under 500 calls and under 8–10
meaningful lights.

Two cautions for whoever picks this up:

- **Do not benchmark by toggling light visibility.** Changing the light count
  invalidates every shader program and triggers a recompile storm — an
  experiment that "turned lights off" measured 0.3 fps, worse than the 3.8 it
  was compared against, purely from compilation.
- **No trustworthy pre-change baseline exists**, so the split between inherited
  scene complexity and cost added by the material work is not established. The
  3200 meshes and 33 lights are structural and predate it; richer per-pixel
  shading (normal + ARM maps, `MeshPhysicalMaterial`) made each of those calls
  more expensive. Both are true; the proportion is not known.

Ordered by expected return, from here:

1. **Keep merging static geometry.** 1854 loose meshes for a building that never
   moves is still the root cause. The next clusters are the framed art (4 meshes
   × 32), the display cases and the reading tables — all repeated per wing and
   all static.
2. **The 699 sprites.** Mostly `TextSprite` labels. Each bakes its own canvas, so
   each is a unique material and none batch. A shared glyph atlas, or swapping
   the glow sprites for `Points` as the chandeliers now do, would collapse them.
3. **Cut the light count**, or bake the static contribution. 37 forward lights is
   roughly triple what this scene can afford, and every one is paid for by every
   lit pixel of all 1088 draw calls.
4. **KTX2 / Basis** for the 45 MB texture load and its GPU-memory footprint.
5. LOD, and frustum culling that is actually allowed to work (several instanced
   meshes set `frustumCulled={false}`).

`sheen` was dropped from the large-area fabrics (rug, niche damask, wool, linen,
vellum) as part of this pass — a second BRDF lobe per pixel per light, invisible
on a matte surface at 80% shadow. Velvet and silk keep it; their grazing
highlight is their whole character.

---

## Still outstanding from the art direction

Not attempted yet, roughly in order of visual return:

- **Performance is playable but not comfortable.** 31 fps with headroom for the
  dome and the centrepiece still to land. Worth another batching pass (see
  above) before adding either.
- **The dome — first pass done** (`three/domeMachine.tsx`). The coffered shell
  was entirely painted, so it caught the light identically at every hour and
  there was nothing on it to find. Added on top of it: four concentric bands
  standing proud of the shell (two heavy carved stone courses, two thin bronze),
  sixteen bronze meridian ribs between them, 260 instanced brass studs in the
  fields, and an armillary of three rings hung in the eye turning on different
  axes — the slowest about nine minutes to a revolution.

  Meridian ribs had been tried on this dome before and cut for being invisible.
  They read now because they are **bronze**: a conductor has a specular response
  the coffers do not, so a raking shaft lights one edge of a rib and leaves the
  other dark. The earlier attempt was dark timber on a timber-toned shell.

  It also needed **cove lighting** — three concealed uplights above the gallery
  cornice. The oculus shaft points straight down past the shell, and with
  ambient cut to 0.17/0.08 the new relief was rendering into near-black. Costs
  ~9% frame rate (31.3 → 28.5 fps), which is the price of the dome existing.

  Still missing from the brief: lapis lazuli panels, engraved planetary orbits
  and astronomical calculations in the stone, suspended astrolabes.
- **Material aging.** The wood is uniform: no darker recesses, no worn corners,
  no repaired sections, no varied grain direction. The scans gave it real grain
  but not a HISTORY. This wants a wear system — per-instance tonal variation
  plus vertex-painted or decal-based wear at the points hands actually touch —
  not another texture.
- **Book rhythm.** Still `book book book`. Needs leaning volumes, flat stacks,
  scroll tubes, oversized atlases, bookends, and above all gaps.
- **The upper gallery has no access.** No spiral stairs, no ladders reaching it.
  It reads as architecture rather than as somewhere a person goes.
- **The atrium centrepiece — still open, and one approach already rejected.**
  A monumental bronze armillary (8.4 m across, hung on a floor-to-dome axis over
  the chart table) was built and **reverted at the client's request**. Whatever
  replaces it, that specific solution — a large hard-edged instrument occupying
  the air directly above the orrery — is not the direction. Ask before building
  the next attempt.

### The visual hierarchy pass

The intended order of attention is: architecture → moonlight → dome →
bookshelves → warm pools → artifacts → magical detail *last*. It was close to
inverted, and four things were doing it:

- **The chandeliers were the brightest objects in the museum.** Polished brass
  at metalness 0.85 / roughness 0.35, with a self-luminous globe at the heart,
  thirty-six times over. A fixture in a room lit by its own candles is a
  *silhouette*. The frame is now black-oxidised forged iron (`#191512`,
  roughness 0.78) and the globe's emissive went 0.9 → 0.12 — it is a bead of
  glass catching the flames, not a lamp. Only the flames emit.
- **Bloom was amplifying exactly what should recede.** At `luminanceThreshold`
  0.62 it caught every warm surface in the room, not just flames, so the gilt
  and the glyphs bled and the architecture sat behind a haze. Now 0.82 / 0.34.
- **The zodiac chart was unfogged and at full strength**, which made floating
  symbols the second-brightest thing in the building. Now `opacity: 0.44`, and
  `fog: false` removed so the far side of the dome recedes like everything else.
- **The wing sigils** came down 0.9 → 0.55 — but deliberately not further.
  They are the only wayfinding in eight identical corridors, so they are signage
  rather than atmosphere; extinguishing them would cost navigation to buy mood.

Candles also gained real flicker: each fixture clones its own flame material and
runs three incommensurate frequencies offset by the fixture's seed, so no two
are in step and none of them repeats. Lamp colour moved from near-white gold to
deep amber (`#ff9d42`) to genuinely separate the warm from the cool.

29.8 fps after the pass.

### Reverted: the dais and the four station tables

A three-course dais under the orrery (with the museum's first ground-height
system so the visitor climbed it) and themed apparatus plus coloured lighting on
the four station desks were both built and **reverted at the client's request**.
Ask before attempting either again.

Two general lessons from that work are worth keeping even though the code is
gone:

**⚠ Transmission is a whole extra scene pass.** The moment any material in the
scene has `transmission > 0`, three.js renders the entire scene a second time
every frame into a transmission render target. Five 11 cm glass flasks on one
desk took the museum from **29.8 fps to 4.2**. Override `transmission: 0` and
use plain alpha for set dressing; reserve real refraction for a hero prop a
visitor puts their face against. (The display-case vitrines already did this —
the rule just was not written down.)

**`distance` does not reduce a light's cost.** In three's forward renderer every
light sits in the uniform array and is evaluated by every lit fragment whatever
its range. A short distance shapes the pool, nothing more. Budget ~1.5 fps per
added light in this scene.

**Measuring frame rate here is easy to get wrong.** `requestAnimationFrame` is
throttled when the Browser pane is hidden, so a reading taken then is meaningless
— check `document.hidden` and front the tab first. Let the page settle several
seconds before measuring, or readings come in far low while textures decode.

### The cost of hero elements

Lights are what this scene cannot afford, and every hero element wants one:

| stage | fps | lights |
| --- | --- | --- |
| after the batching pass | 31.3 | 37 |
| + dome cove lighting (3) | 28.5 | 40 |

~3 fps for three lights — roughly 1 fps each, and the trend is linear because
every lit pixel of every draw call pays for every light. **The light budget is
now the binding constraint**, not geometry. Anything further that wants its own
light should come after the sprite batching and a light-culling or baking pass.
- **Shelf variety.** The shelves still read as procedural. Breaking that needs
  real prop variety — scroll tubes, atlases, instruments, empty gaps — not
  another texture.
- **Environmental storytelling.** No unfinished star charts, half-written notes,
  spectacles, ink stains. This is what would make the place feel worked in
  yesterday, and none of it exists yet.
- **Atmospherics beyond dust:** layered volumetric fog, god rays, incense smoke,
  cloud shadows, exposure adaptation.
- **Nature:** ivy and leaves have definitions but no scans; moss, ferns, roots
  and lichen are not placed.
- **Sound zones.** No hooks laid yet.
- **Performance:** KTX2, LOD, further instancing, decal system.

**4. The dome.** Currently one repeating coffer column. Rebuild as an
astronomical machine: concentric carved rings, bronze ribs, engraved zodiac
bands, lapis inlay, gilded constellations, brass stars. It should read as older
than the rest of the building. Living sky through the oculus.

**5. The atrium centrepiece.** The glowing orb is far too small to anchor a
building this size. A monumental brass armillary or orrery rising into the dome,
turning slowly.

**6. Hallways.** Break the symmetry. Ribbed vaults, alcoves, hidden desks,
balconies, spiral stairs, hanging lanterns, ivy and roots, statues emerging from
darkness.

**7. Environmental storytelling.** Signs of a keeper: notes, open books,
half-finished diagrams, quills, wax seals, instruments. Sparse, deliberate,
plenty of negative space.
