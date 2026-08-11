import type { Entity } from '../../domain/types';

export const alchemy: Entity[] = [
  {
    id: 'alchemy',
    type: 'tradition',
    name: 'Alchemy',
    epithet: 'The noble art of transformation, at the bench and in the book',
    dates: 'Greco-Egyptian origins, c. 300 CE',
    year: 300,
    era: 'antiquity',
    cluster: 'alchemy',
    summary:
      'The long tradition of material and spiritual transformation: from Greco-Egyptian workshops through Arabic masters into the Latin West, pursued by artisans, physicians, and natural philosophers alike.',
    claims: [
      {
        text: 'The Western alchemical tradition runs from Greco-Egyptian craft recipes and Zosimos, through Arabic masters such as Jābir ibn Ḥayyān and al-Rāzī, into the Latin West from the twelfth century.',
        evidence: 'scholarship',
        sources: ['principe-2013'],
      },
      {
        text: 'Principe and Newman showed that early modern “chymistry” was continuous with experimental practice — alchemists worked at the bench, and many recipes can be replicated.',
        evidence: 'scholarship',
        sources: ['principe-2013'],
      },
      {
        text: 'The reading of alchemy as primarily inner, psychological transformation (as in C. G. Jung) is a later interpretation that historians of science treat with caution.',
        evidence: 'speculation',
        sources: ['principe-2013'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'emerald-tablet' },
      { kind: 'associated-with', target: 'ouroboros' },
      { kind: 'influenced', target: 'rosicrucianism' },
    ],
    tags: ['chymistry', 'transmutation', 'laboratory', 'gold'],
  },
  {
    id: 'zosimos',
    type: 'person',
    name: 'Zosimos of Panopolis',
    epithet: 'The first alchemist we can name',
    dates: 'fl. c. 300 CE',
    year: 300,
    era: 'antiquity',
    cluster: 'alchemy',
    summary:
      'The Greco-Egyptian writer whose treatises are the earliest surviving alchemical works under an author’s name — practical instruction entwined with dream-visions of transformation.',
    claims: [
      {
        text: 'Zosimos of Panopolis is the earliest alchemical author whose named works survive, writing in Greek in Egypt around 300 CE.',
        evidence: 'scholarship',
        sources: ['principe-2013'],
      },
      {
        text: 'His “visions” describe dream-journeys of dismemberment and transformation at a sacrificial altar, which he presents as instruction on the composition of the waters.',
        evidence: 'primary',
        sources: ['principe-2013'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'alchemy' },
      { kind: 'associated-with', target: 'alexandria' },
    ],
    tags: ['visions', 'greco-egyptian', 'earliest'],
  },
  {
    id: 'paracelsus',
    type: 'person',
    name: 'Paracelsus',
    epithet: 'The wandering physician who turned alchemy toward medicine',
    dates: '1493–1541',
    year: 1530,
    era: 'renaissance',
    cluster: 'alchemy',
    summary:
      'Theophrastus von Hohenheim, the combative Swiss physician who declared that alchemy’s true purpose was to make medicines, and whose theories reshaped both chemistry and esoteric thought.',
    claims: [
      {
        text: 'Paracelsus reoriented alchemy toward medicine, urging that its true purpose was the preparation of remedies rather than the making of gold.',
        evidence: 'documented',
        sources: ['principe-2013'],
      },
      {
        text: 'His tria prima — salt, sulphur, and mercury — extended the mercury-sulphur theory of metals into a general theory of matter and disease.',
        evidence: 'scholarship',
        sources: ['principe-2013'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'alchemy' },
      { kind: 'influenced', target: 'jacob-boehme' },
      { kind: 'influenced', target: 'rosicrucianism', note: 'the Fama invokes his memory' },
    ],
    tags: ['medicine', 'iatrochemistry', 'tria prima', 'switzerland'],
  },
  {
    id: 'ouroboros',
    type: 'symbol',
    name: 'Ouroboros',
    epithet: 'The serpent that devours its own tail',
    dates: 'attested by late antiquity',
    year: 300,
    era: 'antiquity',
    cluster: 'alchemy',
    summary:
      'The tail-eating serpent of the Greco-Egyptian alchemical manuscripts, emblem of the circular work and of the unity of all things.',
    claims: [
      {
        text: 'In the Greco-Egyptian alchemical manuscripts, the serpent devouring its tail encircles the motto hen to pan — “the one is the all”.',
        evidence: 'documented',
        sources: ['principe-2013'],
      },
      {
        text: 'Alchemists took the ouroboros as an emblem of the circular work: matter dissolved, recombined, and returned upon itself.',
        evidence: 'scholarship',
        sources: ['principe-2013'],
      },
    ],
    relations: [{ kind: 'symbol-of', target: 'alchemy' }],
    tags: ['serpent', 'circle', 'unity', 'hen to pan'],
  },
  {
    id: 'philosophers-stone',
    type: 'concept',
    name: 'The Philosophers’ Stone',
    epithet: 'The agent of perfection sought in the great work',
    year: 1300,
    era: 'medieval',
    cluster: 'alchemy',
    summary:
      'The supreme goal of alchemy: a substance held to perfect base metals into silver or gold, described through stages of colour and veiled in deliberate allegory.',
    claims: [
      {
        text: 'The stone was conceived as an agent of transmutation able to perfect base metals; recipes describe successive stages of blackening, whitening, and reddening.',
        evidence: 'scholarship',
        sources: ['principe-2013'],
      },
      {
        text: 'Adepts wrote under deliberate veils — Decknamen, or cover-names — so that texts read as allegory yet often encode reproducible laboratory procedure.',
        evidence: 'scholarship',
        sources: ['principe-2013'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'alchemy' },
      { kind: 'associated-with', target: 'emerald-tablet' },
    ],
    tags: ['transmutation', 'magnum opus', 'decknamen', 'gold'],
  },
  {
    id: 'voynich-manuscript',
    type: 'work',
    name: 'The Voynich Manuscript',
    epithet: 'The book no one has ever read',
    dates: 'vellum dated c. 1404–1438',
    year: 1420,
    era: 'renaissance',
    cluster: 'alchemy',
    summary:
      'An illustrated codex in an unread script — botanical, astronomical, and balneological imagery with no accepted decipherment — now Beinecke MS 408 at Yale.',
    claims: [
      {
        text: 'Radiocarbon dating places the manuscript’s vellum in the early fifteenth century; its script and language remain unread.',
        evidence: 'documented',
        sources: ['clemens-2016'],
      },
      {
        text: 'A 1665 letter by Johannes Marcus Marci reports that Emperor Rudolf II had bought the book for 600 ducats — a report that remains unverified.',
        evidence: 'primary',
        sources: ['clemens-2016'],
      },
      {
        text: 'Proposed decipherments — ciphers, lost languages, hoax theories — appear regularly; none has achieved scholarly acceptance.',
        evidence: 'speculation',
        sources: ['clemens-2016'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'alchemy', note: 'its imagery is often compared to herbal and alchemical manuscripts' },
      { kind: 'associated-with', target: 'prague' },
    ],
    tags: ['cipher', 'undeciphered', 'beinecke', 'mystery', 'manuscript'],
  },
  {
    id: 'maria-hebraea',
    type: 'person',
    name: 'Maria the Jewess',
    epithet: 'Mother of the apparatus, namesake of the water-bath',
    dates: 'fl. c. 1st–3rd c. CE',
    year: 200,
    era: 'antiquity',
    cluster: 'alchemy',
    summary:
      'The early Greco-Egyptian alchemist quoted reverently by Zosimos, credited with inventing core laboratory instruments — the kerotakis, the tribikos, and the gentle bath that still bears her name.',
    claims: [
      {
        text: 'Zosimos cites Maria as an authority and describes apparatus attributed to her; the bain-marie preserves her name.',
        evidence: 'scholarship',
        sources: ['principe-2013'],
      },
      {
        text: 'The axiom “one becomes two, two becomes three…” is transmitted under her name in the Greek corpus.',
        evidence: 'primary',
        sources: ['principe-2013'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'alchemy' },
      { kind: 'influenced', target: 'zosimos' },
    ],
    tags: ['apparatus', 'bain-marie', 'greco-egyptian'],
  },
  {
    id: 'cleopatra-alchemist',
    type: 'person',
    name: 'Cleopatra the Alchemist',
    epithet: 'Keeper of the gold-making and the ouroboros page',
    dates: 'fl. c. 3rd c. CE',
    year: 250,
    era: 'antiquity',
    cluster: 'alchemy',
    summary:
      'The Greco-Egyptian author under whose name the Chrysopoeia sheet survives — a single famous leaf of emblems including the serpent swallowing its tail.',
    claims: [
      {
        text: 'The Chrysopoeia of Cleopatra leaf transmits early alchemical emblems, among them an ouroboros enclosing “the one is the all”.',
        evidence: 'documented',
        sources: ['principe-2013'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'alchemy' },
      { kind: 'associated-with', target: 'ouroboros' },
    ],
    tags: ['chrysopoeia', 'emblem', 'greco-egyptian'],
  },
  {
    id: 'jabir-ibn-hayyan',
    type: 'person',
    name: 'Jābir ibn Ḥayyān',
    epithet: 'The vast corpus behind a single name',
    dates: 'corpus c. 9th–10th c.',
    year: 900,
    era: 'medieval',
    cluster: 'alchemy',
    summary:
      'The name over the great Arabic alchemical corpus: hundreds of treatises teaching the mercury-sulphur theory of metals and the science of balances.',
    claims: [
      {
        text: 'The Jābirian corpus articulates the mercury-sulphur theory of metallic generation that governed alchemy for eight centuries.',
        evidence: 'scholarship',
        sources: ['principe-2013'],
      },
      {
        text: 'Scholars treat the corpus as the work of a school writing over generations rather than one eighth-century author.',
        evidence: 'scholarship',
        sources: ['principe-2013'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'alchemy' },
      { kind: 'influenced', target: 'pseudo-geber' },
    ],
    tags: ['arabic', 'mercury-sulphur', 'balances'],
  },
  {
    id: 'al-razi',
    type: 'person',
    name: 'Abū Bakr al-Rāzī',
    epithet: 'The physician who classified the art',
    dates: 'c. 865–925',
    year: 900,
    era: 'medieval',
    cluster: 'alchemy',
    summary:
      'The great Persian physician-alchemist whose Book of Secrets organized substances and operations with laboratory clarity — recipes, apparatus, classification.',
    claims: [
      {
        text: 'Al-Rāzī’s Kitāb al-Asrār classifies substances into mineral families and gives procedural recipes, a landmark of practical chemistry.',
        evidence: 'scholarship',
        sources: ['principe-2013'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'alchemy' },
      { kind: 'influenced', target: 'albertus-magnus' },
    ],
    tags: ['persia', 'classification', 'medicine'],
  },
  {
    id: 'khalid-ibn-yazid',
    type: 'person',
    name: 'Khālid ibn Yazīd',
    epithet: 'The prince who bought the art, in the story',
    dates: 'd. c. 704',
    year: 700,
    era: 'medieval',
    cluster: 'alchemy',
    summary:
      'The Umayyad prince whom legend makes the first patron of alchemy in Islam, taught by the monk Morienus — the frame-story of the first Latin translation of 1144.',
    claims: [
      {
        text: 'The dialogue of Morienus and Khālid frames the Testament translated by Robert of Chester in 1144, the work that introduced alchemy to the Latin West.',
        evidence: 'documented',
        sources: ['principe-2013'],
      },
      {
        text: 'Khālid’s own alchemical studies are legendary embroidery on a historical prince.',
        evidence: 'legend',
        sources: ['principe-2013'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'morienus' },
      { kind: 'part-of', target: 'alchemy' },
    ],
    tags: ['umayyad', 'patron', 'legend'],
  },
  {
    id: 'morienus',
    type: 'person',
    name: 'Morienus',
    epithet: 'The hermit whose book crossed into Latin first',
    dates: 'legendary, c. 7th c.',
    year: 680,
    era: 'medieval',
    cluster: 'alchemy',
    summary:
      'The Byzantine hermit-alchemist of the frame-story: his Testament, translated in 1144 as De compositione alchemiae, is by tradition the first alchemical book in Latin.',
    claims: [
      {
        text: 'Robert of Chester’s 1144 preface announces alchemy as a science new to the Latins, translated from the dialogue of Morienus and Khālid.',
        evidence: 'documented',
        sources: ['principe-2013'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'alchemy' },
      { kind: 'associated-with', target: 'khalid-ibn-yazid' },
    ],
    tags: ['1144', 'translation', 'hermit'],
  },
  {
    id: 'albertus-magnus',
    type: 'person',
    name: 'Albertus Magnus',
    epithet: 'The universal doctor at the furnace door',
    dates: 'c. 1200–1280',
    year: 1250,
    era: 'medieval',
    cluster: 'alchemy',
    summary:
      'The Dominican master of natural philosophy who examined alchemy critically in De mineralibus — and to whom later centuries ascribed wonders and grimoires he never wrote.',
    claims: [
      {
        text: 'In De mineralibus Albertus reports testing alchemical gold and finding it inferior — engaged, empirical criticism rather than dismissal.',
        evidence: 'documented',
        sources: ['principe-2013', 'kieckhefer-1989'],
      },
      {
        text: 'A large pseudo-Albertine literature of secrets and marvels accreted around his name.',
        evidence: 'scholarship',
        sources: ['kieckhefer-1989'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'alchemy' },
      { kind: 'influenced', target: 'roger-bacon' },
    ],
    tags: ['dominican', 'minerals', 'pseudo-epigraphy'],
  },
  {
    id: 'roger-bacon',
    type: 'person',
    name: 'Roger Bacon',
    epithet: 'The friar who preached experiment and elixirs',
    dates: 'c. 1214–1292',
    year: 1260,
    era: 'medieval',
    cluster: 'alchemy',
    summary:
      'The Franciscan advocate of experimental science who ranked alchemy among the great practical arts and promised medicine that could prolong life.',
    claims: [
      {
        text: 'Bacon’s Opus maius and related works treat alchemy as the science of generating things from elements, with the elixir as prolonger of life.',
        evidence: 'scholarship',
        sources: ['principe-2013', 'thorndike-1923'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'alchemy' },
      { kind: 'associated-with', target: 'elixir-of-life' },
    ],
    tags: ['franciscan', 'experiment', 'oxford'],
  },
  {
    id: 'arnald-of-villanova',
    type: 'person',
    name: 'Arnald of Villanova',
    epithet: 'Physician to popes, name on a hundred alchemies',
    dates: 'c. 1240–1311',
    year: 1300,
    era: 'medieval',
    cluster: 'alchemy',
    summary:
      'The famous Catalan physician whose medical authority attracted a swarm of pseudonymous alchemical writings, including the influential Rosarius.',
    claims: [
      {
        text: 'The alchemical corpus under Arnald’s name, including the Rosarius philosophorum, is regarded by scholars as pseudonymous.',
        evidence: 'scholarship',
        sources: ['principe-2013'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'alchemy' },
      { kind: 'associated-with', target: 'rosarium-philosophorum' },
    ],
    tags: ['physician', 'pseudo-epigraphy', 'catalonia'],
  },
  {
    id: 'pseudo-llull',
    type: 'person',
    name: 'Pseudo-Lull',
    epithet: 'The art of Ramon Llull, forged in the athanor',
    dates: 'corpus from c. 1332',
    year: 1350,
    era: 'medieval',
    cluster: 'alchemy',
    summary:
      'The vast alchemical corpus fathered on the Majorcan philosopher Ramon Llull — who himself denied transmutation — beginning with the Testamentum of the 1330s.',
    claims: [
      {
        text: 'The historical Llull rejected alchemy, yet over a hundred alchemical works came to bear his name; the Testamentum is the fountainhead.',
        evidence: 'scholarship',
        sources: ['principe-2013'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'alchemy' },
      { kind: 'associated-with', target: 'philosophers-stone' },
    ],
    tags: ['pseudo-epigraphy', 'testamentum', 'majorca'],
  },
  {
    id: 'pseudo-geber',
    type: 'person',
    name: 'Pseudo-Geber',
    epithet: 'The Latin master wearing an Arabic mask',
    dates: 'fl. c. 1300',
    year: 1300,
    era: 'medieval',
    cluster: 'alchemy',
    summary:
      'The Latin author — identified by scholarship with the Franciscan Paul of Taranto — whose Summa perfectionis, written under Geber’s name, became the standard textbook of medieval alchemy.',
    claims: [
      {
        text: 'William Newman identified the author of the Summa perfectionis as Paul of Taranto, writing under the name of Geber.',
        evidence: 'scholarship',
        sources: ['principe-2013'],
      },
      {
        text: 'The Summa’s corpuscular “mercury alone” theory shaped alchemical matter-theory into the seventeenth century.',
        evidence: 'scholarship',
        sources: ['principe-2013', 'newman-principe-2002'],
      },
    ],
    relations: [
      { kind: 'wrote', target: 'summa-perfectionis' },
      { kind: 'derived-from', target: 'jabir-ibn-hayyan' },
    ],
    tags: ['summa', 'corpuscles', 'franciscan'],
  },
  {
    id: 'summa-perfectionis',
    type: 'work',
    name: 'Summa Perfectionis',
    epithet: 'The perfect magistery, set down as a textbook',
    dates: 'c. 1300',
    year: 1310,
    era: 'medieval',
    cluster: 'alchemy',
    summary:
      'The most influential alchemical handbook of the Latin Middle Ages: sober, systematic, and corpuscular, teaching purification of the mercurial principle.',
    claims: [
      {
        text: 'The Summa organized alchemy into principles, impediments, and procedures, and was cited as the authority “Geber” for centuries.',
        evidence: 'scholarship',
        sources: ['principe-2013'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'pseudo-geber' },
      { kind: 'part-of', target: 'alchemy' },
    ],
    tags: ['textbook', 'mercury alone'],
  },
  {
    id: 'nicolas-flamel',
    type: 'person',
    name: 'Nicolas Flamel',
    epithet: 'The scrivener legend made an adept',
    dates: 'c. 1330–1418',
    year: 1400,
    era: 'medieval',
    cluster: 'alchemy',
    summary:
      'A prosperous Parisian scrivener whose posthumous legend — the Book of Abraham the Jew, the pilgrimage, the transmutation of 1382 — made him alchemy’s most famous success story.',
    claims: [
      {
        text: 'The historical Flamel was a scribe and property-owner in Paris; archives record his benefactions and his tombstone survives.',
        evidence: 'documented',
        sources: ['principe-2013'],
      },
      {
        text: 'The alchemical autobiography, the Hieroglyphic Figures, first appears in 1612 — the legend is a seventeenth-century construction.',
        evidence: 'scholarship',
        sources: ['principe-2013'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'philosophers-stone' },
      { kind: 'part-of', target: 'alchemy' },
    ],
    tags: ['paris', 'legend', '1382'],
  },
  {
    id: 'george-ripley',
    type: 'person',
    name: 'George Ripley',
    epithet: 'The canon of Bridlington and his twelve gates',
    dates: 'c. 1415–1490',
    year: 1470,
    era: 'renaissance',
    cluster: 'alchemy',
    summary:
      'England’s most celebrated medieval alchemist, whose Compound of Alchymy leads the seeker through twelve gates of the work, and whose emblems unroll on the Ripley Scrolls.',
    claims: [
      {
        text: 'Ripley’s Compound of Alchymy (printed 1591) structures the opus as twelve gates from calcination to projection.',
        evidence: 'documented',
        sources: ['ashmole-1652', 'principe-2013'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'alchemy' },
      { kind: 'associated-with', target: 'ripley-scroll' },
    ],
    tags: ['england', 'twelve gates', 'canon'],
  },
  {
    id: 'ripley-scroll',
    type: 'work',
    name: 'The Ripley Scroll',
    epithet: 'Twenty feet of emblazoned transmutation',
    dates: 'copies 15th–17th c.',
    year: 1570,
    era: 'renaissance',
    cluster: 'alchemy',
    summary:
      'The great emblematic scrolls associated with George Ripley: dragons, baths, and suns in sequence, painting the stages of the work as a single unrolling vision.',
    claims: [
      {
        text: 'Some two dozen Ripley Scrolls survive; their imagery corresponds to verses associated with Ripley’s school.',
        evidence: 'documented',
        sources: ['principe-2013'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'george-ripley' },
      { kind: 'associated-with', target: 'magnum-opus' },
    ],
    tags: ['scroll', 'emblem', 'england'],
  },
  {
    id: 'thomas-norton',
    type: 'person',
    name: 'Thomas Norton',
    epithet: 'The Bristol adept of the Ordinall',
    dates: 'c. 1433–1513',
    year: 1477,
    era: 'renaissance',
    cluster: 'alchemy',
    summary:
      'The Bristol gentleman whose Ordinall of Alchimy (1477) tells, in careful English verse, how the science is learned from a master and how its gold is twice stolen.',
    claims: [
      {
        text: 'The Ordinall of Alchimy, dated 1477, opens Ashmole’s Theatrum Chemicum Britannicum; its acrostic reveals Norton’s name.',
        evidence: 'documented',
        sources: ['ashmole-1652'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'alchemy' },
      { kind: 'associated-with', target: 'theatrum-chemicum-britannicum' },
    ],
    tags: ['bristol', 'verse', '1477'],
  },
  {
    id: 'basil-valentine',
    type: 'person',
    name: 'Basil Valentine',
    epithet: 'The monk who never was, master of antimony',
    dates: 'corpus from c. 1599',
    year: 1600,
    era: 'early-modern',
    cluster: 'alchemy',
    summary:
      'The legendary Benedictine under whose name Johann Thölde published the great antimony books — chymistry of real power wrapped in a fictive monastic pedigree.',
    claims: [
      {
        text: 'No monk Basil Valentine is documented; scholarship associates the corpus with its publisher Johann Thölde.',
        evidence: 'scholarship',
        sources: ['principe-2013'],
      },
      {
        text: 'The Triumphal Chariot of Antimony transmits genuine preparative chemistry of antimonial remedies.',
        evidence: 'scholarship',
        sources: ['principe-2013'],
      },
    ],
    relations: [
      { kind: 'wrote', target: 'triumphal-chariot-antimony' },
      { kind: 'part-of', target: 'alchemy' },
    ],
    tags: ['antimony', 'pseudonym', 'tholde'],
  },
  {
    id: 'triumphal-chariot-antimony',
    type: 'work',
    name: 'The Triumphal Chariot of Antimony',
    epithet: 'The grey metal rides in glory',
    dates: '1604',
    year: 1604,
    era: 'early-modern',
    cluster: 'alchemy',
    summary:
      'The most famous book of the Basil Valentine corpus: preparation upon preparation of antimony for medicine, defiant of the physicians of the schools.',
    claims: [
      {
        text: 'Published by Thölde in 1604, the Chariot describes antimonial preparations reproducible in the laboratory.',
        evidence: 'documented',
        sources: ['principe-2013'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'basil-valentine' },
      { kind: 'associated-with', target: 'paracelsus', note: 'iatrochemical program' },
    ],
    tags: ['antimony', '1604', 'iatrochemistry'],
  },
  {
    id: 'andreas-libavius',
    type: 'person',
    name: 'Andreas Libavius',
    epithet: 'The schoolmaster who wrote chemistry’s first textbook',
    dates: 'c. 1550–1616',
    year: 1597,
    era: 'early-modern',
    cluster: 'alchemy',
    summary:
      'The combative German schoolmaster whose Alchemia (1597) systematized the art into a teachable discipline — defending transmutation while flaying Paracelsian obscurity.',
    claims: [
      {
        text: 'Libavius’ Alchemia of 1597 is commonly regarded as the first systematic chemistry textbook.',
        evidence: 'scholarship',
        sources: ['moran-2005'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'alchemy' },
      { kind: 'critiqued', target: 'paracelsus' },
    ],
    tags: ['textbook', '1597', 'method'],
  },
  {
    id: 'michael-sendivogius',
    type: 'person',
    name: 'Michael Sendivogius',
    epithet: 'The Polish adept of the central nitre',
    dates: '1566–1636',
    year: 1604,
    era: 'early-modern',
    cluster: 'alchemy',
    summary:
      'The Polish alchemist and courtier whose New Chemical Light taught a secret nitre in the air that feeds all life — read across Europe from Prague to the Royal Society.',
    claims: [
      {
        text: 'Sendivogius’ Novum Lumen Chymicum (1604) went through dozens of editions and propounded an aerial nitre sustaining life and growth.',
        evidence: 'documented',
        sources: ['principe-2013'],
      },
    ],
    relations: [
      { kind: 'wrote', target: 'novum-lumen-chymicum' },
      { kind: 'associated-with', target: 'prague' },
    ],
    tags: ['poland', 'nitre', 'court'],
  },
  {
    id: 'novum-lumen-chymicum',
    type: 'work',
    name: 'Novum Lumen Chymicum',
    epithet: 'A new light out of the air itself',
    dates: '1604',
    year: 1605,
    era: 'early-modern',
    cluster: 'alchemy',
    summary:
      'Sendivogius’ treatise of the new chemical light: the doctrine of the aerial nitre, the food of life hidden in the air, which later natural philosophers read with keen interest.',
    claims: [
      {
        text: 'The treatise’s aerial nitre theory circulated widely and has been linked by historians to later investigations of the air’s vital component.',
        evidence: 'scholarship',
        sources: ['principe-2013'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'michael-sendivogius' },
      { kind: 'part-of', target: 'alchemy' },
    ],
    tags: ['nitre', 'air', '1604'],
  },
  {
    id: 'heinrich-khunrath',
    type: 'person',
    name: 'Heinrich Khunrath',
    epithet: 'Priest of the oratory-laboratory',
    dates: 'c. 1560–1605',
    year: 1595,
    era: 'early-modern',
    cluster: 'alchemy',
    summary:
      'The Christian-cabalist physician whose Amphitheatre of Eternal Wisdom joined prayer-desk and furnace in one engraved chamber — alchemy as worship.',
    claims: [
      {
        text: 'Khunrath’s Amphitheatrum shows the adept kneeling in a chamber that is half oratory, half laboratory, under the motto “ora et labora”.',
        evidence: 'documented',
        sources: ['khunrath-1595'],
      },
      {
        text: 'His fusion of alchemy, cabala, and Christian devotion fed directly into the Rosicrucian imagination.',
        evidence: 'scholarship',
        sources: ['yates-1972'],
      },
    ],
    relations: [
      { kind: 'wrote', target: 'amphitheatrum-sapientiae' },
      { kind: 'influenced', target: 'rosicrucianism' },
    ],
    tags: ['oratory', 'laboratory', 'cabala'],
  },
  {
    id: 'amphitheatrum-sapientiae',
    type: 'work',
    name: 'Amphitheatrum Sapientiae Aeternae',
    epithet: 'The amphitheatre of eternal wisdom',
    dates: '1595 / 1609',
    year: 1609,
    era: 'early-modern',
    cluster: 'alchemy',
    summary:
      'Khunrath’s visionary folio: circular engravings of the cosmic Christ, the oratory-laboratory, and the alchemical citadel — the high baroque of esoteric printmaking.',
    claims: [
      {
        text: 'First issued 1595 and expanded posthumously in 1609, the Amphitheatrum’s circular plates became touchstones of esoteric iconography.',
        evidence: 'documented',
        sources: ['khunrath-1595'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'heinrich-khunrath' },
      { kind: 'part-of', target: 'alchemy' },
    ],
    tags: ['engraving', 'ora et labora'],
  },
  {
    id: 'van-helmont',
    type: 'person',
    name: 'Jan Baptist van Helmont',
    epithet: 'The chymist who weighed a willow and named gas',
    dates: '1580–1644',
    year: 1620,
    era: 'early-modern',
    cluster: 'alchemy',
    summary:
      'The Flemish physician-chymist who coined the word “gas”, quantified the willow-tree experiment, and testified that a stranger’s powder had transmuted mercury in his own hands.',
    claims: [
      {
        text: 'Van Helmont introduced the term “gas” and pursued quantitative experiment, as in the five-year willow trial.',
        evidence: 'documented',
        sources: ['principe-2013', 'moran-2005'],
      },
      {
        text: 'He reported witnessing projection with a grain of the stone received from a stranger — a first-person period testimony.',
        evidence: 'primary',
        sources: ['principe-2013'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'alchemy' },
      { kind: 'influenced', target: 'george-starkey' },
    ],
    tags: ['gas', 'willow', 'flanders'],
  },
  {
    id: 'george-starkey',
    type: 'person',
    name: 'George Starkey',
    epithet: 'Philalethes: the American adept behind the mask',
    dates: '1628–1665',
    year: 1655,
    era: 'early-modern',
    cluster: 'alchemy',
    summary:
      'The Harvard-trained chymist who, writing as Eirenaeus Philalethes, produced the most read alchemical treatises of the century — and taught the young Robert Boyle at the bench.',
    claims: [
      {
        text: 'Newman and Principe established Starkey as the author behind Eirenaeus Philalethes and reconstructed his laboratory practice from his notebooks.',
        evidence: 'scholarship',
        sources: ['newman-principe-2002'],
      },
      {
        text: 'His Introitus apertus (Open Entrance to the Shut Palace of the King) was studied closely by Isaac Newton.',
        evidence: 'scholarship',
        sources: ['dobbs-1975'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'alchemy' },
      { kind: 'influenced', target: 'robert-boyle' },
      { kind: 'influenced', target: 'isaac-newton' },
    ],
    tags: ['philalethes', 'harvard', 'notebooks'],
  },
  {
    id: 'robert-boyle',
    type: 'person',
    name: 'Robert Boyle',
    epithet: 'The sceptical chymist who still sought the stone',
    dates: '1627–1691',
    year: 1661,
    era: 'early-modern',
    cluster: 'alchemy',
    summary:
      'The founder-figure of modern chemistry, whose scepticism targeted sloppy theory, not transmutation — he petitioned Parliament to repeal the act against multiplying gold.',
    claims: [
      {
        text: 'The Sceptical Chymist (1661) attacks both Aristotelian elements and Paracelsian principles as ill-founded.',
        evidence: 'documented',
        sources: ['boyle-1661'],
      },
      {
        text: 'Boyle pursued transmutation throughout his life; the 1689 repeal of the statute against gold-making followed his lobbying.',
        evidence: 'scholarship',
        sources: ['newman-principe-2002', 'principe-2013'],
      },
    ],
    relations: [
      { kind: 'wrote', target: 'sceptical-chymist' },
      { kind: 'collaborated-with', target: 'george-starkey' },
    ],
    tags: ['royal society', 'scepticism', 'transmutation'],
  },
  {
    id: 'sceptical-chymist',
    type: 'work',
    name: 'The Sceptical Chymist',
    epithet: 'Doubt, made into a method for matter',
    dates: '1661',
    year: 1661,
    era: 'early-modern',
    cluster: 'alchemy',
    summary:
      'Boyle’s dialogue against received element-theory — long mythologized as the death of alchemy, better read as chymistry criticizing itself into rigor.',
    claims: [
      {
        text: 'The dialogue dismantles the four elements and the tria prima as inadequate accounts of composition.',
        evidence: 'documented',
        sources: ['boyle-1661'],
      },
      {
        text: 'Historians no longer read the book as ending alchemy; Boyle remained a transmutationist.',
        evidence: 'scholarship',
        sources: ['newman-principe-2002'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'robert-boyle' },
      { kind: 'critiqued', target: 'tria-prima' },
    ],
    tags: ['1661', 'dialogue', 'elements'],
  },
  {
    id: 'isaac-newton',
    type: 'person',
    name: 'Isaac Newton',
    epithet: 'The last of the magicians, by his own papers',
    dates: '1642–1727',
    year: 1690,
    era: 'early-modern',
    cluster: 'alchemy',
    summary:
      'The author of the Principia left behind a million alchemical words — transcripts, indexes, and laboratory notes on the hunting of the green lion.',
    claims: [
      {
        text: 'Newton’s surviving alchemical manuscripts run to roughly a million words, studied systematically since Dobbs.',
        evidence: 'scholarship',
        sources: ['dobbs-1975'],
      },
      {
        text: 'Keynes, who bought the papers in 1936, called Newton “the last of the magicians” — a later characterization, not Newton’s own.',
        evidence: 'speculation',
        sources: ['dobbs-1975'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'alchemy' },
      { kind: 'studied', target: 'george-starkey', note: 'annotated Philalethes closely' },
    ],
    tags: ['manuscripts', 'green lion', 'cambridge'],
  },
  {
    id: 'edward-kelley',
    type: 'person',
    name: 'Edward Kelley',
    epithet: 'Scryer of angels, prisoner of gold',
    dates: '1555–1597/8',
    year: 1590,
    era: 'renaissance',
    cluster: 'alchemy',
    summary:
      'John Dee’s scryer, knighted in Bohemia for promised transmutations and imprisoned when they failed — the era’s cautionary tale of court alchemy.',
    claims: [
      {
        text: 'Kelley served as Dee’s medium in the angelic conversations from 1582 and later won favor, then imprisonment, under Rudolf II.',
        evidence: 'documented',
        sources: ['harkness-1999'],
      },
      {
        text: 'He died from injuries suffered in an escape attempt — reported variously in period accounts.',
        evidence: 'primary',
        sources: ['harkness-1999'],
      },
    ],
    relations: [
      { kind: 'collaborated-with', target: 'john-dee' },
      { kind: 'associated-with', target: 'rudolf-ii' },
    ],
    tags: ['scrying', 'bohemia', 'court'],
  },
  {
    id: 'rudolf-ii',
    type: 'person',
    name: 'Rudolf II',
    epithet: 'The emperor who kept a court of adepts',
    dates: '1552–1612',
    year: 1600,
    era: 'early-modern',
    cluster: 'alchemy',
    summary:
      'The Habsburg emperor whose Prague drew alchemists, astronomers, and magi from all Europe — patron of Kelley, Sendivogius, and the greatest cabinet of curiosities of the age.',
    claims: [
      {
        text: 'Rudolf II’s court at Prague patronized alchemists and occult philosophers alongside Kepler and Brahe.',
        evidence: 'documented',
        sources: ['moran-2005'],
      },
      {
        text: 'The report that Rudolf bought the Voynich manuscript for 600 ducats rests on Marci’s 1665 letter alone.',
        evidence: 'primary',
        sources: ['clemens-2016'],
      },
    ],
    relations: [
      { kind: 'patron-of', target: 'edward-kelley' },
      { kind: 'associated-with', target: 'prague' },
    ],
    tags: ['habsburg', 'patronage', 'kunstkammer'],
  },
  {
    id: 'turba-philosophorum',
    type: 'work',
    name: 'Turba Philosophorum',
    epithet: 'The assembly of the philosophers in conclave',
    dates: 'Arabic c. 900; Latin 12th c.',
    year: 1200,
    era: 'medieval',
    cluster: 'alchemy',
    summary:
      'The “Crowd of the Philosophers”: an imagined council where ancient sages dispute the one work in turn — a founding classic of Latin alchemy translated from Arabic.',
    claims: [
      {
        text: 'The Turba derives from a c. 900 Arabic original staging Greek sages in alchemical council, and became a standard Latin authority.',
        evidence: 'scholarship',
        sources: ['principe-2013'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'alchemy' },
      { kind: 'associated-with', target: 'prima-materia' },
    ],
    tags: ['council', 'arabic', 'translation'],
  },
  {
    id: 'rosarium-philosophorum',
    type: 'work',
    name: 'Rosarium Philosophorum',
    epithet: 'The rose-garden where king and queen embrace',
    dates: 'printed 1550',
    year: 1550,
    era: 'renaissance',
    cluster: 'alchemy',
    summary:
      'The famous illustrated rosary of the philosophers: twenty woodcuts of the solar king and lunar queen dying and rising as one — the chymical wedding in pictures.',
    claims: [
      {
        text: 'The 1550 Frankfurt Rosarium pairs verses and woodcuts depicting conjunction, death, and resurrection of the royal pair.',
        evidence: 'documented',
        sources: ['principe-2013'],
      },
      {
        text: 'Jung made the Rosarium sequence the spine of his psychology of the transference — a twentieth-century rereading.',
        evidence: 'speculation',
        sources: ['principe-2013'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'alchemy' },
      { kind: 'associated-with', target: 'magnum-opus' },
    ],
    tags: ['woodcuts', 'conjunction', '1550'],
  },
  {
    id: 'aurora-consurgens',
    type: 'work',
    name: 'Aurora Consurgens',
    epithet: 'The dawn rising, scripture set to alchemy',
    dates: 'c. 15th c.',
    year: 1420,
    era: 'renaissance',
    cluster: 'alchemy',
    summary:
      'A rhapsodic Latin treatise weaving the Song of Songs into the language of the work, illuminated with startling images — piously ascribed, without proof, to Thomas Aquinas.',
    claims: [
      {
        text: 'The Aurora consurgens survives in illuminated fifteenth-century manuscripts; its attribution to Aquinas is traditional and unproven.',
        evidence: 'tradition',
        sources: ['principe-2013'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'alchemy' },
      { kind: 'associated-with', target: 'philosophers-stone' },
    ],
    tags: ['illumination', 'song of songs'],
  },
  {
    id: 'mutus-liber',
    type: 'work',
    name: 'Mutus Liber',
    epithet: 'The wordless book that shows the work',
    dates: '1677',
    year: 1677,
    era: 'early-modern',
    cluster: 'alchemy',
    summary:
      'The “silent book” of La Rochelle: fifteen plates without text, showing a husband and wife gathering dew and working the stone — instruction by image alone.',
    claims: [
      {
        text: 'Published at La Rochelle in 1677, the Mutus Liber teaches through a sequence of engravings in which dew is collected and processed.',
        evidence: 'documented',
        sources: ['principe-2013'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'alchemy' },
      { kind: 'associated-with', target: 'magnum-opus' },
    ],
    tags: ['plates', 'dew', 'silence'],
  },
  {
    id: 'splendor-solis',
    type: 'work',
    name: 'Splendor Solis',
    epithet: 'The splendour of the sun in twenty-two paintings',
    dates: 'c. 1532–1582',
    year: 1535,
    era: 'renaissance',
    cluster: 'alchemy',
    summary:
      'The most sumptuous of alchemical manuscripts: twenty-two miniatures — peacock flasks, dismembered kings, bathing queens — ascribed to the legendary Salomon Trismosin.',
    claims: [
      {
        text: 'Splendor Solis survives in richly illuminated copies from 1532 onward, including the celebrated 1582 London manuscript.',
        evidence: 'documented',
        sources: ['principe-2013'],
      },
      {
        text: 'Its ascription to Trismosin, alleged master of Paracelsus, is legendary.',
        evidence: 'legend',
        sources: ['principe-2013'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'alchemy' },
      { kind: 'associated-with', target: 'paracelsus' },
    ],
    tags: ['miniatures', 'trismosin', 'peacock'],
  },
  {
    id: 'theatrum-chemicum-britannicum',
    type: 'work',
    name: 'Theatrum Chemicum Britannicum',
    epithet: 'England’s alchemical poets, gathered on one stage',
    dates: '1652',
    year: 1652,
    era: 'early-modern',
    cluster: 'alchemy',
    summary:
      'Elias Ashmole’s great anthology of English alchemical verse — Norton, Ripley, and their fellows — with his learned annotations, a monument of antiquarian chymistry.',
    claims: [
      {
        text: 'Ashmole’s 1652 Theatrum collects the English verse alchemists with commentary, preserving texts otherwise scattered in manuscript.',
        evidence: 'documented',
        sources: ['ashmole-1652'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'elias-ashmole' },
      { kind: 'part-of', target: 'alchemy' },
    ],
    tags: ['anthology', '1652', 'verse'],
  },
  {
    id: 'tria-prima',
    type: 'concept',
    name: 'The Tria Prima',
    epithet: 'Salt, sulphur, mercury: the three that make all',
    dates: 'Paracelsian, 16th c.',
    year: 1530,
    era: 'renaissance',
    cluster: 'alchemy',
    summary:
      'Paracelsus’ three principles — salt the body, sulphur the soul, mercury the spirit — the chemical trinity by which his school read matter, medicine, and disease.',
    claims: [
      {
        text: 'The tria prima extend the Arabic mercury-sulphur pair with salt, making a general theory of composition and pathology.',
        evidence: 'scholarship',
        sources: ['principe-2013'],
      },
    ],
    relations: [
      { kind: 'derived-from', target: 'paracelsus' },
      { kind: 'part-of', target: 'alchemy' },
    ],
    tags: ['principles', 'paracelsian'],
  },
  {
    id: 'prima-materia',
    type: 'concept',
    name: 'Prima Materia',
    epithet: 'The first matter, everywhere and despised',
    dates: 'medieval onward',
    year: 1300,
    era: 'medieval',
    cluster: 'alchemy',
    summary:
      'The undifferentiated root-stuff from which the work begins — described in a hundred riddling names: found in filth, sold for nothing, trodden underfoot.',
    claims: [
      {
        text: 'Alchemical literature multiplies cover-names for the first matter, insisting it is common and everywhere overlooked.',
        evidence: 'scholarship',
        sources: ['principe-2013'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'magnum-opus' },
      { kind: 'associated-with', target: 'philosophers-stone' },
    ],
    tags: ['first matter', 'riddles'],
  },
  {
    id: 'magnum-opus',
    type: 'concept',
    name: 'The Magnum Opus',
    epithet: 'Black, white, and red: the great work in colours',
    dates: 'antiquity onward',
    year: 1400,
    era: 'medieval',
    cluster: 'alchemy',
    summary:
      'The great work itself: the sequence of operations — blackening, whitening, reddening, with the peacock’s tail between — by which the stone is brought to perfection.',
    claims: [
      {
        text: 'From the Greek corpus onward the work is described through colour-stages: nigredo, albedo, and rubedo, often with the cauda pavonis.',
        evidence: 'scholarship',
        sources: ['principe-2013'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'alchemy' },
      { kind: 'associated-with', target: 'philosophers-stone' },
    ],
    tags: ['nigredo', 'albedo', 'rubedo', 'peacock'],
  },
  {
    id: 'alkahest',
    type: 'concept',
    name: 'The Alkahest',
    epithet: 'The universal solvent no vessel can hold',
    dates: 'Paracelsian coinage',
    year: 1600,
    era: 'early-modern',
    cluster: 'alchemy',
    summary:
      'The dreamed-of universal dissolvent of Paracelsian and Helmontian chymistry, able to reduce every body to its first liquid — pursued for a century, never found.',
    claims: [
      {
        text: 'The alkahest, named by Paracelsus and elaborated by van Helmont, was sought as a universal menstruum through the seventeenth century.',
        evidence: 'scholarship',
        sources: ['principe-2013', 'newman-principe-2002'],
      },
    ],
    relations: [
      { kind: 'derived-from', target: 'paracelsus' },
      { kind: 'associated-with', target: 'van-helmont' },
    ],
    tags: ['solvent', 'menstruum'],
  },
  {
    id: 'azoth',
    type: 'concept',
    name: 'Azoth',
    epithet: 'The A and Z of the universal medicine',
    dates: '16th–17th c.',
    year: 1600,
    era: 'early-modern',
    cluster: 'alchemy',
    summary:
      'The name — alpha to omega folded into one word — for the universal spirit or mercury of the philosophers, emblazoned on Basil Valentine’s title pages and Paracelsian broadsides.',
    claims: [
      {
        text: 'Azoth names the universal mercury in Paracelsian and Valentinian literature; the word spans first and last letters of Latin, Greek, and Hebrew alphabets.',
        evidence: 'scholarship',
        sources: ['principe-2013'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'basil-valentine' },
      { kind: 'part-of', target: 'alchemy' },
    ],
    tags: ['mercury', 'alphabet'],
  },
  {
    id: 'elixir-of-life',
    type: 'concept',
    name: 'The Elixir of Life',
    epithet: 'Medicine of metals, medicine of men',
    dates: 'Arabic al-iksīr',
    year: 1000,
    era: 'medieval',
    cluster: 'alchemy',
    summary:
      'The perfecting medicine in its healing aspect: what transmutes metals, taken inwardly, was hoped to renew the body and prolong life.',
    claims: [
      {
        text: 'The word elixir derives from Arabic al-iksīr; Latin authors from Bacon onward treat the stone as a supreme medicine for human bodies.',
        evidence: 'scholarship',
        sources: ['principe-2013'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'philosophers-stone' },
      { kind: 'associated-with', target: 'roger-bacon' },
    ],
    tags: ['longevity', 'medicine'],
  },
  {
    id: 'chrysopoeia',
    type: 'concept',
    name: 'Chrysopoeia',
    epithet: 'The making of gold, named plainly',
    dates: 'Greek antiquity',
    year: 300,
    era: 'antiquity',
    cluster: 'alchemy',
    summary:
      'Gold-making proper — the term of art from the Greek corpus onward for the transmutation of base metal into gold, alchemy’s defining claim.',
    claims: [
      {
        text: 'Chrysopoeia titles the earliest stratum of Greco-Egyptian alchemy and remains the standard term for metallic transmutation.',
        evidence: 'scholarship',
        sources: ['principe-2013'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'alchemy' },
      { kind: 'associated-with', target: 'cleopatra-alchemist' },
    ],
    tags: ['gold', 'transmutation'],
  },
  {
    id: 'green-lion',
    type: 'symbol',
    name: 'The Green Lion',
    epithet: 'The beast that devours the sun',
    dates: 'medieval emblem',
    year: 1400,
    era: 'medieval',
    cluster: 'alchemy',
    summary:
      'The green lion swallowing the sun — among the most famous of alchemical emblems, a cover-name usually resolved as a corrosive vitriol or sharp menstruum that dissolves gold.',
    claims: [
      {
        text: 'The lion devouring the sun appears in the Rosarium tradition; Decknamen readings identify the green lion with vitriol-derived solvents.',
        evidence: 'scholarship',
        sources: ['principe-2013'],
      },
      {
        text: 'Newton’s papers pursue “the green lion” among the work’s materials.',
        evidence: 'scholarship',
        sources: ['dobbs-1975'],
      },
    ],
    relations: [
      { kind: 'symbol-of', target: 'alchemy' },
      { kind: 'associated-with', target: 'rosarium-philosophorum' },
    ],
    tags: ['emblem', 'vitriol', 'sun'],
  },
  {
    id: 'decknamen',
    type: 'concept',
    name: 'Decknamen',
    epithet: 'Cover-names: the code the adepts wrote in',
    dates: 'the whole tradition',
    year: 1500,
    era: 'renaissance',
    cluster: 'alchemy',
    summary:
      'The deliberate cover-names of alchemical writing — doves, dragons, kings, and lions standing for substances — a code that modern historians have learned to read back into the laboratory.',
    claims: [
      {
        text: 'Principe and Newman demonstrated that much emblematic language encodes real procedures, replicable when the Decknamen are resolved.',
        evidence: 'scholarship',
        sources: ['principe-2013', 'newman-principe-2002'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'alchemy' },
      { kind: 'associated-with', target: 'philosophers-stone' },
    ],
    tags: ['code', 'secrecy', 'replication'],
  },
];
