// @ts-expect-error bun:test types are provided by bun runtime
import { test, expect } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import HomePage from '../src/app/page';

test('HomePage renders exact tariff pairs and no literal backslash-n', () => {
  const html = renderToStaticMarkup(React.createElement(HomePage));
  expect(html).not.toContain('\\n');
  expect(html).toContain('Hitam putih');
  expect(html).toContain('Rp 500 per halaman');
  expect(html).toContain('Warna');
  expect(html).toContain('Rp 750 per halaman');
  expect(html.indexOf('Hitam putih')).toBeLessThan(html.indexOf('Rp 500 per halaman'));
  expect(html.indexOf('Rp 500 per halaman')).toBeLessThan(html.indexOf('Warna'));
  expect(html.indexOf('Warna')).toBeLessThan(html.indexOf('Rp 750 per halaman'));
});
