import type { PlanetLore } from './planetLore';

/**
 * CLAVICVLA — the seals and pentacles of Solomon, thrown up as light over the
 * middle of the table.
 *
 * Each of these is a real figure from a real manuscript with a stated PURPOSE,
 * and the purpose is the interesting part. A pentacle in the Key of Solomon is
 * not a decoration and not a general-purpose charm: it is a specific instrument
 * with a specific office, made of a specific metal, at a specific planetary
 * hour, and inscribed with a specific verse of scripture chosen because its
 * literal sense matches the work. The tradition is bureaucratic to a degree
 * modern occultism has largely lost — every figure is a warrant made out for
 * one named thing.
 *
 * The planetary squares (the kameas) are drawn where the tradition uses them,
 * and they are real magic squares: Saturn's 3×3, Jupiter's 4×4, Mars's 5×5,
 * Venus's 7×7, Mercury's 8×8 and the Moon's 9×9, each summing correctly in
 * every row, column and diagonal. Agrippa prints all seven in Book II of the
 * De Occulta Philosophia (1533), and the sigils of the planetary spirits are
 * drawn by tracing the numbers of the square in order — which is why a sigil
 * looks like a doodle and is in fact a path through an arithmetic object.
 */

export type Figure =
  | 'hexagram'
  | 'pentagram'
  | 'kamea'
  | 'wheel'
  | 'cross'
  | 'aemeth'
  | 'sator';

export interface Seal {
  key: string;
  /** the name as the Key of Solomon gives it */
  name: string;
  /** which planet's hour and metal it belongs to */
  planet: string;
  glyph: string;
  metal: string;
  /** the office it is made for, in the Key's own register */
  purpose: string;
  /** the verse the manuscript sets around it */
  versicle: string;
  /** what is drawn at the middle */
  figure: Figure;
  /** the kamea's order, where the figure is a magic square */
  order?: number;
  colour: string;
}

export const SEALS: readonly Seal[] = [
  {
    key: 'sig:solomon',
    name: 'The Seal of Solomon',
    planet: 'All',
    glyph: '✡',
    metal: 'Gold, or a ring of brass',
    purpose: 'To bind and to command; the seal set on the brazen vessel.',
    versicle: 'Sigillum Salomonis · quo spiritus vincti sunt',
    figure: 'hexagram',
    colour: '#ffd98d',
  },
  {
    key: 'sig:saturn',
    name: 'The First Pentacle of Saturn',
    planet: 'Saturn',
    glyph: '♄',
    metal: 'Lead',
    purpose:
      'To command the spirits of Saturn, and to make them obey; the Key sets it first because Saturn governs binding and constraint.',
    versicle: '“Thou hast set a bound that they may not pass over.” — Ps. 104:9',
    figure: 'kamea',
    order: 3,
    colour: '#9a8fa8',
  },
  {
    key: 'sig:jupiter',
    name: 'The Third Pentacle of Jupiter',
    planet: 'Jupiter',
    glyph: '♃',
    metal: 'Tin',
    purpose:
      'For defence and protection, and against every peril whatsoever; it is the pentacle a traveller was told to carry.',
    versicle: '“He shall give his angels charge over thee.” — Ps. 91:11',
    figure: 'kamea',
    order: 4,
    colour: '#e0c68a',
  },
  {
    key: 'sig:mars',
    name: 'The Fifth Pentacle of Mars',
    planet: 'Mars',
    glyph: '♂',
    metal: 'Iron',
    purpose:
      'Terrible unto the demons; at its sight they will obey, for they cannot resist its presence. Made in the hour of Mars, in the day of Mars.',
    versicle: '“Who is like unto thee among the gods?” — Ex. 15:11',
    figure: 'kamea',
    order: 5,
    colour: '#d97a5a',
  },
  {
    key: 'sig:sol',
    name: 'The Fourth Pentacle of the Sun',
    planet: 'The Sun',
    glyph: '☉',
    metal: 'Gold',
    purpose:
      'To see hidden things, and to know what is done in secret; the Key adds that it serveth also to find that which is lost.',
    versicle: '“Let there be light, and there was light.” — Gen. 1:3',
    figure: 'wheel',
    colour: '#ffd070',
  },
  {
    key: 'sig:venus',
    name: 'The First Pentacle of Venus',
    planet: 'Venus',
    glyph: '♀',
    metal: 'Copper',
    purpose:
      'To draw friendship and goodwill, and to reconcile those at variance; it is to be made in the hour of Venus and shown, not worn hidden.',
    versicle: '“Behold, how good and how pleasant it is for brethren to dwell together.” — Ps. 133:1',
    figure: 'kamea',
    order: 7,
    colour: '#8fc4a0',
  },
  {
    key: 'sig:mercury',
    name: 'The Second Pentacle of Mercury',
    planet: 'Mercury',
    glyph: '☿',
    metal: 'Quicksilver, or silvered brass',
    purpose:
      'To open that which is shut, and to gain knowledge and understanding of hidden matters; the pentacle of scholars and of thieves alike.',
    versicle: '“Wisdom and might are his; he revealeth the deep and secret things.” — Dan. 2:20–22',
    figure: 'kamea',
    order: 8,
    colour: '#a8c0d8',
  },
  {
    key: 'sig:luna',
    name: 'The Third Pentacle of the Moon',
    planet: 'The Moon',
    glyph: '☽',
    metal: 'Silver',
    purpose:
      'Against all peril by water, and for safe travelling by night; the Key says it is to be worn about the neck and never shown.',
    versicle: '“He led them through the deep, as through the wilderness.” — Ps. 106:9',
    figure: 'kamea',
    order: 9,
    colour: '#cfd6e2',
  },
  {
    key: 'sig:aemeth',
    name: 'The Sigillum Dei Aemeth',
    planet: 'The seven governors',
    glyph: '✷',
    metal: 'Beeswax, nine inches across',
    purpose:
      'Not a talisman but a TABLE: the seal on which Dee stood the shewstone, and on whose seven-sided figure the whole angelic system was hung.',
    versicle: 'AEMETH — אמת — truth',
    figure: 'aemeth',
    colour: '#e8dcc0',
  },
  {
    key: 'sig:sator',
    name: 'The SATOR Square',
    planet: 'None — a folk seal',
    glyph: '⊞',
    metal: 'Any: scratched, baked, written on a rag',
    purpose:
      'Against fire, against madness, against fever, and to help a woman in labour; the most widely used written charm in Europe, and nobody knows what it means.',
    versicle: 'SATOR AREPO TENET OPERA ROTAS',
    figure: 'sator',
    colour: '#c0b48c',
  },
];

/** the five words of the SATOR square, which read the same in all directions */
export const SATOR = ['SATOR', 'AREPO', 'TENET', 'OPERA', 'ROTAS'] as const;

/**
 * The magic square of a planet, computed rather than tabulated.
 *
 * Odd orders use the Siamese method (start at the top middle, step up-and-right,
 * drop one when blocked), which is how the 3, 5, 7 and 9 squares in Agrippa are
 * constructed. Doubly-even orders — 4 and 8 — fill in order and then reflect the
 * values on the two diagonal patterns of each 4×4 block. Order 6, the Sun's, is
 * singly even and needs the LUX construction, which is why the Sun's pentacle
 * on this plate is drawn as a wheel instead: better to omit a square than to
 * print one that does not add up.
 */
export function kamea(n: number): number[][] {
  const grid: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  if (n % 2 === 1) {
    let i = 0;
    let j = (n - 1) / 2;
    for (let v = 1; v <= n * n; v++) {
      grid[i][j] = v;
      const ni = (i - 1 + n) % n;
      const nj = (j + 1) % n;
      if (grid[ni][nj]) i = (i + 1) % n;
      else {
        i = ni;
        j = nj;
      }
    }
    return grid;
  }
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      const v = i * n + j + 1;
      const onDiag = i % 4 === j % 4 || (i % 4) + (j % 4) === 3;
      grid[i][j] = onDiag ? n * n + 1 - v : v;
    }
  return grid;
}

export const SEAL_LORE: Record<string, PlanetLore> = Object.fromEntries(
  SEALS.map((s) => [
    s.key,
    {
      name: s.name,
      glyph: s.glyph,
      meta: [`Planet: ${s.planet}`, `Metal: ${s.metal}`, s.figure === 'kamea' ? `Kamea of ${s.order}` : 'Figure'],
      body: '',
      talk: '',
    } as PlanetLore,
  ]),
);

/* ————— the readings proper —————
 * Written out rather than generated, because each of these has its own history
 * and the generated stub above only carries the attribute chips. */
const WRITTEN: Record<string, Pick<PlanetLore, 'body' | 'talk'>> = {
  'sig:solomon': {
    body:
      'The hexagram called the Seal of Solomon is one figure with two quite separate histories, and conflating them is the commonest error in the whole subject. As a MAGICAL device it is old, widespread and religiously unspecific: interlaced triangles appear on Jewish, Christian and Islamic amulets from late antiquity onward, in Arabic as khātam Sulaymān, and the legend of Solomon’s ring — engraved with the divine name, by which he commanded the jinn and built the Temple — is common to all three traditions and reaches its fullest form in the Testament of Solomon. As a JEWISH NATIONAL symbol the same shape is remarkably recent: the Magen David is attested on the Jewish community’s flag in Prague from the fourteenth century, is adopted widely only in the nineteenth as an equivalent to the cross, and becomes the emblem of Zionism at the 1897 Basel congress and of the State of Israel in 1948. In between, the Nazis compelled Jews to wear it, which is why the shape carries what it carries. In the Goetia this is the seal stamped on the brazen vessel; in Western ceremonial magic it is the figure of the macrocosm, the four elements written as two triangles, fire and water crossed and air and earth with them.',
    talk: '“Two triangles. It is on amulets from three religions, on the vessel in the Goetia, on a flag, and it was sewn onto coats by people who had no choice. Do not read it as one thing.”',
  },
  'sig:saturn': {
    body:
      'Saturn is the planet of limit, and this pentacle is the Key’s instrument of constraint: it is made in lead, in the day and hour of Saturn, and its office is to compel the spirits of that sphere to appear and obey. At its centre is the kamea of Saturn — the 3×3 magic square, 4 9 2 / 3 5 7 / 8 1 6 — every row, column and diagonal summing to fifteen, the whole summing to forty-five. This is the oldest magic square known: it is the Chinese Luo Shu, described in texts of the first millennium BC as having appeared on the shell of a turtle rising from the river Luo, and it arrives in the West through Arabic sources as the square of Zuḥal, Saturn. Agrippa prints it in 1533 with the seals derived from it. Those derivations are what the numbers are really for: draw a line from cell 1 to cell 2 to cell 3 and so on through all nine and you have traced the sigil of the planet’s intelligence; other paths give the spirit’s sigil. Every one of those doodles in the grimoires is a route through an arithmetic object, which is a far stranger and better fact than the mystery it is usually presented as.',
    talk: '“Fifteen every way, and it came out of a river on a turtle’s back three thousand years ago. Draw a line through one to nine in order and you have the spirit’s sigil. That is all a sigil ever was.”',
  },
  'sig:jupiter': {
    body:
      'The pentacle of protection, and the one most often actually made. Jupiter is the greater benefic, his metal is tin, his day Thursday, and the Third Pentacle in the Key of Solomon is given the plainest possible office: defence and protection against every peril. Its kamea is the 4×4 square summing to thirty-four in every direction — the same square, up to reflection, that Dürer engraved in the top right of Melencolia I in 1514, with the two middle cells of the bottom row reading 15 and 14 for the year. That Dürer put a Jupiter square into a plate about Saturnine melancholy is not decoration: Ficino’s prescription for the melancholic scholar in De Vita is precisely to draw down Jupiter as a counterweight, and the engraving is following the medicine. It is one of the very few places where a specific magical instruction and a specific great artwork can be matched line for line. The versicle set round the border is Psalm 91:11, which is the verse most used in the entire amulet tradition of Europe, and which is also the verse Satan quotes in the temptation in the wilderness.',
    talk: '“It is in the corner of Melencolia I, with the date hidden in the bottom row. Dürer was not decorating. He was taking Ficino’s prescription for a melancholic.”',
  },
  'sig:mars': {
    body:
      'The Fifth Pentacle of Mars is the crisis instrument, and the Key’s language for it is unusually direct: it is terrible unto the demons, and at its sight they will obey, for they cannot resist its presence. It is to be made in iron, in the day and hour of Mars, and it is the figure an operator holds up when a working is going wrong. Its kamea is the 5×5 square summing to sixty-five, whose total is 325, and Mars’s numbers were held to be the harshest of the seven. What is worth noticing here is the register. The pentacles of the Key are not requests; they are the visible proof of a delegated authority, and the entire ritual grammar is that of a court — a summons, a warrant, a seal, a penalty for contempt. When the Goetia’s conjurations escalate they threaten the spirit with being cast into the vessel and into the lake of fire, and the pentacle is the document produced at that point. Whatever else this material is, it is the imagination of a legal culture, made by men who had watched real courts work and expected the invisible world to be governed the same way.',
    talk: '“At its sight they will obey. It is not a prayer, it is a warrant — and the whole ritual is a summons served on something that cannot read.”',
  },
  'sig:sol': {
    body:
      'The Fourth Pentacle of the Sun is for seeing: to know hidden things, to see what is done in secret, and — the Key adds, in its practical way — to find what is lost. Gold, Sunday, the hour of the Sun. The reason it is drawn here as a rayed wheel rather than a square is arithmetic and worth admitting: the Sun’s kamea is the 6×6, the only one of the seven that is singly even, and it cannot be built by either of the simple constructions used for the other six. It needs the LUX method, and rather than print a square that does not add up, this plate draws the Sun’s figure instead. That gap is itself a small piece of history. Agrippa gives all seven squares and does not explain how any of them is made, because the constructions were trade knowledge passed among practitioners and Arabic mathematicians who had been building magic squares systematically since the tenth century — Al-Būnī’s Shams al-Maʿārif is full of them. The seals of the West arrive already assembled, with the mathematics stripped out, which is why they look arbitrary and are not.',
    talk: '“To find what is lost — the most-used office of any pentacle in the book, and the least glamorous. Most magic ever performed was about missing property.”',
  },
  'sig:venus': {
    body:
      'Copper, Friday, the hour of Venus: a pentacle to draw friendship and goodwill, and to reconcile those who are at odds. The Key specifies that it should be shown rather than concealed, which is unusual — most of the pentacles are worn hidden — and the reason is simple enough that it is easy to miss: this one works on people. Its kamea is the 7×7 square, summing to 175, total 1225. The office belongs to the largest and least dramatic category of historical magic, which is not summoning at all but the ordinary human business of love, quarrels, illness, theft and luck. The court records of the early modern period are full of cunning-folk consulted about exactly these things, and the demand was constant across every social level. It is worth setting against the demonology on the neighbouring plate: the surviving grimoires, with their circles and their hierarchies of spirits, represent a learned minority practice belonging to men with books, while the overwhelming majority of magic actually performed in Europe was a copper token, a charm on paper, or a few words said over a sick animal.',
    talk: '“Nearly all magic ever done was about love, theft, and a sick cow. The circles and the demon-kings are the university end of a very large and very ordinary trade.”',
  },
  'sig:mercury': {
    body:
      'To open what is shut, and to gain understanding of hidden matters — the pentacle of scholars and, the tradition cheerfully admits, of thieves. Mercury is the messenger, the interpreter, the patron of writing and commerce and cunning, and the ambiguity is his and not a later corruption. His kamea is the 8×8 square, summing to 260 in every line, and it is by a long way the handsomest of the seven; the sigils traced through it are correspondingly intricate. Mercury is also the hinge between this plate and half the museum, because Hermes Trismegistus — thrice-greatest Hermes, the supposed Egyptian sage from whom the Corpus Hermeticum descends and after whom the whole Hermetic tradition is named — is this god, syncretised with Thoth in Ptolemaic Egypt. When Ficino translated the Corpus for Cosimo de’ Medici in 1463, interrupting his Plato to do it because Cosimo wanted the older wisdom first, the Renaissance believed it was reading a contemporary of Moses. Casaubon showed in 1614 that the texts were written in the first three centuries AD. The tradition carried on regardless, which is a fact about traditions.',
    talk: '“Scholars and thieves, and the same god presides over both. He also lends his name to this entire library, which I have always thought the tradition should sit with more often.”',
  },
  'sig:luna': {
    body:
      'Silver, Monday, the hour of the Moon: against peril by water and for safe travel by night, worn about the neck and never shown. Her kamea is the 9×9 square, summing to 369, and its total — 3321 — is the largest of the seven, which the tradition reads as her being the nearest and busiest of the planets. This is a travelling amulet, and travelling amulets are the best-attested magical objects in Europe because they were carried, lost, and dug up: pilgrim badges, lead crosses, folded paper charms, inscribed rings. What the archaeology shows is that the same person very often carried a Christian relic-badge and a written charm and a planetary token together, with no sense of contradiction at all, and that the Church’s repeated condemnations were aimed at a practice it could not separate from ordinary devotion. The distinction between a prayer, a blessing and a charm is one that theologians drew and almost nobody else observed. This pentacle sits exactly on that line, which is why it carries a psalm verse: it is asking to be read as devotion, and it knows the question is going to be asked.',
    talk: '“Round the neck, never shown, for the water and the dark. People carried these next to a pilgrim badge and saw no difficulty. Only the theologians did.”',
  },
  'sig:aemeth': {
    body:
      'This one is not a talisman at all and it is on the plate to say so. The Sigillum Dei Aemeth is a table: a disc of beeswax nine inches across and an inch and a bit thick, engraved with a heptagram, seven names, and a great many letters and numbers, of which Dee made five — four small ones under the legs of his holy table and one large one on top, on which the shewstone stood. The design descends from a much older tradition, the Liber Iuratus Honorii of the thirteenth century, and Dee took it from that and elaborated it under the angels’ dictation. The word AEMETH is Hebrew emet, truth. What makes the object worth standing in front of is that it survives: it is in the British Museum, along with the obsidian mirror, the crystal, and the gold disc showing the Vision of the Four Castles, and Elias Ashmole recorded that a maidservant used some of Dee’s papers to line pie tins. The whole Enochian system — the alphabet, the nineteen Calls, the Watchtowers that the Golden Dawn built its ritual on and that Crowley worked through in the Algerian desert — was received sitting at this table.',
    talk: '“Not a charm. A table — the thing the crystal stood on. It is in a case in Bloomsbury, and a housemaid used the papers that go with it to line pie tins.”',
  },
  'sig:sator': {
    body:
      'Five words in a five-by-five grid that read the same across, down, backwards and upwards: SATOR AREPO TENET OPERA ROTAS. It is the most widely used written charm in the history of Europe — found scratched at Pompeii before AD 79, which fixes its date beyond argument, and then in Roman Britain at Cirencester, in Coptic Egypt, in Carolingian manuscripts, carved into a church wall in Oppède, baked into bread in the Alps, and copied out for use against fire, fever, madness, snakebite, toothache and the difficulties of childbirth as late as the twentieth century in Europe and among the Pennsylvania Dutch. What it MEANS is genuinely unknown. The Latin is at best strained — roughly, the sower Arepo holds the wheels with effort — and AREPO is not a word, appearing nowhere else in Latin. The best-known theory, published independently by Grosser and Agrell in 1926, is that its letters rearrange into PATERNOSTER twice in a cross, with A and O left over for alpha and omega; the Pompeii dates make a Christian origin awkward but not impossible. Others read it as Jewish, Mithraic, or simply a scribal puzzle that acquired power by being old and strange. That last explanation is the one the evidence best supports, and it is the more interesting for it.',
    talk: '“Scratched on a wall at Pompeii, and still being baked into bread in the twentieth century. Two thousand years of use, and not one person has ever established what it says.”',
  },
};

for (const [key, w] of Object.entries(WRITTEN)) {
  SEAL_LORE[key].body = w.body;
  SEAL_LORE[key].talk = w.talk;
}

/* ————— the three studs, which are about the books rather than the figures ————— */
SEAL_LORE['sig:clavicula'] = {
  name: 'The Key of Solomon',
  glyph: '🗝',
  meta: ['Clavicula Salomonis', 'Greek, 15th c. · Latin & Italian, 16th–18th', 'Mathers, 1889'],
  body:
    'The Key of Solomon is not one book. It is a family of manuscripts — well over a hundred survive, in Greek, Latin, Italian, French, Hebrew and English — whose earliest witnesses are fifteenth-century Greek and whose material is demonstrably older, drawing on Jewish, Arabic and late-antique sources. There is no original and no author; each copyist reorganised, added and dropped, which is why no two copies agree on the order of the pentacles or even on how many there are. Its subject is not summoning demons, whatever the reputation: the great bulk of the text is preparation — the purification of the operator, the making and consecration of the knife, the sword, the wand, the pen, the ink, the parchment, the wax, the silk — and the pentacles themselves, which are given by planet with their offices. The version everyone actually reads is S. L. MacGregor Mathers’s of 1889, made from seven British Museum manuscripts, and Mathers made editorial choices that have since become the tradition: he silently omitted operations he considered black, standardised the pentacle designs from the ones he thought best drawn, and imposed a coherence the manuscripts do not have. Nearly every pentacle reproduced in the last century is his drawing.',
  talk: '“There is no original. A hundred manuscripts, none agreeing, and the version you have seen is a Victorian occultist’s tidy-up of seven of them.”',
};
SEAL_LORE['sig:making'] = {
  name: 'How a Pentacle Is Made',
  glyph: '⚒',
  meta: ['The right metal, the right hour', 'Virgin parchment, or the planet’s metal', 'And the versicle'],
  body:
    'The instructions are specific to a degree that tells you a great deal about what the practice actually was. The pentacle is made in the metal of its planet — lead for Saturn, tin for Jupiter, iron for Mars, gold for the Sun, copper for Venus, quicksilver or silvered brass for Mercury, silver for the Moon — or, if that is beyond the operator’s means, on virgin parchment made from an animal not yet capable of generation, in ink prepared for the purpose. It must be begun and finished within the day and hour of its planet, calculated by the unequal hours from that day’s sunrise in the Chaldean order, which means an operator needed either an almanac or an astrolabe and knew how to use one. It is then consecrated with prayer, incense and sprinkling, wrapped in silk of its own colour, and not shown to anyone. Round its border goes a versicle — a verse of a psalm or of scripture whose literal sense matches the office, so that the figure is, in effect, a citation. The whole procedure is a species of very careful clerical work, and the people who could perform it correctly were the people who could read Latin, tell the time astronomically, and afford the materials.',
  talk: '“The right metal, on the right day, in the right hour, finished before the hour ends — and then wrapped in silk and never shown. It is exacting clerical work, and that is the point of it.”',
};
SEAL_LORE['sig:kamea'] = {
  name: 'The Planetary Squares',
  glyph: '⊞',
  meta: ['Agrippa, De Occulta Philosophia II, 1533', 'Luo Shu · al-Būnī · Dürer', 'A sigil is a path'],
  body:
    'The seven kameas are genuine magic squares of orders three to nine, one per planet, each summing correctly in every row, column and diagonal, and they are the most mathematically respectable objects in this entire building. Their history runs the other way from the usual story: the 3×3 is the Chinese Luo Shu of the first millennium BC; Arabic mathematicians from the tenth century onward built general constructions for every order and wrote them up as mathematics; al-Būnī’s Shams al-Maʿārif attaches them to planets and letters; and they arrive in Latin Europe already assembled, with the constructions stripped out, in Agrippa’s Book II of 1533. What the numbers are FOR, in the magical tradition, is sigil-making: you draw a continuous line from the cell containing 1 to the cell containing 2 and onward through the whole square, and the shape that path makes is the sigil of the planet’s intelligence; different rules give the spirit’s. Every occult sigil you have ever seen that looks like an arbitrary squiggle was produced by a rule of that kind, either from a square or from a letter-grid. They are not arbitrary at all. They are just algorithms whose inputs have been forgotten.',
  talk: '“Every squiggle in every grimoire is a path through a grid, drawn by a rule. Forget the rule and it looks like a mystery. It was never a mystery — it was a procedure.”',
};
