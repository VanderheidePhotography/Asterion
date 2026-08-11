#!/usr/bin/env python3
"""Forget a cluster's resolutions so resolve.py can redo them from scratch:
drop its covers, its resolved/<cluster>.json, and pull its archive ids +
cover hashes out of the shared state files.

Usage: python3 scripts/redbooks/reset_cluster.py <cluster> [...]
"""
import json
import os
import sys

HERE = "scripts/redbooks"
HASHES = "src/features/explorer/three/__tests__/plate-hashes.json"


def load(p, d):
    return json.load(open(p)) if os.path.exists(p) else d


for cluster in sys.argv[1:]:
    rp = f"{HERE}/resolved/{cluster}.json"
    res = load(rp, {"resolved": {}})["resolved"]
    ids = {r["archiveId"] for r in res.values()}
    covers = {r["cover"] for r in res.values()}
    for r in res.values():
        f = "public" + r["cover"]
        if os.path.exists(f):
            os.remove(f)
    used = [x for x in load(f"{HERE}/_used_ids.json", []) if x not in ids]
    json.dump(sorted(used), open(f"{HERE}/_used_ids.json", "w"), indent=0)
    h = load(HASHES, {})
    for c in covers:
        h.pop(c, None)
    json.dump(h, open(HASHES, "w"), indent=0)
    open(HASHES, "a").write("\n")
    if os.path.exists(rp):
        os.remove(rp)
    print(f"reset {cluster}: dropped {len(res)} books, {len(ids)} ids")
