#!/usr/bin/env sh
set -e
echo "Dream Mantra Render build — full production build"
npm install
npm install --prefix backend
npm install --include=dev --prefix client
node scripts/generate-sitemaps.js
NODE_OPTIONS=--max-old-space-size=768 npm run build --prefix client
mkdir -p client/dist/images
cp -r client/public/images/* client/dist/images/ 2>/dev/null || true
cp client/public/robots.txt client/dist/ 2>/dev/null || true
cp client/public/sitemap*.xml client/dist/ 2>/dev/null || true
echo "Build complete (commit ${RENDER_GIT_COMMIT:-local})"
