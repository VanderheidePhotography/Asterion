#!/usr/bin/env python3
"""Shrink the plate files to the size they are actually drawn at.

Commons hands back 900px-wide scans of a few hundred kilobytes each. The
grimoire draws a plate into a frame around 500px across on a 760px page, so
most of that detail is thrown away at draw time while still being paid for on
the wire. This caps the long edge and re-encodes as progressive JPEG.

Idempotent: an image already within the cap and under the size floor is left
alone. Run: python3 scripts/optimize-art.py [--dry-run]
"""

import glob
import os
import sys

from PIL import Image

MAX_EDGE = 1000
QUALITY = 82
ART = "public/art"


def main():
    dry = "--dry-run" in sys.argv
    before = after = 0
    touched = 0
    for path in sorted(glob.glob(f"{ART}/*.jpg")):
        start = os.path.getsize(path)
        before += start
        with Image.open(path) as im:
            im = im.convert("RGB")
            w, h = im.size
            scale = min(1.0, MAX_EDGE / max(w, h))
            if scale < 1.0:
                im = im.resize((round(w * scale), round(h * scale)), Image.LANCZOS)
            if dry:
                after += start
                continue
            im.save(path, "JPEG", quality=QUALITY, optimize=True, progressive=True)
        end = os.path.getsize(path)
        if end < start:
            touched += 1
        else:
            after += start
            continue
        after += end
    print(f"{touched} files re-encoded")
    print(f"{before / 1048576:.1f} MB -> {after / 1048576:.1f} MB")


if __name__ == "__main__":
    main()
