import { CLUSTER_META, type ClusterId } from '../../../domain/types';
import { hashString } from '../../../domain/random';
import { entities } from '../../../data';
import { ENTITY_PLATES } from './entityPlates';
import { RED_BOOK_ART } from '../../../data/redBooks.generated';

/**
 * Bundled public-domain plates for the grimoires. Each cluster has an emblem
 * (used as the frontispiece) and three figure/engraving plates (one is chosen
 * per book, by hashing its id, for an interior illustration). Images are loaded
 * as plain <img> elements and cached so the grimoire press can draw them onto
 * the parchment pages synchronously; `preloadGrimoireArt` warms the cache at
 * scene start and signals when every plate is ready so pages re-bake with art.
 */

const CLUSTERS = Object.keys(CLUSTER_META) as ClusterId[];
const PLATE_VARIANTS = ['fig', 'art2L', 'art2R'] as const;

const imgCache = new Map<string, HTMLImageElement>();
const inflight = new Map<string, Promise<HTMLImageElement | null>>();

function load(path: string): Promise<HTMLImageElement | null> {
  const pending = inflight.get(path);
  if (pending) return pending;
  const p = new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.onload = () => {
      imgCache.set(path, img);
      resolve(img);
    };
    img.onerror = () => resolve(null);
    img.src = path;
  });
  inflight.set(path, p);
  return p;
}

/**
 * The extended plate pool: a second wave of downloaded engravings and
 * portraits so neighbouring books stop repeating each other. Every entry
 * carries an honest caption.
 */
const POOL: Record<ClusterId, [path: string, caption: string][]> = {
  hermetica: [
    ['/art/pool-hermetica-1.jpg', 'The Bembine Table of Isis'],
    ['/art/pool-hermetica-2.jpg', 'Teraphim, from Kircher’s Œdipus Ægyptiacus (1652–54)'],
    ['/art/pool-hermetica-3.jpg', 'Hermes Trismegistus — the Siena Cathedral pavement (1488)'],
    ['/art/pool-hermetica-4.jpg', 'The Emerald Tablet, in a 17th-century engraving'],
    ['/art/pool-hermetica-5.jpg', 'Thoth, ibis-headed scribe of the gods'],
    ['/art/pool-hermetica-6.jpg', 'The weighing of the heart — Papyrus of Ani'],
    ['/art/pool-hermetica-7.jpg', 'Athanasius Kircher'],
    ['/art/pool-hermetica-8.jpg', 'The Tower of Babel — Kircher, Turris Babel (1679)'],
    ['/art/pool-hermetica-9.jpg', 'Marsilio Ficino, first translator of the Corpus Hermeticum'],
    ['/art/pool-hermetica-10.jpg', 'Isis, in an Egyptian relief'],
    ['/art/pool-hermetica-11.jpg', 'Plotinus, founder of Neoplatonism'],
    ['/art/pool-hermetica-12.jpg', 'Serapis — the syncretic god of Ptolemaic Alexandria'],
    ['/art/pool-hermetica-13.jpg', 'Harpocrates, the god of silence'],
    ['/art/pool-hermetica-14.jpg', 'The obelisk Kircher read as a hieroglyphic sermon'],
    ['/art/pool-hermetica-15.jpg', 'A manuscript of the Corpus Hermeticum'],
    ['/art/pool-hermetica-16.jpg', 'The ouroboros of Cleopatra the Alchemist'],
    ['/art/pool-hermetica-17.jpg', 'Iamblichus, who defended theurgy'],
    ['/art/pool-hermetica-18.jpg', 'The Library of Alexandria, imagined by a later engraver'],
  ],
  alchemy: [
    ['/art/pool-alchemy-1.jpg', 'The sun rises over the city — Splendor Solis (1535)'],
    ['/art/pool-alchemy-2.jpg', 'An emblem from Maier’s Atalanta Fugiens (1617)'],
    ['/art/pool-alchemy-3.jpg', 'Khunrath’s laboratory-oratory — Amphitheatrum Sapientiae (1595)'],
    ['/art/pool-alchemy-4.jpg', 'From the Rosarium Philosophorum (1550)'],
    ['/art/pool-alchemy-5.jpg', 'A page of the wordless Mutus Liber (1677)'],
    ['/art/pool-alchemy-6.jpg', 'The Ripley Scroll'],
    ['/art/pool-alchemy-7.jpg', 'Aurora Consurgens, 15th-century manuscript'],
    ['/art/pool-alchemy-8.jpg', 'One of the Twelve Keys of Basil Valentine'],
    ['/art/pool-alchemy-9.jpg', 'Paracelsus'],
    ['/art/pool-alchemy-10.jpg', 'The alchemist at his furnace — Teniers'],
    ['/art/pool-alchemy-11.jpg', 'Nicolas Flamel'],
    ['/art/pool-alchemy-12.jpg', 'Jan Baptist van Helmont'],
    ['/art/pool-alchemy-13.jpg', 'Distillation apparatus, from an early printed herbal'],
    ['/art/pool-alchemy-14.jpg', 'A plate from the Musaeum Hermeticum (1678)'],
    ['/art/pool-alchemy-15.jpg', 'Fludd’s cosmos — Utriusque Cosmi Historia (1617)'],
    ['/art/pool-alchemy-16.jpg', 'Ashmole’s Theatrum Chemicum Britannicum (1652)'],
    ['/art/pool-alchemy-17.jpg', 'Elias Ashmole'],
    ['/art/pool-alchemy-18.jpg', 'Michał Sędziwój (Sendivogius) at work'],
    ['/art/pool-alchemy-19.jpg', 'From the Summa Perfectionis of pseudo-Geber'],
  ],
  kabbalah: [
    ['/art/pool-kabbalah-1.jpg', 'Kabbala Denudata, Knorr von Rosenroth (1677)'],
    ['/art/pool-kabbalah-2.jpg', 'A sephirotic diagram, 16th century'],
    ['/art/pool-kabbalah-3.jpg', 'Portae Lucis — Gikatilla’s Gates of Light (1516)'],
    ['/art/pool-kabbalah-4.jpg', 'The Zohar, Mantua edition (1558)'],
    ['/art/pool-kabbalah-5.jpg', 'Isaac Luria, the Ari of Safed'],
    ['/art/pool-kabbalah-6.jpg', 'Micrography in a Hebrew manuscript'],
    ['/art/pool-kabbalah-7.jpg', 'Safed, where Lurianic kabbalah took shape'],
    ['/art/pool-kabbalah-8.jpg', 'A Torah scroll'],
    ['/art/pool-kabbalah-9.jpg', 'A kabbalistic protective amulet'],
    ['/art/pool-kabbalah-10.jpg', 'Cordovero’s Pardes Rimonim'],
    ['/art/pool-kabbalah-11.jpg', 'The twenty-two letters'],
  ],
  renaissance: [
    ['/art/pool-renaissance-1.jpg', 'John Dee — the Ashmolean portrait'],
    ['/art/pool-renaissance-2.jpg', 'Pico della Mirandola'],
    ['/art/pool-renaissance-3.jpg', 'The execution of Giordano Bruno, Campo de’ Fiori'],
    ['/art/pool-renaissance-4.jpg', 'Heinrich Cornelius Agrippa'],
    ['/art/pool-renaissance-5.jpg', 'Dee’s Monas Hieroglyphica (1564)'],
    ['/art/pool-renaissance-6.jpg', 'Edward Kelley, Dee’s scryer'],
    ['/art/pool-renaissance-7.jpg', 'Johannes Trithemius, abbot and cryptographer'],
    ['/art/pool-renaissance-8.jpg', 'Girolamo Cardano'],
    ['/art/pool-renaissance-10.jpg', 'Arcimboldo’s Rudolf II as Vertumnus'],
    ['/art/pool-renaissance-11.jpg', 'The zodiac man of the almanacs'],
    ['/art/pool-renaissance-12.jpg', 'Cosimo de’ Medici, who commissioned the translation'],
    ['/art/pool-renaissance-13.jpg', 'Florence, where the Hermetic revival began'],
    ['/art/pool-renaissance-14.jpg', 'Dürer’s Melencolia I (1514)'],
    ['/art/pool-renaissance-15.jpg', 'From the Hypnerotomachia Poliphili (1499)'],
  ],
  'early-modern': [
    ['/art/pool-early-modern-1.jpg', 'Geheime Figuren der Rosenkreuzer (Altona, 1785)'],
    ['/art/pool-early-modern-2.jpg', 'Jacob Böhme'],
    ['/art/pool-early-modern-3.jpg', 'Emanuel Swedenborg'],
    ['/art/pool-early-modern-4.jpg', 'The Fama Fraternitatis (1614)'],
    ['/art/pool-early-modern-5.jpg', 'Robert Fludd'],
    ['/art/pool-early-modern-6.jpg', 'Thomas Vaughan, who wrote as Eugenius Philalethes'],
    ['/art/pool-early-modern-7.jpg', 'Blake’s Ancient of Days (1794)'],
    ['/art/pool-early-modern-8.jpg', 'Blake’s Jacob’s Ladder'],
    ['/art/pool-early-modern-9.jpg', 'Court de Gébelin, who first called the tarot Egyptian'],
    ['/art/pool-early-modern-10.jpg', 'Franz Anton Mesmer'],
    ['/art/pool-early-modern-11.jpg', 'The mesmeric baquet'],
    ['/art/pool-early-modern-12.jpg', 'Swedenborg’s New Jerusalem'],
    ['/art/pool-early-modern-13.jpg', 'Comenius, Orbis Sensualium Pictus (1658)'],
    ['/art/pool-early-modern-14.jpg', 'From Alciato’s Emblemata — the emblem book habit'],
  ],
  freemasonry: [
    ['/art/pool-freemasonry-1.jpg', 'A Masonic initiation — 18th-century engraving'],
    ['/art/pool-freemasonry-2.jpg', 'A Master’s apron, hand-painted silk'],
    ['/art/pool-freemasonry-3.jpg', 'A lodge tracing board'],
    ['/art/pool-freemasonry-4.jpg', 'Anderson’s Constitutions (1723)'],
    ['/art/pool-freemasonry-5.jpg', 'A lodge at work, 18th-century engraving'],
    ['/art/pool-freemasonry-6.jpg', 'The Grand Lodge, London'],
    ['/art/pool-freemasonry-7.jpg', 'Solomon’s Temple, the craft’s central figure'],
    ['/art/pool-freemasonry-8.jpg', 'A Masonic certificate'],
    ['/art/pool-freemasonry-9.jpg', 'The eye of providence'],
    ['/art/pool-freemasonry-10.jpg', 'Benjamin Franklin, freemason'],
    ['/art/pool-freemasonry-11.jpg', 'Albert Pike of the Scottish Rite'],
  ],
  'occult-revival': [
    ['/art/pool-occult-revival-1.jpg', 'Helena Petrovna Blavatsky'],
    ['/art/pool-occult-revival-2.jpg', 'Aleister Crowley'],
    ['/art/pool-occult-revival-3.jpg', 'The High Priestess, Rider–Waite–Smith tarot (1909)'],
    ['/art/pool-occult-revival-4.jpg', 'The Fool, Rider–Waite–Smith tarot (1909)'],
    ['/art/pool-occult-revival-5.jpg', 'Papus (Gérard Encausse)'],
    ['/art/pool-occult-revival-6.jpg', 'Annie Besant'],
    ['/art/pool-occult-revival-7.jpg', 'The seal of the Theosophical Society'],
    ['/art/pool-occult-revival-8.jpg', 'A séance, in a 19th-century engraving'],
    ['/art/pool-occult-revival-9.jpg', 'D. D. Home, the medium nobody caught'],
    ['/art/pool-occult-revival-10.jpg', 'A. E. Waite'],
    ['/art/pool-occult-revival-11.jpg', 'MacGregor Mathers'],
    ['/art/pool-occult-revival-12.jpg', 'Rudolf Steiner'],
    ['/art/pool-occult-revival-13.jpg', 'Austin Osman Spare'],
    ['/art/pool-occult-revival-14.jpg', 'The Wheel of Fortune, Rider–Waite–Smith (1909)'],
    ['/art/pool-occult-revival-15.jpg', 'The Star, Rider–Waite–Smith (1909)'],
    ['/art/pool-occult-revival-16.jpg', 'A card of the Tarot de Marseille'],
  ],
  scholarship: [
    ['/art/pool-scholarship-1.jpg', 'The Flammarion engraving (1888)'],
    ['/art/pool-scholarship-2.jpg', 'Brahe’s planisphere — Cellarius, Harmonia Macrocosmica (1660)'],
    ['/art/pool-scholarship-3.jpg', 'Aby Warburg, who took the images seriously'],
    ['/art/pool-scholarship-4.jpg', 'The Bodleian, where the manuscripts landed'],
    ['/art/pool-scholarship-5.jpg', 'The Vatican Library'],
    ['/art/pool-scholarship-6.jpg', 'A scriptorium at work'],
    ['/art/pool-scholarship-7.jpg', 'A Wunderkammer — the museum before museums'],
    ['/art/pool-scholarship-8.jpg', 'Tycho Brahe'],
    ['/art/pool-scholarship-9.jpg', 'Kepler, Harmonices Mundi (1619)'],
    ['/art/pool-scholarship-10.jpg', 'Newton — who wrote more on alchemy than on optics'],
    ['/art/pool-scholarship-11.jpg', 'An armillary sphere'],
    ['/art/pool-scholarship-12.jpg', 'Wright of Derby’s Orrery (1766)'],
    ['/art/pool-scholarship-13.jpg', 'Isaac Casaubon, who dated the Hermetica and broke the spell'],
    ['/art/pool-scholarship-14.jpg', 'A reading room of the old kind'],
    ['/art/pool-scholarship-15.jpg', 'The Prague astronomical clock'],
    ['/art/pool-scholarship-16.jpg', 'An incunable page'],
  ],
};

function corePaths(): string[] {
  const paths: string[] = [];
  for (const c of CLUSTERS) {
    paths.push(`/art/emblem-${c}.jpg`);
    for (const v of PLATE_VARIANTS) paths.push(`/art/${v}-${c}.jpg`);
  }
  return paths;
}

let started = false;
/**
 * Warm the core plates at scene start, and only those.
 *
 * The extended pool is some forty megabytes across a hundred-odd
 * engravings — fetching all of it up front to illustrate the one book a
 * visitor might open would be absurd. Pool plates are fetched per book by
 * `ensurePlates` instead.
 */
export function preloadGrimoireArt(onWave?: () => void): void {
  if (started) {
    onWave?.();
    return;
  }
  started = true;
  Promise.all(corePaths().map(load)).then(() => onWave?.());
}

/**
 * Fetch the two plates a particular book needs, if they are not already in
 * hand. Resolves true when something new arrived, so the caller knows to
 * re-bake the pages — `bakeGrimoire` is synchronous and draws an empty frame
 * for an image that has not landed yet.
 */
export function ensurePlates(cluster: ClusterId, entityId: string): Promise<boolean> {
  const { front, plate } = resolve(cluster, entityId);
  const wanted = [front, plate].filter((p) => !imgCache.has(p));
  if (wanted.length === 0) return Promise.resolve(false);
  return Promise.all(wanted.map(load)).then((r) => r.some(Boolean));
}

/**
 * Per-entity curation: some subjects sit awkwardly under their cluster's
 * default art (Wicca under Lévi's Baphomet, say). These overrides swap in a
 * genuinely relevant plate from the bundled set, with an honest caption.
 * All referenced files are already in the preload set.
 */
const ENTITY_ART: Record<string, { front?: string; plate?: string; caption?: string }> = {
  // the Wicca circle: Agrippa's pentagram-man (the pentacle) + the ouroboros
  wicca: { front: '/art/emblem-renaissance.jpg', plate: '/art/pool-hermetica-16.jpg', caption: 'The ouroboros — nature renewing herself' },
  'gerald-gardner': { front: '/art/emblem-renaissance.jpg', plate: '/art/pool-hermetica-16.jpg', caption: 'The ouroboros — nature renewing herself' },
  'margaret-murray': { front: '/art/emblem-renaissance.jpg', plate: '/art/pool-hermetica-16.jpg', caption: 'The ouroboros — nature renewing herself' },
  // the tarot family reads best beside the Rider–Waite–Smith Magician
  tarot: { plate: '/art/art2L-occult-revival.jpg', caption: 'The Magician, Rider–Waite–Smith tarot (1909)' },
  'rider-waite-smith-tarot': { plate: '/art/art2L-occult-revival.jpg', caption: 'The Magician, Rider–Waite–Smith tarot (1909)' },
  'book-of-thoth-tarot': { plate: '/art/art2L-occult-revival.jpg', caption: 'The Magician, Rider–Waite–Smith tarot (1909)' },
  'pamela-colman-smith': { plate: '/art/art2L-occult-revival.jpg', caption: 'The Magician, Rider–Waite–Smith tarot (1909)' },
  'arthur-edward-waite': { plate: '/art/art2L-occult-revival.jpg', caption: 'The Magician, Rider–Waite–Smith tarot (1909)' },
  'tarot-des-bohemiens': { plate: '/art/art2L-occult-revival.jpg', caption: 'The Magician, Rider–Waite–Smith tarot (1909)' },
  // the Golden Dawn family carries its own Rose Cross
  'golden-dawn': { plate: '/art/art2R-occult-revival.jpg', caption: 'The Rose Cross Lamen of the Golden Dawn' },
  'cipher-manuscripts': { plate: '/art/art2R-occult-revival.jpg', caption: 'The Rose Cross Lamen of the Golden Dawn' },
  'william-wynn-westcott': { plate: '/art/art2R-occult-revival.jpg', caption: 'The Rose Cross Lamen of the Golden Dawn' },
  'macgregor-mathers': { plate: '/art/art2R-occult-revival.jpg', caption: 'The Rose Cross Lamen of the Golden Dawn' },
  'israel-regardie': { plate: '/art/art2R-occult-revival.jpg', caption: 'The Rose Cross Lamen of the Golden Dawn' },
  // spiritualism and mesmerism have nothing to do with Baphomet — give them
  // the heavens (Cellarius) as the period's image of the unseen order
  spiritualism: { front: '/art/emblem-scholarship.jpg', plate: '/art/pool-scholarship-2.jpg', caption: 'Brahe’s planisphere — Cellarius, Harmonia Macrocosmica (1660)' },
  'fox-sisters': { front: '/art/emblem-scholarship.jpg', plate: '/art/pool-scholarship-2.jpg', caption: 'Brahe’s planisphere — Cellarius, Harmonia Macrocosmica (1660)' },
  'allan-kardec': { front: '/art/emblem-scholarship.jpg', plate: '/art/pool-scholarship-2.jpg', caption: 'Brahe’s planisphere — Cellarius, Harmonia Macrocosmica (1660)' },
  spiritism: { front: '/art/emblem-scholarship.jpg', plate: '/art/pool-scholarship-2.jpg', caption: 'Brahe’s planisphere — Cellarius, Harmonia Macrocosmica (1660)' },
  'society-psychical-research': { front: '/art/emblem-scholarship.jpg', plate: '/art/pool-scholarship-2.jpg', caption: 'Brahe’s planisphere — Cellarius, Harmonia Macrocosmica (1660)' },
  'automatic-writing': { front: '/art/emblem-scholarship.jpg', plate: '/art/pool-scholarship-2.jpg', caption: 'Brahe’s planisphere — Cellarius, Harmonia Macrocosmica (1660)' },
  'franz-anton-mesmer': { front: '/art/emblem-scholarship.jpg', plate: '/art/pool-scholarship-2.jpg', caption: 'Brahe’s planisphere — Cellarius, Harmonia Macrocosmica (1660)' },
  'animal-magnetism': { front: '/art/emblem-scholarship.jpg', plate: '/art/pool-scholarship-2.jpg', caption: 'Brahe’s planisphere — Cellarius, Harmonia Macrocosmica (1660)' },
  // famous subjects sit beside their own portraits and plates
  'john-dee': { plate: '/art/pool-renaissance-1.jpg', caption: 'John Dee — the Ashmolean portrait' },
  'enochian-language': { plate: '/art/pool-renaissance-1.jpg', caption: 'John Dee — the Ashmolean portrait' },
  'pico-della-mirandola': { plate: '/art/pool-renaissance-2.jpg', caption: 'Pico della Mirandola' },
  'nine-hundred-theses': { plate: '/art/pool-renaissance-2.jpg', caption: 'Pico della Mirandola' },
  'oration-on-dignity-of-man': { plate: '/art/pool-renaissance-2.jpg', caption: 'Pico della Mirandola' },
  'giordano-bruno': { plate: '/art/pool-renaissance-3.jpg', caption: 'The execution of Giordano Bruno, Campo de’ Fiori' },
  'bruno-execution': { plate: '/art/pool-renaissance-3.jpg', caption: 'The execution of Giordano Bruno, Campo de’ Fiori' },
  'jacob-boehme': { plate: '/art/pool-early-modern-2.jpg', caption: 'Jacob Böhme' },
  'aurora-boehme': { plate: '/art/pool-early-modern-2.jpg', caption: 'Jacob Böhme' },
  'signatura-rerum': { plate: '/art/pool-early-modern-2.jpg', caption: 'Jacob Böhme' },
  'emanuel-swedenborg': { plate: '/art/pool-early-modern-3.jpg', caption: 'Emanuel Swedenborg' },
  'heaven-and-hell': { plate: '/art/pool-early-modern-3.jpg', caption: 'Emanuel Swedenborg' },
  'helena-blavatsky': { plate: '/art/pool-occult-revival-1.jpg', caption: 'Helena Petrovna Blavatsky' },
  'secret-doctrine': { plate: '/art/pool-occult-revival-1.jpg', caption: 'Helena Petrovna Blavatsky' },
  'theosophical-society': { plate: '/art/pool-occult-revival-1.jpg', caption: 'Helena Petrovna Blavatsky' },
  'aleister-crowley': { plate: '/art/pool-occult-revival-2.jpg', caption: 'Aleister Crowley' },
  thelema: { plate: '/art/pool-occult-revival-2.jpg', caption: 'Aleister Crowley' },
  'book-of-the-law': { plate: '/art/pool-occult-revival-2.jpg', caption: 'Aleister Crowley' },
  'ordo-templi-orientis': { plate: '/art/pool-occult-revival-2.jpg', caption: 'Aleister Crowley' },
  'heinrich-khunrath': { plate: '/art/pool-alchemy-3.jpg', caption: 'Khunrath’s laboratory-oratory — Amphitheatrum Sapientiae (1595)' },
  'amphitheatrum-sapientiae': { plate: '/art/pool-alchemy-3.jpg', caption: 'Khunrath’s laboratory-oratory — Amphitheatrum Sapientiae (1595)' },
  'michael-maier': { plate: '/art/pool-alchemy-2.jpg', caption: 'An emblem from Maier’s Atalanta Fugiens (1617)' },
  'atalanta-fugiens': { plate: '/art/pool-alchemy-2.jpg', caption: 'An emblem from Maier’s Atalanta Fugiens (1617)' },
  // the crimson-parity books each carry their OWN cover, downloaded from the
  // very scan they open (see redBooks.generated.ts). Merged in as hand-picks so
  // a book opens on its own title page rather than a shared section plate.
  ...RED_BOOK_ART,
};

/**
 * Core plates kept OUT of the rotation because the same artwork is already in
 * it under a better caption.
 *
 * The original eight-cluster core set was assembled by theme, and several of
 * its plates turned out to be the very engravings later fetched by name — the
 * "figure of Renaissance" is Ficino, the "figure of Freemasonry" is Ashmole,
 * one "plate from Hermetica" is Dee's Monas. Left in, each showed up twice
 * across the library under two different labels. They stay on disk because
 * ENTITY_ART still points some books at them by hand.
 *
 * Found with a perceptual-hash sweep over public/art — rerun that if the set
 * of plates changes, since a byte-comparison misses two scans of one picture.
 */
const SUPERSEDED_BY_POOL = new Set([
  '/art/art2L-alchemy.jpg', // the Ripley Scroll, = pool-alchemy-6
  '/art/art2L-hermetica.jpg', // Dee's Monas, = pool-renaissance-5
  '/art/art2L-scholarship.jpg', // Cellarius, = pool-scholarship-2
  '/art/art2R-early-modern.jpg', // the Fama, = pool-early-modern-4
  '/art/art2R-hermetica.jpg', // the ouroboros, = pool-hermetica-16
  '/art/fig-early-modern.jpg', // Böhme, = pool-early-modern-2
  '/art/fig-freemasonry.jpg', // Ashmole, = pool-alchemy-17
  '/art/fig-renaissance.jpg', // Ficino, = pool-hermetica-9
  // and these are the same picture as some book's OWN plate, now that every
  // subject that could be given its own is (see entityPlates.ts). A pool
  // plate that duplicates one would put the same engraving in two books
  // under two captions, which is the thing this set exists to prevent.
  '/art/art2L-alchemy.jpg',
  '/art/art2L-early-modern.jpg',
  '/art/art2L-hermetica.jpg',
  '/art/art2R-early-modern.jpg',
  '/art/art2R-hermetica.jpg',
  '/art/emblem-occult-revival.jpg',
  '/art/fig-freemasonry.jpg',
  '/art/pool-alchemy-11.jpg',
  '/art/pool-alchemy-16.jpg',
  '/art/pool-alchemy-17.jpg',
  '/art/pool-alchemy-6.jpg',
  '/art/pool-early-modern-4.jpg',
  '/art/pool-freemasonry-11.jpg',
  '/art/pool-freemasonry-3.jpg',
  '/art/pool-hermetica-16.jpg',
  '/art/pool-hermetica-17.jpg',
  '/art/pool-kabbalah-4.jpg',
  '/art/pool-occult-revival-1.jpg',
  '/art/pool-occult-revival-10.jpg',
  '/art/pool-occult-revival-11.jpg',
  '/art/pool-occult-revival-13.jpg',
  '/art/pool-occult-revival-2.jpg',
  '/art/pool-occult-revival-5.jpg',
  '/art/pool-renaissance-1.jpg',
  '/art/pool-renaissance-5.jpg',
  '/art/pool-scholarship-10.jpg',
]);

/** every distinct image a cluster can show, with a caption */
function clusterPool(cluster: ClusterId): [path: string, caption: string][] {
  const label = CLUSTER_META[cluster].label;
  const core: [string, string][] = [
    [`/art/emblem-${cluster}.jpg`, `An emblem of ${label}`],
    [`/art/fig-${cluster}.jpg`, `A figure of ${label}`],
    [`/art/art2L-${cluster}.jpg`, `A plate from ${label}`],
    [`/art/art2R-${cluster}.jpg`, `A plate from ${label}`],
  ];
  // the filter runs over the POOL too, not just the core four: most of what
  // is superseded now is a pool plate that some book carries as its own
  return [...core, ...POOL[cluster]].filter(([path]) => !SUPERSEDED_BY_POOL.has(path));
}

/**
 * Which two plates each book gets — dealt, not hashed.
 *
 * Hashing an id into the pool independently for the frontispiece and the
 * plate meant collisions everywhere: with a pool of six and fifty books in a
 * cluster, the same engraving opened a dozen different books, and two books
 * on the same shelf routinely showed the same pair. This deals instead.
 *
 * Books in a cluster are ordered, then walked round the pool: book i takes
 * pool[i % n] for its frontispiece and pool[(i % n + 1 + lap) % n] for its
 * plate, where lap counts how many times the deal has been round. That gives
 * three guarantees worth having:
 *
 *   · a book's own two plates are never the same image;
 *   · neighbouring books never share a frontispiece or a plate;
 *   · no two books in a cluster get the same PAIR — the offset shifts by one
 *     each lap, so the pairing is unique for n·(n−1) books, far more than any
 *     cluster holds.
 *
 * An image still recurs across a cluster — fifty books cannot each have a
 * unique pair of plates from a pool of twenty — but never in a way you can
 * catch by opening two books side by side.
 */
const ordinals = new Map<string, number>();
let ordinalsBuilt = false;

function buildOrdinals() {
  if (ordinalsBuilt) return;
  ordinalsBuilt = true;
  const seen = new Map<ClusterId, number>();
  for (const e of entities) {
    const n = seen.get(e.cluster) ?? 0;
    ordinals.set(e.id, n);
    seen.set(e.cluster, n + 1);
  }
}

/** the pool indices dealt to a book: [frontispiece, plate] */
function deal(cluster: ClusterId, entityId: string): [number, number] {
  buildOrdinals();
  const n = clusterPool(cluster).length;
  // an unknown id (a test fixture, say) still needs a stable answer
  const i = ordinals.get(entityId) ?? hashString(entityId) % Math.max(n, 1);
  const a = i % n;
  const lap = Math.floor(i / n);
  const b = (a + 1 + lap) % n;
  return [a, b === a ? (a + 1) % n : b];
}

/**
 * Everything a book shows, settled in one place so the frontispiece and the
 * interior plate can never disagree about what the other one picked.
 *
 * A hand-picked plate is honoured, but it can land on the image the deal
 * already gave the frontispiece — that put Khunrath's laboratory on both
 * sides of his own book. Whichever side was not hand-picked steps to the
 * next plate in the pool.
 */
function resolve(
  cluster: ClusterId,
  entityId: string,
): { front: string; plate: string; caption: string; curated: boolean } {
  const pool = clusterPool(cluster);
  /**
   * THE BOOK'S OWN SUBJECT COMES FIRST.
   *
   * Before this, every plate came from a pool of about twenty per section,
   * dealt round so that neighbours never matched — clever, and still a
   * generic engraving: open Nicolas Flamel and you got "a plate from
   * Alchemy". ENTITY_PLATES is a public-domain image OF THE ACTUAL SUBJECT,
   * fetched per entity from Wikimedia Commons, and it outranks the deal.
   *
   * It does not cover everything and is not meant to: an abstract idea often
   * has no picture of its own, and those books fall through to the pool
   * exactly as before. The frontispiece is always left to the deal, so a book
   * still OPENS on its section's emblem and shows its own subject inside.
   */
  const own = ENTITY_PLATES[entityId];
  const hand = ENTITY_ART[entityId];
  // a hand-picked plate that has since been superseded is dropped rather than
  // honoured: those files are duplicates of some book's own picture now, and
  // an override is not a licence to show the same engraving twice
  const clean = hand
    ? {
        ...hand,
        front: hand.front && SUPERSEDED_BY_POOL.has(hand.front) ? undefined : hand.front,
        plate: hand.plate && SUPERSEDED_BY_POOL.has(hand.plate) ? undefined : hand.plate,
      }
    : undefined;
  const o = own ? { ...clean, plate: own.plate, caption: own.caption } : clean;
  const [a, b] = deal(cluster, entityId);
  const fallbackCaption = `A plate from ${CLUSTER_META[cluster].label}`;
  let front = o?.front ?? pool[a][0];
  let plate = o?.plate ?? pool[b][0];
  let caption = o?.plate ? (o.caption ?? fallbackCaption) : pool[b][1];

  if (front === plate) {
    if (o?.plate) {
      for (let k = 1; k < pool.length; k++) {
        const cand = pool[(a + k) % pool.length][0];
        if (cand !== plate) {
          front = cand;
          break;
        }
      }
    } else {
      for (let k = 1; k < pool.length; k++) {
        const idx = (b + k) % pool.length;
        if (pool[idx][0] !== front) {
          plate = pool[idx][0];
          caption = pool[idx][1];
          break;
        }
      }
    }
  }
  return { front, plate, caption, curated: Boolean(o?.front || o?.plate) };
}

/**
 * The two image paths a book will show, and whether they were hand-picked.
 * Exported so the deal's guarantees can be asserted in a test rather than
 * taken on trust — and so a missing file shows up as a failure, not as an
 * empty frame in the finished book.
 */
export function plateAssignment(
  cluster: ClusterId,
  entityId: string,
): { front: string; plate: string; curated: boolean } {
  const { front, plate, curated } = resolve(cluster, entityId);
  return { front, plate, curated };
}

/** the frontispiece for a book — per-entity override, else its dealt plate */
export function frontispiece(cluster: ClusterId, entityId?: string): HTMLImageElement | null {
  if (!entityId) return imgCache.get(clusterPool(cluster)[0][0]) ?? null;
  return imgCache.get(resolve(cluster, entityId).front) ?? null;
}

/** the interior plate and its caption — the other half of the same deal */
export function plateFor(
  cluster: ClusterId,
  entityId: string,
): { img: HTMLImageElement | null; caption: string } {
  const { plate, caption } = resolve(cluster, entityId);
  return { img: imgCache.get(plate) ?? null, caption };
}
