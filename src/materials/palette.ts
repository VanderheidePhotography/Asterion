/**
 * The colour script.
 *
 * One palette for the whole building, so that lighting, materials and effects
 * are arguing about the same ten colours rather than each inventing their own.
 * Nothing here is saturated and nothing here is bright: the museum is roughly
 * 85% shadow, 10% warm illumination, 5% magical light, and a single unearned
 * chroma anywhere reads instantly as a video game.
 */

export const PALETTE = {
  /* ── surfaces ── */
  blackWalnut: '#2a1d14',
  agedBronze: '#6b5334',
  burnishedBrass: '#b98a3d',
  deepEmerald: '#1f3a30',
  midnightBlue: '#16203a',
  charcoal: '#22201e',
  stoneGrey: '#6e6a62',
  burgundy: '#5a1f28',

  /* ── light ── */
  /** through the oculus and the high windows: cool, silver, directionless */
  moonlitSilver: '#aebccb',
  /** candles and oil lamps: the only warmth in the building */
  candleGold: '#ffb757',
  /** hearth, at the bottom of its flicker */
  emberDeep: '#c4581f',
  /** relics and glowing manuscripts — restrained, never neon */
  relicGold: '#f0d492',
} as const;

/**
 * The budget the whole scene is graded against. Kept as data so the lighting
 * rig, the tone mapping and any future exposure adaptation can all be checked
 * against the same target rather than tuned by eye in three separate files.
 */
export const LIGHT_BUDGET = {
  /** fraction of the frame that should sit below the shadow floor */
  shadow: 0.8,
  /** warm practical sources — candles, lamps, hearth */
  warm: 0.15,
  /** anything self-luminous and esoteric */
  magical: 0.05,
} as const;

export type PaletteKey = keyof typeof PALETTE;
