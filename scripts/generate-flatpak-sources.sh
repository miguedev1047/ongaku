#!/usr/bin/env bash
set -euo pipefail

echo "==> 1/2 Generating Rust (Cargo) offline sources..."
python3 .flatpak/flatpak-builder-tools/cargo/flatpak-cargo-generator.py src-tauri/Cargo.lock -o cargo-sources.json

echo "==> 2/2 Generating Frontend (Bun/Node) offline sources..."
bun install --yarn
flatpak-node-generator yarn yarn.lock -o node-sources.json
rm -f yarn.lock

echo "==> Done! Generated:"
echo "    - cargo-sources.json ($(du -h cargo-sources.json | cut -f1))"
echo "    - node-sources.json  ($(du -h node-sources.json | cut -f1))"
