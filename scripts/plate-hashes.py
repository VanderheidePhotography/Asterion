#!/usr/bin/env python3
"""Freeze a perceptual hash of every plate in public/art.

The grimoire test uses these to catch the one duplication a filename check
cannot: two scans of the same engraving under two different names. 256-bit
average hash — the image reduced to 16x16 greyscale, each pixel called light
or dark against the mean — which survives rescaling and re-encoding but not a
genuinely different picture.

Run after adding or removing plates:  python3 scripts/plate-hashes.py
"""

import glob
import json
import os

from PIL import Image

OUT = "src/features/explorer/three/__tests__/plate-hashes.json"
SIZE = 16


def ahash(path: str) -> str:
    with Image.open(path) as im:
        px = list(im.convert("L").resize((SIZE, SIZE), Image.LANCZOS).getdata())  # noqa: PIL deprecation is fine here
    avg = sum(px) / len(px)
    return "".join("1" if v > avg else "0" for v in px)


def main() -> None:
    out = {}
    for path in sorted(glob.glob("public/art/*.jpg") + glob.glob("public/art/*.png")):
        out["/art/" + os.path.basename(path)] = ahash(path)
    with open(OUT, "w") as f:
        json.dump(out, f, indent=0)
        f.write("\n")
    print(f"hashed {len(out)} plates -> {OUT}")


if __name__ == "__main__":
    main()
