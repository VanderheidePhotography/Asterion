#!/usr/bin/env python3
"""Fetch the archive.org `language` of every resolved red book and split them
into English vs non-English, so the non-English scans can be dropped."""
import glob
import json
import urllib.request
from concurrent.futures import ThreadPoolExecutor

UA = "AsterionMuseum/1.0 (educational)"
EN = {"english", "eng", "en", "en-us", "enm"}  # incl. Middle English


def lang_of(ident):
    try:
        req = urllib.request.Request("https://archive.org/metadata/" + ident, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=30) as r:
            md = json.loads(r.read()).get("metadata", {})
    except Exception:
        return ident, None
    lg = md.get("language")
    if isinstance(lg, list):
        lg = lg[0] if lg else None
    return ident, (str(lg).strip().lower() if lg else None)


rows = []  # (cluster, bkId, archiveId)
for f in glob.glob("scripts/redbooks/resolved/*.json"):
    cl = f.split("/")[-1][:-5]
    for bk, h in json.load(open(f))["resolved"].items():
        rows.append((cl, bk, h["archiveId"]))

langs = {}
with ThreadPoolExecutor(max_workers=10) as p:
    for ident, lg in p.map(lambda r: lang_of(r[2]), rows):
        langs[ident] = lg

eng, non, unknown = [], [], []
for cl, bk, ident in rows:
    lg = langs.get(ident)
    if lg is None:
        unknown.append((cl, bk, ident))
    elif lg in EN:
        eng.append((cl, bk, ident))
    else:
        non.append((cl, bk, ident, lg))

json.dump(
    {"english": [[c, b, i] for c, b, i in eng],
     "non_english": [[c, b, i, l] for c, b, i, l in non],
     "unknown": [[c, b, i] for c, b, i in unknown]},
    open("scripts/redbooks/_lang.json", "w"), indent=1)
print(f"english {len(eng)}  non-english {len(non)}  unknown {len(unknown)}")
from collections import Counter
print("non-english by cluster:", dict(Counter(c for c, *_ in [(r[0],) for r in non])))
print("non-english langs:", dict(Counter(l for *_, l in non)))
print("unknown:", [f"{c}/{b}" for c, b, i in unknown])
