/**
 * Strip all aurora theme CSS from index.css
 */
import fs from 'fs';
import path from 'path';

const cssPath = path.resolve('client/src/index.css');
const lines = fs.readFileSync(cssPath, 'utf8').split('\n');
const out = [];

function isAuroraSelector(line) {
  return /html\.aurora\b/.test(line) || /html\.is-mobile-perf\s+html\.aurora\b/.test(line);
}

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];

  if (line.includes('SOLAR FLUX') && line.trim().startsWith('/*')) {
    continue;
  }

  // Start of a rule: gather selector lines until '{'
  if (isAuroraSelector(line) || (line.includes('html.dark') && i + 1 < lines.length && isAuroraSelector(lines[i + 1]))) {
    const selectorLines = [];
    let j = i;
    while (j < lines.length && !lines[j].includes('{')) {
      selectorLines.push(lines[j]);
      j++;
    }
    if (j >= lines.length) {
      out.push(line);
      continue;
    }

    const keptSelectors = selectorLines.filter((sl) => !isAuroraSelector(sl));
    if (keptSelectors.length === 0) {
      // Skip entire rule block
      let depth = 0;
      while (j < lines.length) {
        depth += (lines[j].match(/\{/g) || []).length;
        depth -= (lines[j].match(/\}/g) || []).length;
        j++;
        if (depth <= 0) break;
      }
      i = j;
      continue;
    }

    // Mixed rule — keep dark selectors only
    for (const sl of keptSelectors) out.push(sl);
    let depth = 0;
    while (j < lines.length) {
      out.push(lines[j]);
      depth += (lines[j].match(/\{/g) || []).length;
      depth -= (lines[j].match(/\}/g) || []).length;
      j++;
      if (depth <= 0) break;
    }
    i = j;
    continue;
  }

  if (isAuroraSelector(line)) {
    // Aurora-only selector line not caught above — skip rule
    let j = i;
    let depth = 0;
    do {
      depth += (lines[j].match(/\{/g) || []).length;
      depth -= (lines[j].match(/\}/g) || []).length;
      j++;
    } while (j < lines.length && depth > 0);
    i = j;
    continue;
  }

  out.push(line);
}

let css = out.join('\n');
css = css.replace(/light-bg-aurora-wash/g, 'light-bg-accent-wash');
css = css.replace(/home-how-dreamz__fusion-aurora/g, 'home-how-dreamz__fusion-glow');
css = css.replace(/dash-mobile-deck__aurora/g, 'dash-mobile-deck__glow');
css = css.replace(/dark \/ aurora/gi, 'dark');
css = css.replace(/light · dark · aurora/gi, 'light · dark');
css = css.replace(/\n{4,}/g, '\n\n\n');

fs.writeFileSync(cssPath, css);
console.log('html.aurora rules:', (css.match(/html\.aurora/g) || []).length);
console.log('aurora mentions:', (css.match(/aurora/gi) || []).length);
