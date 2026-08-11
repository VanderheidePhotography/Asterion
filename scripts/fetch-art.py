#!/usr/bin/env python3
"""Fetch a batch of public-domain esoteric images from Wikimedia Commons.

For each (search query, output name) pair: resolve the best File: title via
the Commons search API, then download a 900px-wide thumb via Special:FilePath.
Commons rate-limits robots aggressively — sleep between requests and retry
once on failure.
"""

import json
import sys
import time
import urllib.parse
import urllib.request

UA = "AsterionMuseum/1.0 (educational esoteric-history museum; contact: local dev)"
OUT = "public/art"

TARGETS = [
    ("Oedipus Aegyptiacus", "pool-hermetica-2.jpg"),
    ("freemasons initiation engraving", "pool-freemasonry-1.jpg"),
    ("Helena Petrovna Blavatsky", "pool-occult-revival-1.jpg"),
    ("Giordano Bruno engraving portrait", "pool-renaissance-3.jpg"),
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
    if len(blob) < 4000:
        return False
    with open(f"{OUT}/{out}", "wb") as f:
        f.write(blob)
    return True


def main():
    ok, fail = [], []
    for query, out in TARGETS:
        for attempt in (1, 2):
            try:
                title = api_search(query)
                if not title:
                    raise RuntimeError("no search hit")
                if fetch(title, out):
                    print(f"OK   {out}  <-  {title}", flush=True)
                    ok.append(out)
                    break
                raise RuntimeError("tiny file")
            except Exception as e:  # noqa: BLE001
                print(f"ERR  {out} attempt {attempt}: {e}", flush=True)
                if attempt == 2:
                    fail.append(out)
                time.sleep(12)
        time.sleep(7)
    print(f"\ndone: {len(ok)} ok, {len(fail)} failed: {fail}")
    sys.exit(0 if not fail else 1)


if __name__ == "__main__":
    main()
