import type { PlanetLore } from './planetLore';

/**
 * CIRCVLVS ARTIS — the magic circle and the Triangle of Art.
 *
 * A round table already IS a magic circle, which is the joke this plate is
 * built on, and the operation it draws is the best-documented ritual in the
 * Western tradition: the circle of divine names with the operator inside it,
 * the brazen vessel, the censer, the sword, and — set OUTSIDE the circle, to
 * the east — the triangle with a black mirror in it, into which the spirit is
 * commanded to appear.
 *
 * The tone this plate has to hold is the one the whole museum runs on. These
 * are real historical documents with real datable sources and a real
 * transmission history, and almost everything popularly said about their age is
 * wrong. The Lemegeton is a seventeenth-century compilation. Its list of
 * spirits is lifted, in order, from a sixteenth-century appendix written by a
 * physician who was arguing that the whole business was a delusion. Most of
 * what survives of medieval demonology survives because sceptics printed it in
 * order to attack it — which is a fact worth more than any amount of atmosphere.
 */

/**
 * The ten divine names of the outer ring.
 *
 * These are the names of the ten sephirot as the Golden Dawn fixed them, which
 * is the arrangement almost every modern printing of the Goetic circle uses.
 * The earlier manuscripts are far less tidy — the Sloane and Harley copies of
 * the Lemegeton carry various sets, often garbled, and the tidy sephirotic
 * scheme is a nineteenth-century regularisation of them.
 */
export const DIVINE_NAMES: readonly { latin: string; hebrew: string; gloss: string }[] = [
  { latin: 'EHEIEH', hebrew: 'אהיה', gloss: 'I Am — Kether' },
  { latin: 'IAH', hebrew: 'יה', gloss: 'Chokmah' },
  { latin: 'IHVH ELOHIM', hebrew: 'יהוה אלהים', gloss: 'Binah' },
  { latin: 'EL', hebrew: 'אל', gloss: 'Chesed' },
  { latin: 'ELOHIM GIBOR', hebrew: 'אלהים גבור', gloss: 'Geburah' },
  { latin: 'IHVH ELOAH VA-DAATH', hebrew: 'יהוה אלוה ודעת', gloss: 'Tiphareth' },
  { latin: 'IHVH TZABAOTH', hebrew: 'יהוה צבאות', gloss: 'Netzach' },
  { latin: 'ELOHIM TZABAOTH', hebrew: 'אלהים צבאות', gloss: 'Hod' },
  { latin: 'SHADDAI EL CHAI', hebrew: 'שדי אל חי', gloss: 'Yesod' },
  { latin: 'ADONAI MELEKH', hebrew: 'אדני מלך', gloss: 'Malkuth' },
];

/** the four archangels of the quarters, and the elements they are given */
export const QUARTERS: readonly { name: string; hebrew: string; dir: string; element: string; bearing: number; colour: string }[] = [
  { name: 'RAPHAEL', hebrew: 'רפאל', dir: 'ORIENS', element: 'Air', bearing: 0, colour: '#e8e0c0' },
  { name: 'MICHAEL', hebrew: 'מיכאל', dir: 'MERIDIES', element: 'Fire', bearing: Math.PI / 2, colour: '#e8a070' },
  { name: 'GABRIEL', hebrew: 'גבריאל', dir: 'OCCIDENS', element: 'Water', bearing: Math.PI, colour: '#88b8d0' },
  { name: 'URIEL', hebrew: 'אוריאל', dir: 'SEPTENTRIO', element: 'Earth', bearing: -Math.PI / 2, colour: '#a8b088' },
];

/** the three names lettered on the sides of the Triangle of Art */
export const TRIANGLE_NAMES = ['MICHAEL', 'ANEXHEXETON', 'PRIMEUMATON'] as const;

/** the triangle stands outside the circle, to the east — which on this plate is
 *  world +x, the visitor's right hand as they stand at the console */
export const EAST = 0;

export const GOETIA_LORE: Record<string, PlanetLore> = {
  'circ:circulus': {
    name: 'The Circle',
    glyph: '◯',
    meta: ['Nine feet across, by the book', 'Names, not power', 'Key of Solomon, Book II'],
    body:
      'The circle is not a battery and it is not a barrier in any physical sense the texts claim; it is a statement of jurisdiction. The operator stands inside a boundary inscribed with the names of God and of his own authority, and the whole logic of the ritual is legal rather than energetic — the spirit is commanded in the name of a superior, exactly as a summons is served. The Key of Solomon specifies nine feet in diameter, drawn with a consecrated knife or in chalk or on virgin parchment, and gives elaborate instructions for the days of preparation, the bathing, the fasting, the vestments and the timing by the planetary hour. Every one of those requirements does something a modern reader can recognise: days of fasting and abstinence, sleeplessness, a night-time working by candle and censer, and a long recitation in an unfamiliar language are between them a fairly reliable recipe for altered perception, and the practitioners were not naive about this — the texts insist on the preparation precisely because without it nothing happens. What the circle mainly protects is the operator’s nerve. That is not a small function when the operation is designed to produce an apparition.',
    talk: '“It is not a wall. It is a claim of authority, written down where you can stand on it — and after three days of fasting you will need something to stand on.”',
  },
  'circ:triangulum': {
    name: 'The Triangle of Art',
    glyph: '△',
    meta: ['Outside the circle, to the east', 'MICHAEL · ANEXHEXETON · PRIMEUMATON', 'Two feet from the circle'],
    body:
      'The Triangle of Art is where the spirit is required to appear, and its position carries the entire argument of the ritual: it is OUTSIDE the circle, and two feet from it. The operator’s protection and the spirit’s place of manifestation are separate figures, and everything is arranged so that nothing crosses from one to the other. Its three sides are lettered MICHAEL, ANEXHEXETON and PRIMEUMATON — the archangel who binds, and two of the barbarous names, words with no meaning in any language which the tradition insists must be pronounced exactly as written. Their untranslatability is doctrinal rather than accidental: Iamblichus, in the third century, defends the use of unintelligible divine names on the ground that their power lies in the sounds themselves and not in what they signify, and warns explicitly against translating them. That argument passes into the Greek Magical Papyri, into the medieval grimoires, and out again into every modern ritual system. Inside the triangle sits the black mirror, and the direction is east because that is where the sun rises and where a church is oriented — a working of this kind borrows every scrap of authority it can reach.',
    talk: '“Outside the circle, and two feet clear of it. The whole geometry is about keeping two things apart, and the operator is on the safe side of the gap.”',
  },
  'circ:speculum': {
    name: 'The Black Mirror',
    glyph: '◍',
    meta: ['Scrying', 'Dee’s obsidian mirror, British Museum', 'Aztec, by way of the Spanish'],
    body:
      'A dark, featureless surface with no detail for the eye to hold is what a scryer needs, and the tradition has used still water in a bowl, a polished black stone, ink pooled in the palm, a crystal ball, and a mirror backed with black paint. What is being exploited is a real perceptual effect: deprive vision of stable structure and it begins to supply its own, which is why prolonged staring into an empty field produces drifting forms, faces and movement in almost anybody. That is the Ganzfeld effect, and it has been studied experimentally since the 1930s. The most famous object of this kind in the world is in the British Museum: John Dee’s mirror of polished obsidian, together with his crystal, his wax Sigillum Dei Aemeth and his gold Vision of the Four Castles. The mirror is Aztec — Mexican obsidian, associated with Tezcatlipoca, whose name means Smoking Mirror — brought to Europe after the conquest, and it is a small hard reminder of what the sixteenth-century trade in wonders actually consisted of. Dee did not scry himself; he sat and wrote while Edward Kelley reported what he saw, and the resulting Enochian language and angelic conversations run to thousands of manuscript pages.',
    talk: '“Dee’s mirror is Aztec obsidian, looted after the conquest, and it is in a case in Bloomsbury. He never looked into it himself. He sat beside Kelley and took the minutes.”',
  },
  'circ:vas': {
    name: 'The Brazen Vessel',
    glyph: '⚱',
    meta: ['Lemegeton, the Goetia', 'Sealed with the Seal of Solomon', 'Cast into the lake of Babylon'],
    body:
      'The Goetia opens with a legend rather than an instruction. Solomon, it says, bound seventy-two kings and princes into a vessel of brass, sealed it with his seal, and cast it into a deep lake near Babylon; the Babylonians, expecting treasure, broke it open and the spirits escaped, returning to their places except Belial, who entered an image and gave oracles. Every element of that story is borrowed. The binding of demons by Solomon comes from the Testament of Solomon, a Greek text of perhaps the first to fourth century AD which is the ultimate source of the whole tradition; the vessel and the lake and the false treasure are folklore motifs found from the Levant to the Baltic; the Arabic tradition of jinn sealed in brass by Sulaymān is the same story told by different people, and gives the modern world the genie in the bottle. The vessel on this table is therefore both the ritual instrument the Goetia specifies for constraining a disobedient spirit, and the mythological object the entire text hangs from — and it is worth noticing that in the story it FAILS. It is broken open by people looking for gold.',
    talk: '“Seventy-two spirits in a brass jar at the bottom of a lake, and it held until somebody thought there was treasure in it. The moral is not subtle.”',
  },
  'circ:thuribulum': {
    name: 'The Censer',
    glyph: '♨',
    meta: ['Frankincense, myrrh, storax', 'A visible medium', 'And a pharmacology'],
    body:
      'The censer does two things and the texts are candid about the first. Smoke gives a spirit something to appear IN — a shifting, lit, semi-opaque volume above the triangle, into which the eye will readily assemble a figure, which is the same perceptual mechanism the black mirror exploits from the other direction. The Key of Solomon and the Goetia specify suffumigations by planet, and the standard resins are frankincense, myrrh, storax, benzoin and mastic, burnt on charcoal. The second thing is less often admitted. Some of the incenses named in the grimoire literature are pharmacologically active, and a few are dangerous: henbane, mandrake, thornapple and belladonna appear in recipes across the tradition, all of them tropane-alkaloid deliverers and all of them capable of producing vivid, convincing and entirely involuntary hallucination, along with tachycardia, delirium and, in quantity, death. This is one of the places where a museum has an obligation to be blunt rather than atmospheric. The apparitions were often real experiences. Several of the recipes that produced them would put a modern reader in hospital, and are not to be attempted.',
    talk: '“Frankincense to see something in. And, in some of the recipes, henbane — which is why the visions were reliable, and why some operators did not come back to write about them.”',
  },
  'circ:gladius': {
    name: 'The Sword & the Instruments',
    glyph: '†',
    meta: ['Made new, consecrated, virgin', 'Steel, and a maker’s cost', 'Key of Solomon, Book II'],
    body:
      'The Key of Solomon spends more of its length on the making of the instruments than on any operation performed with them. The knife must be of new steel, forged at the day and hour of Mercury, quenched in the blood of a mole and the juice of the pimpernel; the sword must be new, engraved with names, consecrated with fumigations; the parchment must be virgin, from an animal not yet capable of generation; the wax, the ink, the pen from the third feather of a goose’s right wing, the silk to wrap everything in — all new, all made by the operator, all consecrated. Two things follow from this. The first is practical and unromantic: a full working was extremely expensive, which tells you that the surviving manuscripts belonged to people with money and leisure — clergy, physicians, notaries, minor gentry — and not to the cunning-folk of the villages, whose magic ran on charms, herbs and written words on paper. The second is psychological. Weeks of purposeful, difficult, exacting labour before the ritual begins is itself the ritual; by the time the sword is finished the operator is a different person from the one who began it, and that is precisely the point of a preparation.',
    talk: '“Read the instructions for making the knife and then ask who could afford a month of that. It was never the village cunning-man. It was the man with a library.”',
  },
  'circ:lemegeton': {
    name: 'The Lemegeton',
    glyph: '📜',
    meta: ['Compiled c. 1640', 'Five books', 'Mathers & Crowley, 1904'],
    body:
      'The Lesser Key of Solomon is a seventeenth-century compilation in five parts — the Goetia, the Theurgia-Goetia, the Pauline Art, the Almadel and the Ars Notoria — assembled from much older material by an unknown hand, probably in England, around 1640. Its manuscripts are in the British Library. The famous first book, the Goetia, catalogues seventy-two spirits with their ranks, legions, appearances, offices and engraved seals, and it is the source of nearly every demon a modern reader could name. Its transmission into the present is worth tracing precisely, because it explains the aesthetic of an enormous amount of later occultism: Samuel Liddell MacGregor Mathers translated it, Aleister Crowley paid for and published the edition in 1904, and Crowley’s preface takes a strikingly modernising line, suggesting the spirits are portions of the human brain. The Ars Notoria, the last part, is the oldest — a thirteenth-century tradition of prayers and figures for obtaining knowledge and memory directly by grace, without study — and it is the part that connects this book to the memory arts on the wheels next door.',
    talk: '“Seventy-two spirits, each with a rank and a seal and a stated office. It reads like a civil service list, and that is exactly what it is imitating.”',
  },
  'circ:weyer': {
    name: 'Weyer & Scot — the Sceptics Who Saved It',
    glyph: '⚖',
    meta: ['Pseudomonarchia Daemonum, 1577', 'Discoverie of Witchcraft, 1584', 'Preserved by their enemies'],
    body:
      'This is the single most useful fact on this plate. The list of spirits in the Goetia is taken, in order and almost verbatim, from the Pseudomonarchia Daemonum, an appendix Johann Weyer added to his De Praestigiis Daemonum in 1577 — and Weyer was a Dutch physician who published it in the course of arguing that the whole subject was a delusion and that the women being burned as witches were ill, deceived or melancholic rather than guilty. He was a student of Agrippa’s, and his book is one of the first sustained attacks on the witch persecutions in print. Reginald Scot did the same thing in England in 1584: The Discoverie of Witchcraft reprints conjurations, circles and charms at length in order to expose them as frauds, and includes the earliest published explanations of conjuring tricks in English. James VI of Scotland wrote Daemonologie in 1597 specifically to refute Scot, and on becoming James I is said to have ordered the Discoverie burned. Both books were promptly mined by exactly the people they were written against. The demonologies survive for us because the men debunking them quoted the material in full, and the seventeenth-century compilers simply lifted it back out.',
    talk: '“Weyer printed the list to prove it was nonsense. Scot printed the conjurations to expose the trick. Every grimoire since has copied them out of the debunkings.”',
  },
  'circ:dee': {
    name: 'Dee, Kelley & the Angelic Conversations',
    glyph: '⚹',
    meta: ['1582–1589', 'The holy table & the shewstone', 'British Museum'],
    body:
      'John Dee was the most learned man in England — mathematician, author of the preface to the first English Euclid, navigational adviser to the Muscovy Company, owner of the largest private library in the country — and from 1582 he spent his evenings recording what Edward Kelley claimed to see in a crystal. Their sessions produced the Enochian material: a language with its own alphabet, syntax and a substantial vocabulary, a set of nineteen Calls, and the elaborate apparatus of the Watchtowers and the holy table. The physical objects survive and can be seen: the wax Sigillum Dei Aemeth, the obsidian mirror, the crystal, the gold disc, in the British Museum, and the holy table’s design in the Sloane manuscripts. What to make of it is genuinely unsettled. Kelley was a convicted forger who at one point relayed an angelic instruction that the two men share their wives, which Dee, appallingly, obeyed. And yet the Enochian corpus is internally consistent to a degree that is hard to fake off the cuff. The Golden Dawn adopted the whole system in the 1880s and it remains the backbone of a great deal of modern ceremonial magic — which means the most influential magical system of the last century was received by a man his own contemporaries knew to be a criminal.',
    talk: '“The finest mathematician in England, taking dictation from a convicted forger, for seven years. And the language they produced still has a grammar you can learn.”',
  },
  'circ:owners': {
    name: 'Whose Books These Were',
    glyph: '✎',
    meta: ['Hebrew names, Christian operators', 'Clerical underworld', 'A caution'],
    body:
      'The names in the outer ring of this circle are Hebrew, and almost none of the men who drew such circles were Jewish. That gap deserves saying out loud. Medieval and early-modern Christian ritual magic borrows the divine names, the angelic hierarchies and a good deal of the vocabulary of Jewish mysticism, and it does so at a time when the communities that produced them were being expelled, forcibly converted and killed — from England in 1290, from Spain in 1492, from much of the Empire in between. The borrowing runs on a fantasy that Hebrew is the language of creation and therefore intrinsically powerful, and it very largely ignores what the Kabbalists themselves were doing, which was a devotional and exegetical practice with severe restrictions on who might study it. The operators were, as Richard Kieckhefer showed, mostly a clerical underworld: literate men in minor orders with Latin, access to books, and time — the same people who copied the liturgy. And the practice of this magic never protected anyone from the charge of witchcraft. The people executed in the panics were overwhelmingly poor women with no books at all.',
    talk: '“The names are Hebrew and the men using them mostly were not. It is worth knowing whose language was being borrowed, and what was happening to them at the time.”',
  },
};
