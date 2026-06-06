#!/usr/bin/env sh
set -e
echo "Dream Mantra Render build — using prebuilt client/dist from git"
npm install
npm install --prefix backend
npm install --include=dev --prefix client
if [ ! -f client/dist/index.html ]; then
  echo "client/dist missing — running vite build"
  NODE_OPTIONS=--max-old-space-size=768 npm run build --prefix client
else
  echo "client/dist found — skipping vite build"
fi
echo "Build complete"
