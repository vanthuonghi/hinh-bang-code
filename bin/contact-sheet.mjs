#!/usr/bin/env node
// Bảng soi thiết kế: xuất một trang HTML chứa mọi preset + ma trận bố cục × màu
// + mọi hoa tiết, dùng để rà giao diện bằng mắt trước khi commit.
//
//   node bin/contact-sheet.mjs [--out out/contact-sheet.html]
//
// Không phải một phần của sản phẩm — chỉ là công cụ dev (out/ nằm trong .gitignore).

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { THEMES, SIZES, LAYOUTS, PATTERNS, PRESETS, EXAMPLES, buildSVG } from '../lib/svg.js';

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outPath = outIdx >= 0 && args[outIdx + 1] ? args[outIdx + 1] : 'out/contact-sheet.html';

const SAMPLE = {
  title: '5 phút mỗi sáng thay đổi ngày của bạn',
  subtitle: 'Một nghi thức nhỏ, hiệu quả bất ngờ',
  author: 'VANHI',
  theme: 'sunset',
  layout: 'left',
  size: '1200x630',
  pattern: 'orb',
  emoji: '',
};

const cell = (svg, label, w = 300) =>
  `<figure style="margin:0;width:${w}px"><div style="border-radius:10px;overflow:hidden;border:1px solid #2a2f3a;background:#0d1017">${svg}</div>` +
  `<figcaption style="font:11px/1.4 ui-monospace,monospace;color:#8b93a7;padding:5px 2px">${label}</figcaption></figure>`;

const section = (title, body) =>
  `<h2 style="font:600 15px/1.4 system-ui;color:#e9ecf3;margin:34px 0 12px;border-bottom:1px solid #262b38;padding-bottom:8px">${title}</h2>` +
  `<div style="display:flex;flex-wrap:wrap;gap:14px">${body}</div>`;

const html = `<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"><title>contact sheet</title>
<style>body{margin:0;padding:26px;background:#0f1117}svg{display:block;width:100%;height:auto}</style></head>
<body>
${section('PRESETS', PRESETS.map((p) => cell(
  buildSVG({ ...SAMPLE, ...(EXAMPLES.find((e) => e.key === p.key) || {}), theme: p.theme, layout: p.layout, size: p.size, pattern: p.pattern }),
  `${p.key} · ${p.theme}/${p.layout}/${p.pattern}/${p.size}`, 320)).join(''))}
${section('LAYOUTS', Object.keys(LAYOUTS).map((l) => cell(
  buildSVG({ ...SAMPLE, layout: l, theme: 'aurora', size: '1200x630' }), `layout: ${l}`)).join(''))}
${section('PATTERNS', Object.keys(PATTERNS).map((p) => cell(
  buildSVG({ ...SAMPLE, pattern: p, theme: 'ocean', layout: 'split', size: '1200x630' }), `pattern: ${p}`)).join(''))}
${section('THEMES', Object.keys(THEMES).map((th) => cell(
  buildSVG({ ...SAMPLE, theme: th, layout: 'hero', size: '1200x630' }), `theme: ${th}`, 260)).join(''))}
${section('SIZES', Object.keys(SIZES).map((s) => cell(
  buildSVG({ ...SAMPLE, size: s, theme: 'galaxy', layout: 'center' }), `size: ${s}`, 240)).join(''))}
</body></html>`;

await mkdir(path.dirname(path.resolve(outPath)), { recursive: true });
await writeFile(outPath, html);
console.log(`✅ ${outPath} (${(html.length / 1024).toFixed(0)} KB)`);
