import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = process.argv.indexOf('--copy');
const file = arg < 0 ? path.join(root, 'src/lib/copy.ts') : process.argv[arg + 1];
try {
  const expected = JSON.parse(fs.readFileSync(path.join(root, 'docs/COPY_MANIFEST.json'), 'utf8'));
  const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  if (source.parseDiagnostics.length) throw new Error('invalid TypeScript');
  function literal(node) {
    if (ts.isAsExpression(node) || ts.isSatisfiesExpression(node) || ts.isParenthesizedExpression(node)) return literal(node.expression);
    if (ts.isStringLiteralLike(node)) return node.text;
    if (ts.isArrayLiteralExpression(node)) return node.elements.map(literal);
    if (ts.isObjectLiteralExpression(node)) {
      const out = {};
      for (const prop of node.properties) {
        if (!ts.isPropertyAssignment(prop) || !prop.name || !('text' in prop.name)) throw new Error('registry must contain literal properties');
        const key = prop.name.text;
        if (Object.hasOwn(out, key)) throw new Error('duplicate key ' + key);
        out[key] = literal(prop.initializer);
      }
      return out;
    }
    throw new Error('nonliteral registry value');
  }
  const actual = {};
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      const name = declaration.name.getText(source);
      if (name === 'COPY_STATUS_MAP' && declaration.initializer?.getText(source) === 'COPY_ORDER_STATUS') continue;
      actual[name] = literal(declaration.initializer);
    }
  }
  function compare(a, b, location = 'registry') {
    if (typeof a !== typeof b || a === null || b === null) {
      if (a !== b) throw new Error(location + ' changed');
      return;
    }
    if (typeof a !== 'object') { if (a !== b) throw new Error(location + ' changed'); return; }
    if (Array.isArray(a) !== Array.isArray(b)) throw new Error(location + ' changed shape');
    const keys = Object.keys(a).sort();
    if (JSON.stringify(keys) !== JSON.stringify(Object.keys(b).sort())) throw new Error(location + ' missing/unknown key');
    for (const key of keys) compare(a[key], b[key], location + '.' + key);
  }
  compare(expected, actual);
  console.log('PASS: copy registry matches reviewed COPY_MANIFEST.json (unknown, missing and changed values rejected).');
} catch (error) { console.error('FAIL: ' + error.message); process.exitCode = 1; }
