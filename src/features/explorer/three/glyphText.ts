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

/**
 * Apply `asText` to EVERY canvas text draw in the application, once.
 *
 * The targeted approach was tried first and failed twice: the glyphs are
 * drawn from 71 call sites across 17 modules — the drum frieze, the dome
 * band, the floor, the orrery, the plates, the seals, the tables, the book
 * pages — and fixing the three I could find left the rest rendering as
 * stickers on the device I could not see. A rule that must be remembered at
 * 71 call sites is not a rule, it is a liability.
 *
 * So it is enforced in the one place they all pass through. Patching a DOM
 * prototype is a heavy instrument and deserves justification:
 *
 *   - It is exactly co-extensive with the problem. Every affected draw goes
 *     through fillText or strokeText; nothing else can produce the bug.
 *   - It cannot change layout or metrics. A variation selector is a zero-width
 *     request for a glyph FORM; `measureText` is left alone deliberately, and
 *     the text form is never wider than the emoji one it replaces.
 *   - It is idempotent. The selector is not itself in the symbol ranges, so
 *     text that has already been through here is unchanged.
 *   - It is inert on every platform but Apple's, which is the only one that
 *     colours these characters in.
 *
 * Installed once from main.tsx, before anything paints.
 */
export function installTextPresentation(): void {
  if (typeof CanvasRenderingContext2D === 'undefined') return;
  const proto = CanvasRenderingContext2D.prototype as CanvasRenderingContext2D & {
    __asterionTextForm?: boolean;
  };
  if (proto.__asterionTextForm) return; // hot reload, or a double import
  proto.__asterionTextForm = true;

  const fill = proto.fillText;
  const stroke = proto.strokeText;
  proto.fillText = function (text: string, x: number, y: number, maxWidth?: number) {
    return maxWidth === undefined
      ? fill.call(this, asText(String(text)), x, y)
      : fill.call(this, asText(String(text)), x, y, maxWidth);
  };
  proto.strokeText = function (text: string, x: number, y: number, maxWidth?: number) {
    return maxWidth === undefined
      ? stroke.call(this, asText(String(text)), x, y)
      : stroke.call(this, asText(String(text)), x, y, maxWidth);
  };
}
