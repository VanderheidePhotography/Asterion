/**
 * The scanned originals: a real, public-domain copy of a real book, on the
 * Internet Archive.
 *
 * ONLY WORKS APPEAR HERE, AND EVERY ONE IS ITS OWN SCAN.
 *
 * This map used to have a second layer under it — one canonical classic per
 * section, handed to ANY entity that had no scan of its own. That meant a
 * person, a symbol, a city or an idea all offered you 'the original on
 * archive.org', and fifty books in a wing offered you the SAME original: open
 * Paracelsus, open the ouroboros, open Nicolas Flamel, and each one sent you
 * to Waite's Paracelsus. The fallback is gone. A book links to the book it
 * actually is; everything else is a Wikipedia article and says so.
 *
 * Each identifier below was resolved by searching the Internet Archive for the
 * work by title and author, preferring the oldest institutional scan, and then
 * checked against the metadata API: the item exists, is not dark, is not
 * lending-restricted, and carries readable files. No identifier is used twice.
 *
 * Works with no public-domain scan — the Cipher Manuscripts, Ramsay's Oration,
 * Shi'ur Komah, and the modern scholarship in the Academic Study wing, which
 * is all still in copyright — are deliberately absent. They link to Wikipedia
 * like any other entry rather than to somebody's unauthorised upload.
 */
import type { Entity } from '../domain/types';
import { RED_BOOK_ARCHIVE } from './redBooks.generated';

export interface ArchiveText {
  /** Internet Archive item identifier */
  id: string;
  title: string;
  author: string;
  year: string;
}

const embed = (t: ArchiveText) => `https://archive.org/embed/${t.id}`;
export const archiveEmbedUrl = embed;
export const archiveDetailsUrl = (t: ArchiveText) => `https://archive.org/details/${t.id}`;

/** the scan of each work we hold, keyed by entity id */
export const ARCHIVE_BY_ENTITY: Record<string, ArchiveText> = {
  // — alchemy —
  'voynich-manuscript': { id: 'thevoynichmanuscript_201908', title: 'The Voynich Manuscript', author: 'anonymous', year: 'c. 1404–1438' },
  'summa-perfectionis': { id: 'geberisphilosoph00gebe', title: 'Summa perfectionis magisterii', author: 'pseudo-Geber', year: '1542' },
  'ripley-scroll': { id: 'bim_early-english-books-1475-1640_the-compound-of-alchymy-_ripley-george_1591', title: 'The Compound of Alchymy', author: 'George Ripley', year: '1591' },
  'triumphal-chariot-antimony': { id: 'triumphalchariot00basi', title: 'The Triumphal Chariot of Antimony', author: 'Basil Valentine', year: '1893' },
  'novum-lumen-chymicum': { id: 'novumlumenchymi00glaugoog', title: 'Novum Lumen Chymicum', author: 'Michael Sendivogius', year: '1664' },
  'amphitheatrum-sapientiae': { id: 'amphitheatrum-sapientiae-aeternae-solius', title: 'Amphitheatrum Sapientiae Aeternae', author: 'Heinrich Khunrath', year: '1617' },
  'sceptical-chymist': { id: 'bim_early-english-books-1641-1700_the-sceptical-chymist_boyle-robert_1680', title: 'The Sceptical Chymist', author: 'Robert Boyle', year: '1680' },
  'turba-philosophorum': { id: 'alchemyturbaphil00waitrich', title: 'The Turba Philosophorum', author: 'trans. A. E. Waite', year: '1896' },
  'rosarium-philosophorum': { id: 'raimvndilvlliima00llul', title: 'De alchimia opuscula (with the Rosarium)', author: 'ed. Cyriacus Jacobus', year: '1546' },
  'aurora-consurgens': { id: 'AuroraConsurgens', title: 'Aurora Consurgens', author: 'Zentralbibliothek Zürich MS', year: '15th c.' },
  'mutus-liber': { id: 'mutus-liber', title: 'Mutus Liber', author: 'Altus (Isaac Baulot)', year: '1677' },
  'splendor-solis': { id: 'splendorsolisalc00tris', title: 'Splendor Solis', author: 'Salomon Trismosin', year: '1920' },
  'theatrum-chemicum-britannicum': { id: 'theatrumchemicum00ashm', title: 'Theatrum Chemicum Britannicum', author: 'Elias Ashmole', year: '1652' },

  // — early-modern —
  'fama-fraternitatis': { id: 'famafraternitati00andr', title: 'Fama Fraternitatis', author: 'anonymous', year: '1615' },
  'chymical-wedding': { id: 'chymischehochzei00rose', title: 'Chymische Hochzeit Christiani Rosencreutz', author: 'Johann Valentin Andreae', year: '1616' },
  'confessio-fraternitatis': { id: 'confessiorcfrate0000vari', title: 'Confessio Fraternitatis', author: 'anonymous', year: '1918' },
  'utriusque-cosmi-historia': { id: 'bub_gb_1t2kO04MCQcC', title: 'Utriusque Cosmi Historia', author: 'Robert Fludd', year: '1617' },
  'atalanta-fugiens': { id: 'atalantafugiensh00maie', title: 'Atalanta Fugiens', author: 'Michael Maier', year: '1618' },
  'aurora-boehme': { id: 'bim_early-english-books-1641-1700_aurora-that-is-the-day_bohme-jacob_1656', title: 'Aurora, that is, the Day-Spring', author: 'Jacob Böhme', year: '1656' },
  'signatura-rerum': { id: 'signaturarerumor00bhme', title: 'Signatura Rerum', author: 'Jacob Böhme', year: '1651' },
  'heaven-and-hell': { id: 'heavenandhellal00swedgoog', title: 'Heaven and Hell', author: 'Emanuel Swedenborg', year: '1885' },

  // — freemasonry —
  'andersons-constitutions': { id: 'the-constitutions-of-the-free-masons-1723', title: 'The Constitutions of the Free-Masons', author: 'James Anderson', year: '1723' },
  'regius-poem': { id: 'The_Regius_Manuscript_-_A_Poem_Of_Moral_Duties_1390', title: 'The Regius Manuscript', author: 'anonymous', year: 'c. 1425' },
  'old-charges': { id: 'oldchargesbriti00hughgoog', title: 'The Old Charges of British Freemasons', author: 'W. J. Hughan', year: '1872' },
  'ahiman-rezon': { id: 'ahimanrezonmason00free', title: 'Ahiman Rezon', author: 'Laurence Dermott', year: '1805' },
  'illustrations-of-masonry': { id: 'illustrationsofm00engluoft', title: 'Illustrations of Masonry', author: 'William Preston', year: '1788' },
  'morals-and-dogma': { id: 'pike-morals-and-dogma_202311', title: 'Morals and Dogma', author: 'Albert Pike', year: '1871' },
  'magic-flute': { id: 'magicfluteoperai00moza', title: 'The Magic Flute', author: 'W. A. Mozart', year: '1874' },

  // — hermetica —
  'corpus-hermeticum': { id: 'thricegreatesthe01hermuoft', title: 'Thrice-Greatest Hermes, vol. I', author: 'trans. G. R. S. Mead', year: '1906' },
  'emerald-tablet': { id: 'b30625865', title: 'Tabula Smaragdina', author: 'Julius Ruska', year: '1926' },
  picatrix: { id: 'picatrix_202012', title: 'Picatrix (Ghāyat al-Ḥakīm)', author: 'pseudo-al-Majrīṭī', year: 'c. 1200' },
  poimandres: { id: 'HermesTrismegistusTheDivinePymander1650', title: 'The Divine Pymander', author: 'trans. John Everard', year: '1650' },
  'asclepius-dialogue': { id: 'HermesTrismegistusAsclepius1657', title: 'The Asclepius', author: 'Hermes Trismegistus', year: '1657' },
  'kore-kosmou': { id: 'thricegreatesth00meadgoog', title: 'Thrice-Greatest Hermes, vol. III', author: 'trans. G. R. S. Mead', year: '1906' },
  'stobaean-hermetica': { id: 'hermetica0003walt', title: 'Hermetica, vol. III', author: 'ed. Walter Scott', year: '1926' },
  'technical-hermetica': { id: 'MeadGRSThriceGreatestHermesVolII1906', title: 'Thrice-Greatest Hermes, vol. II', author: 'trans. G. R. S. Mead', year: '1906' },
  'de-mysteriis': { id: 'b24884170', title: 'Iamblichus on the Mysteries', author: 'trans. Thomas Taylor', year: '1895' },
  'chaldean-oracles': { id: 'chaldeanoracles', title: 'The Chaldean Oracles', author: 'trans. W. Wynn Westcott', year: '1895' },
  'crater-hermetis': { id: 'ita-bnc-mag-00000928-001', title: 'Contenta in hoc volumine — Pimander, Crater Hermetis', author: 'Lefèvre d’Étaples / Lazzarelli', year: '1505' },

  // — kabbalah —
  'sefer-yetzirah': { id: 'sepheryetzirahb00rittgoog', title: 'Sepher Yetzirah', author: 'trans. W. Wynn Westcott', year: '1893' },
  zohar: { id: 'BSG_8BSUP169_2', title: 'Sepher ha-Zohar — Le livre de la splendeur', author: 'trans. Jean de Pauly', year: '1907' },
  'sefer-ha-bahir': { id: 'sefer-habbahir-francais-hebreu', title: 'Sefer ha-Bahir', author: 'anonymous', year: 'c. 1176' },
  'pardes-rimmonim': { id: 'ldpd_17893921_000', title: 'ʻAsis Rimonim — an abridgement of Pardes Rimonim', author: 'Moses Cordovero', year: '1579' },
  'kabbala-denudata': { id: 'kabbaladenudata00rosegoog', title: 'Kabbala Denudata', author: 'Knorr von Rosenroth', year: '1912' },

  // — occult-revival —
  'dogme-et-rituel': { id: 'bub_gb_DnKxvoJi3o0C', title: 'Dogme et rituel de la haute magie', author: 'Éliphas Lévi', year: '1861' },
  'secret-doctrine': { id: 'in.ernet.dli.2015.62045', title: 'The Secret Doctrine, vol. I', author: 'H. P. Blavatsky', year: '1888' },
  'rider-waite-smith-tarot': { id: 'a.-e.-waite-the-pictorial-key-to-the-tarot', title: 'The Pictorial Key to the Tarot', author: 'A. E. Waite', year: '1911' },
  'book-of-the-law': { id: 'CrowleyTheBookOfTheLaw', title: 'The Book of the Law', author: 'Aleister Crowley', year: '1904' },
  'tarot-des-bohemiens': { id: 'tarotofbohemians00papu', title: 'The Tarot of the Bohemians', author: 'Papus', year: '1896' },

  // — renaissance —
  'three-books-of-occult-philosophy': { id: 'cu31924028928236', title: 'Three Books of Occult Philosophy', author: 'H. C. Agrippa', year: '1651' },
  'monas-hieroglyphica': { id: 'b33350838', title: 'Monas Hieroglyphica', author: 'John Dee', year: '1564' },
  'de-vita-libri-tres': { id: 'ita-bnc-in2-00002438-001', title: 'De Vita Libri Tres', author: 'Marsilio Ficino', year: '1489' },
  'oration-on-dignity-of-man': { id: 'oration-on-the-dignity-of-man-Giovanni-Pico-Della-mirandola', title: 'Oration on the Dignity of Man', author: 'Pico della Mirandola', year: '1486' },
  'de-arte-cabalistica': { id: 'b13135004_0001', title: 'De Arte Cabalistica', author: 'Johann Reuchlin', year: '1517' },
  steganographia: { id: 'SteganographiaBSB1608', title: 'Steganographia', author: 'Johannes Trithemius', year: '1608' },
  'agrippa-de-vanitate': { id: 'b33349174', title: 'De Vanitate Scientiarum', author: 'H. C. Agrippa', year: '1531' },
  'de-praestigiis-daemonum': { id: 'depraestigiisdae00weye', title: 'De Praestigiis Daemonum', author: 'Johann Weyer', year: '1563' },
  'magia-naturalis': { id: 'B-001-003-709', title: 'Magia Naturalis', author: 'Giambattista della Porta', year: '1560' },
  'city-of-the-sun': { id: 'tommaso-campanella-the-city-of-the-sun', title: 'The City of the Sun', author: 'Tommaso Campanella', year: '1602' },
  'de-harmonia-mundi': { id: 'bub_gb_shCT1ePhvjQC', title: 'De Harmonia Mundi Totius', author: 'Francesco Giorgi', year: '1525' },
  'horapollo-hieroglyphica': { id: 'horapollinishier01hora', title: 'Hieroglyphica', author: 'Horapollo', year: '1727' },
  'hypnerotomachia-poliphili': { id: 'A336080', title: 'Hypnerotomachia Poliphili', author: 'Francesco Colonna', year: '1499' },
  'de-umbris-idearum': { id: 'bub_gb_ZcEDcxELqfAC', title: 'De Umbris Idearum', author: 'Giordano Bruno', year: '1582' },
  'enochian-language': { id: 'b30324282_0001', title: 'A True and Faithful Relation', author: 'John Dee, ed. Meric Casaubon', year: '1659' },

  // — scholarship —
  'history-of-magic-experimental-science': { id: 'historyofmagicex02thor', title: 'A History of Magic and Experimental Science, vol. II', author: 'Lynn Thorndike', year: '1923' },

  // — crimson-parity additions —
  // real, verified scans added to bring each hall's crimson spines level with
  // its violet ones; declared and cover-checked in redBooks.generated.ts and
  // merged in below so `archiveTextFor` treats them exactly like the rest.
  ...RED_BOOK_ARCHIVE,

  /* ————— the shelf books, second pass —————
   *
   * The colour of a spine is a promise about the DOOR (see the two materials in
   * GrandLibrary), so every scan added here turns a violet spine crimson. These
   * were resolved the same way as the block above — searched by title and
   * author, preferring the oldest institutional scan, then checked one by one
   * against the metadata API for: item exists, mediatype `texts`, not dark, not
   * lending-restricted, and carrying readable files. No identifier is reused.
   *
   * The bar that decided what could NOT be added: a book still in copyright
   * links to Wikipedia, however many uploads of it sit on archive.org. That is
   * most of the Academic Study wing and the modern occult canon — Copenhaver,
   * Fowden, Jonas, Dodds, Betz's papyri, Jung's Mysterium, Regardie, the
   * Crowley revisions — and the uploads that do exist for them are somebody's,
   * not the publisher's. Where a work has no public-domain scan at all (the
   * Cipher Manuscripts, Ramsay's Oration, Norton's Ordinall, the Heptameron,
   * Fludd's Apologia) it stays violet too. */

  // — hermetica —
  'bk-mead-thrice-greatest': { id: 'thricegreatesth00hermgoog', title: 'Thrice-Greatest Hermes', author: 'G. R. S. Mead', year: '1906' },
  'bk-scott-hermetica': { id: 'ScottHermeticaVolTwo', title: 'Hermetica, vol. II', author: 'ed. Walter Scott', year: '1925' },
  'bk-cumont-astrology-religion': { id: 'astrologyreligio00cumouoft', title: 'Astrology and Religion among the Greeks and Romans', author: 'Franz Cumont', year: '1912' },
  'bk-plotinus-enneads': { id: 'theenneads01plot', title: 'The Enneads', author: 'trans. Stephen MacKenna', year: '1917' },
  'bk-porphyry-life-plotinus': { id: 'plotinusethicalt01plotuoft', title: 'Porphyry’s Life of Plotinus, with the Ethical Treatises', author: 'trans. Stephen MacKenna', year: '1917' },
  'bk-augustine-city-of-god': { id: 'sanctiaureliiaug02auguuoft', title: 'De civitate Dei', author: 'Augustine of Hippo, ed. Dombart', year: '1863' },
  'bk-lactantius-institutes': { id: 'BeineckeMS156_47', title: 'Divinae institutiones (Beinecke MS 156)', author: 'Lactantius', year: 'c. 1450' },

  // — alchemy —
  'bk-waite-hermetic-museum': { id: 'b24927363_0001', title: 'The Hermetic Museum, Restored and Enlarged', author: 'trans. A. E. Waite', year: '1893' },
  'bk-musaeum-hermeticum': { id: 'musaeumhermeticu00meri', title: 'Musaeum Hermeticum Reformatum et Amplificatum', author: 'Matthäus Merian', year: '1678' },
  'bk-paracelsus-opus-paramirum': { id: 'b24867330', title: 'Volumen paramirum und Opus paramirum', author: 'Paracelsus, ed. Franz Strunz', year: '1904' },
  'bk-paracelsus-archidoxa': { id: 'hin-wel-all-00002611-001', title: 'Archidoxa', author: 'Paracelsus', year: '1570' },
  'bk-van-helmont-ortus': { id: 'BIUSante_pharma_011695x01', title: 'Ortus Medicinae', author: 'Jan Baptist van Helmont', year: '1648' },
  'bk-philalethes-open-entrance': { id: 'bub_gb_YC0RCBstjVUC', title: 'Introitus Apertus ad Occlusum Regis Palatium', author: 'Eirenaeus Philalethes', year: '1667' },
  'bk-bacon-mirror-alchimy': { id: 'mirrorofalchimy00baco', title: 'The Mirror of Alchimy', author: 'pseudo-Roger Bacon', year: '1597' },
  'bk-artis-auriferae': { id: 'hin-wel-all-00001651-001', title: 'Artis Auriferae quam Chemiam Vocant, vol. I', author: 'various', year: '1593' },
  'bk-theatrum-chemicum': { id: 'BIUSante_pharma_res011287x03', title: 'Theatrum Chemicum', author: 'ed. Lazarus Zetzner', year: '1602' },

  // — kabbalah —
  'bk-mathers-kabbalah-unveiled': { id: 'b24884443', title: 'The Kabbalah Unveiled', author: 'S. L. MacGregor Mathers', year: '1887' },

  // — renaissance —
  'bk-bruno-cena-ceneri': { id: 'bub_gb_HKOi7s_LsK4C', title: 'La cena de le ceneri', author: 'Giordano Bruno', year: '1864' },
  'bk-trithemius-polygraphia': { id: 'b33552137', title: 'Polygraphiae libri sex', author: 'Johannes Trithemius', year: '1518' },
  'bk-dee-true-relation': { id: 'truefaithfulrela00deej', title: 'A True & Faithful Relation', author: 'John Dee, ed. Meric Casaubon', year: '1659' },
  'bk-dee-mathematicall-preface': { id: 'themathematicall22062gut', title: 'The Mathematicall Praeface to Euclid', author: 'John Dee', year: '1570' },
  'bk-reuchlin-de-verbo': { id: 'bub_gb_lS_ozB8_LlQC', title: 'De Verbo Mirifico', author: 'Johann Reuchlin', year: '1514' },
  'bk-scot-discoverie': { id: 'discoverieofwitc00scot', title: 'The Discoverie of Witchcraft', author: 'Reginald Scot', year: '1886' },
  'bk-ficino-platonic-theology': { id: 'ita-bnc-in2-00001718-002', title: 'Theologia Platonica de immortalitate animorum', author: 'Marsilio Ficino', year: '1482' },
  'bk-ficino-de-amore': { id: 'McGillLibrary-rbsc_marsilio-ficino_PA4279S8F51544-16012', title: 'Sopra lo amore, ovvero Convito di Platone', author: 'Marsilio Ficino', year: '1544' },
  'bk-giorgi-harmonia-mundi': { id: 'b33552654', title: 'De Harmonia Mundi Totius', author: 'Francesco Giorgi', year: '1546' },
  'bk-camillo-idea-del-theatro': { id: 'bub_gb_NFck5cl1tLQC', title: 'L’Idea del Theatro', author: 'Giulio Camillo', year: '1550' },
  'bk-valeriano-hieroglyphica': { id: 'desacrisaegyptio00vale', title: 'Hieroglyphica, sive de sacris Aegyptiorum literis', author: 'Pierio Valeriano', year: '1556' },
  'bk-horapollo-hieroglyphica': { id: 'hieroglyphicahor00hora', title: 'Hieroglyphica Horapollinis', author: 'Horapollo, ed. Jean Mercier', year: '1595' },
  'bk-colonna-hypnerotomachia': { id: 'McGillLibrary-rbsc_hypnerotomachia-poliphili_foliolncun1499Colonna-20536', title: 'Hypnerotomachia Poliphili', author: 'Francesco Colonna', year: '1499' },
  'bk-agrippa-fourth-book': { id: 'cu31924006718757', title: 'Fourth Book of Occult Philosophy', author: 'pseudo-Agrippa', year: '1655' },
  'bk-cardano-de-subtilitate': { id: 'b33350218', title: 'De Subtilitate Libri XXI', author: 'Girolamo Cardano', year: '1560' },
  'bk-pico-heptaplus': { id: 'bub_gb_TNfBIcYj76MC', title: 'Heptaplus (in the Omnia Opera)', author: 'Pico della Mirandola', year: '1506' },
  'bk-alciato-emblematum': { id: 'emblemataandreae00alci', title: 'Emblemata', author: 'Andrea Alciato', year: '1548' },

  // — early-modern —
  'bk-andreae-reipublicae': { id: 'reipublicaechris00andr', title: 'Reipublicae Christianopolitanae Descriptio', author: 'Johann Valentin Andreae', year: '1619' },
  'bk-bacon-new-atlantis': { id: 'idealcommonwealt00unknuoft', title: 'New Atlantis (in Ideal Commonwealths)', author: 'Francis Bacon', year: '1901' },
  'bk-maier-silentium-post-clamores': { id: 'hin-wel-all-00002321-001', title: 'Silentium post Clamores', author: 'Michael Maier', year: '1617' },
  'bk-vaughan-fame-confession': { id: 'b30340159', title: 'The Fame and Confession of the Fraternity of R:C:', author: 'trans. Thomas Vaughan', year: '1658' },
  'bk-vaughan-anthroposophia': { id: 'b24868279', title: 'The Magical Writings of Thomas Vaughan', author: 'ed. A. E. Waite', year: '1888' },
  'bk-boehme-mysterium-magnum': { id: 'bim_early-english-books-1641-1700_mysterium-magnum_bohme-jacob_1654', title: 'Mysterium Magnum', author: 'Jacob Böhme', year: '1654' },
  'bk-law-works-boehme': { id: 'worksofjacobbehm04beohuoft', title: 'The Works of Jacob Behmen, the Teutonic Theosopher', author: 'ed. William Law', year: '1764' },
  'bk-comenius-labyrinth': { id: 'thelabyrinthofth00comeuoft', title: 'The Labyrinth of the World and the Paradise of the Heart', author: 'Jan Amos Comenius', year: '1901' },
  'bk-glanvill-sadducismus': { id: 'saducismustriump00glan_0', title: 'Saducismus Triumphatus', author: 'Joseph Glanvill', year: '1705' },
  'bk-swedenborg-arcana': { id: 'arcanacoelestia01swedgoog', title: 'Arcana Coelestia', author: 'Emanuel Swedenborg', year: '1857' },
  'bk-mesmer-memoire': { id: 'mmoiresurlad00mesm', title: 'Mémoire sur la découverte du magnétisme animal', author: 'Franz Anton Mesmer', year: '1779' },
  'bk-heindel-cosmo-conception': { id: 'rosicruciancosm00hein', title: 'The Rosicrucian Cosmo-Conception', author: 'Max Heindel', year: '1911' },
  'bk-waite-real-history-rosicrucians': { id: 'realhistoryofros00waituoft', title: 'The Real History of the Rosicrucians', author: 'A. E. Waite', year: '1887' },
  'bk-spence-encyclopaedia-occultism': { id: 'AnEncyclopaediaOfOccultism', title: 'An Encyclopaedia of Occultism', author: 'Lewis Spence', year: '1920' },

  // — freemasonry —
  'bk-mackey-encyclopedia': { id: 'encyclopaediaoff00mack', title: 'An Encyclopaedia of Freemasonry', author: 'Albert G. Mackey', year: '1887' },
  'bk-gould-history-freemasonry': { id: 'historyoffreemas02goul', title: 'The History of Freemasonry, vol. II', author: 'Robert Freke Gould', year: '1900' },
  'bk-prichard-masonry-dissected': { id: 'bim_eighteenth-century_masonry-dissected-being_prichard-samuel_1730', title: 'Masonry Dissected', author: 'Samuel Prichard', year: '1730' },
  'bk-ars-quatuor-coronatorum': { id: 'arsquatuorcorona01free', title: 'Ars Quatuor Coronatorum, vol. I', author: 'Quatuor Coronati Lodge no. 2076', year: '1886' },
  'bk-morgan-illustrations': { id: 'illustrationsofm00morg', title: 'Illustrations of Masonry', author: 'William Morgan', year: '1826' },
  'bk-robison-proofs-conspiracy': { id: 'proofsofconspira00robi_201708', title: 'Proofs of a Conspiracy', author: 'John Robison', year: '1797' },
  'bk-barruel-memoirs': { id: 'AbrggDesMMoiresPourServirILHistoireDuJacobinisme', title: 'Mémoires pour servir à l’histoire du Jacobinisme (abrégé)', author: 'Augustin Barruel', year: '1797' },
  'bk-cooke-manuscript': { id: 'CookeManuscriptWithTranslation', title: 'The Cooke Manuscript, with translation', author: 'anonymous', year: 'c. 1450' },
  'bk-hall-secret-teachings': { id: 'the-secret-teachings-of-all-ages-by-manly-p.-hall-1928', title: 'The Secret Teachings of All Ages', author: 'Manly P. Hall', year: '1928' },
  'bk-hall-lost-keys': { id: 'TheLostKeysOfFreemasonry', title: 'The Lost Keys of Freemasonry', author: 'Manly P. Hall', year: '1923' },
  'bk-wilmshurst-meaning-masonry': { id: 'in.ernet.dli.2015.216779', title: 'The Meaning of Masonry', author: 'W. L. Wilmshurst', year: '1922' },

  // — occult-revival —
  'bk-blavatsky-isis-unveiled': { id: 'cu31924092304587', title: 'Isis Unveiled', author: 'H. P. Blavatsky', year: '1877' },
  'bk-levi-histoire-magie': { id: 'histoiredelamag00lvgoog', title: 'Histoire de la magie', author: 'Éliphas Lévi', year: '1860' },
  'bk-levi-clef-grands-mysteres': { id: 'leclefdesgrandsm00lvil', title: 'La clef des grands mystères', author: 'Éliphas Lévi', year: '1861' },
  'bk-mathers-goetia': { id: 'lesserkeyofsolom00dela', title: 'The Lesser Key of Solomon, Goetia', author: 'ed. L. W. de Laurence', year: '1916' },
  'bk-mathers-abramelin': { id: 'sacred-magic-abramelin', title: 'The Book of the Sacred Magic of Abramelin the Mage', author: 'trans. S. L. MacGregor Mathers', year: '1900' },
  'bk-mathers-key-of-solomon': { id: 'b24884431', title: 'The Key of Solomon the King', author: 'trans. S. L. MacGregor Mathers', year: '1889' },
  'bk-de-guaita-serpent-genese': { id: 'BSG_8RSUP1847', title: 'Le Serpent de la Genèse: Le Temple de Satan', author: 'Stanislas de Guaita', year: '1891' },
  'bk-hartmann-magic-white-black': { id: 'magicwhiteandbl00hartgoog', title: 'Magic, White and Black', author: 'Franz Hartmann', year: '1904' },
  'bk-steiner-occult-science': { id: 'rudolf-steiner-ga-013', title: 'Die Geheimwissenschaft im Umriss', author: 'Rudolf Steiner', year: '1910' },
  'bk-besant-leadbeater-thought-forms': { id: 'in.ernet.dli.2015.213512', title: 'Thought-Forms', author: 'Annie Besant and C. W. Leadbeater', year: '1905' },
  'bk-randolph-eulis': { id: '06115989.4836.emory.edu', title: 'Eulis! The History of Love', author: 'Paschal Beverly Randolph', year: '1874' },
  'bk-barrett-magus': { id: 'b22006795', title: 'The Magus, or Celestial Intelligencer', author: 'Francis Barrett', year: '1801' },
  'bk-kardec-spirits-book': { id: 'philosophiespiri00kard_0', title: 'Le Livre des Esprits', author: 'Allan Kardec', year: '1922' },

  /* ————— titles added FOR their scans —————
   *
   * Everything above answers the question "does this book on the shelf have a
   * scan?". These thirty went the other way: the halls were short of readable
   * originals, so they were chosen as real cult classics of each tradition that
   * are BOTH canonical and out of copyright, and shelved (in shelfBooks.ts)
   * once the scan was confirmed. Same checks as the rest of the file. */

  // — hermetica —
  'bk-mead-fragments-faith': { id: 'fragmentsoffaith00meaduoft', title: 'Fragments of a Faith Forgotten', author: 'G. R. S. Mead', year: '1906' },
  'bk-mead-pistis-sophia': { id: 'pistis-sophia_1896', title: 'Pistis Sophia', author: 'trans. G. R. S. Mead', year: '1896' },
  'bk-king-gnostics-remains': { id: 'gnosticsandtheir00kinguoft', title: 'The Gnostics and Their Remains', author: 'C. W. King', year: '1887' },
  'bk-taylor-life-pythagoras': { id: 'b29318610', title: 'Life of Pythagoras', author: 'Iamblichus, trans. Thomas Taylor', year: '1818' },

  // — alchemy —
  'bk-atwood-suggestive-inquiry': { id: 'suggestiveinquir00atwo_0', title: 'A Suggestive Inquiry into the Hermetic Mystery', author: 'Mary Anne Atwood', year: '1920' },
  'bk-hitchcock-remarks-alchemy': { id: 'remarks-upon-alchemy-and-the-alchemists-indicating-a-method-of-discovering-the-t', title: 'Remarks upon Alchemy and the Alchemists', author: 'Ethan Allen Hitchcock', year: '1857' },
  'bk-kelly-alchemical-writings': { id: 'TheAlchemicalWritingsOfEdwardKelly1893', title: 'The Alchemical Writings of Edward Kelly', author: 'ed. A. E. Waite', year: '1893' },
  'bk-waite-paracelsus-writings': { id: 'hermeticalchemic00para', title: 'The Hermetic and Alchemical Writings of Paracelsus', author: 'ed. A. E. Waite', year: '1894' },
  'bk-redgrove-alchemy-ancient-modern': { id: 'alchemyancientan001408mbp', title: 'Alchemy: Ancient and Modern', author: 'H. Stanley Redgrove', year: '1922' },

  // — kabbalah —
  'bk-ginsburg-kabbalah': { id: 'cu31924075115380', title: 'The Kabbalah: Its Doctrines, Development, and Literature', author: 'Christian D. Ginsburg', year: '1920' },
  'bk-franck-la-kabbale': { id: 'lakabbale00fran', title: 'La Kabbale', author: 'Adolphe Franck', year: '1843' },
  'bk-myer-qabbalah': { id: 'qabbalahphilosop00myer', title: 'Qabbalah', author: 'Isaac Myer', year: '1888' },
  'bk-waite-doctrine-kabalah': { id: 'thedoctrineandli00wattuoft', title: 'The Doctrine and Literature of the Kabalah', author: 'A. E. Waite', year: '1902' },

  // — renaissance —
  'bk-kircher-oedipus-aegyptiacus': { id: 'A027084', title: 'Oedipus Aegyptiacus', author: 'Athanasius Kircher', year: '1652' },

  // — early-modern —
  'bk-eckartshausen-cloud': { id: 'cloud-upon-the-sanctuary', title: 'The Cloud upon the Sanctuary', author: 'Karl von Eckartshausen', year: '1795' },
  'bk-saint-martin-erreurs': { id: 'bub_gb_FrNiPKzEq6cC', title: 'Des erreurs et de la vérité', author: 'Louis-Claude de Saint-Martin', year: '1782' },

  // — freemasonry —
  'bk-newton-builders': { id: 'buildersstorystu00newt_0', title: 'The Builders', author: 'Joseph Fort Newton', year: '1915' },
  'bk-yarker-arcane-schools': { id: 'b24886002', title: 'The Arcane Schools', author: 'John Yarker', year: '1909' },
  'bk-waite-new-encyclopaedia-masonry': { id: 'dli.ministry.04761', title: 'A New Encyclopaedia of Freemasonry', author: 'A. E. Waite', year: '1921' },

  // — occult-revival —
  'bk-kybalion': { id: 'kybalion_202202', title: 'The Kybalion', author: 'Three Initiates', year: '1908' },
  'bk-blavatsky-key-theosophy': { id: 'keytotheosophyb00blavgoog', title: 'The Key to Theosophy', author: 'H. P. Blavatsky', year: '1889' },
  'bk-kingsford-perfect-way': { id: 'perfectwayorfind00king_0', title: 'The Perfect Way', author: 'Anna Kingsford and Edward Maitland', year: '1882' },
  'bk-crowley-book-of-lies': { id: 'bookoflies0000unse_o9x3', title: 'The Book of Lies', author: 'Aleister Crowley', year: '1913' },

  // — scholarship —
  'bk-tylor-primitive-culture': { id: 'primitiveculture00tylo', title: 'Primitive Culture', author: 'E. B. Tylor', year: '1871' },
  'bk-frazer-golden-bough': { id: 'goldenboughstudy03fraz', title: 'The Golden Bough', author: 'James George Frazer', year: '1911' },
  'bk-murray-witch-cult': { id: 'witchcultinweste00murr', title: 'The Witch-Cult in Western Europe', author: 'Margaret Murray', year: '1921' },
  'bk-summers-history-witchcraft': { id: 'dli.ministry.25916', title: 'The History of Witchcraft and Demonology', author: 'Montague Summers', year: '1926' },
  'bk-lecky-rationalism': { id: 'historyriseandi08leckgoog', title: 'History of the Rise and Influence of the Spirit of Rationalism', author: 'W. E. H. Lecky', year: '1866' },
  'bk-ennemoser-history-magic': { id: 'historymagictrb00ennegoog', title: 'The History of Magic', author: 'Joseph Ennemoser', year: '1854' },
  'bk-waite-occult-sciences': { id: 'occultsciencesco00wait', title: 'The Occult Sciences', author: 'A. E. Waite', year: '1891' },
};

/**
 * The scan to open for an entity — and nothing at all unless it IS a book.
 *
 * The type check is the whole point: 'Original on archive.org' is a promise
 * that the thing in your hands has an original to read, which is true of the
 * Corpus Hermeticum and false of Hermes Trismegistus.
 */
export function archiveTextFor(entity: Pick<Entity, 'id' | 'type'> | undefined): ArchiveText | undefined {
  if (!entity || entity.type !== 'work') return undefined;
  return ARCHIVE_BY_ENTITY[entity.id];
}
