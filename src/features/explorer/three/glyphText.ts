/**
 * FORCE TEXT PRESENTATION ON THE SYMBOLS THIS MUSEUM IS BUILT FROM.
 *
 * The zodiac signs, the planets and the alchemical symbols are ordinary
 * Unicode characters, and on Apple platforms a good number of them default to
 * EMOJI presentation: iOS drew the drum frieze and the floor's signs as pink
 * rounded badges with white cartoon glyphs, which is exactly what an
 * eighteenth-century engraved frieze should not look like. It renders
 * correctly on macOS and on Android, so it never showed on the desk.
 *
 * The remedy is Unicode's own: VARIATION SELECTOR-15 (U+FE0E) after a
 * character asks explicitly for the text form, and every platform honours it.
 * (Its sibling U+FE0F asks for the emoji form, which is what iOS was
 * assuming.) The selector is invisible, costs one code unit, and is ignored
 * by fonts that only have a text glyph anyway — so it is safe to apply
 * broadly rather than trying to keep a list of exactly which characters a
 * given iOS version decides to colour in.
 *
 * Applied to every character in the symbol blocks the collection draws from:
 * Miscellaneous Symbols (which holds the zodiac and the planets), Dingbats,
 * and the alchemical block. Letters, digits and punctuation pass through
 * untouched.
 */

/** U+FE0E — "render the preceding character as text, not as an emoji" */
const TEXT_PRESENTATION = '︎';

/**
 * Code point ranges that can pick up an emoji face on some platform.
 *
 * Deliberately wider than the set iOS currently colours: the list changes
 * between OS versions, the selector is harmless on a character that was never
 * going to be coloured, and a frieze that silently turns into stickers on a
 * future iOS is a bug nobody will think to look for.
 */
const SYMBOL_RANGES: [number, number][] = [
  [0x2190, 0x21ff], // arrows
  [0x2300, 0x23ff], // technical (includes ⌛ ⏳ and friends)
  [0x25a0, 0x25ff], // geometric shapes
  [0x2600, 0x27bf], // misc symbols + dingbats — the zodiac and planets live here
  [0x2b00, 0x2bff], // misc symbols and arrows (stars)
  [0x1f300, 0x1f9ff], // the pictographic planes
];

function wantsSelector(code: number): boolean {
  return SYMBOL_RANGES.some(([lo, hi]) => code >= lo && code <= hi);
}

/**
 * Return `text` with a text-presentation selector after every symbol.
 *
 * Iterated by code POINT rather than by code unit, so astral characters are
 * not split in half — `for…of` over a string yields whole code points, which
 * `text[i]` does not.
 */
export function asText(text: string): string {
  let out = '';
  for (const ch of text) {
    out += ch;
    const code = ch.codePointAt(0);
    if (code !== undefined && wantsSelector(code)) out += TEXT_PRESENTATION;
  }
  return out;
}
