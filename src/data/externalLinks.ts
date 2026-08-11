/**
 * External references per entity — Wikipedia for orientation, plus open
 * full-text archives for a few primary works. Kept separate from the
 * claims/citations system on purpose: these are onward doors, not evidence.
 * Tests verify every key resolves to a real entity.
 *
 * TWO LAYERS. The hand-written map below is the curated one: a checked
 * article, sometimes with a second link to a full text or a digitised
 * manuscript. Under it sits the generated `WIKIPEDIA_TITLES`, which covers
 * every entity in the collection — 75 of 407 had a link before, so most of
 * the museum offered no onward door at all, and the ones that did were
 * offering archive.org's scan of somebody else's book instead.
 *
 * The curated layer WINS, always. A generated title is a search result; a
 * curated one is a decision. To fix a bad generated link, add the entity here.
 */

export interface ExternalLink {
  label: string;
  url: string;
}

import { WIKIPEDIA_TITLES } from './wikipediaLinks';
import { shelfBookLinks } from './shelfBooks';

const W = (title: string): ExternalLink => ({
  label: 'Wikipedia',
  url: `https://en.wikipedia.org/wiki/${title}`,
});

const CURATED: Record<string, ExternalLink[]> = {
  // — Hermetica & Late Antiquity —
  'hermes-trismegistus': [W('Hermes_Trismegistus')],
  'corpus-hermeticum': [
    W('Corpus_Hermeticum'),
    { label: 'Full text (Mead trans., sacred-texts)', url: 'https://sacred-texts.com/gno/th1/index.htm' },
  ],
  'emerald-tablet': [W('Emerald_Tablet')],
  picatrix: [W('Picatrix')],
  alexandria: [W('Alexandria')],
  hermeticism: [W('Hermeticism')],
  'prisca-theologia': [W('Prisca_theologia')],
  gnosis: [W('Gnosis')],
  'isaac-casaubon': [W('Isaac_Casaubon')],
  'casaubon-dating': [W('Isaac_Casaubon')],

  // — Alchemy —
  alchemy: [W('Alchemy')],
  zosimos: [W('Zosimos_of_Panopolis')],
  paracelsus: [W('Paracelsus')],
  ouroboros: [W('Ouroboros')],
  'philosophers-stone': [W("Philosopher's_stone")],
  'voynich-manuscript': [
    W('Voynich_manuscript'),
    { label: 'Digitized manuscript (Yale Beinecke)', url: 'https://collections.library.yale.edu/catalog/2002046' },
  ],

  // — Kabbalah —
  kabbalah: [W('Kabbalah')],
  'sefer-yetzirah': [W('Sefer_Yetzirah')],
  zohar: [W('Zohar')],
  'moses-de-leon': [W('Moses_de_Le%C3%B3n')],
  'isaac-luria': [W('Isaac_Luria')],
  'tree-of-life': [W('Tree_of_life_(Kabbalah)')],

  // — Renaissance —
  'marsilio-ficino': [W('Marsilio_Ficino')],
  'ficino-translation': [W('Corpus_Hermeticum')],
  'pico-della-mirandola': [W('Giovanni_Pico_della_Mirandola')],
  'nine-hundred-theses': [W('Giovanni_Pico_della_Mirandola')],
  'johannes-reuchlin': [W('Johann_Reuchlin')],
  'christian-cabala': [W('Christian_Kabbalah')],
  'cornelius-agrippa': [W('Heinrich_Cornelius_Agrippa')],
  'three-books-of-occult-philosophy': [
    W('Three_Books_of_Occult_Philosophy'),
    { label: 'Full text (sacred-texts)', url: 'https://sacred-texts.com/eso/agrippa/index.htm' },
  ],
  'john-dee': [W('John_Dee')],
  'monas-hieroglyphica': [W('Monas_Hieroglyphica')],
  'giordano-bruno': [W('Giordano_Bruno')],
  'bruno-execution': [W('Giordano_Bruno')],
  florence: [W('Florence')],
  prague: [W('Prague')],
  correspondences: [W('Correspondence_(theology)')],
  'natural-magic': [W('Natural_magic')],
  pentagram: [W('Pentagram')],

  // — Rosicrucianism & Christian Theosophy —
  rosicrucianism: [W('Rosicrucianism')],
  'fama-fraternitatis': [W('Fama_Fraternitatis')],
  'chymical-wedding': [W('Chymical_Wedding_of_Christian_Rosenkreutz')],
  'christian-rosenkreutz': [W('Christian_Rosenkreuz')],
  'johann-valentin-andreae': [W('Johannes_Valentinus_Andreae')],
  'rose-cross': [W('Rose_Cross')],
  'jacob-boehme': [W('Jakob_B%C3%B6hme')],

  // — Freemasonry —
  freemasonry: [W('Freemasonry')],
  'grand-lodge-founding': [W('Premier_Grand_Lodge_of_England')],
  'andersons-constitutions': [W("Anderson's_Constitutions")],
  'elias-ashmole': [W('Elias_Ashmole')],
  'square-and-compasses': [W('Square_and_Compasses')],
  london: [W('London')],

  // — The Occult Revival —
  'eliphas-levi': [W('%C3%89liphas_L%C3%A9vi')],
  'dogme-et-rituel': [W('Dogme_et_Rituel_de_la_Haute_Magie')],
  tarot: [W('Tarot')],
  'helena-blavatsky': [W('Helena_Blavatsky')],
  'theosophical-society': [W('Theosophical_Society')],
  'secret-doctrine': [
    W('The_Secret_Doctrine'),
    { label: 'Full text (sacred-texts)', url: 'https://sacred-texts.com/the/sd/index.htm' },
  ],
  'golden-dawn': [W('Hermetic_Order_of_the_Golden_Dawn')],
  'cipher-manuscripts': [W('Cipher_Manuscripts')],
  'william-wynn-westcott': [W('William_Wynn_Westcott')],
  'macgregor-mathers': [W('Samuel_Liddell_MacGregor_Mathers')],
  'arthur-edward-waite': [W('A._E._Waite')],
  'pamela-colman-smith': [W('Pamela_Colman_Smith')],
  'rider-waite-smith-tarot': [W('Rider%E2%80%93Waite_Tarot')],
  'israel-regardie': [W('Israel_Regardie')],

  // — The Academic Study —
  'frances-yates': [W('Frances_Yates')],
  'bruno-hermetic-tradition': [W('Giordano_Bruno_and_the_Hermetic_Tradition')],
  'warburg-institute': [W('Warburg_Institute')],
  'antoine-faivre': [W('Antoine_Faivre')],
  'wouter-hanegraaff': [W('Wouter_Hanegraaff')],
  'western-esotericism-field': [W('Western_esotericism')],
  'gershom-scholem': [W('Gershom_Scholem')],
  // — corrections to the generated titles (see wikipediaLinks.ts) —
  // The search picks the top-ranked article for an entity's name, which is
  // right about nine times in ten and badly wrong the rest: it sent Egil
  // Asprem to Anton LaVey and the Amsterdam chair to a list of airline codes.
  // Where a work or an idea has no article of its own, the honest target is
  // the person or tradition it belongs to.
  'novum-lumen-chymicum': [W('Michael_Sendivogius')],
  'amphitheatrum-sapientiae': [W('Heinrich_Khunrath')],
  'utriusque-cosmi-historia': [W('Robert_Fludd')],
  ungrund: [W('Jakob_B%C3%B6hme')],
  'regius-poem': [W('Regius_Manuscript')],
  'illustrations-of-masonry': [W('William_Preston_(Freemason)')],
  'ramsays-oration': [W('Andrew_Michael_Ramsay')],
  'kitab-sirr-al-khaliqa': [W('Sirr_al-khaliqa')],
  'pardes-rimmonim': [W('Moses_ben_Jacob_Cordovero')],
  'tarot-des-bohemiens': [W('G%C3%A9rard_Encausse')],
  'astral-light': [W('Astral_light')],
  'julian-the-theurgist': [W('Julian_the_Theurgist')],
  'shevirat-ha-kelim': [W('Lurianic_Kabbalah')],
  'agrippa-de-vanitate': [W('Heinrich_Cornelius_Agrippa')],
  'history-of-magic-experimental-science': [W('Lynn_Thorndike')],
  mnemohistory: [W('Jan_Assmann')],
  religionism: [W('Western_esotericism')],
  'egil-asprem': [W('Western_esotericism')],
  'hhp-amsterdam': [W('University_of_Amsterdam')],
  'gold-und-rosenkreuz': [W('Rosicrucianism')],
  'pico-condemnation': [W('Giovanni_Pico_della_Mirandola')],
};

/** every entity's article, with the curated entries laid over the generated ones.
 *  The shelf books sit with the curated layer, not the generated one: each of
 *  their titles was chosen by hand, and a book with no article of its own
 *  points at its AUTHOR rather than at a guess. */
export const EXTERNAL_LINKS: Record<string, ExternalLink[]> = {
  ...Object.fromEntries(Object.entries(WIKIPEDIA_TITLES).map(([id, title]) => [id, [W(title)]])),
  ...Object.fromEntries(Object.entries(shelfBookLinks).map(([id, title]) => [id, [W(title)]])),
  ...CURATED,
};
