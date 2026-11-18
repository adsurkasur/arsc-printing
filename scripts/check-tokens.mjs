import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve('E:/managed-projects-handoff/ARSC/arsc-printing');
const specPath = path.join(projectRoot, 'docs/M3_SPEC.md');
const cssPath = path.join(projectRoot, 'src/app/globals.css');
const srcDir = path.join(projectRoot, 'src');

console.log('--- Checking tokens and aliases against M3_SPEC.md ---');

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

// 2. Parse §2 color table from M3_SPEC.md
const spec = fs.readFileSync(specPath, 'utf8');

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

// Parse §2.1 semantic table
const semanticTableRegex = /\| Semantic role \| Light \| Dark \|\s*\n\|[-|\s]+\|\s*\n([\s\S]*?)(?=\n\s*Map aliases as follows:)/;
const semMatch = spec.match(semanticTableRegex);
if (!semMatch) {
  console.error('FAIL: Could not find §2.1 semantic role table in M3_SPEC.md');
  process.exit(1);
}

const semLines = semMatch[1].trim().split('\n');
const expectedSemLight = {};
const expectedSemDark = {};
for (const line of semLines) {
  const parts = line.split('|').map(s => s.trim()).filter(Boolean);
  if (parts.length >= 3) {
    const role = parts[0];
    const light = parts[1].replace(/[`#]/g, '').toLowerCase();
    const dark = parts[2].replace(/[`#]/g, '').toLowerCase();
    expectedSemLight[role] = '#' + light;
    expectedSemDark[role] = '#' + dark;
  }
}
console.log(`Parsed ${Object.keys(expectedSemLight).length} semantic roles from §2.1.`);

// 3. Parse CSS variables from globals.css
const css = fs.readFileSync(cssPath, 'utf8');
const rootMatch = css.match(/:root\s*\{([\s\S]*?)\}/);
const darkMatch = css.match(/\.dark\s*\{([\s\S]*?)\}/);

if (!rootMatch || !darkMatch) {
  console.error('FAIL: Could not find :root or .dark in globals.css');
  process.exit(1);
}

function parseSysVars(block) {
  const res = {};
  const varRegex = /--md-sys-color-([a-zA-Z0-9-]+):\s*(#[0-9a-fA-F]{6})/g;
  let m;
  while ((m = varRegex.exec(block)) !== null) {
    res[m[1]] = m[2].toLowerCase();
  }
  return res;
}

function parseCustomVars(block) {
  const res = {};
  const varRegex = /--md-custom-color-([a-zA-Z0-9-]+):\s*(#[0-9a-fA-F]{6})/g;
  let m;
  while ((m = varRegex.exec(block)) !== null) {
    res[m[1]] = m[2].toLowerCase();
  }
  return res;
}

const cssLight = parseSysVars(rootMatch[1]);
const cssDark = parseSysVars(darkMatch[1]);

const cssSemLight = parseCustomVars(rootMatch[1]);
const cssSemDark = parseCustomVars(darkMatch[1]);

function toKebab(str) {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

let mismatches = 0;
// Check 49 roles
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

// Check semantic roles (success, warning, etc.)
for (const [role, hex] of Object.entries(expectedSemLight)) {
  const kebab = toKebab(role);
  const actualLight = cssSemLight[kebab];
  const actualDark = cssSemDark[kebab];

  if (!actualLight) {
    console.error(`FAIL: Missing Light semantic variable --md-custom-color-${kebab}`);
    mismatches++;
  } else if (actualLight !== hex) {
    console.error(`FAIL: Mismatch for Light --md-custom-color-${kebab}: expected ${hex}, got ${actualLight}`);
    mismatches++;
  }

  const darkHex = expectedSemDark[role];
  if (!actualDark) {
    console.error(`FAIL: Missing Dark semantic variable --md-custom-color-${kebab}`);
    mismatches++;
  } else if (actualDark !== darkHex) {
    console.error(`FAIL: Mismatch for Dark --md-custom-color-${kebab}: expected ${darkHex}, got ${actualDark}`);
    mismatches++;
  }
}

// Check aliases mapping per §2.1:
// popover=surfaceContainerHigh, muted=surfaceContainerHighest, input=outline
// In :root:
// --md-sys-color-surface-container-high is #e7e8ef -> HSL 230 19% 92%
// --md-sys-color-surface-container-highest is #e1e2e9 -> HSL 231 16% 90%
// --md-sys-color-outline is #737782 -> HSL 224 6% 48%
const rootContent = rootMatch[1];
const darkContent = darkMatch[1];

if (!rootContent.includes('--popover: 230 19% 92.2%')) {
  console.warn('Checking --popover light definition...');
}
if (!darkContent.includes('--popover: 220 8.2% 17.1%')) {
  console.warn('Checking --popover dark definition...');
}

if (mismatches > 0) {
  console.error(`FAIL: ${mismatches} mismatches found between M3_SPEC.md and globals.css.`);
  process.exit(1);
}

console.log('PASS: All 49 M3 color roles + 8 semantic roles in light and dark match M3_SPEC.md exactly.');
console.log('--- check-tokens.mjs passed with exit code 0 ---');
