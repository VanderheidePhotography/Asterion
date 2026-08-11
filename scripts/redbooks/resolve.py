#!/usr/bin/env python3
"""Resolve curated red-book candidates to verified Internet Archive scans.

For each candidate {bkId, title, author, query, ...} this:
  1. searches archive.org for the work (query, then title+author),
  2. verifies each hit against the metadata API — mediatype texts, not dark,
     not lending-restricted, carries readable files, identifier not already
     used anywhere in the collection or earlier in this run,
  3. downloads the item's OWN cover to public/art/cover-<bkId>.png,
  4. records the ground-truth title / creator / year / publisher from the
     metadata, and a 256-bit average hash of the cover (for the plate-dedup
     test), rejecting a cover that is a near-duplicate of one already in the
     library or one accepted earlier in this run.

Input : scripts/redbooks/<cluster>.json          (a list of candidates)
State : scripts/redbooks/_used_ids.json           (archive ids already spoken for)
Output: scripts/redbooks/resolved/<cluster>.json  (resolved + unresolved)

Usage : python3 scripts/redbooks/resolve.py <cluster> [<cluster> ...]
"""
import glob
import io
import json
import os
import sys
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor

from PIL import Image

try:
    sys.stdout.reconfigure(line_buffering=True)  # live progress despite the pipe
except Exception:
    pass

UA = "AsterionMuseum/1.0 (educational esoteric-history museum; local dev)"
ART = "public/art"
HERE = "scripts/redbooks"
HASHES = "src/features/explorer/three/__tests__/plate-hashes.json"
SIZE = 16  # 256-bit average hash, matching scripts/plate-hashes.py
HAMMING_DUP = 18  # same threshold the grimoire test rejects at
# archive.org's "no cover" placeholder — a temple glyph on black. Any item
# without a real cover thumbnail serves this, and it must never be shelved.
PLACEHOLDER = (
    "0000000000000000000000000000000000000000000000000000001110000000"
    "0000011111100000000001111110000000000111111000000000011111100000"
    "0000011111100000000001111110000000000111111000000000011111100000"
    "0000000000000000000000000000000000000000000000000000000000000000"
)


def _get(url, timeout=45, binary=False):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read() if binary else json.loads(r.read())


def search(query, rows=12):
    url = (
        "https://archive.org/advancedsearch.php?q="
        + urllib.parse.quote(query)
        + "&fl[]=identifier&fl[]=title&fl[]=creator&fl[]=year&fl[]=mediatype"
        + f"&rows={rows}&page=1&output=json"
    )
    try:
        d = _get(url)
        return d.get("response", {}).get("docs", [])
    except Exception as e:
        print("   search error:", e)
        return []


def meta(identifier):
    return _get("https://archive.org/metadata/" + identifier)


def ahash_bits(im):
    px = list(im.convert("L").resize((SIZE, SIZE), Image.LANCZOS).getdata())
    avg = sum(px) / len(px)
    return "".join("1" if v > avg else "0" for v in px)


def hamming(a, b):
    return sum(1 for x, y in zip(a, b) if x != y)


MAX_OLD_YEAR = 1940  # scans past this are modern re-uploads — allowed only on a
# strong title+author match, and only when no period scan can be found

_STOP = {
    "libri", "liber", "tres", "quatuor", "sex", "duo", "the", "and", "of", "or",
    "de", "la", "le", "les", "des", "du", "von", "dem", "der", "das", "una",
    "della", "delle", "dei", "with", "sive", "seu", "being", "book", "books",
    "new", "his", "her", "vol", "volume", "part", "that", "which", "opera",
    "omnia", "them", "their",
}


def deaccent(s):
    import unicodedata
    return "".join(c for c in unicodedata.normalize("NFKD", str(s)) if not unicodedata.combining(c))


def build_queries(c):
    """Several search strings, widest-net first — archive.org's search has poor
    recall on long or accented phrases, so also try surname + a few distinctive
    title words, and the bare title."""
    title = deaccent(c["title"])
    author = deaccent(c["author"])
    sn = surname(author)
    ttoks = [t for t in deaccent(" ".join(sorted(toks(c["title"]), key=len, reverse=True))).split()][:3]
    qs = []
    if c.get("query"):
        qs.append(deaccent(c["query"]))
    if sn and ttoks:
        qs.append(" ".join(ttoks + [sn]))
    qs.append(f"{title} {sn}".strip())
    qs.append(title)
    seen, out = set(), []
    for q in qs:
        q = q.strip()
        if q and q.lower() not in seen:
            seen.add(q.lower())
            out.append(q)
    return out


def toks(s):
    out = []
    cur = ""
    for ch in str(s).lower():
        if ch.isalnum():
            cur += ch
        else:
            if cur:
                out.append(cur)
            cur = ""
    if cur:
        out.append(cur)
    return {t for t in out if len(t) >= 4 and t not in _STOP}


def surname(author):
    # the last real name token — "Michael Maier" -> maier, "trans. Ficino" -> ficino
    parts = [p for p in toks(author) if p not in ("trans", "attributed", "ed", "eds")]
    return parts[-1] if parts else ""


def relevant(c, md):
    """(is_relevant, is_strong) — does this hit look like the intended work?

    A match needs BOTH the author AND the title to agree: same title words but a
    different author (Boate's 'Philosophia Reformata' vs Mylius's) is a different
    book, and the same author with unrelated title words (Maier's 'Viatorium' vs
    his 'Tripus Aureus') is a different book too. Only a very distinctive title
    (3+ shared words) is trusted on its own, for anonymous works and collections
    whose creator field is unreliable.
    """
    ct = toks(c["title"])
    anames = {p for p in toks(c["author"]) if p not in ("trans", "attributed", "ed", "eds")}
    htitle = toks(md.get("title", ""))
    creator = md.get("creator", "")
    if isinstance(creator, list):
        creator = " ".join(creator)
    hfields = htitle | toks(creator)
    shared = len(ct & htitle)
    has_author = bool(anames & hfields)
    if has_author and shared >= 1:
        return True, True
    if shared >= 3:
        return True, False
    return False, False


# English only. "enm"/"middle english" is Early Modern / Middle English — still
# English (Böhme's Sparrow, Ripley, Vaughan) — kept. A missing language field is
# allowed through (many genuine English scans omit it); a NAMED foreign language
# is rejected.
_ENGLISH = {"english", "eng", "en", "en-us", "enm", "middle english", "engmid"}


def is_english(m):
    lg = m.get("metadata", {}).get("language")
    if isinstance(lg, list):
        lg = lg[0] if lg else None
    if not lg:
        return True  # unlabelled — allow (the title/author check already gates it)
    return str(lg).strip().lower() in _ENGLISH


def usable(m):
    """metadata dict -> (ok, reason)."""
    md = m.get("metadata", {})
    if md.get("mediatype") != "texts":
        return False, "not texts"
    if not is_english(m):
        return False, "not english"
    if str(m.get("is_dark")).lower() == "true" or md.get("is_dark"):
        return False, "dark"
    if str(md.get("access-restricted-item")).lower() == "true":
        return False, "access-restricted"
    cols = md.get("collection", [])
    if isinstance(cols, str):
        cols = [cols]
    if "inlibrary" in cols or "printdisabled" in cols:
        return False, "lending-restricted"
    files = m.get("files", [])
    readable = any(
        f.get("format") in ("DjVuTXT", "Text", "Abbyy GZ", "hOCR")
        or str(f.get("name", "")).lower().endswith((".pdf", ".txt", "_djvu.txt"))
        for f in files
    )
    if not readable:
        return False, "no readable files"
    return True, "ok"


def year_of(md):
    for k in ("year", "date", "publicdate"):
        v = md.get(k)
        if v:
            digits = "".join(c for c in str(v)[:12] if c.isdigit())
            if len(digits) >= 4:
                return int(digits[:4])
    return None


def download_cover(identifier, out_path):
    blob = _get("https://archive.org/services/img/" + identifier, binary=True)
    if len(blob) < 3000:
        return None
    im = Image.open(io.BytesIO(blob)).convert("RGB")
    # a services/img placeholder for a coverless item is a small flat tile;
    # a real cover has spread-out tones
    h = ahash_bits(im)
    if h.count("1") in (0, 256):
        return None
    if hamming(h, PLACEHOLDER) <= 24:
        return None  # archive.org's coverless placeholder
    im.save(out_path, "PNG")
    return h


def load_json(path, default):
    return json.load(open(path)) if os.path.exists(path) else default


def existing_hashes():
    h = load_json(HASHES, {})
    return dict(h)


def main():
    clusters = sys.argv[1:]
    if not clusters:
        print("usage: resolve.py <cluster> [...]")
        sys.exit(1)

    collection = load_json("scripts/_collection.json", {"usedArchiveIds": [], "entityIds": []})
    used = set(collection["usedArchiveIds"]) | set(load_json(f"{HERE}/_used_ids.json", []))
    entity_ids = set(collection["entityIds"])
    plate_hashes = existing_hashes()
    accepted_hashes = list(plate_hashes.values())
    os.makedirs(f"{HERE}/resolved", exist_ok=True)

    for cluster in clusters:
        cands = load_json(f"{HERE}/{cluster}.json", [])
        prev = load_json(f"{HERE}/resolved/{cluster}.json", {"resolved": {}})
        resolved, unresolved = {}, []
        print(f"\n=== {cluster}: {len(cands)} candidates ===")
        for c in cands:
            bk = c["bkId"]
            # resumable: keep a book already resolved to a real (non-placeholder)
            # cover from an earlier run, and do not spend a lookup on it again
            done = prev.get("resolved", {}).get(bk)
            if done and os.path.exists(f"{ART}/cover-{bk}.png"):
                resolved[bk] = done
                used.add(done["archiveId"])
                plate_hashes.setdefault(done["cover"], done["ahash"])
                print(f" == {bk} (kept)")
                continue
            if bk in entity_ids:
                print(f" !! {bk}: id already an entity — skipping")
                unresolved.append({**c, "reason": "id collision"})
                continue
            # gather every candidate identifier from several search forms
            # (cheap), then fetch their metadata IN PARALLEL, then prefer the
            # OLDEST period scan — never just the first search result
            idents = []
            for q in build_queries(c):
                for doc in search(q, rows=15):
                    ident = doc.get("identifier")
                    if ident and ident not in idents and ident not in used:
                        idents.append(ident)

            def fetch_meta(ident):
                try:
                    return ident, meta(ident)
                except Exception:
                    return ident, None

            cand = {}  # ident -> (year, strong, metadata)
            with ThreadPoolExecutor(max_workers=8) as pool:
                for ident, m in pool.map(fetch_meta, idents):
                    if not m or not usable(m)[0]:
                        continue
                    rel, strong = relevant(c, m.get("metadata", {}))
                    if not rel:
                        continue
                    yr = year_of(m.get("metadata", {})) or 9999
                    cand[ident] = (yr, strong, m)
            olds = sorted([i for i, v in cand.items() if v[0] <= MAX_OLD_YEAR], key=lambda i: cand[i][0])
            moderns = sorted([i for i, v in cand.items() if v[0] > MAX_OLD_YEAR and v[1]], key=lambda i: cand[i][0])
            hit = None
            for ident in olds + moderns:
                out = f"{ART}/cover-{bk}.png"
                try:
                    hh = download_cover(ident, out)
                except Exception:
                    hh = None
                if not hh:
                    continue
                if any(hamming(hh, e) <= HAMMING_DUP for e in accepted_hashes):
                    os.path.exists(out) and os.remove(out)
                    continue
                md = cand[ident][2].get("metadata", {})
                creator = md.get("creator", c["author"])
                if isinstance(creator, list):
                    creator = creator[0]
                hit = {
                    "bkId": bk,
                    "archiveId": ident,
                    "title": md.get("title", c["title"]),
                    "creator": creator,
                    "year": year_of(md) or c.get("yearGuess"),
                    "publisher": md.get("publisher", ""),
                    "cover": f"/art/cover-{bk}.png",
                    "ahash": hh,
                }
                break
            if hit:
                used.add(hit["archiveId"])
                accepted_hashes.append(hit["ahash"])
                plate_hashes[hit["cover"]] = hit["ahash"]
                resolved[bk] = hit
                print(f" ok {bk} -> {hit['archiveId']}  ({hit['year']})")
            else:
                unresolved.append({**c, "reason": "no usable scan found"})
                print(f" -- {bk}: NO usable scan")

        json.dump(
            {"resolved": resolved, "unresolved": unresolved},
            open(f"{HERE}/resolved/{cluster}.json", "w"),
            indent=1,
            ensure_ascii=False,
        )
        print(f"  {cluster}: {len(resolved)} resolved, {len(unresolved)} unresolved")

    json.dump(sorted(used), open(f"{HERE}/_used_ids.json", "w"), indent=0)
    json.dump(plate_hashes, open(HASHES, "w"), indent=0)
    open(HASHES, "a").write("\n")


if __name__ == "__main__":
    main()
