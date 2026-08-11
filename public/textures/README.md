# Texture drop zone

One folder per material id. The ids are the keys of `src/materials/library.json`.

```
public/textures/
  manifest.json                  ← generated, do not hand-edit
  wood_walnut_ancient/
    albedo.jpg
    normal.png
    roughness.jpg
    ao.jpg
    height.png
  metal_bronze_aged/
    albedo.jpg
    normal.png
    roughness.jpg
    metalness.jpg
```

After adding or replacing files:

```bash
npm run textures:scan
```

That rewrites `manifest.json`, which is the only thing the runtime reads. Any
material without an entry keeps its painted stand-in, so a half-finished
texture library renders perfectly well — surfaces upgrade one at a time.

## File naming

The scanner is forgiving. All of these resolve to the same slot:

| slot        | accepted stems                                                   |
| ----------- | ---------------------------------------------------------------- |
| `albedo`    | `albedo`, `basecolor`, `base_color`, `color`, `diffuse`, `col`    |
| `normal`    | `normal`, `normalgl`, `normal_gl`, `nrm`                          |
| `roughness` | `roughness`, `rough`, `rgh`                                       |
| `ao`        | `ao`, `ambientocclusion`, `ambient_occlusion`, `occlusion`        |
| `metalness` | `metalness`, `metallic`, `metal`                                  |
| `height`    | `height`, `displacement`, `disp`, `bump`                          |
| `emissive`  | `emissive`, `emission`                                            |
| `alpha`     | `alpha`, `opacity`                                                |

Suffixed names work too — `oak_2k_basecolor.jpg` resolves to `albedo`. If a file
name does not match what `library.json` declares for that slot, the scanner
prints a warning naming both, so the mismatch never becomes a silent 404.

Formats: `.jpg`, `.png`, `.webp`, `.avif`, `.ktx2`.

## Conventions that matter

- **Normal maps must be OpenGL convention** (green channel up). DirectX-convention
  maps make every dent read as a bump. Flip green in your authoring tool, or set
  a negative `normalScale` in `library.json` for that one material.
- **Only `albedo` and `emissive` are colour.** Everything else is measurement data
  and is loaded linear. Do not colour-correct roughness or normal maps.
- **AO reuses UV0.** No second UV set is needed anywhere in this project.
- **Height maps do nothing by default.** Displacement only bites on tessellated
  geometry, so `displacementScale` is 0 unless a material sets it. Ship height
  maps anyway — they cost nothing unused and are there when a surface gets
  subdivided.
- **2K is the sensible default**; 4K only for the floors and the dome, which are
  the two surfaces a visitor actually gets close to at a grazing angle.

## Tuning without new files

`src/materials/library.json` carries the scalar side of every surface — colour
tint, roughness, metalness, normal strength, tiling density. Editing those is a
hot reload, not a rebuild. `tilesPerMetre` is the one to reach for first: it sets
apparent grain, and it is almost always what makes a scan read as the wrong size.
