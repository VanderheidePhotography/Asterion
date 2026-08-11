# Content Guidelines

The collection's credibility is its whole value. These rules are enforced by
tests where possible and by review discipline everywhere else.

## Adding an entity

Entities live in `src/data/entities/<cluster>.ts`. Each needs:

- `id` — kebab-case, stable forever (it is a URL).
- `type` — person / organization / work / symbol / concept / event / place / tradition.
- `epithet` — one poetic *but accurate* line; it appears on shelf labels and
  title pages.
- `summary` — 2–3 sentences, neutral register, no weasel words.
- `claims` — 2–4 statements, **each with an evidence level and citations**.
- `relations` — at least one; nothing may exist in isolation (tested).
- `year` — representative year; drives shelving order and the timeline
  (events, works, and organizations appear on the timeline page).

## The evidence rubric, applied

- **documented** — dates, imprints, diaries, minutes; multiple independent
  witnesses or a critical edition behind it.
- **primary** — what a period source *asserts* (the Fama's story of the
  vault; Anderson's 1738 account of 1717). Use when the source is the only
  witness. The claim text should make the reported nature visible.
- **scholarship** — an interpretation owned by a named scholar or the
  field's consensus ("Scholem argued…", "historians read the manifestos
  as…").
- **tradition** — what an organization or lineage teaches about itself.
- **legend** — mythic attribution (Hermes Trismegistus, Christian
  Rosenkreutz's 106 years).
- **speculation** — later readings presented as such (Gébelin's Egyptian
  tarot, psychological alchemy).

When the record is layered — the Zohar's traditional attribution *and*
Scholem's analysis — give each layer its own claim. Never flatten.

## Sources

Add to `src/data/sources.ts`. Primary sources and critical editions are
`kind: 'primary'`; academic literature is `kind: 'secondary'`. Prefer
standard scholarly works (university presses, established monographs).
A claim citing a source not in the bibliography **fails the test suite**.

## Tone

Museum label voice: warm, precise, unhurried. No credulity, no sneering.
Legends are told as the stories they are — labelled as legend.
