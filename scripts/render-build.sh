#!/usr/bin/env sh
set -e
echo "Dream Mantra Render build — using prebuilt client/dist from git"
npm install
npm install --prefix backend
npm install --include=dev --prefix client
if [ ! -f client/dist/index.html ]; then
  echo "client/dist missing — running vite build"
  node scripts/generate-sitemaps.js
  NODE_OPTIONS=--max-old-space-size=768 npm run build --prefix client
else
  echo "client/dist found — regenerating sitemaps and skipping vite build"
  node scripts/generate-sitemaps.js
  cp client/public/sitemap*.xml client/dist/ 2>/dev/null || true
  cp client/public/robots.txt client/dist/ 2>/dev/null || true
fi
echo "Build complete"
