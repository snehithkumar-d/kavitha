#!/usr/bin/env bash
# kavitha · fetch-fonts.sh
#
# Downloads the three woff2 font files used by the theme into assets/fonts/.
# All three are open source (SIL OFL / Apache-2.0).
#
#   Fraunces       — github.com/undercase/Fraunces (SIL OFL)
#   Geist          — github.com/vercel/geist-font (SIL OFL)
#   Geist Mono     — github.com/vercel/geist-font (SIL OFL)
#
# Usage:  npm run fonts   (or)   bash scripts/fetch-fonts.sh

set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/assets/fonts"
mkdir -p "$DIR"
cd "$DIR"

echo "→ fetching fonts into $DIR"

# Geist (variable)
curl -fsSL -o Geist-Variable.woff2 \
    "https://github.com/vercel/geist-font/raw/main/packages/next/dist/fonts/geist-sans/Geist-Variable.woff2"

# Geist Mono (variable)
curl -fsSL -o GeistMono-Variable.woff2 \
    "https://github.com/vercel/geist-font/raw/main/packages/next/dist/fonts/geist-mono/GeistMono-Variable.woff2"

# Fraunces (variable, upright + italic) — sourced from Google Fonts CSS API which serves woff2
# (the upstream undercase/Fraunces repo ships TTF only)
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
curl -fsSL -A "$UA" 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..700&display=swap' \
    | grep -oE 'https://fonts\.gstatic\.com/[^)]+\.woff2' \
    | head -2 \
    | (i=0; while IFS= read -r url; do
        i=$((i + 1))
        if [ "$i" = "1" ]; then out="Fraunces-Variable.woff2"; else out="Fraunces-Italic-Variable.woff2"; fi
        curl -fsSL -o "$out" "$url"
        echo "  ✓ $out"
    done)

echo "✓ fonts fetched."
echo "  These files are ignored by git (see assets/fonts/.gitignore)."
