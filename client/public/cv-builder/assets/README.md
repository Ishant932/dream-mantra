# assets/

Static files for the CV Builder.

- `logo-dot.svg` — the small navy/gold Dream Mantra brand dot (used as a favicon or in the header if you want to add a logo).

Note: profile photos uploaded through the "Misc / Optional" tab are **not** saved here — they're read in-browser and kept in memory as base64 data (embedded straight into the CV preview / PDF). Nothing is written to disk. If you'd like uploaded photos to persist across sessions, that would need a small backend or `localStorage`/`indexedDB` addition — currently out of scope by design, to keep this a single static site with no server dependency.

Drop any future assets here — e.g. a real Dream Mantra logo file, a custom favicon (`favicon.ico`), or additional font files if you switch off the Google Fonts CDN — and reference them with a relative path from `index.html` or `css/styles.css` (e.g. `assets/favicon.ico`).
