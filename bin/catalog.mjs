#!/usr/bin/env node
// Ghi lại tài liệu máy-đọc từ lib/svg.js:
//   agent.json   — danh mục + endpoint + schema input (JSON)
//   llms.txt     — bản chữ ngắn theo chuẩn llms.txt
//   agent.html   — trang hướng dẫn tĩnh (agent và người đều đọc được)
//   index.html   — khối bảng giữa <!-- catalog:start --> và <!-- catalog:end -->
//
//   node bin/catalog.mjs           # ghi
//   node bin/catalog.mjs --check   # chỉ kiểm tra lệch (exit 1 nếu lệch)
//
// Test (test/catalog.test.js) cũng kiểm tra điều này nên CI chặn drift.

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderAgentJson, renderAgentHtml, renderLlms, renderIndexBlock } from '../lib/catalog.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const INDEX = path.join(ROOT, 'index.html');
const START = '<!-- catalog:start -->';
const END = '<!-- catalog:end -->';

export function injectIndexBlock(html, block) {
  const start = html.indexOf(START);
  const end = html.indexOf(END);
  if (start < 0 || end < 0 || end < start) {
    throw new Error('index.html thiếu cặp marker <!-- catalog:start --> … <!-- catalog:end -->');
  }
  return html.slice(0, start + START.length) + '\n' + block + '\n      ' + html.slice(end);
}

async function version() {
  try {
    return JSON.parse(await readFile(path.join(ROOT, 'package.json'), 'utf8')).version;
  } catch {
    return '2.0.0';
  }
}

export async function generate() {
  const v = await version();
  const indexSrc = await readFile(INDEX, 'utf8');
  return {
    'agent.json': renderAgentJson(v),
    'llms.txt': renderLlms(v),
    'agent.html': renderAgentHtml(v),
    'index.html': injectIndexBlock(indexSrc, renderIndexBlock()),
  };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const check = process.argv.includes('--check');
  const out = await generate();
  let drift = 0;
  for (const [file, content] of Object.entries(out)) {
    const target = path.join(ROOT, file);
    let current = '';
    try { current = await readFile(target, 'utf8'); } catch { /* chưa có */ }
    if (current === content) continue;
    drift++;
    if (check) {
      console.error(`✗ ${file} lệch với lib/svg.js — chạy: node bin/catalog.mjs`);
    } else {
      await writeFile(target, content);
      console.log(`✓ ${file}`);
    }
  }
  if (check) {
    if (drift) process.exit(1);
    console.log('✓ tài liệu agent khớp lib/svg.js');
  } else if (!drift) {
    console.log('✓ không có gì thay đổi');
  }
}
