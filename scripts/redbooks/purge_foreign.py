#!/usr/bin/env python3
"""Remove every non-English red book (from _lang.json) from the whole pipeline:
the candidate JSONs, the resolved JSONs, the cover PNGs, the plate hashes, and
the used-id ledger. Middle/Early-Modern English and unlabelled scans are kept.
"""
import glob
import json
import os

FOREIGN = {"fre", "french", "lat", "latin", "ger", "german", "heb", "hebrew",
           "ita", "italian", "spa", "spanish", "spanish;castilian", "und", "dut", "dutch"}
HASHES = "src/features/explorer/three/__tests__/plate-hashes.json"

lang = json.load(open("scripts/redbooks/_lang.json"))
drop_bk, drop_ids = set(), set()
for cl, bk, ident, lg in lang["non_english"]:
    if str(lg).strip().lower() in FOREIGN:
        drop_bk.add(bk)
        drop_ids.add(ident)
print(f"dropping {len(drop_bk)} foreign books")

# 1) candidate JSONs
for f in glob.glob("scripts/redbooks/*.json"):
    if any(x in f for x in ["_used", "resolved", "_collection", "_worksnoscan", "_lang"]):
        continue
    data = json.load(open(f))
    if not isinstance(data, list):
        continue
    kept = [c for c in data if c["bkId"] not in drop_bk]
    if len(kept) != len(data):
        json.dump(kept, open(f, "w"), indent=1, ensure_ascii=False)
        print(f"  {os.path.basename(f)}: {len(data)}->{len(kept)}")

# 2) resolved JSONs + covers
covers_removed = 0
for f in glob.glob("scripts/redbooks/resolved/*.json"):
    d = json.load(open(f))
    res = d["resolved"]
    for bk in list(res):
        if bk in drop_bk:
            cov = "public" + res[bk]["cover"]
            if os.path.exists(cov):
                os.remove(cov)
                covers_removed += 1
            del res[bk]
    json.dump(d, open(f, "w"), indent=1, ensure_ascii=False)
print(f"  removed {covers_removed} cover files")

# 3) plate hashes
h = json.load(open(HASHES))
for bk in drop_bk:
    h.pop(f"/art/cover-{bk}.png", None)
json.dump(h, open(HASHES, "w"), indent=0)
open(HASHES, "a").write("\n")

# 4) used-ids ledger
used = [x for x in json.load(open("scripts/redbooks/_used_ids.json")) if x not in drop_ids]
json.dump(sorted(used), open("scripts/redbooks/_used_ids.json", "w"), indent=0)
print("done")
