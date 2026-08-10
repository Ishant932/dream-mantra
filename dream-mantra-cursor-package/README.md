# Dream Mantra — Test Portal (static front-end)

Plain HTML/CSS/JS mockup of the portal — no framework, no build step, no scoring formulas.
Matches the current app state: all 7 Skill Mapping tests visible, no Reports tab, "Your class"
driven by the Profile step's academic-stage answer.

## Folder structure

```
index.html        entry point — header + all 3 tabs (Profile, Ask questions, Take test)
css/styles.css     all styling (colors/tokens copied from the real app's globals.css)
js/app.js          tab / sub-tab / wizard logic — reads content from data/data.json
data/data.json     all editable content: user info, the 7 instruments, chat messages, wizard fields
assets/logo.svg    brand mark used in the header
```

## Running it in Cursor

`app.js` loads `data/data.json` via `fetch()`, which browsers block on the plain `file://`
protocol. Serve the folder over local HTTP instead:

- **Cursor/VS Code**: install the "Live Server" extension, right-click `index.html` → "Open with Live Server".
- **Or from a terminal** in this folder:
  ```bash
  npx serve .
  ```
  then open the printed `http://localhost:...` URL.

## Editing content

Everything text-based (instrument titles/hints, chat messages, wizard field labels, the
signed-in user's name/ID) lives in `data/data.json` — edit that file, no HTML/JS changes needed.

To change colors/spacing, edit the CSS custom properties at the top of `css/styles.css`
(`--dm-accent`, `--dm-tint-*`, etc.) — they match the real app's design tokens.
