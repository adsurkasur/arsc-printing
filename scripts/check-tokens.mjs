import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve('E:/managed-projects-handoff/ARSC/arsc-printing');
const specPath = path.join(projectRoot, 'docs/M3_SPEC.md');
const cssPath = path.join(projectRoot, 'src/app/globals.css');
const srcDir = path.join(projectRoot, 'src');

console.log('--- Checking tokens against M3_SPEC.md ---');

// 1. Prohibited old green values check
const prohibited = ['90d5a8', '1b5e3c', '121412'];
function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.isFile() && /\.(tsx?|css|json|html|mjs|js)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8').toLowerCase();
      for (const p of prohibited) {
        if (content.includes(p)) {
          console.error(`FAIL: Found prohibited hex #${p} in ${fullPath}`);
          process.exit(1);
        }
      }
    }
  }
}
scanDir(srcDir);
console.log('PASS: No prohibited old green hex values found in src/.');

// 2. Parse §2 tables from M3_SPEC.md
const spec = fs.readFileSync(specPath, 'utf8');

// Match §2 color table: | Role | Light | Dark |
const colorTableRegex = /\| Role \| Light \| Dark \|\s*\n\|[-|\s]+\|\s*\n([\s\S]*?)(?=\n\s*### 2\.1|\n\s*## 2\.1)/;
const match = spec.match(colorTableRegex);
if (!match) {
  console.error('FAIL: Could not find §2 color table in M3_SPEC.md');
  process.exit(1);
}

const lines = match[1].trim().split('\n');
const expectedLight = {};
const expectedDark = {};

for (const line of lines) {
  const parts = line.split('|').map(s => s.trim()).filter(Boolean);
  if (parts.length >= 3) {
    const role = parts[0];
    const light = parts[1].replace(/[`#]/g, '').toLowerCase();
    const dark = parts[2].replace(/[`#]/g, '').toLowerCase();
    expectedLight[role] = '#' + light;
    expectedDark[role] = '#' + dark;
  }
}

console.log(`Parsed ${Object.keys(expectedLight).length} roles from M3_SPEC.md §2.`);

// 3. Parse CSS variables from globals.css
const css = fs.readFileSync(cssPath, 'utf8');
const rootMatch = css.match(/:root\s*\{([\s\S]*?)\}/);
const darkMatch = css.match(/\.dark\s*\{([\s\S]*?)\}/);

if (!rootMatch || !darkMatch) {
  console.error('FAIL: Could not find :root or .dark in globals.css');
  process.exit(1);
}

function parseVars(block) {
  const res = {};
  const varRegex = /--md-sys-color-([a-zA-Z0-9-]+):\s*(#[0-9a-fA-F]{6})/g;
  let m;
  while ((m = varRegex.exec(block)) !== null) {
    // Convert kebab to camelCase or preserve kebab
    res[m[1]] = m[2].toLowerCase();
  }
  return res;
}

const cssLight = parseVars(rootMatch[1]);
const cssDark = parseVars(darkMatch[1]);

function toKebab(str) {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

let mismatches = 0;
for (const [role, hex] of Object.entries(expectedLight)) {
  const kebab = toKebab(role);
  const actualLight = cssLight[kebab];
  const actualDark = cssDark[kebab];

  if (!actualLight) {
    console.error(`FAIL: Missing Light variable --md-sys-color-${kebab}`);
    mismatches++;
  } else if (actualLight !== hex) {
    console.error(`FAIL: Mismatch for Light --md-sys-color-${kebab}: expected ${hex}, got ${actualLight}`);
    mismatches++;
  }

  const darkHex = expectedDark[role];
  if (!actualDark) {
    console.error(`FAIL: Missing Dark variable --md-sys-color-${kebab}`);
    mismatches++;
  } else if (actualDark !== darkHex) {
    console.error(`FAIL: Mismatch for Dark --md-sys-color-${kebab}: expected ${darkHex}, got ${actualDark}`);
    mismatches++;
  }
}

if (mismatches > 0) {
  console.error(`FAIL: ${mismatches} mismatches found between M3_SPEC.md and globals.css.`);
  process.exit(1);
}

console.log('PASS: All 49 M3 color roles in light and dark match M3_SPEC.md exactly.');
console.log('--- check-tokens.mjs passed with exit code 0 ---');
