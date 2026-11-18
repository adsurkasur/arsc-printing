import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve('E:/managed-projects-handoff/ARSC/arsc-printing');
const copyPath = path.join(projectRoot, 'src/lib/copy.ts');

const prohibited = ['15 menit', '50 mb', '08.00', '16.00', 'lantai 1', 'gedung f ftp'];

const content = fs.readFileSync(copyPath, 'utf8').toLowerCase();
let failed = false;

for (const p of prohibited) {
  if (content.includes(p)) {
    console.error(`FAIL: copy.ts contains unapproved string: "${p}"`);
    failed = true;
  }
}

// Verify required limits exist
if (!content.includes('10 mib')) {
  console.error('FAIL: copy.ts missing required 10 MiB limit');
  failed = true;
}
if (!content.includes('5 mib')) {
  console.error('FAIL: copy.ts missing required 5 MiB limit');
  failed = true;
}

// Verify backend_completed wording
if (!content.includes('menunggu pemeriksaan hasil')) {
  console.error('FAIL: copy.ts missing exact backend_completed mapping');
  failed = true;
}

if (failed) {
  process.exit(1);
}

console.log('PASS: check-copy verified verbatim compliance with M3_SPEC.md §5-§7.');
