import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const specPath = path.join(projectRoot, 'docs/M3_SPEC.md');
const cssArg = process.argv.indexOf('--css');
const cssPath = cssArg < 0 ? path.join(projectRoot, 'src/app/globals.css') : process.argv[cssArg + 1];
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


// Every HSL compatibility alias is compared in sRGB; <=1 channel rounding tolerance.
const aliases = {
  background:'surface', foreground:'onSurface', card:'surfaceContainerLow', 'card-foreground':'onSurface',
  popover:'surfaceContainerHigh', 'popover-foreground':'onSurface', primary:'primary', 'primary-foreground':'onPrimary',
  secondary:'secondaryContainer', 'secondary-foreground':'onSecondaryContainer', muted:'surfaceContainerHighest',
  'muted-foreground':'onSurfaceVariant', accent:'secondaryContainer', 'accent-foreground':'onSecondaryContainer',
  destructive:'error', 'destructive-foreground':'onError', border:'outlineVariant', input:'outline', ring:'primary',
  success:'success', 'success-foreground':'onSuccess', warning:'warning', 'warning-foreground':'onWarning',
};
function hslRgb(value) {
  const m = value?.match(/^\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%\s*$/);
  if (!m) return null;
  const h=Number(m[1])/60, s=Number(m[2])/100, l=Number(m[3])/100;
  const c=(1-Math.abs(2*l-1))*s, x=c*(1-Math.abs(h%2-1)), base=l-c/2;
  const rgb=[[c,x,0],[x,c,0],[0,c,x],[0,x,c],[x,0,c],[c,0,x]][Math.floor(h)%6];
  return rgb.map(v=>(v+base)*255);
}
for (const [theme, block, expected, semantic] of [
  ['light',rootMatch[1],expectedLight,expectedSemLight], ['dark',darkMatch[1],expectedDark,expectedSemDark],
]) {
  for (const [alias, role] of Object.entries(aliases)) {
    const value=block.match(new RegExp('--'+alias+':\\s*([^;]+);'))?.[1];
    const rgb=hslRgb(value), hex=expected[role] ?? semantic[role];
    const target=hex.slice(1).match(/../g).map(v=>parseInt(v,16));
    if (!rgb || rgb.some((v,i)=>Math.abs(v-target[i])>1)) {
      console.error(`FAIL: ${theme} alias ${alias} does not match ${role}`); mismatches++;
    }
  }
  // Parse all 22 rows in the approved alpha table, not a second numeric allowlist.
  const rows=[...spec.matchAll(/\| (light|dark) (\w+)\/(\w+) \|[^\n]+?\| (\d+)%\/(\d+)%\/(\d+)%\/(\d+)% \|/g)].filter(m=>m[1]===theme);
  if (rows.length!==11) throw new Error('missing contrast alpha rows');
  for (const row of rows) {
    const pair=toKebab(row[3]);
    for (const [i,state] of ['hover','focus','pressed','dragged'].entries()) {
      const value=block.match(new RegExp('--m3-layer-'+pair+'-'+state+':\\s*([^;]+);'))?.[1];
      if (value===undefined || Number(value)!==Number(row[4+i])/100) {
        console.error(`FAIL: ${theme} alpha ${pair}/${state}`); mismatches++;
      }
    }
  }
}
if (mismatches) { console.error(`FAIL: ${mismatches} token/alias/alpha mismatches`); process.exit(1); }
console.log('PASS: 49 roles + 8 semantic roles, 23 aliases/theme and 88 alpha overrides match spec.');
