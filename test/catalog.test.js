// Test chống "lệch tài liệu": agent.json / llms.txt / agent.html / bảng trong
// index.html phải luôn khớp với các map trong lib/svg.js.
//
// Vì sao cần: agent (Hermes) đọc đúng những file này để biết gửi theme/layout nào.
// Thêm một theme mà quên chạy `node bin/catalog.mjs` → agent gửi giá trị mà
// tài liệu không có → nó tưởng sai. Test này chặn đúng chuyện đó trong CI.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  THEMES, LAYOUTS, SIZES, PATTERNS, PRESETS, EXAMPLES, SIZE_GROUPS, LAYOUT_GROUPS,
  normalize, SIZE_LABELS, THEME_LABELS, LAYOUT_INFO, SIZE_USE,
} from '../lib/svg.js';
import { generate } from '../bin/catalog.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => readFile(path.join(ROOT, f), 'utf8');

test('tài liệu agent khớp lib/svg.js (chạy `npm run catalog` nếu fail)', async () => {
  const files = await generate();
  for (const [name, expected] of Object.entries(files)) {
    const actual = await read(name);
    assert.equal(actual, expected,
      `${name} lệch với lib/svg.js — chạy: node bin/catalog.mjs`);
  }
});

test('agent.json: version, endpoint dispatch và input schema đầy đủ', async () => {
  const doc = JSON.parse(await read('agent.json'));
  const pkg = JSON.parse(await read('package.json'));
  assert.equal(doc.version, pkg.version);

  const dispatch = doc.entrypoints.github_actions.dispatch;
  assert.match(dispatch.url, /\/actions\/workflows\/render\.yml\/dispatches$/);
  assert.ok(dispatch.body.ref.startsWith('refs/heads/'), 'phải có ref, thiếu là 422');

  // Mọi trường normalize() trả ra phải có trong inputs → agent biết gửi gì.
  const documented = new Set(doc.inputs.map((i) => i.key));
  for (const key of Object.keys(normalize({ title: 'x' }))) {
    assert.ok(documented.has(key), `agent.json thiếu input "${key}"`);
  }
  // ...và ngược lại, không tài liệu hoá trường không tồn tại.
  const real = new Set(Object.keys(normalize({ title: 'x' })));
  for (const key of documented) assert.ok(real.has(key), `agent.json có input lạ "${key}"`);
});

test('agent.json mô tả đủ theme/layout/size/pattern/preset', async () => {
  const doc = JSON.parse(await read('agent.json'));
  const keys = (list) => list.map((x) => x.key);
  assert.deepEqual(keys(doc.catalog.themes), Object.keys(THEMES));
  assert.deepEqual(keys(doc.catalog.layouts), Object.keys(LAYOUTS));
  assert.deepEqual(keys(doc.catalog.sizes), Object.keys(SIZES));
  assert.deepEqual(keys(doc.catalog.patterns), Object.keys(PATTERNS));
  assert.deepEqual(keys(doc.catalog.presets), PRESETS.map((p) => p.key));
  assert.deepEqual(keys(doc.catalog.examples), EXAMPLES.map((p) => p.key));
  assert.deepEqual(doc.catalog.groups.sizes, SIZE_GROUPS);
  assert.deepEqual(doc.catalog.groups.layouts, LAYOUT_GROUPS);
  // Nhãn tiếng Việt đi kèm để agent hiển thị / chọn hộ người dùng.
  for (const t of doc.catalog.themes) assert.equal(t.label, THEME_LABELS[t.key]);
  for (const s of doc.catalog.sizes) {
    assert.equal(s.label, SIZE_LABELS[s.key]);
    assert.equal(s.use, SIZE_USE[s.key]);
  }
  for (const l of doc.catalog.layouts) assert.equal(l.hint, LAYOUT_INFO[l.key].hint);
});

test('llms.txt liệt kê mọi khoá hợp lệ và đúng URL thật', async () => {
  const txt = await read('llms.txt');
  for (const key of Object.keys(THEMES)) assert.ok(txt.includes(key), `llms.txt thiếu theme ${key}`);
  for (const key of Object.keys(LAYOUTS)) assert.ok(txt.includes(key), `llms.txt thiếu layout ${key}`);
  for (const key of Object.keys(SIZES)) assert.ok(txt.includes(key), `llms.txt thiếu size ${key}`);
  for (const key of Object.keys(PATTERNS)) assert.ok(txt.includes(key), `llms.txt thiếu pattern ${key}`);
  assert.ok(txt.includes('api.github.com/repos/vanthuonghi/hinh-bang-code/actions/workflows/render.yml/dispatches'));
  assert.ok(txt.includes('"ref":"refs/heads/main"'), 'ví dụ dispatch phải có ref');
  assert.ok(txt.includes('agent.json') && txt.includes('agent.html'));
});

test('agent.html là trang tĩnh tự đủ, không phụ thuộc mạng', async () => {
  const html = await read('agent.html');
  assert.match(html, /^<!DOCTYPE html>/);
  assert.ok(!/<script src=/.test(html), 'trang hướng dẫn không được cần JS ngoài');
  assert.ok(html.includes('render.yml/dispatches'));
  assert.ok(html.includes('gallery/manifest.json'));
  for (const key of Object.keys(LAYOUTS)) assert.ok(html.includes(key), `agent.html thiếu layout ${key}`);
});

test('giới hạn độ dài trong agent.json khớp normalize() thật', async () => {
  const doc = JSON.parse(await read('agent.json'));
  const caps = doc.fallbacks.max_lengths;
  const long = 'x'.repeat(400);
  const out = normalize({ title: long, subtitle: long, author: long, footer: long });
  assert.equal(out.title.length, caps.title);
  assert.equal(out.subtitle.length, caps.subtitle);
  assert.equal(out.author.length, caps.author);
  assert.equal(out.footer.length, caps.footer);
});

test('workflow khai báo ĐỦ input mà tài liệu bảo agent gửi (thiếu = 422)', async () => {
  const yml = await read('.github/workflows/render.yml');
  const body = yml.slice(yml.indexOf('workflow_dispatch:'), yml.indexOf('permissions:'));
  const declared = [...body.matchAll(/^\s{6}([a-z_]+):$/gm)].map((m) => m[1]);
  const doc = JSON.parse(await read('agent.json'));
  const expected = doc.inputs.map((i) => i.key);
  for (const key of expected) {
    assert.ok(declared.includes(key), `workflow_dispatch thiếu input \"${key}\" — dispatch sẽ bị 422`);
  }
  // ...và ngược lại: input khai báo mà tài liệu không nhắc cũng là lệch.
  for (const key of declared) {
    assert.ok(expected.includes(key), `workflow có input \"${key}\" mà agent.json không mô tả`);
  }
});

test('index.html: có khối catalog, tab Agent và link tới tài liệu máy đọc', async () => {
  const html = await read('index.html');
  assert.ok(html.includes('<!-- catalog:start -->') && html.includes('<!-- catalog:end -->'));
  assert.ok(html.includes('data-tab="agent"'), 'phải có tab hướng dẫn agent');
  assert.ok(html.includes('href="agent.json"') && html.includes('href="llms.txt"') && html.includes('href="agent.html"'));
  // UI dựng từ map export, nên mọi kích thước phải xuất hiện trong khối catalog.
  const block = html.slice(html.indexOf('<!-- catalog:start -->'), html.indexOf('<!-- catalog:end -->'));
  for (const key of Object.keys(SIZES)) assert.ok(block.includes(key), `bảng size trong index.html thiếu ${key}`);
});
