#!/usr/bin/env python3
"""Emit src/data/redBooks.generated.ts from the curated candidates + resolved
Internet Archive scans.

Only books that RESOLVED to a verified, non-placeholder scan are emitted. The
curated title/author/dates/summary are trusted for display; the resolver
supplies only the archive identifier, the edition year, and the cover file.

Usage: python3 scripts/redbooks/generate.py
"""
import glob
import json
import os

HERE = "scripts/redbooks"
OUT = "src/data/redBooks.generated.ts"
CLUSTERS = ["hermetica", "alchemy", "kabbalah", "renaissance",
            "early-modern", "freemasonry", "occult-revival", "scholarship"]


def js(s):
    return json.dumps(s, ensure_ascii=False)


def main():
    collection = json.load(open("scripts/_collection.json"))
    entity_ids = set(collection["entityIds"])

    shelf, archive, art = [], [], []
    seen_bk = set()
    counts = {}
    problems = []

    for cluster in CLUSTERS:
        cands = {c["bkId"]: c for c in json.load(open(f"{HERE}/{cluster}.json"))} \
            if os.path.exists(f"{HERE}/{cluster}.json") else {}
        res = json.load(open(f"{HERE}/resolved/{cluster}.json"))["resolved"] \
            if os.path.exists(f"{HERE}/resolved/{cluster}.json") else {}
        n = 0
        for bk, r in res.items():
            c = cands.get(bk)
            if not c:
                problems.append(f"{bk}: resolved but no candidate record")
                continue
            if bk in seen_bk:
                problems.append(f"{bk}: duplicate bkId")
                continue
            if bk in entity_ids:
                problems.append(f"{bk}: bkId collides with an existing entity")
                continue
            if c["linkTarget"] not in entity_ids:
                problems.append(f"{bk}: link target '{c['linkTarget']}' is not an entity")
                continue
            if not os.path.exists("public" + r["cover"]):
                problems.append(f"{bk}: cover file missing {r['cover']}")
                continue
            seen_bk.add(bk)
            n += 1
            era = c.get("era", "renaissance")
            shelf.append(
                "  { id: %s, title: %s, author: %s, dates: %s, year: %s, "
                "era: %s, cluster: %s, epithet: %s, summary: %s, "
                "link: { kind: %s, target: %s }, tags: [%s], wiki: %s, imprint: %s }"
                % (
                    js(bk), js(c["title"]), js(c["author"]), js(c["dates"]), c.get("yearGuess"),
                    js(era), js(c["cluster"]), js(c["epithet"]), js(c["summary"]),
                    js(c["linkKind"]), js(c["linkTarget"]),
                    ", ".join(js(t) for t in c["tags"]), js(c.get("wiki", "")), js(c["imprint"]),
                )
            )
            archive.append(
                "  %s: { id: %s, title: %s, author: %s, year: %s },"
                % (js(bk), js(r["archiveId"]), js(c["title"]), js(c["author"]), js(str(r["year"])))
            )
            art.append(
                "  %s: { plate: %s, caption: %s }," % (js(bk), js(r["cover"]), js(c["title"]))
            )
        counts[cluster] = n

    header = (
        "/**\n"
        " * AUTO-GENERATED — do not edit by hand.\n"
        " *\n"
        " * Real, public-domain full texts on the Internet Archive, added to bring each\n"
        " * hall's crimson (has-a-scan) spines up to parity with its violet ones. Each\n"
        " * identifier was resolved by searching archive.org for the work and verified\n"
        " * against the metadata API — item exists, mediatype texts, not dark, not\n"
        " * lending-restricted, readable files — and no identifier is reused. Each book\n"
        " * also carries its OWN cover, downloaded from that scan into public/art.\n"
        " *\n"
        " * Regenerate: python3 scripts/redbooks/generate.py\n"
        " */\n"
        "import type { ShelfBook } from './shelfBooks';\n"
        "import type { ArchiveText } from './archiveTexts';\n\n"
    )
    body = (
        "export const redShelfBooks: ShelfBook[] = [\n"
        + ",\n".join(shelf)
        + ",\n];\n\n"
        "/** entity id -> the scan it opens */\n"
        "export const RED_BOOK_ARCHIVE: Record<string, ArchiveText> = {\n"
        + "\n".join(archive)
        + "\n};\n\n"
        "/** entity id -> its own cover plate, shown inside the opened book */\n"
        "export const RED_BOOK_ART: Record<string, { plate: string; caption: string }> = {\n"
        + "\n".join(art)
        + "\n};\n"
    )
    open(OUT, "w").write(header + body)

    total = sum(counts.values())
    print(f"wrote {OUT}: {total} red books")
    for c in CLUSTERS:
        print(f"  {c}: {counts[c]}")
    if problems:
        print("\nPROBLEMS:")
        for p in problems:
            print("  !!", p)


if __name__ == "__main__":
    main()
