# Dream Mantra CV Builder

An ATS-friendly resume builder — 8 templates, custom color themes & fonts, live ATS compatibility scoring, clickable links, proof-of-certification links, and one-click A4 PDF export. No build step, no backend — plain HTML/CSS/JS.

## Folder structure

```
dream-mantra-cv-builder/
├── index.html          → app shell + markup, loads css/js
├── css/
│   └── styles.css       → all styling (editor UI + all 8 CV templates + print rules)
├── js/
│   └── app.js            → all logic (state, rendering, ATS scoring, PDF export)
├── data/
│   └── config.json       → color themes, font pairings, date formats, template list
└── assets/
    ├── logo-dot.svg      → small brand mark / favicon
    └── README.md
```

## Running it in Cursor

Because `app.js` loads `data/config.json` via `fetch()`, it needs to be served over `http://`, not opened directly as a `file://` path (browsers block `fetch` for local files under `file://`). Two easy options inside Cursor:

**Option A — built-in Live Preview / Live Server extension**
Install the "Live Server" (or Cursor's built-in Live Preview) extension, right-click `index.html` → "Open with Live Server."

**Option B — quick terminal server**
```bash
cd dream-mantra-cv-builder
npx serve .
# or: python3 -m http.server 5500
```
Then open the printed `localhost` URL.

> If you *do* open `index.html` directly by double-clicking it, the app still works — it detects the failed fetch and silently falls back to an identical built-in copy of the config (see `FALLBACK_CONFIG` in `js/app.js`). You just won't be able to hot-edit `config.json` and see it reflected without a server.

## Editing without touching JavaScript

Open `data/config.json` to:
- add/remove **color themes** (`colorThemes`)
- add/remove **font pairings** (`fontPairs` — mark `"safe": true` if it's a system font, for ATS scoring)
- add/remove **date display formats** (`dateFormats`)
- add/remove **template cards** shown in the template picker (`templates` — the `key` must match a `.tpl-<key>` CSS class in `css/styles.css` and a branch in `render()` in `app.js` if it needs unique layout logic)

If you keep the server running, just save the JSON file and refresh the browser tab.

## Key things to know about the code

- **State** lives in a single `state` object at the top of `app.js` (personal info, all resume sections, settings, visibility toggles).
- **`render()`** is the single function that re-draws the CV preview (`#page`) any time something changes — it switches on `state.template` to pick which HTML structure to build.
- **`computeATSScore()`** is a genuine, weighted checklist (contact completeness, summary depth, experience bullets, education, skills count, ATS-safe template/font, content length, links) — not a hardcoded number. A fully filled-out resume on an ATS-safe template naturally lands in the 90s.
- **PDF export** is just `window.print()` plus an `@page { size: A4; margin: 0; }` print stylesheet — this keeps text selectable and links clickable in the exported PDF (unlike screenshot/canvas-based exporters).
- **Photo upload** (Misc tab) is read client-side and stored as a base64 data URL in `state.misc.photo` — nothing is uploaded anywhere.

## Adding a brand-new template

1. Add an entry to `templates` in `data/config.json` with a unique `key` and a `swatch` class name.
2. Add a `.swatch.t-<key>{...}` rule in `css/styles.css` for the little preview thumbnail.
3. Add `.tpl-<key> ...` CSS rules for the actual resume layout (copy the closest existing template as a starting point, e.g. `.tpl-classic` or `.tpl-modern`).
4. If the template needs a genuinely different HTML skeleton (like `sidebar` does), add a branch for it inside `render()` in `app.js`. If it's just a CSS reskin of the single-column layout (like `compact`, `timeline`, `executive`), you don't need any JS changes — the default branch already handles it.
