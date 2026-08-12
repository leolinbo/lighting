#!/usr/bin/env bash
# ============================================================
# Generate ODM vs OEM blog images via APIMart gpt-image-2 (1k)
# ============================================================
# Purpose: produce the 3 AI images for the "ODM vs OEM LED
#   Lighting" blog post, replacing the placeholder photos that
#   were copied from the factory library while api.apimart.ai
#   was unreachable from the CI network.
#
# Usage:
#   bash scripts/gen_blog_odm_oem_images.sh
#
# After generation, copy outputs into:
#   src/assets/images/blog/odm-oem-guide/odm-oem-cover.jpg
#   public/images/blog/odm-oem-guide/odm-existing-design-rebrand.jpg
#   public/images/blog/odm-oem-guide/oem-custom-engineering.jpg
#
# Requires: APIMART_API_KEY in .env or environment, and network
#   access to https://api.apimart.ai (proxy 127.0.0.1:7897).
# ============================================================
set -euo pipefail

cd "$(dirname "$0")/.."
OUT=outputs/images/odm-oem-guide
mkdir -p "$OUT"

# 1) Cover image — split-screen OEM vs ODM concept, 16:9
python3 scripts/gen_image.py \
  --prompt "Split-screen professional product photograph: on the left, a sleek modern LED track lighting fixture labeled with a blank white brand box on the housing (ODM rebrand concept); on the right, an engineer reviewing a CAD drawing and a machined aluminum fixture prototype on a workbench (OEM custom concept). Clean modern lighting factory environment, shallow depth of field, high detail, soft diffused studio lighting, photorealistic, 8k" \
  --size "16:9" --resolution "1k" --n 1 \
  --out "$OUT" --output-name odm-oem-cover

# 2) ODM section — existing catalog fixture being rebranded
python3 scripts/gen_image.py \
  --prompt "Professional photograph of a modern black LED track light fixture on a clean assembly bench, a worker in white gloves applying a subtle brand label, other similar fixtures with different color trims behind, bright clean LED lighting factory, photorealistic product photography, soft shadows, high detail" \
  --size "16:9" --resolution "1k" --n 1 \
  --out "$OUT" --output-name odm-existing-design-rebrand

# 3) OEM section — custom engineering and tooling
python3 scripts/gen_image.py \
  --prompt "Professional photograph of an LED lighting engineer in a modern factory reviewing a detailed CAD blueprint of a track light while a die-cast aluminum housing prototype and optical reflector sit on the desk, CNC machining in the blurred background, clean industrial lighting, photorealistic, high detail" \
  --size "16:9" --resolution "1k" --n 1 \
  --out "$OUT" --output-name oem-custom-engineering

echo ""
echo "=== Done. Copy files into place: ==="
echo "cp $OUT/odm-oem-cover*.png src/assets/images/blog/odm-oem-guide/odm-oem-cover.jpg"
echo "cp $OUT/odm-existing-design-rebrand*.png public/images/blog/odm-oem-guide/odm-existing-design-rebrand.jpg"
echo "cp $OUT/oem-custom-engineering*.png public/images/blog/odm-oem-guide/oem-custom-engineering.jpg"
