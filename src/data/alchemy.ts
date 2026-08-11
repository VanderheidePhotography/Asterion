/**
 * The seven planetary metals of the alchemists, in the Chaldean order of the
 * spheres (Saturn down to the Moon). Each carries its classical planet and a
 * genuine note on its place in the Magnum Opus — the black, white and red
 * stages of the Great Work the library's alchemy shelves document — plus a
 * line an alchemist at the bench might mutter. Educational flavour, not craft.
 */
export interface Metal {
  name: string;
  /** the classical planet that rules the metal */
  planet: string;
  glyph: string;
  /** the colour of the phial's contents */
  color: string;
  /** an esoteric-historical reading tied to the traditions in the library */
  meaning: string;
  /** an aside an alchemist at the bench might offer */
  talk: string;
}

export const METALS: Metal[] = [
  {
    name: 'Lead', planet: 'Saturn', glyph: '♄', color: '#6b6f7a',
    meaning: 'The prima materia and the nigredo — Saturn’s heavy, base lead is where the Work begins. The blackened corpse that must rot before it can be reborn; the leaden weight of matter awaiting its release.',
    talk: '“Everything starts here, in the black. Do not flinch from the lead — it is only gold that has forgotten itself.”',
  },
  {
    name: 'Tin', planet: 'Jupiter', glyph: '♃', color: '#9aa4b0',
    meaning: 'Jupiter’s tin — expansive, kingly, the metal of benevolent rule. In the Work it marks the widening of the vessel, the generous dissolution before the salts are gathered and fixed.',
    talk: '“Jupiter’s metal, open-handed. Every Work needs its season of increase before the harvest.”',
  },
  {
    name: 'Iron', planet: 'Mars', glyph: '♂', color: '#7a3b2e',
    meaning: 'Mars’s iron — the fire and the blade, the martial heat that drives calcination. The alchemists’ sulphur made metal; a force that must be governed, lest it burn the Stone it was lit to forge.',
    talk: '“Mars gives the heat. Useful — but a furnace unwatched consumes the very thing you meant to make.”',
  },
  {
    name: 'Gold', planet: 'Sun', glyph: '☉', color: '#d4af37',
    meaning: 'Sol’s gold — the rubedo, the accomplished Stone. The incorruptible metal the whole Work aspires to: not mere wealth but the philosophical gold, consciousness made whole and crowned.',
    talk: '“And here is the goal — the reddening, the crowned child. Warm your hands; the long Work has ripened.”',
  },
  {
    name: 'Copper', planet: 'Venus', glyph: '♀', color: '#b87333',
    meaning: 'Venus’s copper — the green metal of love and conjunction. The vitriol and verdigris of the coniunctio, where Sol and Luna are wed; the fertile green lion of the emblem-books.',
    talk: '“Venus’s copper, the green work. Nothing is made gold that was not first made to love.”',
  },
  {
    name: 'Quicksilver', planet: 'Mercury', glyph: '☿', color: '#c0c4cc',
    meaning: 'Mercury’s quicksilver — the fluid spirit, neither solid nor wholly liquid. The universal solvent and mediator, Hermes moving between the metals; the volatile that must at last be fixed.',
    talk: '“Mercury will not be held. Catch him and he slips — and that slipperiness is the whole secret.”',
  },
  {
    name: 'Silver', planet: 'Moon', glyph: '☽', color: '#cfd4da',
    meaning: 'Luna’s silver — the albedo, the whitening after the black. The purified body washed clean, the moon’s mirror; the lesser stone that must precede the solar gold.',
    talk: '“Luna’s silver — the white stage. The corpse is washed and shines. Rest a moment, before the reddening.”',
  },
];
