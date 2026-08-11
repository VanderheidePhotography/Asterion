import type { Entity } from '../../domain/types';

export const occultRevival: Entity[] = [
  {
    id: 'eliphas-levi',
    type: 'person',
    name: 'Éliphas Lévi',
    epithet: 'The ex-seminarian who invented the occult “tradition”',
    dates: '1810–1875',
    year: 1855,
    era: 'nineteenth',
    cluster: 'occult-revival',
    summary:
      'Alphonse-Louis Constant, the Parisian writer whose Dogme et rituel recast scattered materials as one coherent magical tradition — the fountainhead of the nineteenth-century occult revival.',
    claims: [
      {
        text: 'Alphonse-Louis Constant, a sometime seminarian writing as Éliphas Lévi, published Dogme et rituel de la haute magie in 1854–56, recasting magic as a single coherent “tradition”.',
        evidence: 'documented',
        sources: ['levi-1856', 'godwin-1994'],
      },
      {
        text: 'He yoked the twenty-two tarot trumps to the twenty-two Hebrew letters — a synthesis with no earlier documented basis that became foundational for French and British occultism.',
        evidence: 'documented',
        sources: ['levi-1856', 'dummett-1996'],
      },
    ],
    relations: [
      { kind: 'wrote', target: 'dogme-et-rituel' },
      { kind: 'influenced', target: 'golden-dawn' },
      { kind: 'influenced', target: 'helena-blavatsky' },
      { kind: 'associated-with', target: 'tarot' },
    ],
    tags: ['paris', 'magic', 'occultism', 'constant'],
  },
  {
    id: 'dogme-et-rituel',
    type: 'work',
    name: 'Dogme et rituel de la haute magie',
    epithet: 'Doctrine and ritual for a new age of magic',
    dates: '1854–56',
    year: 1855,
    era: 'nineteenth',
    cluster: 'occult-revival',
    summary:
      'Lévi’s two-volume manifesto of high magic, whose Baphomet frontispiece became one of the most reproduced images in occultism.',
    claims: [
      {
        text: 'Two volumes — Doctrine and Ritual — published in Paris, 1854–56; its “Baphomet of Mendes” frontispiece became one of occultism’s most reproduced images.',
        evidence: 'documented',
        sources: ['levi-1856'],
      },
      {
        text: 'Godwin situates Lévi at the hinge where Enlightenment-era mythography turned into a self-conscious occultist movement.',
        evidence: 'scholarship',
        sources: ['godwin-1994'],
      },
    ],
    relations: [{ kind: 'associated-with', target: 'tarot' }],
    tags: ['baphomet', 'paris', 'high magic'],
  },
  {
    id: 'tarot',
    type: 'concept',
    name: 'Tarot',
    epithet: 'A card game that became a book of symbols',
    dates: 'game from the 1440s; esoteric turn 1781',
    year: 1781,
    era: 'enlightenment',
    cluster: 'occult-revival',
    summary:
      'Born as a fifteenth-century Italian card game, read since 1781 as a repository of ancient wisdom — the clearest case study in how esoteric meaning accretes onto older artefacts.',
    claims: [
      {
        text: 'Tarot began as a card game in northern Italy in the 1440s (carte da trionfi); luxurious hand-painted decks survive from the Visconti-Sforza courts.',
        evidence: 'documented',
        sources: ['dummett-1996'],
      },
      {
        text: 'No evidence connects the cards to esoteric use before the eighteenth century.',
        evidence: 'scholarship',
        sources: ['dummett-1996'],
      },
      {
        text: 'In 1781 Antoine Court de Gébelin declared the trumps a surviving Egyptian “Book of Thoth” — an unsupported speculation with enormous consequences.',
        evidence: 'speculation',
        sources: ['gebelin-1781', 'dummett-1996'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'hermes-trismegistus', note: 'via Gébelin’s speculative “Book of Thoth”' },
      { kind: 'associated-with', target: 'kabbalah', note: 'the letter–trump correspondence begins with Lévi' },
    ],
    tags: ['cards', 'trumps', 'egypt', 'divination'],
  },
  {
    id: 'helena-blavatsky',
    type: 'person',
    name: 'Helena Petrovna Blavatsky',
    epithet: 'The sphinx of the nineteenth century',
    dates: '1831–1891',
    year: 1875,
    era: 'nineteenth',
    cluster: 'occult-revival',
    summary:
      'The Russian-born co-founder of the Theosophical Society, whose massive syntheses of religion, science, and occult lore made her the century’s most influential — and most contested — esoteric author.',
    claims: [
      {
        text: 'Blavatsky co-founded the Theosophical Society in New York in 1875 and wrote Isis Unveiled (1877) and The Secret Doctrine (1888).',
        evidence: 'documented',
        sources: ['blavatsky-1877', 'blavatsky-1888', 'godwin-1994'],
      },
      {
        text: 'The Society for Psychical Research’s 1885 Hodgson Report accused her of fraudulent phenomena; a 1986 re-examination in the SPR’s journal by Vernon Harrison criticized the report’s methods. Both remain part of the record.',
        evidence: 'documented',
        sources: ['hodgson-1885', 'harrison-1986'],
      },
      {
        text: 'She claimed instruction from hidden masters, the “Mahatmas” — a claim central to Theosophical tradition and historically unverified.',
        evidence: 'tradition',
        sources: ['godwin-1994'],
      },
    ],
    relations: [
      { kind: 'founded', target: 'theosophical-society' },
      { kind: 'wrote', target: 'secret-doctrine' },
    ],
    tags: ['theosophy', 'mahatmas', 'russia', 'new york'],
  },
  {
    id: 'theosophical-society',
    type: 'organization',
    name: 'The Theosophical Society',
    epithet: 'A universal brotherhood in search of hidden law',
    dates: 'founded 17 November 1875',
    year: 1875,
    era: 'nineteenth',
    cluster: 'occult-revival',
    summary:
      'Founded in New York in 1875 and headquartered in Adyar from 1882, the Society carried esoteric ideas — and Asian religious thought — to a worldwide audience.',
    claims: [
      {
        text: 'Founded in New York City on 17 November 1875 by Blavatsky, Henry Steel Olcott, William Quan Judge, and others; its headquarters moved to Adyar, India, in 1882.',
        evidence: 'documented',
        sources: ['godwin-1994'],
      },
      {
        text: 'Its declared objects included forming a universal brotherhood and investigating unexplained laws of nature and the powers latent in humanity.',
        evidence: 'documented',
        sources: ['godwin-1994'],
      },
    ],
    relations: [{ kind: 'associated-with', target: 'secret-doctrine' }],
    tags: ['adyar', 'brotherhood', '1875', 'olcott'],
  },
  {
    id: 'secret-doctrine',
    type: 'work',
    name: 'The Secret Doctrine',
    epithet: 'Cosmogenesis and Anthropogenesis',
    dates: '1888',
    year: 1888,
    era: 'nineteenth',
    cluster: 'occult-revival',
    summary:
      'Blavatsky’s two-volume magnum opus, presented as commentary on stanzas from a “Book of Dzyan” that no scholar has ever located.',
    claims: [
      {
        text: 'Published in two volumes in 1888 — Cosmogenesis and Anthropogenesis — presented as commentary on stanzas from a “Book of Dzyan”.',
        evidence: 'documented',
        sources: ['blavatsky-1888'],
      },
      {
        text: 'No manuscript of the Book of Dzyan has ever been produced; scholarship treats it as Blavatsky’s literary construction.',
        evidence: 'scholarship',
        sources: ['godwin-1994'],
      },
    ],
    relations: [{ kind: 'associated-with', target: 'theosophical-society' }],
    tags: ['dzyan', 'stanzas', 'cosmogenesis'],
  },
  {
    id: 'golden-dawn',
    type: 'organization',
    name: 'The Hermetic Order of the Golden Dawn',
    epithet: 'The order that systematized the occult revival',
    dates: '1888–c. 1903 (original order)',
    year: 1888,
    era: 'nineteenth',
    cluster: 'occult-revival',
    summary:
      'The London magical order founded in 1888, whose graded curriculum fused Kabbalah, tarot, alchemy, astrology, and Dee’s angelic material — and whose influence outlived its brief, schism-ridden life.',
    claims: [
      {
        text: 'The Isis-Urania Temple opened in London in 1888, founded by three Freemasons — Westcott, Mathers, and Woodman — on the basis of the Cipher Manuscripts.',
        evidence: 'documented',
        sources: ['howe-1972'],
      },
      {
        text: 'Its graded curriculum fused Kabbalah, tarot, alchemy, astrology, and “Enochian” material adapted from John Dee’s angelic diaries into a single syllabus.',
        evidence: 'documented',
        sources: ['regardie-1940', 'howe-1972'],
      },
      {
        text: 'Schisms from 1900 to 1903 broke the original order into successor bodies, including the Stella Matutina.',
        evidence: 'documented',
        sources: ['howe-1972'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'freemasonry', note: 'all three founders were Master Masons' },
      { kind: 'derived-from', target: 'cipher-manuscripts' },
    ],
    tags: ['isis-urania', 'magical order', 'grades', 'london'],
  },
  {
    id: 'cipher-manuscripts',
    type: 'work',
    name: 'The Cipher Manuscripts',
    epithet: 'Sixty folios of enciphered ritual, origin unknown',
    dates: 'surfaced 1880s',
    year: 1887,
    era: 'nineteenth',
    cluster: 'occult-revival',
    summary:
      'The enciphered folios sketching five skeleton rituals from which the Golden Dawn was built — their true origin still debated, their accompanying credentials judged a fabrication.',
    claims: [
      {
        text: 'Some sixty folios in a cipher drawn from Trithemius sketch skeleton rituals of five grades; Westcott said he received them through the papers of a Masonic scholar in 1887.',
        evidence: 'primary',
        sources: ['howe-1972'],
      },
      {
        text: 'Howe’s documentary study concluded that the “Anna Sprengel” correspondence authorizing the order was fabricated; the manuscripts’ true origin remains debated.',
        evidence: 'scholarship',
        sources: ['howe-1972'],
      },
    ],
    relations: [{ kind: 'associated-with', target: 'william-wynn-westcott' }],
    tags: ['cipher', 'trithemius', 'sprengel', 'folios'],
  },
  {
    id: 'william-wynn-westcott',
    type: 'person',
    name: 'William Wynn Westcott',
    epithet: 'Coroner by day, hierophant by night',
    dates: '1848–1925',
    year: 1888,
    era: 'nineteenth',
    cluster: 'occult-revival',
    summary:
      'The London coroner, Freemason, and Rosicrucian society chief who produced the warrant — and, scholarship concludes, the fabricated credentials — on which the Golden Dawn was founded.',
    claims: [
      {
        text: 'A London coroner, Master Mason, and head of the Societas Rosicruciana in Anglia, Westcott produced the warrant and correspondence that founded the Golden Dawn.',
        evidence: 'documented',
        sources: ['howe-1972'],
      },
      {
        text: 'Howe judged the Sprengel letters to be Westcott’s own fabrication — a conclusion widely accepted, though contested in some order histories.',
        evidence: 'scholarship',
        sources: ['howe-1972'],
      },
    ],
    relations: [
      { kind: 'founded', target: 'golden-dawn' },
      { kind: 'member-of', target: 'freemasonry' },
      { kind: 'associated-with', target: 'cipher-manuscripts' },
    ],
    tags: ['coroner', 'sria', 'warrant'],
  },
  {
    id: 'macgregor-mathers',
    type: 'person',
    name: 'S. L. MacGregor Mathers',
    epithet: 'The ritualist who built the temple’s interior',
    dates: '1854–1918',
    year: 1890,
    era: 'nineteenth',
    cluster: 'occult-revival',
    summary:
      'The self-taught scholar who wrote the Golden Dawn’s developed rituals and Second Order teachings, and translated kabbalistic and magical texts for a new occult readership.',
    claims: [
      {
        text: 'Mathers wrote the order’s developed rituals and its Second Order teachings, and translated grimoires and kabbalistic texts.',
        evidence: 'documented',
        sources: ['howe-1972', 'regardie-1940'],
      },
      {
        text: 'His Kabbalah Unveiled (1887) translated portions of Knorr von Rosenroth’s Latin Kabbala Denudata.',
        evidence: 'documented',
        sources: ['howe-1972'],
      },
    ],
    relations: [
      { kind: 'founded', target: 'golden-dawn' },
      { kind: 'studied', target: 'kabbalah' },
      { kind: 'member-of', target: 'freemasonry' },
    ],
    tags: ['rituals', 'translator', 'second order'],
  },
  {
    id: 'arthur-edward-waite',
    type: 'person',
    name: 'A. E. Waite',
    epithet: 'The mystic who footnoted the occult',
    dates: '1857–1942',
    year: 1909,
    era: 'twentieth',
    cluster: 'occult-revival',
    summary:
      'Scholar-mystic and prolific historian of occult orders, who steered his branch of the Golden Dawn toward mysticism and commissioned the century’s most influential tarot deck.',
    claims: [
      {
        text: 'Waite joined the Golden Dawn in 1891 and later led a mystically-oriented offshoot; his histories of Rosicrucianism and Freemasonry pioneered critical bibliography of the subject.',
        evidence: 'documented',
        sources: ['gilbert-1987'],
      },
      {
        text: 'He commissioned Pamela Colman Smith in 1909 to design the tarot deck published by William Rider & Son.',
        evidence: 'documented',
        sources: ['gilbert-1987', 'dummett-1996'],
      },
    ],
    relations: [
      { kind: 'member-of', target: 'golden-dawn' },
      { kind: 'collaborated-with', target: 'pamela-colman-smith' },
      { kind: 'associated-with', target: 'rider-waite-smith-tarot', note: 'conceived the deck; Smith drew it' },
    ],
    tags: ['mysticism', 'historian', 'tarot'],
  },
  {
    id: 'pamela-colman-smith',
    type: 'person',
    name: 'Pamela Colman Smith',
    epithet: 'The artist whose seventy-eight images conquered the century',
    dates: '1878–1951',
    year: 1909,
    era: 'twentieth',
    cluster: 'occult-revival',
    summary:
      'Artist, illustrator, and stage designer who drew all seventy-eight cards of the 1909 deck — including the first fully illustrated pips in a widely printed tarot — for a flat fee and long without credit.',
    claims: [
      {
        text: 'Smith drew all seventy-eight images of the 1909 deck, including fully illustrated pip cards, for a modest flat fee, and long went uncredited.',
        evidence: 'documented',
        sources: ['dummett-1996'],
      },
      {
        text: 'She had joined the Golden Dawn’s successor milieu in 1901 through the Yeats circle.',
        evidence: 'documented',
        sources: ['dummett-1996'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'rider-waite-smith-tarot', note: 'illustrated all 78 cards' },
      { kind: 'member-of', target: 'golden-dawn' },
    ],
    tags: ['artist', 'illustration', 'pixie'],
  },
  {
    id: 'rider-waite-smith-tarot',
    type: 'work',
    name: 'The Rider–Waite–Smith Tarot',
    epithet: 'The deck that became the default',
    dates: '1909',
    year: 1909,
    era: 'twentieth',
    cluster: 'occult-revival',
    summary:
      'The 1909 deck conceived by Waite and drawn by Smith, whose imagery became the twentieth century’s standard tarot iconography.',
    claims: [
      {
        text: 'Published by William Rider & Son, London, in 1909; Waite’s Pictorial Key to the Tarot (1911) is its companion text.',
        evidence: 'documented',
        sources: ['waite-1911', 'dummett-1996'],
      },
      {
        text: 'Its imagery became the default tarot iconography of the twentieth century.',
        evidence: 'scholarship',
        sources: ['dummett-1996'],
      },
    ],
    relations: [
      { kind: 'derived-from', target: 'tarot' },
      { kind: 'associated-with', target: 'golden-dawn', note: 'its symbolism draws on the order’s teachings' },
    ],
    tags: ['deck', 'rider', '1909', 'iconography'],
  },
  {
    id: 'israel-regardie',
    type: 'person',
    name: 'Israel Regardie',
    epithet: 'The man who opened the vault',
    dates: '1907–1985',
    year: 1937,
    era: 'twentieth',
    cluster: 'occult-revival',
    summary:
      'Once secretary to Aleister Crowley, later a chiropractor and writer, Regardie published the Golden Dawn’s rituals in four volumes — arguing the material should be preserved openly rather than lost.',
    claims: [
      {
        text: 'Regardie published the Golden Dawn’s rituals and knowledge lectures in four volumes (1937–40), arguing that the material should be openly preserved.',
        evidence: 'documented',
        sources: ['regardie-1940', 'howe-1972'],
      },
    ],
    relations: [
      { kind: 'member-of', target: 'golden-dawn', note: 'initiated in the Stella Matutina, a successor order' },
    ],
    tags: ['publication', 'stella matutina', 'preservation'],
  },
  {
    id: 'aleister-crowley',
    type: 'person',
    name: 'Aleister Crowley',
    epithet: 'The Beast who proclaimed a new aeon',
    dates: '1875–1947',
    year: 1904,
    era: 'twentieth',
    cluster: 'occult-revival',
    summary:
      'The most notorious magician of the century: Golden Dawn initiate, mountaineer, poet, and prophet of Thelema, who claimed a discarnate intelligence dictated to him the law of a new age.',
    claims: [
      {
        text: 'Crowley joined the Golden Dawn in 1898 and sided with Mathers in the schism of 1900, hastening the order’s collapse.',
        evidence: 'documented',
        sources: ['howe-1972', 'kaczynski-2010'],
      },
      {
        text: 'He reported that in Cairo in 1904 a being named Aiwass dictated The Book of the Law over three days.',
        evidence: 'primary',
        sources: ['crowley-1904', 'kaczynski-2010'],
      },
    ],
    relations: [
      { kind: 'member-of', target: 'golden-dawn' },
      { kind: 'founded', target: 'thelema' },
      { kind: 'wrote', target: 'book-of-the-law' },
      { kind: 'member-of', target: 'ordo-templi-orientis' },
    ],
    tags: ['thelema', 'the beast', 'cairo'],
  },
  {
    id: 'thelema',
    type: 'tradition',
    name: 'Thelema',
    epithet: 'Do what thou wilt shall be the whole of the law',
    dates: 'from 1904',
    year: 1904,
    era: 'twentieth',
    cluster: 'occult-revival',
    summary:
      'The religious-magical philosophy Crowley proclaimed after Cairo: each person a star with a unique True Will, whose discovery and pursuit is the whole of the law.',
    claims: [
      {
        text: 'Thelema takes its watchwords — “Do what thou wilt” and “Love is the law” — from The Book of the Law, framing life as the discovery of one’s True Will.',
        evidence: 'primary',
        sources: ['crowley-1904'],
      },
      {
        text: 'Crowley elaborated Thelemic practice across a large corpus and through the O.T.O. and his A∴A∴.',
        evidence: 'scholarship',
        sources: ['kaczynski-2010'],
      },
    ],
    relations: [
      { kind: 'derived-from', target: 'aleister-crowley' },
      { kind: 'associated-with', target: 'ordo-templi-orientis' },
    ],
    tags: ['true will', 'new aeon', 'religion'],
  },
  {
    id: 'book-of-the-law',
    type: 'work',
    name: 'The Book of the Law',
    epithet: 'Three chapters dictated by a voice in Cairo',
    dates: '1904',
    year: 1904,
    era: 'twentieth',
    cluster: 'occult-revival',
    summary:
      'Liber AL vel Legis, the central scripture of Thelema, whose three chapters speak in the voices of Nuit, Hadit, and Ra-Hoor-Khuit and announce the aeon of the crowned and conquering child.',
    claims: [
      {
        text: 'Crowley recorded the text over three days in April 1904, attributing it to the praeterhuman intelligence Aiwass.',
        evidence: 'primary',
        sources: ['crowley-1904'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'aleister-crowley' },
      { kind: 'part-of', target: 'thelema' },
    ],
    tags: ['liber al', 'aiwass', 'scripture'],
  },
  {
    id: 'ordo-templi-orientis',
    type: 'organization',
    name: 'Ordo Templi Orientis',
    epithet: 'The order of the templars of the east',
    dates: 'from c. 1904',
    year: 1912,
    era: 'twentieth',
    cluster: 'occult-revival',
    summary:
      'The German-founded initiatic order that Crowley reshaped around Thelema, transmitting a graded system said to culminate in a secret of sexual magic.',
    claims: [
      {
        text: 'Crowley joined the O.T.O. around 1912 under Theodor Reuss and rewrote its rituals to embody Thelema, later heading the order.',
        evidence: 'documented',
        sources: ['kaczynski-2010'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'aleister-crowley' },
      { kind: 'part-of', target: 'thelema' },
    ],
    tags: ['initiatic order', 'sex magic', 'grades'],
  },
  {
    id: 'book-of-thoth-tarot',
    type: 'work',
    name: 'The Thoth Tarot',
    epithet: 'A deck painted through the war years',
    dates: '1938–1943',
    year: 1944,
    era: 'twentieth',
    cluster: 'occult-revival',
    summary:
      'Crowley’s tarot, painted by Lady Frieda Harris over five years and expounded in his Book of Thoth — a Thelemic reworking of the Golden Dawn’s cards.',
    claims: [
      {
        text: 'Harris executed the eighty cards to Crowley’s directions between 1938 and 1943; The Book of Thoth appeared in 1944, the deck itself decades later.',
        evidence: 'documented',
        sources: ['crowley-1944', 'kaczynski-2010'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'aleister-crowley' },
      { kind: 'derived-from', target: 'golden-dawn' },
      { kind: 'associated-with', target: 'tarot' },
    ],
    tags: ['tarot', 'frieda harris', 'thoth'],
  },
  {
    id: 'dion-fortune',
    type: 'person',
    name: 'Dion Fortune',
    epithet: 'The psychologist-magician of the Inner Light',
    dates: '1890–1946',
    year: 1935,
    era: 'twentieth',
    cluster: 'occult-revival',
    summary:
      'Violet Firth, novelist and occultist, who blended Golden Dawn magic with the new psychology, founded the Society of the Inner Light, and wrote the enduring Mystical Qabalah.',
    claims: [
      {
        text: 'Fortune trained in a Golden Dawn successor order and founded the Fraternity (later Society) of the Inner Light in the 1920s.',
        evidence: 'documented',
        sources: ['greer-1995', 'owen-2004'],
      },
      {
        text: 'Her Mystical Qabalah (1935) became a standard modern exposition of the Tree of Life for magical practice.',
        evidence: 'documented',
        sources: ['fortune-1935'],
      },
    ],
    relations: [
      { kind: 'founded', target: 'society-of-inner-light' },
      { kind: 'wrote', target: 'mystical-qabalah' },
      { kind: 'associated-with', target: 'golden-dawn' },
    ],
    tags: ['inner light', 'qabalah', 'psychology'],
  },
  {
    id: 'society-of-inner-light',
    type: 'organization',
    name: 'The Society of the Inner Light',
    epithet: 'Dion Fortune’s temple of the western mysteries',
    dates: 'from 1928',
    year: 1928,
    era: 'twentieth',
    cluster: 'occult-revival',
    summary:
      'The magical fraternity Fortune built out of the Golden Dawn stream, teaching a Christianized Western Mystery Tradition that outlived her and shaped later British occultism.',
    claims: [
      {
        text: 'The Society of the Inner Light grew from Fortune’s fraternity of the 1920s and continued after her death in 1946.',
        evidence: 'documented',
        sources: ['owen-2004', 'greer-1995'],
      },
    ],
    relations: [
      { kind: 'derived-from', target: 'golden-dawn' },
      { kind: 'associated-with', target: 'dion-fortune' },
    ],
    tags: ['western mysteries', 'fraternity'],
  },
  {
    id: 'mystical-qabalah',
    type: 'work',
    name: 'The Mystical Qabalah',
    epithet: 'The Tree of Life for the modern magician',
    dates: '1935',
    year: 1935,
    era: 'twentieth',
    cluster: 'occult-revival',
    summary:
      'Fortune’s lucid guide to the Tree of Life as a map of consciousness and a scaffold for magical work — the book that carried Hermetic Qabalah into the twentieth century.',
    claims: [
      {
        text: 'The Mystical Qabalah presents the sefirot and paths as a practical psychology and cosmology for Western esoteric practice.',
        evidence: 'documented',
        sources: ['fortune-1935'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'dion-fortune' },
      { kind: 'derived-from', target: 'tree-of-life' },
    ],
    tags: ['qabalah', 'tree of life', 'manual'],
  },
  {
    id: 'wb-yeats',
    type: 'person',
    name: 'W. B. Yeats',
    epithet: 'The poet who took the magical motto Demon est Deus Inversus',
    dates: '1865–1939',
    year: 1890,
    era: 'twentieth',
    cluster: 'occult-revival',
    summary:
      'Ireland’s greatest modern poet and a devoted Golden Dawn magician, whose occult studies and his wife’s automatic writing yielded the visionary system of A Vision.',
    claims: [
      {
        text: 'Yeats was initiated into the Golden Dawn in 1890 and remained active for decades, taking part in its disputes.',
        evidence: 'documented',
        sources: ['howe-1972', 'owen-2004'],
      },
      {
        text: 'A Vision (1925) systematized the symbolism delivered through George Yeats’ automatic writing from 1917.',
        evidence: 'documented',
        sources: ['owen-2004'],
      },
    ],
    relations: [
      { kind: 'member-of', target: 'golden-dawn' },
      { kind: 'associated-with', target: 'automatic-writing' },
    ],
    tags: ['poetry', 'ireland', 'a vision'],
  },
  {
    id: 'papus',
    type: 'person',
    name: 'Papus',
    epithet: 'The physician who organized the French occult revival',
    dates: '1865–1916',
    year: 1889,
    era: 'nineteenth',
    cluster: 'occult-revival',
    summary:
      'Gérard Encausse, tireless organizer of fin-de-siècle Paris occultism, founder of the Martinist Order and author of the influential Tarot of the Bohemians.',
    claims: [
      {
        text: 'Papus founded the modern Martinist Order and co-founded numerous esoteric bodies; his Tarot des Bohémiens (1889) systematized occult tarot correspondences.',
        evidence: 'documented',
        sources: ['papus-1889', 'godwin-1994'],
      },
    ],
    relations: [
      { kind: 'founded', target: 'martinist-order' },
      { kind: 'wrote', target: 'tarot-des-bohemiens' },
      { kind: 'influenced', target: 'tarot' },
    ],
    tags: ['paris', 'martinism', 'tarot'],
  },
  {
    id: 'martinist-order',
    type: 'organization',
    name: 'The Martinist Order',
    epithet: 'The inner way, revived as an order of Paris',
    dates: 'from c. 1891',
    year: 1891,
    era: 'nineteenth',
    cluster: 'occult-revival',
    summary:
      'The initiatic order Papus assembled around the legacy of Saint-Martin and Pasqually, transmitting a Christian-esoteric “way of the heart” through symbolic degrees.',
    claims: [
      {
        text: 'Papus and Augustin Chaboseau organized the Martinist Order in the early 1890s, claiming descent from Saint-Martin’s circle.',
        evidence: 'documented',
        sources: ['godwin-1994'],
      },
    ],
    relations: [
      { kind: 'derived-from', target: 'louis-claude-de-saint-martin' },
      { kind: 'founded', target: 'papus' },
    ],
    tags: ['martinism', 'initiation', 'paris'],
  },
  {
    id: 'tarot-des-bohemiens',
    type: 'work',
    name: 'Le Tarot des Bohémiens',
    epithet: 'The tarot keyed to the alphabet of God',
    dates: '1889',
    year: 1889,
    era: 'nineteenth',
    cluster: 'occult-revival',
    summary:
      'Papus’ systematic occult tarot, tying the twenty-two trumps to the Hebrew letters and the Tetragrammaton — the French complement to the coming English decks.',
    claims: [
      {
        text: 'The Tarot des Bohémiens presents the pack as a symbolic “book of Thoth” organized by the Hebrew alphabet and the divine name.',
        evidence: 'documented',
        sources: ['papus-1889'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'papus' },
      { kind: 'derived-from', target: 'eliphas-levi' },
    ],
    tags: ['tarot', 'hebrew', 'correspondences'],
  },
  {
    id: 'josephin-peladan',
    type: 'person',
    name: 'Joséphin Péladan',
    epithet: 'The self-styled Sâr of the mystic Rose+Croix',
    dates: '1858–1918',
    year: 1892,
    era: 'nineteenth',
    cluster: 'occult-revival',
    summary:
      'Flamboyant novelist and aesthete who founded the Salon de la Rose+Croix, staging symbolist art as a Catholic-esoteric mystery against the materialism of the age.',
    claims: [
      {
        text: 'Péladan broke with Papus’ circle to found the Ordre de la Rose-Croix Catholique and mounted the Salons de la Rose+Croix (1892–1897) exhibiting Symbolist artists.',
        evidence: 'documented',
        sources: ['godwin-1994'],
      },
    ],
    relations: [
      { kind: 'founded', target: 'salon-rose-croix' },
      { kind: 'associated-with', target: 'papus' },
    ],
    tags: ['symbolism', 'rose-croix', 'aesthete'],
  },
  {
    id: 'salon-rose-croix',
    type: 'event',
    name: 'The Salon de la Rose+Croix',
    epithet: 'Symbolist art enthroned as sacred mystery',
    dates: '1892–1897',
    year: 1892,
    era: 'nineteenth',
    cluster: 'occult-revival',
    summary:
      'Péladan’s six exhibitions in Paris that fused esoteric idealism with Symbolist painting, banishing realism in favour of dream, myth, and the sacred.',
    claims: [
      {
        text: 'The six Salons de la Rose+Croix (1892–1897) presented Symbolist and idealist art under an explicitly esoteric program.',
        evidence: 'documented',
        sources: ['godwin-1994'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'josephin-peladan' },
      { kind: 'part-of', target: 'occult-revival-movement' },
    ],
    tags: ['symbolism', 'paris', 'exhibition'],
  },
  {
    id: 'occult-revival-movement',
    type: 'tradition',
    name: 'The Occult Revival',
    epithet: 'The nineteenth century’s return of the rejected',
    dates: 'c. 1850–1914',
    year: 1875,
    era: 'nineteenth',
    cluster: 'occult-revival',
    summary:
      'The broad flowering of magic, spiritualism, and esoteric religion across Europe and America — from Lévi and the spiritualists to Theosophy and the Golden Dawn.',
    claims: [
      {
        text: 'Historians describe a nineteenth-century occult revival channeling Renaissance and early-modern esotericism into new orders, societies, and religions.',
        evidence: 'scholarship',
        sources: ['godwin-1994', 'owen-2004'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'eliphas-levi' },
      { kind: 'associated-with', target: 'theosophical-society' },
      { kind: 'associated-with', target: 'golden-dawn' },
    ],
    tags: ['revival', 'nineteenth century', 'magic'],
  },
  {
    id: 'spiritualism',
    type: 'tradition',
    name: 'Spiritualism',
    epithet: 'The rapping that summoned a movement',
    dates: 'from 1848',
    year: 1848,
    era: 'nineteenth',
    cluster: 'occult-revival',
    summary:
      'The mass movement of communication with the dead, born from the Fox sisters’ rappings and spreading through séance rooms across America and Europe.',
    claims: [
      {
        text: 'Modern Spiritualism is conventionally dated to the Fox sisters’ rappings at Hydesville, New York, in 1848.',
        evidence: 'documented',
        sources: ['godwin-1994', 'owen-2004'],
      },
      {
        text: 'One Fox sister later confessed the raps were produced by cracking joints, then partly retracted — the episode remains disputed.',
        evidence: 'primary',
        sources: ['godwin-1994'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'fox-sisters' },
      { kind: 'influenced', target: 'society-psychical-research' },
    ],
    tags: ['séance', 'mediums', 'the dead'],
  },
  {
    id: 'fox-sisters',
    type: 'person',
    name: 'The Fox Sisters',
    epithet: 'The girls whose rappings began a religion',
    dates: 'active from 1848',
    year: 1848,
    era: 'nineteenth',
    cluster: 'occult-revival',
    summary:
      'Kate and Margaret Fox of Hydesville, whose claimed spirit-rappings in 1848 sparked the Spiritualist movement — and whose later confession and retraction never settled the matter.',
    claims: [
      {
        text: 'The Fox sisters’ rappings drew national attention from 1848 and became the movement’s founding phenomenon.',
        evidence: 'documented',
        sources: ['godwin-1994'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'spiritualism' },
      { kind: 'located-in', target: 'london', note: 'the movement soon crossed the Atlantic' },
    ],
    tags: ['hydesville', 'rappings', 'mediums'],
  },
  {
    id: 'society-psychical-research',
    type: 'organization',
    name: 'The Society for Psychical Research',
    epithet: 'Science sent to sit in the séance room',
    dates: 'from 1882',
    year: 1882,
    era: 'nineteenth',
    cluster: 'occult-revival',
    summary:
      'The London society founded to examine mediumship, telepathy, and hauntings by scientific method — whose investigators both exposed frauds and lent the uncanny academic standing.',
    claims: [
      {
        text: 'Founded in 1882 by Cambridge scholars including Henry Sidgwick, the SPR investigated psychical claims, producing the critical Hodgson Report on Theosophy in 1885.',
        evidence: 'documented',
        sources: ['hodgson-1885', 'godwin-1994'],
      },
    ],
    relations: [
      { kind: 'critiqued', target: 'theosophical-society' },
      { kind: 'associated-with', target: 'spiritualism' },
    ],
    tags: ['1882', 'telepathy', 'investigation'],
  },
  {
    id: 'rudolf-steiner',
    type: 'person',
    name: 'Rudolf Steiner',
    epithet: 'The Goethe scholar who founded a spiritual science',
    dates: '1861–1925',
    year: 1913,
    era: 'twentieth',
    cluster: 'occult-revival',
    summary:
      'Austrian philosopher and editor of Goethe’s scientific writings who, after leading the German Theosophists, broke away to found Anthroposophy and its schools, medicine, and agriculture.',
    claims: [
      {
        text: 'Steiner led the German Section of the Theosophical Society before founding the Anthroposophical Society in 1912–13 over doctrinal differences.',
        evidence: 'documented',
        sources: ['godwin-1994', 'goodrick-clarke-2008'],
      },
      {
        text: 'His movement generated Waldorf education, biodynamic agriculture, and anthroposophical medicine.',
        evidence: 'documented',
        sources: ['goodrick-clarke-2008'],
      },
    ],
    relations: [
      { kind: 'founded', target: 'anthroposophy' },
      { kind: 'member-of', target: 'theosophical-society' },
    ],
    tags: ['anthroposophy', 'waldorf', 'goethe'],
  },
  {
    id: 'anthroposophy',
    type: 'tradition',
    name: 'Anthroposophy',
    epithet: 'A path of knowledge to lead the spirit to the cosmos',
    dates: 'from 1912',
    year: 1912,
    era: 'twentieth',
    cluster: 'occult-revival',
    summary:
      'Steiner’s “spiritual science”: a systematic path of inner development claiming disciplined access to supersensible worlds, expressed through art, education, and practical reform.',
    claims: [
      {
        text: 'Anthroposophy presents itself as a methodical spiritual science; its institutions in education, agriculture, and the arts persist worldwide.',
        evidence: 'documented',
        sources: ['goodrick-clarke-2008'],
      },
    ],
    relations: [
      { kind: 'derived-from', target: 'rudolf-steiner' },
      { kind: 'derived-from', target: 'theosophical-society' },
    ],
    tags: ['spiritual science', 'goetheanum'],
  },
  {
    id: 'annie-besant',
    type: 'person',
    name: 'Annie Besant',
    epithet: 'The freethinker who led Theosophy and India',
    dates: '1847–1933',
    year: 1907,
    era: 'twentieth',
    cluster: 'occult-revival',
    summary:
      'Secularist, socialist, and union organizer turned Theosophist, who succeeded Blavatsky’s tradition as international president and championed Indian home rule.',
    claims: [
      {
        text: 'Besant became president of the Theosophical Society in 1907 and was active in Indian nationalist politics, presiding over the Indian National Congress in 1917.',
        evidence: 'documented',
        sources: ['godwin-1994'],
      },
      {
        text: 'With C. W. Leadbeater she promoted the young Krishnamurti as a coming world teacher, a project he later renounced.',
        evidence: 'documented',
        sources: ['godwin-1994'],
      },
    ],
    relations: [
      { kind: 'member-of', target: 'theosophical-society' },
      { kind: 'associated-with', target: 'jiddu-krishnamurti' },
    ],
    tags: ['theosophy', 'india', 'reform'],
  },
  {
    id: 'jiddu-krishnamurti',
    type: 'person',
    name: 'Jiddu Krishnamurti',
    epithet: 'The chosen vehicle who dissolved his own order',
    dates: '1895–1986',
    year: 1929,
    era: 'twentieth',
    cluster: 'occult-revival',
    summary:
      'The South Indian boy groomed by the Theosophists as vehicle for the World Teacher, who in 1929 dissolved the Order of the Star and spent his life teaching that truth is a pathless land.',
    claims: [
      {
        text: 'Krishnamurti dissolved the Order of the Star in the East in 1929, repudiating the messianic role prepared for him and rejecting all spiritual authority thereafter.',
        evidence: 'documented',
        sources: ['godwin-1994'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'annie-besant' },
      { kind: 'critiqued', target: 'theosophical-society' },
    ],
    tags: ['world teacher', 'pathless land', 'renunciation'],
  },
  {
    id: 'g-i-gurdjieff',
    type: 'person',
    name: 'G. I. Gurdjieff',
    epithet: 'The teacher of the work against sleep',
    dates: 'c. 1866–1949',
    year: 1922,
    era: 'twentieth',
    cluster: 'occult-revival',
    summary:
      'The Armenian-Greek teacher who claimed to have gathered a lost esoteric knowledge in Central Asia and taught it in the West as the Work — sacred dances, self-observation, and the effort to awaken.',
    claims: [
      {
        text: 'Gurdjieff established the Institute for the Harmonious Development of Man near Paris in 1922 and taught a system of self-development he called “the Work”.',
        evidence: 'documented',
        sources: ['godwin-1994', 'goodrick-clarke-2008'],
      },
    ],
    relations: [
      { kind: 'founded', target: 'the-fourth-way' },
      { kind: 'influenced', target: 'p-d-ouspensky' },
    ],
    tags: ['the work', 'movements', 'central asia'],
  },
  {
    id: 'p-d-ouspensky',
    type: 'person',
    name: 'P. D. Ouspensky',
    epithet: 'The mathematician who mapped a teacher’s system',
    dates: '1878–1947',
    year: 1915,
    era: 'twentieth',
    cluster: 'occult-revival',
    summary:
      'Russian philosopher of higher dimensions who became Gurdjieff’s foremost pupil and expositor, then taught independently — his In Search of the Miraculous the classic account of the Work.',
    claims: [
      {
        text: 'Ouspensky met Gurdjieff in 1915 and later recorded his teaching in In Search of the Miraculous, published posthumously in 1949.',
        evidence: 'documented',
        sources: ['godwin-1994'],
      },
    ],
    relations: [
      { kind: 'studied', target: 'g-i-gurdjieff' },
      { kind: 'part-of', target: 'the-fourth-way' },
    ],
    tags: ['the work', 'tertium organum', 'russia'],
  },
  {
    id: 'the-fourth-way',
    type: 'tradition',
    name: 'The Fourth Way',
    epithet: 'Awakening in the midst of ordinary life',
    dates: 'from c. 1915',
    year: 1920,
    era: 'twentieth',
    cluster: 'occult-revival',
    summary:
      'Gurdjieff’s name for his path — neither fakir, monk, nor yogi, but a way of conscious labor and intentional suffering pursued in everyday life to awaken from mechanical sleep.',
    claims: [
      {
        text: 'The Fourth Way teaches that ordinary humanity lives “asleep” and that conscious effort and self-remembering are needed to develop a real inner unity.',
        evidence: 'scholarship',
        sources: ['godwin-1994'],
      },
    ],
    relations: [
      { kind: 'derived-from', target: 'g-i-gurdjieff' },
      { kind: 'associated-with', target: 'p-d-ouspensky' },
    ],
    tags: ['self-remembering', 'awakening', 'the work'],
  },
  {
    id: 'hilma-af-klint',
    type: 'person',
    name: 'Hilma af Klint',
    epithet: 'The painter of the temple, decades ahead of her time',
    dates: '1862–1944',
    year: 1907,
    era: 'twentieth',
    cluster: 'occult-revival',
    summary:
      'The Swedish artist whose vast abstract paintings, produced from 1906 under spirit guidance within her group The Five, anticipated abstraction — and which she asked be hidden for twenty years after her death.',
    claims: [
      {
        text: 'Af Klint produced large abstract works from 1906, informed by Theosophy and Anthroposophy and by séances with the group “De Fem”; she directed that they not be shown until decades after her death.',
        evidence: 'documented',
        sources: ['goodrick-clarke-2008', 'godwin-1994'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'theosophical-society' },
      { kind: 'associated-with', target: 'anthroposophy' },
    ],
    tags: ['abstraction', 'painting', 'the five'],
  },
  {
    id: 'automatic-writing',
    type: 'concept',
    name: 'Automatic Writing',
    epithet: 'The hand that writes what the mind did not choose',
    dates: 'from Spiritualism onward',
    year: 1900,
    era: 'twentieth',
    cluster: 'occult-revival',
    summary:
      'The practice of writing without conscious control, used by mediums and magicians alike to receive messages — from Spiritualist séances to the automatic script behind Yeats’ A Vision.',
    claims: [
      {
        text: 'Automatic writing was a common technique of Spiritualist mediumship and psychical research, and produced the raw material of Yeats’ A Vision.',
        evidence: 'documented',
        sources: ['owen-2004'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'spiritualism' },
      { kind: 'associated-with', target: 'wb-yeats' },
    ],
    tags: ['mediumship', 'script', 'trance'],
  },
  {
    id: 'baphomet',
    type: 'symbol',
    name: 'Baphomet',
    epithet: 'The sabbatic goat of the reconciled opposites',
    dates: 'Lévi’s 1856 image',
    year: 1856,
    era: 'nineteenth',
    cluster: 'occult-revival',
    summary:
      'Éliphas Lévi’s winged, goat-headed figure of the Sabbatic Goat — an emblem of the union of opposites drawn for Dogme et rituel that became the century’s most recognizable occult icon.',
    claims: [
      {
        text: 'Lévi devised the Baphomet image for Dogme et rituel de la haute magie (1856) as a symbolic synthesis of opposites, not an object of worship.',
        evidence: 'documented',
        sources: ['levi-1856', 'godwin-1994'],
      },
      {
        text: 'The medieval charge that the Templars venerated a “Baphomet” is the distant, disputed source of the name.',
        evidence: 'speculation',
        sources: ['godwin-1994'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'eliphas-levi' },
      { kind: 'symbol-of', target: 'occult-revival-movement' },
    ],
    tags: ['sabbatic goat', 'opposites', 'icon'],
  },
  {
    id: 'astral-light',
    type: 'concept',
    name: 'The Astral Light',
    epithet: 'The universal fluid the magician learns to bend',
    dates: 'Lévi’s coinage, 1850s',
    year: 1856,
    era: 'nineteenth',
    cluster: 'occult-revival',
    summary:
      'Éliphas Lévi’s name for the plastic, all-pervading medium of imagination and will through which magical operations act — the nervous system, as it were, of the cosmos.',
    claims: [
      {
        text: 'Lévi identified the astral light as the universal magical agent, uniting older ideas of the sidereal spirit and animal magnetism.',
        evidence: 'documented',
        sources: ['levi-1856'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'eliphas-levi' },
      { kind: 'derived-from', target: 'anima-mundi' },
    ],
    tags: ['fluid', 'will', 'imagination'],
  },
  {
    id: 'astral-projection',
    type: 'concept',
    name: 'Astral Projection',
    epithet: 'The body of light, sent walking through the planes',
    dates: 'Golden Dawn practice',
    year: 1890,
    era: 'nineteenth',
    cluster: 'occult-revival',
    summary:
      'The disciplined exit from the physical body in a “body of light” to travel the inner planes — a core skill taught in Golden Dawn and Theosophical circles.',
    claims: [
      {
        text: 'Golden Dawn instruction, later published by Regardie, describes forming and projecting a body of light for visionary travel on the astral plane.',
        evidence: 'documented',
        sources: ['regardie-1940', 'howe-1972'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'golden-dawn' },
      { kind: 'associated-with', target: 'astral-light' },
    ],
    tags: ['body of light', 'inner planes', 'scrying'],
  },
  {
    id: 'gerald-gardner',
    type: 'person',
    name: 'Gerald Gardner',
    epithet: 'The retired planter who went public as a witch',
    dates: '1884–1964',
    year: 1954,
    era: 'twentieth',
    cluster: 'occult-revival',
    summary:
      'The Englishman who, after the repeal of the witchcraft laws, announced a surviving witch-cult and published its rites — founding the modern religion of Wicca, stitched from many esoteric threads.',
    claims: [
      {
        text: 'Gardner presented Wicca to the public in Witchcraft Today (1954), claiming initiation into a surviving coven.',
        evidence: 'documented',
        sources: ['hutton-1999'],
      },
      {
        text: 'Hutton showed that Gardnerian Wicca was assembled in the twentieth century from folklore, ceremonial magic, and Crowleyan material rather than surviving intact from antiquity.',
        evidence: 'scholarship',
        sources: ['hutton-1999'],
      },
    ],
    relations: [
      { kind: 'founded', target: 'wicca' },
      { kind: 'influenced', target: 'aleister-crowley', note: 'reversed: Gardner drew on Crowley’s texts' },
    ],
    tags: ['witchcraft', 'wicca', '1954'],
  },
  {
    id: 'wicca',
    type: 'tradition',
    name: 'Wicca',
    epithet: 'The reinvented craft of the wise',
    dates: 'from the 1950s',
    year: 1954,
    era: 'twentieth',
    cluster: 'occult-revival',
    summary:
      'The modern pagan witchcraft religion that grew from Gardner’s covens — initiatory, duotheistic, and ritual — which became the seedbed of the wider contemporary Pagan movement.',
    claims: [
      {
        text: 'Wicca emerged publicly in 1950s Britain and diversified into many traditions, becoming the most influential strand of modern Paganism.',
        evidence: 'scholarship',
        sources: ['hutton-1999'],
      },
    ],
    relations: [
      { kind: 'derived-from', target: 'gerald-gardner' },
      { kind: 'part-of', target: 'occult-revival-movement' },
    ],
    tags: ['paganism', 'witchcraft', 'covens'],
  },
  {
    id: 'margaret-murray',
    type: 'person',
    name: 'Margaret Murray',
    epithet: 'The Egyptologist who imagined an old religion',
    dates: '1863–1963',
    year: 1921,
    era: 'twentieth',
    cluster: 'occult-revival',
    summary:
      'The pioneering archaeologist whose witch-cult hypothesis — that early modern witch trials targeted a surviving pagan fertility religion — was rejected by historians but seeded modern Wicca.',
    claims: [
      {
        text: 'Murray’s The Witch-Cult in Western Europe (1921) argued for an organized surviving pagan religion behind the witch trials.',
        evidence: 'documented',
        sources: ['hutton-1999'],
      },
      {
        text: 'Historians have thoroughly discredited the Murray thesis, though it profoundly shaped popular belief and modern Paganism.',
        evidence: 'scholarship',
        sources: ['hutton-1999', 'thomas-1971'],
      },
    ],
    relations: [
      { kind: 'influenced', target: 'wicca' },
      { kind: 'critiqued', target: 'occult-revival-movement', note: 'her thesis was rejected by scholars' },
    ],
    tags: ['witch-cult', 'thesis', 'archaeology'],
  },
  {
    id: 'franz-anton-mesmer',
    type: 'person',
    name: 'Franz Anton Mesmer',
    epithet: 'The doctor of the invisible magnetic tide',
    dates: '1734–1815',
    year: 1779,
    era: 'enlightenment',
    cluster: 'occult-revival',
    summary:
      'The Viennese physician whose theory of “animal magnetism” — an invisible fluid whose blockage caused illness — swept pre-Revolutionary Paris and seeded hypnotism, spiritualism, and much of modern occult psychology.',
    claims: [
      {
        text: 'Mesmer propounded animal magnetism in Paris in the 1770s–80s; a royal commission in 1784, including Franklin and Lavoisier, found no evidence of the fluid.',
        evidence: 'documented',
        sources: ['godwin-1994'],
      },
      {
        text: 'Mesmerism’s trance states fed directly into hypnotism and the séance culture of the nineteenth century.',
        evidence: 'scholarship',
        sources: ['godwin-1994', 'owen-2004'],
      },
    ],
    relations: [
      { kind: 'founded', target: 'animal-magnetism' },
      { kind: 'influenced', target: 'spiritualism' },
    ],
    tags: ['mesmerism', 'fluid', 'paris'],
  },
  {
    id: 'animal-magnetism',
    type: 'concept',
    name: 'Animal Magnetism',
    epithet: 'The healing fluid that flowed between all bodies',
    dates: 'from the 1770s',
    year: 1779,
    era: 'enlightenment',
    cluster: 'occult-revival',
    summary:
      'Mesmer’s postulated universal fluid, manipulated by passes and rapport to heal — the bridge between Enlightenment medicine and the trance-phenomena of the occult revival.',
    claims: [
      {
        text: 'Animal magnetism held that a subtle fluid pervades bodies and can be directed for cures; its somnambulic trances became a laboratory of the uncanny.',
        evidence: 'scholarship',
        sources: ['godwin-1994'],
      },
    ],
    relations: [
      { kind: 'derived-from', target: 'franz-anton-mesmer' },
      { kind: 'influenced', target: 'astral-light' },
    ],
    tags: ['fluid', 'trance', 'healing'],
  },
  {
    id: 'allan-kardec',
    type: 'person',
    name: 'Allan Kardec',
    epithet: 'The codifier of the spirits’ doctrine',
    dates: '1804–1869',
    year: 1857,
    era: 'nineteenth',
    cluster: 'occult-revival',
    summary:
      'The French educator Hippolyte Rivail who, as Allan Kardec, systematized séance teachings into Spiritism — a doctrine of reincarnation and moral progress that took deep root in Brazil.',
    claims: [
      {
        text: 'Kardec’s Le Livre des Esprits (1857) codified Spiritism, distinguished from Anglo-American Spiritualism chiefly by its doctrine of reincarnation.',
        evidence: 'documented',
        sources: ['godwin-1994'],
      },
    ],
    relations: [
      { kind: 'founded', target: 'spiritism' },
      { kind: 'associated-with', target: 'spiritualism' },
    ],
    tags: ['spiritism', 'reincarnation', 'brazil'],
  },
  {
    id: 'spiritism',
    type: 'tradition',
    name: 'Spiritism',
    epithet: 'The spirits’ teaching, organized into a faith',
    dates: 'from 1857',
    year: 1857,
    era: 'nineteenth',
    cluster: 'occult-revival',
    summary:
      'The Kardecist current of spirit-communication built on reincarnation and moral evolution — largely eclipsed in France, it flourished as a major religious movement in Brazil.',
    claims: [
      {
        text: 'Spiritism, codified by Kardec, differs from Spiritualism in its systematic doctrine of successive reincarnations and became widespread in Latin America.',
        evidence: 'scholarship',
        sources: ['godwin-1994'],
      },
    ],
    relations: [
      { kind: 'derived-from', target: 'allan-kardec' },
      { kind: 'associated-with', target: 'spiritualism' },
    ],
    tags: ['reincarnation', 'brazil', 'doctrine'],
  },
  {
    id: 'austin-osman-spare',
    type: 'person',
    name: 'Austin Osman Spare',
    epithet: 'The artist who drew magic from the subconscious',
    dates: '1886–1956',
    year: 1913,
    era: 'twentieth',
    cluster: 'occult-revival',
    summary:
      'The visionary London draughtsman, briefly Crowley’s pupil, whose private system of sigils and the alphabet of desire bypassed ritual for the subconscious — grandfather of late-century chaos magic.',
    claims: [
      {
        text: 'Spare’s The Book of Pleasure (1913) set out a sigil method of impressing desire on the subconscious, later foundational to chaos magic.',
        evidence: 'documented',
        sources: ['goodrick-clarke-2008'],
      },
    ],
    relations: [
      { kind: 'studied', target: 'aleister-crowley' },
      { kind: 'associated-with', target: 'sigil' },
    ],
    tags: ['sigils', 'art', 'subconscious'],
  },
  {
    id: 'golden-dawn-schism',
    type: 'event',
    name: 'The Schism of 1900',
    epithet: 'The Golden Dawn torn apart in a single season',
    dates: '1900',
    year: 1900,
    era: 'twentieth',
    cluster: 'occult-revival',
    summary:
      'The 1900 revolt of the London temple against Mathers — inflamed by Crowley’s arrival and the exposure of a forged founding link — that shattered the Golden Dawn into rival successor orders.',
    claims: [
      {
        text: 'In 1900 the London adepts rebelled against Mathers’ autocracy; the conflict, worsened by Crowley, split the order into successor bodies such as the Stella Matutina and the A.O.',
        evidence: 'documented',
        sources: ['howe-1972', 'kaczynski-2010'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'golden-dawn' },
      { kind: 'associated-with', target: 'aleister-crowley' },
    ],
    tags: ['1900', 'schism', 'revolt'],
  },
];
