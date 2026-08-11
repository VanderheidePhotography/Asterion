import type { Entity } from '../../domain/types';

export const freemasonry: Entity[] = [
  {
    id: 'freemasonry',
    type: 'tradition',
    name: 'Freemasonry',
    epithet: 'From working lodges to a brotherhood of symbols',
    dates: 'lodge records from 1599',
    year: 1717,
    era: 'enlightenment',
    cluster: 'freemasonry',
    summary:
      'The fraternal tradition that grew from Scottish operative lodges into the “speculative” craft of the eighteenth century — moralized tools, graded ritual, and a legendary history of its own.',
    claims: [
      {
        text: 'The earliest minuted lodges appear in Scotland from 1599; through the seventeenth century operative lodges admitted gentlemen “accepted” masons.',
        evidence: 'documented',
        sources: ['stevenson-1988'],
      },
      {
        text: 'Four London lodges formed a Grand Lodge (traditionally 1717 — a date recent scholarship has re-examined), and Anderson’s Constitutions codified the new speculative craft in 1723.',
        evidence: 'documented',
        sources: ['anderson-1723', 'stevenson-1988'],
      },
      {
        text: 'Masonic legend traces the craft to the builders of Solomon’s Temple and beyond — a traditional history, not a documented one.',
        evidence: 'tradition',
        sources: ['anderson-1723'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'square-and-compasses' },
      { kind: 'associated-with', target: 'london' },
    ],
    tags: ['lodge', 'craft', 'speculative', 'fraternity'],
  },
  {
    id: 'grand-lodge-founding',
    type: 'event',
    name: 'The Founding of the Grand Lodge',
    epithet: 'Four lodges at the Goose and Gridiron',
    dates: 'traditionally 24 June 1717',
    year: 1717,
    era: 'enlightenment',
    cluster: 'freemasonry',
    summary:
      'The traditional origin of organized Grand Lodge Freemasonry: four London lodges meeting at the Goose and Gridiron alehouse — an event known only from a retrospective account.',
    claims: [
      {
        text: 'The founding at the Goose and Gridiron alehouse, St Paul’s Churchyard, on 24 June 1717 is known only from Anderson’s retrospective account of 1738; some historians now argue for 1721.',
        evidence: 'primary',
        sources: ['stevenson-1988'],
      },
      {
        text: 'Whatever the exact date, a governing “Grand Lodge” standing over autonomous lodges was an organizational innovation of the early eighteenth century.',
        evidence: 'scholarship',
        sources: ['stevenson-1988'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'freemasonry' },
      { kind: 'located-in', target: 'london' },
    ],
    tags: ['1717', 'grand lodge', 'goose and gridiron'],
  },
  {
    id: 'andersons-constitutions',
    type: 'work',
    name: 'Anderson’s Constitutions',
    epithet: 'The craft acquires a book of its own',
    dates: '1723',
    year: 1723,
    era: 'enlightenment',
    cluster: 'freemasonry',
    summary:
      'The founding text of Grand Lodge Freemasonry: regulations, charges, and a sweeping “traditional history” of the craft from Adam onward.',
    claims: [
      {
        text: 'Commissioned by the new Grand Lodge and printed in 1723, it collected regulations, charges, and a “traditional history” of the craft reaching back to Adam.',
        evidence: 'documented',
        sources: ['anderson-1723'],
      },
      {
        text: 'Its legendary history reworks the medieval “Old Charges” manuscripts for an Enlightenment audience.',
        evidence: 'scholarship',
        sources: ['stevenson-1988'],
      },
    ],
    relations: [{ kind: 'part-of', target: 'freemasonry' }],
    tags: ['constitutions', 'charges', '1723'],
  },
  {
    id: 'elias-ashmole',
    type: 'person',
    name: 'Elias Ashmole',
    epithet: 'Antiquary, alchemist, and one of the first recorded accepted masons',
    dates: '1617–1692',
    year: 1650,
    era: 'early-modern',
    cluster: 'freemasonry',
    summary:
      'The great English antiquary whose diary records one of the earliest English masonic initiations, who anthologized England’s alchemical poetry, and whose collections founded the Ashmolean.',
    claims: [
      {
        text: 'Ashmole’s diary for 16 October 1646 records his admission as a freemason at Warrington — among the earliest personal records of an English “accepted” mason.',
        evidence: 'documented',
        sources: ['ashmole-josten'],
      },
      {
        text: 'He compiled the Theatrum Chemicum Britannicum (1652), an anthology of English alchemical poetry, and his collections founded the Ashmolean Museum at Oxford.',
        evidence: 'documented',
        sources: ['ashmole-josten', 'principe-2013'],
      },
    ],
    relations: [
      { kind: 'member-of', target: 'freemasonry' },
      { kind: 'studied', target: 'alchemy' },
      { kind: 'associated-with', target: 'london' },
    ],
    tags: ['antiquary', 'diary', '1646', 'ashmolean'],
  },
  {
    id: 'square-and-compasses',
    type: 'symbol',
    name: 'The Square and Compasses',
    epithet: 'Working tools become moral emblems',
    dates: 'speculative usage, 18th c.',
    year: 1723,
    era: 'enlightenment',
    cluster: 'freemasonry',
    summary:
      'The most recognizable masonic emblem: the stonemason’s square and compasses, moralized in speculative ritual into measures of conduct and restraint.',
    claims: [
      {
        text: 'The working tools of stonemasons became moral emblems in speculative ritual — the square of conduct, the compasses of due bounds.',
        evidence: 'documented',
        sources: ['anderson-1723', 'stevenson-1988'],
      },
    ],
    relations: [{ kind: 'symbol-of', target: 'freemasonry' }],
    tags: ['tools', 'emblem', 'lodge'],
  },
  {
    id: 'london',
    type: 'place',
    name: 'London',
    epithet: 'Alehouses, coffee-houses, lodges, and temples',
    year: 1717,
    era: 'enlightenment',
    cluster: 'freemasonry',
    summary:
      'The metropolis whose clubs and sociable spaces incubated Grand Lodge Freemasonry — and, a century and a half later, the orders and presses of the occult revival.',
    claims: [
      {
        text: 'Coffee-house and alehouse sociability made London the seedbed of Grand Lodge Freemasonry and, later, of the occult revival’s orders and publishing houses.',
        evidence: 'documented',
        sources: ['stevenson-1988', 'godwin-1994'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'freemasonry' },
      { kind: 'associated-with', target: 'golden-dawn' },
    ],
    tags: ['city', 'sociability', 'england'],
  },
  {
    id: 'regius-poem',
    type: 'work',
    name: 'The Regius Poem',
    epithet: 'The oldest charge, in fourteenth-century verse',
    dates: 'c. 1425–1450',
    year: 1430,
    era: 'medieval',
    cluster: 'freemasonry',
    summary:
      'The earliest known document of the masonic tradition: a Middle English poem of the craft’s legendary history and moral charges, from Euclid and Athelstan to table manners.',
    claims: [
      {
        text: 'The Regius manuscript (British Library MS Royal 17 A I), dated to the second quarter of the fifteenth century, is the oldest of the Old Charges.',
        evidence: 'documented',
        sources: ['stevenson-1988', 'bogdan-snoek-2014'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'old-charges' },
      { kind: 'associated-with', target: 'freemasonry' },
    ],
    tags: ['manuscript', 'verse', 'charges'],
  },
  {
    id: 'old-charges',
    type: 'work',
    name: 'The Old Charges',
    epithet: 'The craft’s legendary history, copied for centuries',
    dates: 'c. 1425–1700s',
    year: 1450,
    era: 'medieval',
    cluster: 'freemasonry',
    summary:
      'The family of over a hundred manuscripts — Regius, Cooke, and their descendants — reciting the mythical history of masonry and the duties of masons, read at makings for three centuries.',
    claims: [
      {
        text: 'More than a hundred Old Charges survive, tracing the craft legend from the liberal sciences through Solomon’s Temple to England.',
        evidence: 'documented',
        sources: ['stevenson-1988', 'bogdan-snoek-2014'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'freemasonry' },
      { kind: 'influenced', target: 'andersons-constitutions' },
    ],
    tags: ['manuscripts', 'legend', 'duties'],
  },
  {
    id: 'william-schaw',
    type: 'person',
    name: 'William Schaw',
    epithet: 'The king’s master of works who organized the lodges',
    dates: 'c. 1550–1602',
    year: 1598,
    era: 'renaissance',
    cluster: 'freemasonry',
    summary:
      'Master of Works to James VI of Scotland, whose statutes of 1598–99 organized Scottish lodges as standing institutions — and required masons to practice the art of memory.',
    claims: [
      {
        text: 'Stevenson argued the Schaw Statutes mark the institutional beginning of lodge masonry, decades before the London Grand Lodge.',
        evidence: 'scholarship',
        sources: ['stevenson-1988'],
      },
      {
        text: 'The second Schaw Statute enjoins testing masons in “the art of memorie” — a Renaissance discipline inside the craft.',
        evidence: 'documented',
        sources: ['stevenson-1988'],
      },
    ],
    relations: [
      { kind: 'wrote', target: 'schaw-statutes' },
      { kind: 'associated-with', target: 'freemasonry' },
    ],
    tags: ['scotland', 'statutes', 'memory'],
  },
  {
    id: 'schaw-statutes',
    type: 'event',
    name: 'The Schaw Statutes',
    epithet: 'Scotland writes the lodges into law',
    dates: '1598–1599',
    year: 1598,
    era: 'renaissance',
    cluster: 'freemasonry',
    summary:
      'The regulations issued by William Schaw to the masons of Scotland: lodges with wardens, records, and tests — the earliest documented framework of organized freemasonry.',
    claims: [
      {
        text: 'The statutes of 1598 and 1599 regulate lodge organization, apprenticeship, and discipline, and are preserved in lodge archives.',
        evidence: 'documented',
        sources: ['stevenson-1988'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'william-schaw' },
      { kind: 'associated-with', target: 'lodge-of-edinburgh' },
    ],
    tags: ['1598', 'regulation', 'scotland'],
  },
  {
    id: 'lodge-of-edinburgh',
    type: 'organization',
    name: 'The Lodge of Edinburgh (Mary’s Chapel)',
    epithet: 'The lodge with the oldest minutes in the world',
    dates: 'minutes from 1599',
    year: 1599,
    era: 'renaissance',
    cluster: 'freemasonry',
    summary:
      'Edinburgh’s ancient lodge, whose minute-book from 1599 is the oldest continuous lodge record — including the 1634 admission of gentlemen who never cut stone.',
    claims: [
      {
        text: 'The Lodge of Edinburgh’s minutes begin in 1599; it admitted non-operative members such as Lord Alexander in 1634.',
        evidence: 'documented',
        sources: ['stevenson-1988'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'freemasonry' },
      { kind: 'associated-with', target: 'speculative-masonry' },
    ],
    tags: ['edinburgh', 'minutes', '1599'],
  },
  {
    id: 'speculative-masonry',
    type: 'concept',
    name: 'Speculative Masonry',
    epithet: 'From the mason’s yard to the moral temple',
    dates: '17th–18th c. transition',
    year: 1700,
    era: 'early-modern',
    cluster: 'freemasonry',
    summary:
      'The transformation by which working masons’ lodges filled with “accepted” gentlemen who worked in symbol only — the craft’s tools re-read as instruments of the soul.',
    claims: [
      {
        text: 'Lodges in Scotland and England admitted non-operatives through the seventeenth century — Ashmole in 1646 among the earliest recorded in England — until symbolic masonry predominated.',
        evidence: 'documented',
        sources: ['stevenson-1988', 'ashmole-josten'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'freemasonry' },
      { kind: 'associated-with', target: 'elias-ashmole' },
    ],
    tags: ['accepted', 'symbol', 'transition'],
  },
  {
    id: 'james-anderson',
    type: 'person',
    name: 'James Anderson',
    epithet: 'The minister who rewrote the craft’s history',
    dates: 'c. 1679–1739',
    year: 1723,
    era: 'enlightenment',
    cluster: 'freemasonry',
    summary:
      'The Scottish Presbyterian minister in London commissioned to digest the Old Charges — producing the 1723 Constitutions whose grand legendary history became the craft’s official past.',
    claims: [
      {
        text: 'Anderson compiled the 1723 Constitutions and its enlarged 1738 edition, recasting the craft legend from Adam onward.',
        evidence: 'documented',
        sources: ['anderson-1723', 'bogdan-snoek-2014'],
      },
    ],
    relations: [
      { kind: 'wrote', target: 'andersons-constitutions' },
      { kind: 'associated-with', target: 'grand-lodge-founding' },
    ],
    tags: ['1723', 'minister', 'history'],
  },
  {
    id: 'jean-theophile-desaguliers',
    type: 'person',
    name: 'Jean-Théophile Desaguliers',
    epithet: 'Newton’s demonstrator, the grand lodge’s architect',
    dates: '1683–1744',
    year: 1719,
    era: 'enlightenment',
    cluster: 'freemasonry',
    summary:
      'Huguenot refugee, Newtonian lecturer, and third Grand Master — the organizing intelligence who tied the young Grand Lodge to the Royal Society’s world.',
    claims: [
      {
        text: 'Desaguliers, curator of experiments for the Royal Society, served as Grand Master in 1719 and shaped the Constitutions project.',
        evidence: 'documented',
        sources: ['jacob-1991', 'bogdan-snoek-2014'],
      },
      {
        text: 'Jacob reads early Grand Lodge masonry as a carrier of Newtonian Enlightenment sociability.',
        evidence: 'scholarship',
        sources: ['jacob-1991'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'grand-lodge-founding' },
      { kind: 'collaborated-with', target: 'james-anderson' },
    ],
    tags: ['newtonian', 'royal society', 'grand master'],
  },
  {
    id: 'anthony-sayer',
    type: 'person',
    name: 'Anthony Sayer',
    epithet: 'The first grand master, otherwise obscure',
    dates: 'c. 1672–1741',
    year: 1717,
    era: 'enlightenment',
    cluster: 'freemasonry',
    summary:
      'The gentleman elected first Grand Master at the Goose and Gridiron alehouse in 1717 — a man of modest means who later petitioned the charity he had helped found.',
    claims: [
      {
        text: 'Anderson’s 1738 account names Sayer first Grand Master of the 1717 Grand Lodge; records show him later receiving masonic charity.',
        evidence: 'tradition',
        sources: ['anderson-1723', 'bogdan-snoek-2014'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'grand-lodge-founding' },
      { kind: 'member-of', target: 'freemasonry' },
    ],
    tags: ['1717', 'first'],
  },
  {
    id: 'antients-grand-lodge',
    type: 'organization',
    name: 'The Antients Grand Lodge',
    epithet: 'The rival lodge that called the founders modern',
    dates: '1751–1813',
    year: 1751,
    era: 'enlightenment',
    cluster: 'freemasonry',
    summary:
      'The breakaway grand lodge of 1751 — largely Irish artisans in London — that branded the older body “Moderns”, championed the Royal Arch, and forced the union of 1813.',
    claims: [
      {
        text: 'The Antients organized in 1751 under Dermott’s guidance, claiming older usages including the Royal Arch, until union created the UGLE in 1813.',
        evidence: 'documented',
        sources: ['bogdan-snoek-2014', 'dermott-1756'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'laurence-dermott' },
      { kind: 'part-of', target: 'freemasonry' },
    ],
    tags: ['1751', 'rivalry', 'royal arch'],
  },
  {
    id: 'laurence-dermott',
    type: 'person',
    name: 'Laurence Dermott',
    epithet: 'The painter’s son who out-organized the establishment',
    dates: '1720–1791',
    year: 1756,
    era: 'enlightenment',
    cluster: 'freemasonry',
    summary:
      'Irish journeyman painter turned wine merchant, the Antients’ brilliant Grand Secretary, whose Ahiman Rezon and sharp pen made the rebels the larger body.',
    claims: [
      {
        text: 'Dermott served as the Antients’ Grand Secretary from 1752 and published their constitutions, Ahiman Rezon, in 1756.',
        evidence: 'documented',
        sources: ['dermott-1756'],
      },
    ],
    relations: [
      { kind: 'wrote', target: 'ahiman-rezon' },
      { kind: 'member-of', target: 'antients-grand-lodge' },
    ],
    tags: ['ireland', 'secretary'],
  },
  {
    id: 'ahiman-rezon',
    type: 'work',
    name: 'Ahiman Rezon',
    epithet: 'The Antients’ book of the law, with teeth',
    dates: '1756',
    year: 1756,
    era: 'enlightenment',
    cluster: 'freemasonry',
    summary:
      'Dermott’s constitutions for the Antients — part law-book, part satire on the Moderns — carried by their lodges through the empire and into American grand lodges.',
    claims: [
      {
        text: 'Ahiman Rezon served as the Antients’ constitution from 1756 and was adopted, in local editions, by several American grand lodges.',
        evidence: 'documented',
        sources: ['dermott-1756', 'bogdan-snoek-2014'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'laurence-dermott' },
      { kind: 'associated-with', target: 'andersons-constitutions', note: 'its rival and parody' },
    ],
    tags: ['constitutions', '1756'],
  },
  {
    id: 'united-grand-lodge',
    type: 'organization',
    name: 'The United Grand Lodge of England',
    epithet: 'Two rivals joined under royal brothers',
    dates: 'union of 1813',
    year: 1813,
    era: 'nineteenth',
    cluster: 'freemasonry',
    summary:
      'The 1813 union of Moderns and Antients under the royal dukes Sussex and Kent — standardized ritual, one constitution, and the mother grand lodge of world masonry since.',
    claims: [
      {
        text: 'The Articles of Union of 1813 merged the rival grand lodges, with the Lodge of Reconciliation settling standard ritual thereafter.',
        evidence: 'documented',
        sources: ['bogdan-snoek-2014'],
      },
    ],
    relations: [
      { kind: 'derived-from', target: 'grand-lodge-founding' },
      { kind: 'located-in', target: 'london' },
    ],
    tags: ['1813', 'union'],
  },
  {
    id: 'william-preston',
    type: 'person',
    name: 'William Preston',
    epithet: 'The lecturer who polished the ritual to a shine',
    dates: '1742–1818',
    year: 1772,
    era: 'enlightenment',
    cluster: 'freemasonry',
    summary:
      'The Edinburgh-born printer whose Illustrations of Masonry and system of lectures gave English-speaking masonry its eloquent, pedagogical voice.',
    claims: [
      {
        text: 'Preston’s Illustrations of Masonry (1772) went through many editions; his lecture system underlies the Preston-Webb ritual tradition of American lodges.',
        evidence: 'documented',
        sources: ['preston-1772', 'bogdan-snoek-2014'],
      },
    ],
    relations: [
      { kind: 'wrote', target: 'illustrations-of-masonry' },
      { kind: 'member-of', target: 'freemasonry' },
    ],
    tags: ['lectures', 'printer'],
  },
  {
    id: 'illustrations-of-masonry',
    type: 'work',
    name: 'Illustrations of Masonry',
    epithet: 'The craft explained to itself, beautifully',
    dates: '1772',
    year: 1772,
    era: 'enlightenment',
    cluster: 'freemasonry',
    summary:
      'Preston’s manual of masonic knowledge and eloquence — history, charges, and the moralized lectures that trained generations of lodge orators.',
    claims: [
      {
        text: 'First published 1772 and repeatedly enlarged, the Illustrations codified lecture and ceremony for the English craft.',
        evidence: 'documented',
        sources: ['preston-1772'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'william-preston' },
      { kind: 'part-of', target: 'freemasonry' },
    ],
    tags: ['manual', '1772'],
  },
  {
    id: 'chevalier-ramsay',
    type: 'person',
    name: 'The Chevalier Ramsay',
    epithet: 'The orator who gave masonry a crusader past',
    dates: '1686–1743',
    year: 1737,
    era: 'enlightenment',
    cluster: 'freemasonry',
    summary:
      'The Scottish-French man of letters whose 1737 Paris oration traced masonry to the crusading knights — the spark from which the high degrees and “Scottish” rites blazed up.',
    claims: [
      {
        text: 'Ramsay’s Discours (1736/37) claimed masonic origins among crusader knights in the Holy Land; the theme fed the proliferation of chivalric degrees.',
        evidence: 'documented',
        sources: ['bogdan-snoek-2014', 'mcintosh-1997'],
      },
    ],
    relations: [
      { kind: 'wrote', target: 'ramsays-oration' },
      { kind: 'influenced', target: 'scottish-rite' },
    ],
    tags: ['oration', 'crusaders', 'paris'],
  },
  {
    id: 'ramsays-oration',
    type: 'work',
    name: 'Ramsay’s Oration',
    epithet: 'The speech that begat a hundred degrees',
    dates: '1737',
    year: 1737,
    era: 'enlightenment',
    cluster: 'freemasonry',
    summary:
      'The address to French masons that replaced stonemasons with crusader-knights in the craft’s imagined ancestry — chivalry entering masonry through eloquence.',
    claims: [
      {
        text: 'The oration circulated widely in France; historians link the subsequent invention of chivalric high degrees to its themes.',
        evidence: 'scholarship',
        sources: ['bogdan-snoek-2014'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'chevalier-ramsay' },
      { kind: 'influenced', target: 'strict-observance' },
    ],
    tags: ['1737', 'chivalry'],
  },
  {
    id: 'scottish-rite',
    type: 'organization',
    name: 'The Scottish Rite',
    epithet: 'Thirty-three degrees rising from a French root',
    dates: 'Charleston 1801',
    year: 1801,
    era: 'nineteenth',
    cluster: 'freemasonry',
    summary:
      'The Ancient and Accepted Scottish Rite: French high-degree masonry consolidated at Charleston in 1801 into thirty-three degrees — Pike’s empire of moral instruction.',
    claims: [
      {
        text: 'The first Supreme Council, 33°, organized at Charleston in 1801 from the French Order of the Royal Secret.',
        evidence: 'documented',
        sources: ['bogdan-snoek-2014'],
      },
    ],
    relations: [
      { kind: 'derived-from', target: 'ramsays-oration', note: 'through the French high degrees' },
      { kind: 'associated-with', target: 'albert-pike' },
    ],
    tags: ['charleston', '33 degrees'],
  },
  {
    id: 'albert-pike',
    type: 'person',
    name: 'Albert Pike',
    epithet: 'The frontier lawyer who rebuilt the rite',
    dates: '1809–1891',
    year: 1871,
    era: 'nineteenth',
    cluster: 'freemasonry',
    summary:
      'Poet, lawyer, Confederate general, and for thirty years Sovereign Grand Commander — the man who rewrote the Scottish Rite’s rituals and gave it Morals and Dogma.',
    claims: [
      {
        text: 'Pike led the Southern Jurisdiction from 1859 to 1891, rewriting its degrees and publishing Morals and Dogma in 1871.',
        evidence: 'documented',
        sources: ['pike-1871', 'bogdan-snoek-2014'],
      },
    ],
    relations: [
      { kind: 'wrote', target: 'morals-and-dogma' },
      { kind: 'member-of', target: 'scottish-rite' },
    ],
    tags: ['commander', 'ritualist'],
  },
  {
    id: 'morals-and-dogma',
    type: 'work',
    name: 'Morals and Dogma',
    epithet: 'A degree-by-degree philosophy, borrowed boldly',
    dates: '1871',
    year: 1871,
    era: 'nineteenth',
    cluster: 'freemasonry',
    summary:
      'Pike’s huge companion to the Scottish Rite degrees — a synthesis of world religions and esoteric lore, leaning heavily and silently on Éliphas Lévi.',
    claims: [
      {
        text: 'Morals and Dogma (1871) expounds the rite’s thirty-two degrees; substantial passages adapt Lévi’s writings without attribution.',
        evidence: 'scholarship',
        sources: ['pike-1871', 'godwin-1994'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'albert-pike' },
      { kind: 'derived-from', target: 'dogme-et-rituel' },
    ],
    tags: ['1871', 'degrees', 'lévi'],
  },
  {
    id: 'albert-mackey',
    type: 'person',
    name: 'Albert G. Mackey',
    epithet: 'The doctor who encyclopaedized the craft',
    dates: '1807–1881',
    year: 1873,
    era: 'nineteenth',
    cluster: 'freemasonry',
    summary:
      'Charleston physician and tireless masonic scholar: his encyclopaedia and jurisprudence — including the twenty-five “landmarks” — furnished the craft’s reference shelf.',
    claims: [
      {
        text: 'Mackey published his Encyclopaedia of Freemasonry in 1873 and formulated an influential list of ancient landmarks in 1858.',
        evidence: 'documented',
        sources: ['mackey-1873'],
      },
    ],
    relations: [
      { kind: 'member-of', target: 'scottish-rite' },
      { kind: 'associated-with', target: 'albert-pike' },
    ],
    tags: ['encyclopaedia', 'landmarks'],
  },
  {
    id: 'royal-arch',
    type: 'concept',
    name: 'The Royal Arch',
    epithet: 'The word recovered from the vault',
    dates: 'attested from 1743',
    year: 1750,
    era: 'enlightenment',
    cluster: 'freemasonry',
    summary:
      'The degree of the recovered word: beneath the temple’s ruins a vault yields what was lost — masonry’s own sequel to the Hiramic tragedy, and the Antients’ banner.',
    claims: [
      {
        text: 'The Royal Arch is first firmly attested in the 1740s; the Antients treated it as the completion of the Master’s degree.',
        evidence: 'documented',
        sources: ['bogdan-snoek-2014'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'freemasonry' },
      { kind: 'associated-with', target: 'antients-grand-lodge' },
    ],
    tags: ['vault', 'degree', 'word'],
  },
  {
    id: 'grand-orient-de-france',
    type: 'organization',
    name: 'The Grand Orient de France',
    epithet: 'The continental path, parted from London',
    dates: 'from 1773',
    year: 1773,
    era: 'enlightenment',
    cluster: 'freemasonry',
    summary:
      'France’s great masonic obedience, reorganized in 1773 — engine of Enlightenment sociability, and after 1877, when it dropped the Great Architect requirement, the pole of “irregular” masonry.',
    claims: [
      {
        text: 'The Grand Orient assumed its modern form in 1773; its 1877 removal of the requirement of belief in God led Anglo-American grand lodges to withdraw recognition.',
        evidence: 'documented',
        sources: ['bogdan-snoek-2014', 'jacob-1991'],
      },
    ],
    relations: [
      { kind: 'part-of', target: 'freemasonry' },
      { kind: 'associated-with', target: 'grand-lodge-founding' },
    ],
    tags: ['france', '1877', 'obedience'],
  },
  {
    id: 'prince-hall',
    type: 'person',
    name: 'Prince Hall',
    epithet: 'Founder of the lodge that would not be denied',
    dates: 'c. 1735–1807',
    year: 1784,
    era: 'enlightenment',
    cluster: 'freemasonry',
    summary:
      'The free Black Bostonian — leatherworker, abolitionist petitioner — initiated in a British military lodge in 1775, who won African Lodge No. 459 its English charter.',
    claims: [
      {
        text: 'Hall and fourteen others were initiated in 1775 by a lodge attached to a British regiment; African Lodge No. 459 received its Grand Lodge of England charter in 1784.',
        evidence: 'documented',
        sources: ['bogdan-snoek-2014'],
      },
      {
        text: 'Hall petitioned the Massachusetts legislature against slavery and for schools for Black children.',
        evidence: 'documented',
        sources: ['bogdan-snoek-2014'],
      },
    ],
    relations: [
      { kind: 'founded', target: 'prince-hall-freemasonry' },
      { kind: 'member-of', target: 'freemasonry' },
    ],
    tags: ['boston', 'abolition', '459'],
  },
  {
    id: 'prince-hall-freemasonry',
    type: 'organization',
    name: 'Prince Hall Freemasonry',
    epithet: 'The parallel craft of Black America',
    dates: 'from 1784',
    year: 1808,
    era: 'nineteenth',
    cluster: 'freemasonry',
    summary:
      'The masonic tradition descending from African Lodge No. 459 — denied recognition for two centuries, it built its own grand lodges and a backbone of Black civic life.',
    claims: [
      {
        text: 'From African Lodge grew independent Black grand lodges across the United States; mutual recognition with mainstream grand lodges advanced only from the 1990s.',
        evidence: 'documented',
        sources: ['bogdan-snoek-2014'],
      },
    ],
    relations: [
      { kind: 'derived-from', target: 'prince-hall' },
      { kind: 'part-of', target: 'freemasonry' },
    ],
    tags: ['african lodge', 'recognition'],
  },
  {
    id: 'benjamin-franklin',
    type: 'person',
    name: 'Benjamin Franklin',
    epithet: 'Printer of the craft’s first American book',
    dates: '1706–1790',
    year: 1734,
    era: 'enlightenment',
    cluster: 'freemasonry',
    summary:
      'Philadelphia’s philosopher-printer, Grand Master of Pennsylvania, who reprinted Anderson’s Constitutions in 1734 — the first masonic book in America — and later sat in Paris’ Nine Sisters lodge.',
    claims: [
      {
        text: 'Franklin printed the Constitutions in 1734 as Grand Master of Pennsylvania and assisted at Voltaire’s initiation in the Loge des Neuf Sœurs in 1778.',
        evidence: 'documented',
        sources: ['bogdan-snoek-2014', 'jacob-1991'],
      },
    ],
    relations: [
      { kind: 'member-of', target: 'freemasonry' },
      { kind: 'associated-with', target: 'andersons-constitutions' },
    ],
    tags: ['philadelphia', 'printer', 'nine sisters'],
  },
  {
    id: 'george-washington',
    type: 'person',
    name: 'George Washington',
    epithet: 'The first president, sworn on a lodge Bible',
    dates: '1732–1799',
    year: 1793,
    era: 'enlightenment',
    cluster: 'freemasonry',
    summary:
      'Initiated at Fredericksburg in 1752, the first president took his oath on a lodge’s Bible and laid the Capitol cornerstone in masonic regalia — the craft stitched into the republic’s founding fabric.',
    claims: [
      {
        text: 'Washington was initiated in 1752; he laid the U.S. Capitol cornerstone with masonic ceremony in 1793.',
        evidence: 'documented',
        sources: ['bogdan-snoek-2014'],
      },
    ],
    relations: [
      { kind: 'member-of', target: 'freemasonry' },
      { kind: 'associated-with', target: 'george-washington-cornerstone' },
    ],
    tags: ['virginia', 'capitol', '1752'],
  },
  {
    id: 'george-washington-cornerstone',
    type: 'event',
    name: 'The Capitol Cornerstone Ceremony',
    epithet: 'The republic founded with square and level',
    dates: '18 September 1793',
    year: 1793,
    era: 'enlightenment',
    cluster: 'freemasonry',
    summary:
      'Washington, in apron, laying the Capitol’s cornerstone with corn, wine, and oil — the most public image of masonry’s presence at the American founding.',
    claims: [
      {
        text: 'The ceremony of 18 September 1793 was conducted with masonic rites by lodges of Maryland and Virginia with Washington presiding.',
        evidence: 'documented',
        sources: ['bogdan-snoek-2014'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'george-washington' },
      { kind: 'associated-with', target: 'freemasonry' },
    ],
    tags: ['1793', 'capitol', 'ritual'],
  },
  {
    id: 'mozart',
    type: 'person',
    name: 'Wolfgang Amadeus Mozart',
    epithet: 'The brother who set the temple to music',
    dates: '1756–1791',
    year: 1791,
    era: 'enlightenment',
    cluster: 'freemasonry',
    summary:
      'Initiated in Vienna in 1784, Mozart wrote music for lodge ceremonies and, in The Magic Flute, gave masonic initiation its immortal stage.',
    claims: [
      {
        text: 'Mozart joined the Viennese lodge Zur Wohltätigkeit in 1784 and composed masonic funeral music and cantatas for lodge use.',
        evidence: 'documented',
        sources: ['bogdan-snoek-2014'],
      },
    ],
    relations: [
      { kind: 'wrote', target: 'magic-flute' },
      { kind: 'member-of', target: 'freemasonry' },
    ],
    tags: ['vienna', '1784', 'music'],
  },
  {
    id: 'magic-flute',
    type: 'work',
    name: 'The Magic Flute',
    epithet: 'Initiation sung for all the world to see',
    dates: '1791',
    year: 1791,
    era: 'enlightenment',
    cluster: 'freemasonry',
    summary:
      'Mozart and Schikaneder’s opera of trials by silence, fire, and water in Sarastro’s temple of wisdom — masonic initiation transposed into fairy-tale and immortal music.',
    claims: [
      {
        text: 'The Magic Flute premiered in Vienna in September 1791; its temple scenes, trials, and symbolism have long been read as masonic.',
        evidence: 'scholarship',
        sources: ['bogdan-snoek-2014'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'mozart' },
      { kind: 'associated-with', target: 'freemasonry' },
    ],
    tags: ['opera', '1791', 'trials'],
  },
  {
    id: 'cagliostro',
    type: 'person',
    name: 'Count Cagliostro',
    epithet: 'The magus of the Egyptian lodges, dead in a papal cell',
    dates: '1743–1795',
    year: 1785,
    era: 'enlightenment',
    cluster: 'freemasonry',
    summary:
      'Giuseppe Balsamo of Palermo — healer, seer, founder of Egyptian-rite masonry, ruined by the Diamond Necklace affair and condemned by the Inquisition to die in the fortress of San Leo.',
    claims: [
      {
        text: 'Cagliostro founded an “Egyptian” masonic rite admitting women; arrested in Rome in 1789, he died imprisoned at San Leo in 1795.',
        evidence: 'documented',
        sources: ['mcintosh-1997', 'goodrick-clarke-2008'],
      },
      {
        text: 'His identification with the Sicilian adventurer Giuseppe Balsamo, asserted at his trial, has been questioned but remains standard.',
        evidence: 'scholarship',
        sources: ['goodrick-clarke-2008'],
      },
    ],
    relations: [
      { kind: 'founded', target: 'egyptian-rite' },
      { kind: 'member-of', target: 'freemasonry' },
    ],
    tags: ['egyptian rite', 'san leo', 'necklace affair'],
  },
  {
    id: 'egyptian-rite',
    type: 'organization',
    name: 'The Egyptian Rite',
    epithet: 'Masonry robed in the mysteries of the Nile',
    dates: 'from 1784',
    year: 1784,
    era: 'enlightenment',
    cluster: 'freemasonry',
    summary:
      'Cagliostro’s rite of masonic regeneration under Egyptian trappings, with lodges for women under the Queen of Sheba’s name — the exotic high-water of Enlightenment occult masonry.',
    claims: [
      {
        text: 'The Egyptian Rite practiced ceremonies of moral and physical regeneration and uniquely admitted women in parallel lodges.',
        evidence: 'documented',
        sources: ['mcintosh-1997'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'cagliostro' },
      { kind: 'part-of', target: 'freemasonry' },
    ],
    tags: ['egypt', 'women', 'regeneration'],
  },
  {
    id: 'count-saint-germain',
    type: 'person',
    name: 'The Count of Saint-Germain',
    epithet: 'The man who claimed to remember everything',
    dates: 'd. 1784 (per record)',
    year: 1760,
    era: 'enlightenment',
    cluster: 'freemasonry',
    summary:
      'The polyglot adventurer of the European courts — chemist, violinist, diplomat of mysterious means — around whom gathered the legend of deathless age, and later, theosophical apotheosis.',
    claims: [
      {
        text: 'Saint-Germain served Louis XV in secret diplomacy and died at Eckernförde in 1784 by church record.',
        evidence: 'documented',
        sources: ['goodrick-clarke-2008'],
      },
      {
        text: 'Stories of his agelessness and immortality are legend, embellished after his death and adopted by Theosophy.',
        evidence: 'legend',
        sources: ['godwin-1994'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'freemasonry' },
      { kind: 'influenced', target: 'theosophical-society', note: 'as an ascended master of later legend' },
    ],
    tags: ['adventurer', 'immortality', 'courts'],
  },
  {
    id: 'strict-observance',
    type: 'organization',
    name: 'The Rite of Strict Observance',
    epithet: 'Masonry kneeling to unknown superiors',
    dates: '1751–1782',
    year: 1764,
    era: 'enlightenment',
    cluster: 'freemasonry',
    summary:
      'Von Hund’s German templar rite, sworn to invisible “Unknown Superiors” and the Templar succession — dominant for a generation, dissolved at Wilhelmsbad when the superiors never appeared.',
    claims: [
      {
        text: 'The Strict Observance claimed descent from the Knights Templar under Unknown Superiors; the Convent of Wilhelmsbad (1782) abandoned the Templar claim.',
        evidence: 'documented',
        sources: ['mcintosh-1997', 'bogdan-snoek-2014'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'karl-von-hund' },
      { kind: 'derived-from', target: 'ramsays-oration', note: 'chivalric masonry systematized' },
    ],
    tags: ['templars', 'wilhelmsbad', 'germany'],
  },
  {
    id: 'karl-von-hund',
    type: 'person',
    name: 'Karl Gotthelf von Hund',
    epithet: 'The baron who waited for orders that never came',
    dates: '1722–1776',
    year: 1751,
    era: 'enlightenment',
    cluster: 'freemasonry',
    summary:
      'The Saxon baron who built the Strict Observance on his account of a Templar initiation in Paris — dying with his Unknown Superiors still silent.',
    claims: [
      {
        text: 'Von Hund reported being received into a Templar order c. 1743 by unnamed superiors; no evidence of them ever surfaced.',
        evidence: 'primary',
        sources: ['mcintosh-1997'],
      },
    ],
    relations: [
      { kind: 'founded', target: 'strict-observance' },
      { kind: 'member-of', target: 'freemasonry' },
    ],
    tags: ['saxony', 'templar claim'],
  },
  {
    id: 'illuminati',
    type: 'organization',
    name: 'The Bavarian Illuminati',
    epithet: 'The order the conspiracies never let die',
    dates: '1776–1787',
    year: 1776,
    era: 'enlightenment',
    cluster: 'freemasonry',
    summary:
      'Weishaupt’s radical-Enlightenment secret society, recruiting through masonic lodges until Bavaria banned it — eleven years of existence, two centuries of imagined omnipotence.',
    claims: [
      {
        text: 'Founded 1 May 1776 at Ingolstadt and suppressed by Bavarian edicts of 1784–87, the order infiltrated lodges to advance rationalist reform.',
        evidence: 'documented',
        sources: ['bogdan-snoek-2014', 'goodrick-clarke-2008'],
      },
      {
        text: 'Claims of the order’s survival and world-direction, from Robison and Barruel onward, are conspiracy literature.',
        evidence: 'speculation',
        sources: ['goodrick-clarke-2008'],
      },
    ],
    relations: [
      { kind: 'attributed-to', target: 'adam-weishaupt' },
      { kind: 'associated-with', target: 'freemasonry' },
    ],
    tags: ['ingolstadt', '1776', 'suppression'],
  },
  {
    id: 'adam-weishaupt',
    type: 'person',
    name: 'Adam Weishaupt',
    epithet: 'The professor who built a machine of minds',
    dates: '1748–1830',
    year: 1776,
    era: 'enlightenment',
    cluster: 'freemasonry',
    summary:
      'Canon-law professor at Ingolstadt, founder of the Illuminati as “Spartacus” — exiled to Gotha when Bavaria broke his order, to write apologias the conspiracists never read.',
    claims: [
      {
        text: 'Weishaupt founded the order in 1776 and directed its graded system of surveillance and instruction until his flight in 1785.',
        evidence: 'documented',
        sources: ['bogdan-snoek-2014'],
      },
    ],
    relations: [
      { kind: 'founded', target: 'illuminati' },
      { kind: 'member-of', target: 'freemasonry' },
    ],
    tags: ['ingolstadt', 'spartacus'],
  },
  {
    id: 'sria',
    type: 'organization',
    name: 'Societas Rosicruciana in Anglia',
    epithet: 'Masons studying the rose-cross by candlelight',
    dates: 'from 1867',
    year: 1867,
    era: 'nineteenth',
    cluster: 'freemasonry',
    summary:
      'The masonic Rosicrucian study society of Victorian London — grades from the Gold- und Rosenkreuz, papers on Kabbalah and alchemy, and the seedbed of the Golden Dawn.',
    claims: [
      {
        text: 'The SRIA, organized by Robert Wentworth Little in 1867 with Kenneth Mackenzie’s assistance, admitted master masons to a nine-grade Rosicrucian system; Westcott and Mathers led its colleges.',
        evidence: 'documented',
        sources: ['howe-1972', 'mcintosh-1997'],
      },
    ],
    relations: [
      { kind: 'derived-from', target: 'gold-und-rosenkreuz' },
      { kind: 'influenced', target: 'golden-dawn' },
      { kind: 'part-of', target: 'freemasonry' },
    ],
    tags: ['1867', 'study society', 'grades'],
  },
  {
    id: 'hiram-abiff',
    type: 'person',
    name: 'Hiram Abiff',
    epithet: 'The widow’s son, slain for the word',
    dates: 'legendary',
    year: -950,
    era: 'antiquity',
    cluster: 'freemasonry',
    summary:
      'The master builder of Solomon’s Temple in masonic legend, murdered by three fellows for the Master’s word — the drama every Master Mason enacts.',
    claims: [
      {
        text: 'The Hiramic legend, dramatized in the third degree, is attested from the 1720s; Prichard’s 1730 exposure prints an early version.',
        evidence: 'documented',
        sources: ['bogdan-snoek-2014'],
      },
      {
        text: 'The biblical Hiram is a Tyrian craftsman in Kings and Chronicles; the murder narrative is masonic legend.',
        evidence: 'legend',
        sources: ['bogdan-snoek-2014'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'temple-of-solomon' },
      { kind: 'symbol-of', target: 'freemasonry' },
    ],
    tags: ['third degree', 'legend', 'builder'],
  },
  {
    id: 'temple-of-solomon',
    type: 'place',
    name: 'The Temple of Solomon',
    epithet: 'The building every lodge rebuilds',
    dates: 'biblical; masonic symbol',
    year: -950,
    era: 'antiquity',
    cluster: 'freemasonry',
    summary:
      'The Jerusalem temple of the craft legend: quarry of its offices, pillars, and passwords — every lodge room a symbolic ground-plan of its courts.',
    claims: [
      {
        text: 'Masonic ritual sets its degrees at the building of Solomon’s Temple, with the pillars Jachin and Boaz at its porch.',
        evidence: 'tradition',
        sources: ['bogdan-snoek-2014', 'mackey-1873'],
      },
    ],
    relations: [
      { kind: 'symbol-of', target: 'freemasonry' },
      { kind: 'associated-with', target: 'hiram-abiff' },
    ],
    tags: ['jerusalem', 'pillars', 'symbol'],
  },
  {
    id: 'all-seeing-eye',
    type: 'symbol',
    name: 'The All-Seeing Eye',
    epithet: 'Providence watching from the lodge ceiling',
    dates: '18th c. in masonic use',
    year: 1797,
    era: 'enlightenment',
    cluster: 'freemasonry',
    summary:
      'The eye of divine watchfulness — an old emblem of Providence adopted by the lodges, and, on the U.S. Great Seal, forever mistaken for their signature.',
    claims: [
      {
        text: 'The eye appears in masonic iconography by the later eighteenth century as an emblem of the all-observing deity.',
        evidence: 'documented',
        sources: ['mackey-1873', 'bogdan-snoek-2014'],
      },
      {
        text: 'Its presence on the Great Seal (designed 1782) is not of masonic origin, though popular belief insists otherwise.',
        evidence: 'scholarship',
        sources: ['bogdan-snoek-2014'],
      },
    ],
    relations: [
      { kind: 'symbol-of', target: 'freemasonry' },
      { kind: 'associated-with', target: 'square-and-compasses' },
    ],
    tags: ['providence', 'great seal'],
  },
  {
    id: 'masonic-apron',
    type: 'symbol',
    name: 'The Masonic Apron',
    epithet: 'The workman’s leather, whitened into honour',
    dates: 'operative to speculative',
    year: 1717,
    era: 'enlightenment',
    cluster: 'freemasonry',
    summary:
      'The stonemason’s protective skin transfigured: white lambskin presented at initiation as “more ancient than the Golden Fleece”, badge of innocence and labor.',
    claims: [
      {
        text: 'The apron passed from operative equipment to the first symbolic gift of initiation, its investiture ritualized in the eighteenth century.',
        evidence: 'tradition',
        sources: ['mackey-1873', 'bogdan-snoek-2014'],
      },
    ],
    relations: [
      { kind: 'symbol-of', target: 'freemasonry' },
      { kind: 'associated-with', target: 'speculative-masonry' },
    ],
    tags: ['lambskin', 'initiation'],
  },
  {
    id: 'tracing-board',
    type: 'symbol',
    name: 'The Tracing Board',
    epithet: 'The lodge’s lessons, painted on one board',
    dates: 'from c. 1800 in painted form',
    year: 1820,
    era: 'nineteenth',
    cluster: 'freemasonry',
    summary:
      'The emblematic paintings — one per degree — on which the lodge’s symbols are gathered and explained: floor-drawings of chalk hardened into folk-art icons.',
    claims: [
      {
        text: 'Tracing boards evolved from chalked floor-drawings erased after each meeting into painted boards; John Harris’ nineteenth-century designs became standard in England.',
        evidence: 'documented',
        sources: ['bogdan-snoek-2014'],
      },
    ],
    relations: [
      { kind: 'symbol-of', target: 'freemasonry' },
      { kind: 'associated-with', target: 'temple-of-solomon' },
    ],
    tags: ['painting', 'degrees', 'emblems'],
  },
  {
    id: 'morgan-affair',
    type: 'event',
    name: 'The Morgan Affair',
    epithet: 'The disappearance that emptied the lodges',
    dates: '1826',
    year: 1826,
    era: 'nineteenth',
    cluster: 'freemasonry',
    summary:
      'The abduction and presumed murder of William Morgan, would-be exposer of the ritual, in upstate New York — igniting America’s Anti-Masonic movement and its first third party.',
    claims: [
      {
        text: 'Morgan vanished in September 1826 after announcing an exposure; the scandal spawned the Anti-Masonic Party and halved American lodge membership for a generation.',
        evidence: 'documented',
        sources: ['bogdan-snoek-2014'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'freemasonry' },
      { kind: 'associated-with', target: 'andersons-constitutions', note: 'the ritual secrecy at issue' },
    ],
    tags: ['1826', 'anti-masonry', 'new york'],
  },
  {
    id: 'papal-bull-1738',
    type: 'event',
    name: 'In Eminenti',
    epithet: 'Rome’s first anathema on the lodges',
    dates: '1738',
    year: 1738,
    era: 'enlightenment',
    cluster: 'freemasonry',
    summary:
      'Clement XII’s bull of 1738 forbidding Catholics the lodges on pain of excommunication — the opening act of two centuries of church–craft hostility.',
    claims: [
      {
        text: 'In eminenti apostolatus specula (April 1738) condemned masonic association; subsequent popes renewed the ban repeatedly.',
        evidence: 'documented',
        sources: ['bogdan-snoek-2014'],
      },
    ],
    relations: [
      { kind: 'associated-with', target: 'freemasonry' },
      { kind: 'associated-with', target: 'grand-lodge-founding' },
    ],
    tags: ['1738', 'excommunication', 'rome'],
  },
];
