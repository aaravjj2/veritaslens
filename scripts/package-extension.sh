#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT/extension"
npm install
npm run build
cd "$ROOT"
rm -f veritaslens-v1.0.zip
(
  cd extension/dist
  zip -r "$ROOT/veritaslens-v1.0.zip" .
)
echo "Built $ROOT/veritaslens-v1.0.zip"
unzip -l "$ROOT/veritaslens-v1.0.zip" | head -n 30
