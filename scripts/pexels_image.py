#!/usr/bin/env python3
# ============================================================
# Pexels image search & downloader for blog images
# ============================================================
# Purpose: search Pexels for royalty-free photos and download
#   them into the site's asset folders (replacing the old
#   APIMart AI-generation flow, which required an unreachable
#   proxy on the CI machine).
#
# Usage:
#   python3 scripts/pexels_image.py \
#     --query "LED track lighting" \
#     --out src/assets/images/blog/odm-oem-guide/odm-oem-cover.jpg \
#     --max-size 1600 --quality 85 [--orientation landscape]
#
# Requires: PEXELS_API_KEY in .env or environment variable.
#   Pexels is reachable directly (no proxy needed).
# ============================================================
import argparse
import io
import os
import sys
import urllib.parse

import requests
from PIL import Image


def load_key():
    key = os.environ.get("PEXELS_API_KEY", "")
    if key:
        return key
    # fallback to .env file
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    env = os.path.join(root, ".env")
    if os.path.exists(env):
        for line in open(env, encoding="utf-8").read().splitlines():
            if line.startswith("PEXELS_API_KEY="):
                return line.split("=", 1)[1].strip()
    print("❌ PEXELS_API_KEY not found in env or .env", file=sys.stderr)
    sys.exit(1)


def search(key, query, per_page=3, orientation="landscape"):
    params = {"query": query, "per_page": per_page}
    if orientation:
        params["orientation"] = orientation
    r = requests.get(
        "https://api.pexels.com/v1/search",
        params=params,
        headers={"Authorization": key},
        timeout=30,
    )
    r.raise_for_status()
    return r.json().get("photos", [])


def download_photo(key, photo, out, max_size=1600, quality=85):
    src = photo["src"]["large"]
    r = requests.get(src, headers={"Authorization": key}, timeout=60)
    r.raise_for_status()
    im = Image.open(io.BytesIO(r.content)).convert("RGB")
    w, h = im.size
    m = max(w, h)
    if m > max_size:
        scale = max_size / m
        im = im.resize((round(w * scale), round(h * scale)), Image.LANCZOS)
    outdir = os.path.dirname(os.path.abspath(out))
    os.makedirs(outdir, exist_ok=True)
    # pick extension from out path; default jpeg
    ext = os.path.splitext(out)[1].lower()
    if ext in (".png", ".webp"):
        im.save(out, ext[1:].upper(), optimize=True)
    else:
        im.save(out, "JPEG", quality=quality, optimize=True)
    print(f"✔ saved {out} ({im.size[0]}x{im.size[1]})")
    return photo.get("alt", "")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--query", required=True, help="Pexels search query")
    ap.add_argument("--out", required=True, help="output image path")
    ap.add_argument("--max-size", type=int, default=1600)
    ap.add_argument("--quality", type=int, default=85)
    ap.add_argument("--orientation", default="landscape")
    ap.add_argument("--per-page", type=int, default=3)
    ap.add_argument("--pick", type=int, default=0, help="0-based index among results")
    args = ap.parse_args()

    key = load_key()
    photos = search(key, args.query, per_page=args.per_page, orientation=args.orientation)
    if not photos:
        print(f"❌ no results for '{args.query}'", file=sys.stderr)
        sys.exit(1)
    photo = photos[args.pick]
    alt = download_photo(key, photo, args.out, args.max_size, args.quality)
    print(f"   alt: {alt}")


if __name__ == "__main__":
    main()
