# Prompt: re-dress the eight wing halls as a druidic, earthy, deep-magic library

Paste the whole thing as a task prompt.

---

The eight wing corridors read cold and institutional — grey neoclassical stone, flat
lit, a tidy museum arcade. I want them to read as a **druid's deep library**: living
wood and old growth-stone, dark and green-brown, lit in pools rather than evenly,
with real depth and mystery down the length of the hall. Not a fantasy set-dress
sticker pass — the same standard of honesty the arcade already holds itself to
(`src/features/explorer/three/wingArcade.tsx`, the "nothing stops in mid-air" comment
at the top). Every new member must still carry something.

## The material change (do this first — it's most of the win)

`wingArcade.tsx` currently has one stone, `STONE = '#6b6455'`, at roughness 0.92, plus
`brass` and the `sigil` emissive. Rework the palette so the order stops reading as
marble:

- Split the single stone into **two** materials: a damp, dark base stone for
  everything below the stack cornice (a green-black, low-saturation slate), and a
  warmer, lichen-touched stone above the cornice where the light actually reaches.
  Real halls are darker at the bottom; the current uniform value is why it looks flat.
- The corbelled shafts and capitals should read as **timber**, not stone — the
  three-roll cluster becomes bundled limbs, the `bell`/`abacus` a carved wooden
  capital. Keep the exact same geometry footprint and instancing scheme; change
  the material and add a bark/grain canvas alongside `flutes()` in
  `textures.ts` (same trick — painted detail, zero extra vertices).
- Keep the brass. Brass against green-black wood is the whole mood; brass against
  grey marble is a bank lobby. But drop its `roughness` so it reads as old,
  hand-rubbed metal rather than new gilt.
- Tint the fluted pilaster shafts to the new base. Note the existing warning in the
  file: `flutes()` bakes its own base colour, so pass the new colour in rather than
  tinting the material on top of it, or the shafts go black again.

## Growth over the order

Add one new instanced part set, in the same `Parts` pattern already in the file (one
draw call per part, `frustumCulled={false}`, geometry disposed in a `useLayoutEffect`):

- **Ivy/root runners** climbing the pilasters at `PIER_US` and spilling off the stack
  cornice. Cheap: a few alpha-cut quad strips with a painted leaf canvas, instanced,
  never more than 2–3 draw calls total.
- **Moss** in the corbel fillets and along the cornice chamfer — a dark green emissive-
  free band, not a separate mesh if a texture on the existing chamfer will do.
- Vary it per hall by `WING_ANGLES` index so the eight wings aren't identical; one or
  two halls should be nearly overgrown, others barely touched.

## Light — the single biggest cause of "poor"

The halls are evenly lit and therefore have no depth. Change that:

- Light in **pools with dark between them**. Fixture light already exists (see the
  comment in `furniture.tsx` about only some fixtures in a wing carrying a real light)
  — lean harder into it: fewer real lights, higher intensity, warmer colour, and
  genuinely dark stretches between the bays.
- Warm amber at the fixtures, and a cold green-blue fill from the vault so the two
  read against each other down the corridor's length.
- The rib bosses at `CROWN_Y` already glow via the `sigil` emissive material without
  costing a light. Extend that idea: **emissive-only** carved sigils on the capitals
  and low along the base stone, so the hall has glowing points receding into the
  distance. That's what sells depth — a line of small lights running away from you.
- Add distance fog / exponential falloff tuned so the far end of a 46 m hall goes
  properly dark and you can't read the end wall until you walk toward it. Check
  `atmosphere.tsx` for what's already there before adding a second system.

## Air

`DustMotes.tsx` exists. In the halls it should be slower, sparser, and drifting
*through the light pools only* — motes in the dark are invisible noise and wasted
fill rate. Consider a low ground haze in the darkest bays.

## Hard constraints

- Node 23.7.0 via nvm.
- Instanced meshes only for anything repeated across the eight halls, exactly as
  `WingArcade` does now. Do not regress the draw-call budget — the file's own history
  is that the old colonnade cost 800 draw calls to be wrong in. State the before/after
  draw-call count when you're done.
- No `drei` `Text`, no fiber pointer events. `TextSprite` and `ManualPicker` only.
- Every derived height (`SPRING_Y`, `CORNICE_Y`, `CROWN_Y`) stays derived. Don't
  hardcode a number the vault section already implies.
- Don't touch the load path. `floor → pilaster → stack cornice → corbel → shaft →
  capital → rib → vault` must still be legible; you're changing what it's *made of*
  and how it's *lit*, not removing members.

## Order of work

1. Palette + materials in `wingArcade.tsx` (biggest visual delta, smallest diff).
2. Bark/leaf canvases in `textures.ts`.
3. Lighting and fog rework.
4. Growth instances.
5. Motes/haze.

Run the app and screenshot a hall from the rotunda mouth looking down its length after
each stage, so the change is visible step by step.
