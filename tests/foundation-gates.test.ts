// @ts-expect-error bun:test types are provided by bun runtime
import { test, expect } from 'bun:test';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

// These tests exercise the executable gate, not a duplicated blacklist.
const original = readFileSync('src/lib/copy.ts', 'utf8');
const mutations = [
  ['invented time promise', (s: string) => s + "\nexport const FAKE = 'siap dalam 15 menit';"],
  ['unknown promise outside former blacklist', (s: string) => s + "\nexport const FAKE = 'Dijamin selesai dalam tujuh detik.';"],
  ['missing required approval notification', (s: string) => s.replace(/ {2}approve: 'Pesanan disetujui dan masuk antrean cetak.',\r?\n/, '')],
] as const;
for (const [name, mutate] of mutations) test(`copy gate rejects ${name} (exit 1)`, () => {
  const dir = mkdtempSync('E:/OpenBot/tmp/copy-mutation-');
  try {
    const file = join(dir, 'copy.ts');
    writeFileSync(file, mutate(original));
    const result = spawnSync(process.execPath.includes('bun') ? 'node' : process.execPath,
      ['scripts/check-copy.mjs', '--copy', file], { encoding: 'utf8' });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('FAIL:');
  } finally { rmSync(dir, { recursive: true }); }
});
test('copy gate accepts reviewed registry', () => {
  expect(spawnSync('node', ['scripts/check-copy.mjs']).status).toBe(0);
});
for (const [name, mutate] of [
  ['wrong alias', (s: string) => s.replace(/--popover:[^;]+;/, '--popover: 0 0% 0%;')],
  ['wrong alpha override', (s: string) => s.replace('--m3-layer-primary-container-hover: 0;', '--m3-layer-primary-container-hover: 0.08;')],
] as const) test(`token gate rejects ${name}`, () => {
  const dir = mkdtempSync('E:/OpenBot/tmp/token-mutation-');
  try {
    const file = join(dir, 'globals.css');
    writeFileSync(file, mutate(readFileSync('src/app/globals.css', 'utf8')));
    expect(spawnSync('node', ['scripts/check-tokens.mjs', '--css', file]).status).toBe(1);
  } finally { rmSync(dir, { recursive: true }); }
});
