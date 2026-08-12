#!/usr/bin/env bash
# ============================================================
# Generate ODM vs OEM blog images via APIMart gpt-image-2 (1k)
# ============================================================
# Purpose: produce the 3 AI images for the "ODM vs OEM LED
#   Lighting" blog post, replacing the placeholder photos that
#   were copied from the factory library while api.apimart.ai
#   was unreachable from the CI network.
#
# Usage (run on a machine with network access to APIMart):
#   bash scripts/gen_blog_odm_oem_images.sh
#
#   - Generates 3 images into outputs/images/odm-oem-guide/
#   - Validates each file (non-empty + decodable as image)
#   - Retries failed generations up to $MAX_RETRY times
#   - Auto-copies valid results into the site's asset folders
#
# After generation, images are deployed to:
#   src/assets/images/blog/odm-oem-guide/odm-oem-cover.jpg
#   public/images/blog/odm-oem-guide/odm-existing-design-rebrand.jpg
#   public/images/blog/odm-oem-guide/oem-custom-engineering.jpg
#
# Requires: APIMART_API_KEY in .env or environment, and network
#   access to https://api.apimart.ai (proxy 127.0.0.1:7897 on the
#   machine that runs this script).
# ============================================================
set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$(pwd)"
OUT="$ROOT/outputs/images/odm-oem-guide"
mkdir -p "$OUT"

# ------------------------------------------------------------------
# Config
# ------------------------------------------------------------------
MAX_RETRY="${MAX_RETRY:-3}"          # retries per image on failure
PROXY="${APIMART_PROXY:-http://127.0.0.1:7897}"

# Destinations (cover via astro:assets, inline images via public/)
declare -A DEST=(
  [odm-oem-cover]="$ROOT/src/assets/images/blog/odm-oem-guide/odm-oem-cover.jpg"
  [odm-existing-design-rebrand]="$ROOT/public/images/blog/odm-oem-guide/odm-existing-design-rebrand.jpg"
  [oem-custom-engineering]="$ROOT/public/images/blog/odm-oem-guide/oem-custom-engineering.jpg"
)

# ------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------
# Pillow availability (used for image validation + JPEG conversion).
# If missing, fall back to a non-empty / magic-byte check and keep PNG.
HAS_PIL=false
python3 -c "import PIL" 2>/dev/null && HAS_PIL=true

# Validate a generated image file: non-empty (+ decodable if Pillow present).
is_valid_image() {
  local f="$1"
  [ -s "$f" ] || return 1
  # magic-byte sanity check via the file command (portable)
  local ftype
  ftype="$(file -b --mime-type "$f" 2>/dev/null)"
  case "$ftype" in
    image/png|image/jpeg) ;;  # valid raster image
    *) echo "⚠️  unexpected file type: '$ftype'" >&2; return 1 ;;
  esac
  if [ "$HAS_PIL" = true ]; then
    python3 - "$f" <<'PY' || return 1
import sys
try:
    from PIL import Image
    img = Image.open(sys.argv[1])
    img.verify()
    print(f"ok {img.format} {img.size[0]}x{img.size[1]}")
except Exception as e:
    print(f"invalid: {e}", file=sys.stderr)
    sys.exit(1)
PY
  fi
  return 0
}

# Convert to JPEG (best-effort). Falls back to copying PNG when Pillow is
# unavailable (PNG remains valid for the site).
to_jpeg() {
  local src="$1" dst="$2"
  mkdir -p "$(dirname "$dst")"
  if [ "$HAS_PIL" = true ]; then
    python3 - "$src" "$dst" <<'PY'
import sys
try:
    from PIL import Image
    img = Image.open(sys.argv[1]).convert("RGB")
    w, h = img.size
    m = max(w, h)
    if m > 1024:
        scale = 1024 / m
        img = img.resize((round(w*scale), round(h*scale)), Image.LANCZOS)
    img.save(sys.argv[2], "JPEG", quality=88, optimize=True)
    print(f"converted -> {sys.argv[2]} ({img.size[0]}x{img.size[1]})")
except Exception as e:
    print(f"convert failed: {e}", file=sys.stderr)
    sys.exit(1)
PY
  else
    cp -f "$src" "$dst"
    echo "⚠️ Pillow not found — copied PNG as-is: $dst (consider 'pip install Pillow')"
  fi
}

# Generate one image with retry + validation.
generate() {
  local name="$1" prompt="$2"
  local attempt=0 file=""
  while [ "$attempt" -lt "$MAX_RETRY" ]; do
    attempt=$((attempt + 1))
    echo ""
    echo "── [${attempt}/${MAX_RETRY}] Generating '$name' ..."
    python3 scripts/gen_image.py \
      --prompt "$prompt" \
      --size "16:9" --resolution "1k" --n 1 \
      --out "$OUT" --output-name "$name" \
      || { echo "⚠️ gen_image.py exited non-zero"; continue; }

    file="$OUT/$name.png"
    if is_valid_image "$file"; then
      echo "✔ '$name' valid: $file"
      return 0
    else
      echo "⚠️ '$name' failed validation, retrying..."
      rm -f "$file"
    fi
  done
  echo "❌ '$name' failed after $MAX_RETRY attempts."
  return 1
}

# ------------------------------------------------------------------
# 1) Cover image — split-screen OEM vs ODM concept, 16:9
# ------------------------------------------------------------------
gen_fail=0
generate odm-oem-cover \
  "Split-screen professional product photograph: on the left, a sleek modern LED track lighting fixture labeled with a blank white brand box on the housing (ODM rebrand concept); on the right, an engineer reviewing a CAD drawing and a machined aluminum fixture prototype on a workbench (OEM custom concept). Clean modern lighting factory environment, shallow depth of field, high detail, soft diffused studio lighting, photorealistic, 8k" \
  || gen_fail=1

# ------------------------------------------------------------------
# 2) ODM section — existing catalog fixture being rebranded
# ------------------------------------------------------------------
generate odm-existing-design-rebrand \
  "Professional photograph of a modern black LED track light fixture on a clean assembly bench, a worker in white gloves applying a subtle brand label, other similar fixtures with different color trims behind, bright clean LED lighting factory, photorealistic product photography, soft shadows, high detail" \
  || gen_fail=1

# ------------------------------------------------------------------
# 3) OEM section — custom engineering and tooling
# ------------------------------------------------------------------
generate oem-custom-engineering \
  "Professional photograph of an LED lighting engineer in a modern factory reviewing a detailed CAD blueprint of a track light while a die-cast aluminum housing prototype and optical reflector sit on the desk, CNC machining in the blurred background, clean industrial lighting, photorealistic, high detail" \
  || gen_fail=1

# ------------------------------------------------------------------
# Deploy valid images into site asset folders
# ------------------------------------------------------------------
echo ""
echo "=== Deploying images to site assets ==="
failed=0
for name in "${!DEST[@]}"; do
  src="$OUT/$name.png"
  dst="${DEST[$name]}"
  if [ -s "$src" ]; then
    if to_jpeg "$src" "$dst"; then
      echo "✔ deployed: $dst"
    else
      echo "❌ convert failed for '$name'"; failed=1
    fi
  else
    echo "⚠️ missing source for '$name', skip deploy"; failed=1
  fi
done

echo ""
echo "=== Done ==="
if [ "$failed" -eq 0 ]; then
  echo "✅ All 3 images generated & deployed. Next steps:"
  echo "   git add . && git commit -m 'feat: add AI-generated ODM vs OEM images' && git push"
else
  echo "⚠️ Some images failed. Re-run this script to retry, or check network / API key."
  echo "   APIMART key: check .env (APIMART_API_KEY)"
  echo "   Proxy on this machine: $PROXY"
fi
