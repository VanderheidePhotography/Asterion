#!/usr/bin/env python3
"""Fetch the extended plate pool for the grimoires from Wikimedia Commons.

Same resolve-then-download approach as fetch-art.py, but for a large batch:
every book in the library draws its frontispiece and interior plate from its
cluster's pool, and with only a handful of plates per cluster the same
engraving was turning up in a dozen different books. This widens each pool to
~20 so the deal can run without repetition.

Queries name specific works, artists or sitters rather than themes — a vague
query returns whatever Commons ranks first, which has previously included
material that had no business in the museum. Everything fetched here still
gets looked at on the contact sheet before it ships.

Writes to public/art/pool-<cluster>-<n>.jpg, continuing each cluster's
existing numbering. Existing files are skipped, so the script is re-runnable.
"""

import json
import os
import sys
import time
import urllib.parse
import urllib.request

UA = "AsterionMuseum/1.0 (educational esoteric-history museum; contact: local dev)"
OUT = "public/art"

# (search query, cluster, caption) — the caption is what the page prints under
# the plate, so it must describe the thing honestly.
TARGETS = [
    # ---- hermetica -------------------------------------------------------
    ("Hermes Trismegistus Siena Duomo floor", "hermetica", "Hermes Trismegistus — the Siena Cathedral pavement (1488)"),
    ("Tabula Smaragdina", "hermetica", "The Emerald Tablet, in a 17th-century engraving"),
    ("Thoth ibis headed god", "hermetica", "Thoth, ibis-headed scribe of the gods"),
    ("Papyrus of Ani Book of the Dead", "hermetica", "The weighing of the heart — Papyrus of Ani"),
    ("Athanasius Kircher portrait", "hermetica", "Athanasius Kircher"),
    ("Kircher Turris Babel", "hermetica", "The Tower of Babel — Kircher, Turris Babel (1679)"),
    ("Marsilio Ficino portrait", "hermetica", "Marsilio Ficino, first translator of the Corpus Hermeticum"),
    ("Isis Egyptian goddess relief", "hermetica", "Isis, in an Egyptian relief"),
    ("Plotinus", "hermetica", "Plotinus, founder of Neoplatonism"),
    ("Serapis bust", "hermetica", "Serapis — the syncretic god of Ptolemaic Alexandria"),
    ("Harpocrates", "hermetica", "Harpocrates, the god of silence"),
    ("Egyptian obelisk Piazza Navona", "hermetica", "The obelisk Kircher read as a hieroglyphic sermon"),
    ("Corpus Hermeticum manuscript", "hermetica", "A manuscript of the Corpus Hermeticum"),
    ("Ouroboros Chrysopoeia Cleopatra", "hermetica", "The ouroboros of Cleopatra the Alchemist"),
    ("Iamblichus", "hermetica", "Iamblichus, who defended theurgy"),
    ("Library of Alexandria engraving", "hermetica", "The Library of Alexandria, imagined by a later engraver"),
    # ---- alchemy ---------------------------------------------------------
    ("Rosarium Philosophorum", "alchemy", "From the Rosarium Philosophorum (1550)"),
    ("Mutus Liber", "alchemy", "A page of the wordless Mutus Liber (1677)"),
    ("Ripley Scroll", "alchemy", "The Ripley Scroll"),
    ("Aurora Consurgens manuscript", "alchemy", "Aurora Consurgens, 15th-century manuscript"),
    ("Basil Valentine Twelve Keys", "alchemy", "One of the Twelve Keys of Basil Valentine"),
    ("Paracelsus portrait", "alchemy", "Paracelsus"),
    ("David Teniers alchemist painting", "alchemy", "The alchemist at his furnace — Teniers"),
    ("Nicolas Flamel", "alchemy", "Nicolas Flamel"),
    ("Jan Baptist van Helmont", "alchemy", "Jan Baptist van Helmont"),
    ("alembic distillation woodcut", "alchemy", "Distillation apparatus, from an early printed herbal"),
    ("Musaeum Hermeticum", "alchemy", "A plate from the Musaeum Hermeticum (1678)"),
    ("Robert Fludd Utriusque Cosmi", "alchemy", "Fludd’s cosmos — Utriusque Cosmi Historia (1617)"),
    ("Theatrum Chemicum Britannicum", "alchemy", "Ashmole’s Theatrum Chemicum Britannicum (1652)"),
    ("Elias Ashmole portrait", "alchemy", "Elias Ashmole"),
    ("Michael Sendivogius painting", "alchemy", "Michał Sędziwój (Sendivogius) at work"),
    ("Pseudo Geber Summa Perfectionis", "alchemy", "From the Summa Perfectionis of pseudo-Geber"),
    # ---- kabbalah --------------------------------------------------------
    ("Portae Lucis Gikatilla", "kabbalah", "Portae Lucis — Gikatilla’s Gates of Light (1516)"),
    ("Zohar first edition", "kabbalah", "The Zohar, Mantua edition (1558)"),
    ("Sefer Yetzirah", "kabbalah", "Sefer Yetzirah, the Book of Formation"),
    ("Isaac Luria", "kabbalah", "Isaac Luria, the Ari of Safed"),
    ("Adam Kadmon", "kabbalah", "Adam Kadmon, the primordial man"),
    ("Merkabah chariot vision Ezekiel", "kabbalah", "Ezekiel’s chariot — the merkabah"),
    ("Hebrew illuminated manuscript micrography", "kabbalah", "Micrography in a Hebrew manuscript"),
    ("Safed old city", "kabbalah", "Safed, where Lurianic kabbalah took shape"),
    ("Torah scroll", "kabbalah", "A Torah scroll"),
    ("kabbalistic amulet Hebrew", "kabbalah", "A kabbalistic protective amulet"),
    ("Abraham Abulafia", "kabbalah", "The ecstatic kabbalah of Abraham Abulafia"),
    ("Moses Cordovero Pardes Rimonim", "kabbalah", "Cordovero’s Pardes Rimonim"),
    ("Shiviti menorah", "kabbalah", "A shiviti — the divine name as a menorah"),
    ("Hebrew alphabet manuscript", "kabbalah", "The twenty-two letters"),
    # ---- renaissance -----------------------------------------------------
    ("Cornelius Agrippa De occulta philosophia", "renaissance", "Agrippa, De occulta philosophia (1533)"),
    ("Heinrich Cornelius Agrippa portrait", "renaissance", "Heinrich Cornelius Agrippa"),
    ("Monas Hieroglyphica Dee", "renaissance", "Dee’s Monas Hieroglyphica (1564)"),
    ("Edward Kelley", "renaissance", "Edward Kelley, Dee’s scryer"),
    ("Johannes Trithemius", "renaissance", "Johannes Trithemius, abbot and cryptographer"),
    ("Girolamo Cardano", "renaissance", "Girolamo Cardano"),
    ("Tommaso Campanella", "renaissance", "Tommaso Campanella"),
    ("Nostradamus portrait", "renaissance", "Nostradamus"),
    ("Rudolf II Holy Roman Emperor portrait", "renaissance", "Rudolf II, whose Prague court drew every adept"),
    ("Arcimboldo Vertumnus", "renaissance", "Arcimboldo’s Rudolf II as Vertumnus"),
    ("Renaissance astrological man zodiac", "renaissance", "The zodiac man of the almanacs"),
    ("Cosimo de Medici portrait", "renaissance", "Cosimo de’ Medici, who commissioned the translation"),
    ("Florence Palazzo Medici", "renaissance", "Florence, where the Hermetic revival began"),
    ("Albrecht Durer Melencolia", "renaissance", "Dürer’s Melencolia I (1514)"),
    ("Hypnerotomachia Poliphili woodcut", "renaissance", "From the Hypnerotomachia Poliphili (1499)"),
    # ---- early modern ----------------------------------------------------
    ("Fama Fraternitatis Rosicrucian", "early-modern", "The Fama Fraternitatis (1614)"),
    ("Chymische Hochzeit Christiani Rosencreutz", "early-modern", "The Chymical Wedding of Christian Rosenkreutz (1616)"),
    ("Robert Fludd portrait", "early-modern", "Robert Fludd"),
    ("Johann Valentin Andreae", "early-modern", "Johann Valentin Andreae"),
    ("Thomas Vaughan Eugenius Philalethes", "early-modern", "Thomas Vaughan, who wrote as Eugenius Philalethes"),
    ("William Blake Ancient of Days", "early-modern", "Blake’s Ancient of Days (1794)"),
    ("William Blake Jacob's Ladder", "early-modern", "Blake’s Jacob’s Ladder"),
    ("Antoine Court de Gebelin", "early-modern", "Court de Gébelin, who first called the tarot Egyptian"),
    ("Franz Anton Mesmer portrait", "early-modern", "Franz Anton Mesmer"),
    ("mesmerism baquet engraving", "early-modern", "The mesmeric baquet"),
    ("Swedenborg New Jerusalem", "early-modern", "Swedenborg’s New Jerusalem"),
    ("Comenius Orbis Pictus", "early-modern", "Comenius, Orbis Sensualium Pictus (1658)"),
    ("Pietism Philipp Jakob Spener", "early-modern", "Spener, and the pietist turn inward"),
    ("17th century printing press engraving", "early-modern", "The press that carried the manifestos"),
    ("Emblemata Alciato", "early-modern", "From Alciato’s Emblemata — the emblem book habit"),
    # ---- freemasonry -----------------------------------------------------
    ("Masonic tracing board", "freemasonry", "A lodge tracing board"),
    ("Anderson's Constitutions 1723", "freemasonry", "Anderson’s Constitutions (1723)"),
    ("square and compasses", "freemasonry", "The square and compasses"),
    ("Masonic lodge engraving 18th century", "freemasonry", "A lodge at work, 18th-century engraving"),
    ("Grand Lodge of England", "freemasonry", "The Grand Lodge, London"),
    ("Solomon's Temple engraving", "freemasonry", "Solomon’s Temple, the craft’s central figure"),
    ("Masonic certificate engraving", "freemasonry", "A Masonic certificate"),
    ("all seeing eye providence", "freemasonry", "The eye of providence"),
    ("Mozart Die Zauberflote Masonic", "freemasonry", "The Magic Flute — Masonry set to music"),
    ("Benjamin Franklin portrait", "freemasonry", "Benjamin Franklin, freemason"),
    ("Albert Pike", "freemasonry", "Albert Pike of the Scottish Rite"),
    ("Knights Templar seal", "freemasonry", "The Templar seal the higher degrees claimed"),
    ("Masonic hall interior engraving", "freemasonry", "Inside a Masonic hall"),
    ("stonemason medieval carving", "freemasonry", "The operative masons the craft remembers"),
    # ---- occult revival --------------------------------------------------
    ("Eliphas Levi portrait", "occult-revival", "Éliphas Lévi"),
    ("Papus Gerard Encausse", "occult-revival", "Papus (Gérard Encausse)"),
    ("Annie Besant portrait", "occult-revival", "Annie Besant"),
    ("Theosophical Society seal", "occult-revival", "The seal of the Theosophical Society"),
    ("Isis Unveiled Blavatsky", "occult-revival", "Blavatsky’s Isis Unveiled (1877)"),
    ("seance engraving 19th century", "occult-revival", "A séance, in a 19th-century engraving"),
    ("Fox sisters spiritualism", "occult-revival", "The Fox sisters"),
    ("Daniel Dunglas Home", "occult-revival", "D. D. Home, the medium nobody caught"),
    ("Arthur Edward Waite", "occult-revival", "A. E. Waite"),
    ("Samuel Liddell MacGregor Mathers", "occult-revival", "MacGregor Mathers"),
    ("Rudolf Steiner portrait", "occult-revival", "Rudolf Steiner"),
    ("Austin Osman Spare", "occult-revival", "Austin Osman Spare"),
    ("Rider Waite tarot Wheel of Fortune", "occult-revival", "The Wheel of Fortune, Rider–Waite–Smith (1909)"),
    ("Rider Waite tarot Star card", "occult-revival", "The Star, Rider–Waite–Smith (1909)"),
    ("Tarot de Marseille card", "occult-revival", "A card of the Tarot de Marseille"),
    ("Spiritualist newspaper Banner of Light", "occult-revival", "The spiritualist press"),
    # ---- scholarship -----------------------------------------------------
    ("Aby Warburg", "scholarship", "Aby Warburg, who took the images seriously"),
    ("Warburg Institute library", "scholarship", "The Warburg Institute"),
    ("Bodleian Library interior", "scholarship", "The Bodleian, where the manuscripts landed"),
    ("Vatican Apostolic Library", "scholarship", "The Vatican Library"),
    ("medieval scriptorium monk writing", "scholarship", "A scriptorium at work"),
    ("cabinet of curiosities Wunderkammer engraving", "scholarship", "A Wunderkammer — the museum before museums"),
    ("Tycho Brahe portrait", "scholarship", "Tycho Brahe"),
    ("Kepler Harmonices Mundi", "scholarship", "Kepler, Harmonices Mundi (1619)"),
    ("Isaac Newton portrait Godfrey Kneller", "scholarship", "Newton — who wrote more on alchemy than on optics"),
    ("armillary sphere engraving", "scholarship", "An armillary sphere"),
    ("orrery Joseph Wright", "scholarship", "Wright of Derby’s Orrery (1766)"),
    ("Isaac Casaubon", "scholarship", "Isaac Casaubon, who dated the Hermetica and broke the spell"),
    ("old library reading room engraving", "scholarship", "A reading room of the old kind"),
    ("astronomical clock Prague", "scholarship", "The Prague astronomical clock"),
    ("incunabula printed book page", "scholarship", "An incunable page"),
]


def api_search(query: str):
    q = urllib.parse.quote(f"{query} filetype:bitmap")
    url = (
        "https://commons.wikimedia.org/w/api.php?action=query&list=search"
        f"&srsearch={q}&srnamespace=6&srlimit=1&format=json"
    )
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        data = json.load(r)
    hits = data.get("query", {}).get("search", [])
    return hits[0]["title"] if hits else None


def fetch(title: str, out: str) -> bool:
    name = urllib.parse.quote(title.removeprefix("File:"))
    url = f"https://commons.wikimedia.org/wiki/Special:FilePath/{name}?width=900"
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        blob = r.read()
    # a few kilobytes means we got an error page or a thumbnail stub, not a plate
    if len(blob) < 8000:
        return False
    with open(f"{OUT}/{out}", "wb") as f:
        f.write(blob)
    return True


def next_index(cluster: str) -> int:
    n = 1
    while os.path.exists(f"{OUT}/pool-{cluster}-{n}.jpg"):
        n += 1
    return n


def load_manifest():
    """Merge with whatever a previous run recorded — a re-run fills the gaps
    left by rate-limiting, and must not drop the earlier entries."""
    try:
        with open("scripts/art-manifest.json") as f:
            return json.load(f)
    except (OSError, ValueError):
        return []


def main():
    manifest = load_manifest()
    have = {m["query"] for m in manifest}
    ok = fail = skipped = 0
    for query, cluster, caption in TARGETS:
        if query in have:
            continue
        out = f"pool-{cluster}-{next_index(cluster)}.jpg"
        got = False
        for attempt in (1, 2):
            try:
                title = api_search(query)
                if not title:
                    raise RuntimeError("no search hit")
                if fetch(title, out):
                    print(f"OK   {out}  <-  {title}", flush=True)
                    manifest.append({"file": out, "cluster": cluster, "caption": caption, "source": title, "query": query})
                    ok += 1
                    got = True
                    break
                raise RuntimeError("tiny file")
            except Exception as e:  # noqa: BLE001
                print(f"ERR  {out} attempt {attempt} ({query}): {e}", flush=True)
                if attempt == 2:
                    fail += 1
                time.sleep(30)
        if not got:
            skipped += 1
        time.sleep(11)
    with open("scripts/art-manifest.json", "w") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    print(f"\ndone: {ok} ok, {fail} failed, {skipped} skipped")
    sys.exit(0)


if __name__ == "__main__":
    main()
