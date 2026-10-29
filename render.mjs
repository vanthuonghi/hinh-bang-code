#!/usr/bin/env node
// Sinh hình bằng code từ một yêu cầu (GitHub Issue hoặc workflow_dispatch) —
// chạy trong Actions hoặc local. Toàn bộ bố cục/màu nằm ở lib/svg.js (dùng chung
// với trang xem trước) nên file này chỉ lo nhập/xuất file.
//
// Local:
//   node render.mjs --title "[render] Tiêu đề" --body $'Tiêu đề: ...\nTheme: sunset'
// Actions: đọc env ISSUE_TITLE / ISSUE_BODY / ISSUE_NUMBER / GITHUB_REPOSITORY / GH_USER

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSVG, parseRequest, slugify } from './lib/svg.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const GALLERY = path.join(ROOT, 'gallery');
const MANIFEST = path.join(GALLERY, 'manifest.json');

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) { out[argv[i].slice(2)] = argv[i + 1] ?? ''; i++; }
  }
  return out;
}

async function writeManifest(newEntry) {
  let manifest = { generated: '', images: [] };
  try { manifest = JSON.parse(await readFile(MANIFEST, 'utf8')); } catch { /* chưa có */ }
  const images = [newEntry, ...(manifest.images || []).filter((i) => i.file !== newEntry.file)].slice(0, 96);
  manifest = { generated: new Date().toISOString(), images };
  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
}

export async function render(req, { issueNumber = '', user = '', outDir = GALLERY } = {}) {
  const svg = buildSVG(req);
  const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const base = `${slugify(req.title)}-${stamp}${issueNumber ? `-iss${issueNumber}` : ''}`;
  await mkdir(outDir, { recursive: true });
  const svgPath = path.join(outDir, `${base}.svg`);
  await writeFile(svgPath, svg + '\n');

  const pngPath = path.join(outDir, `${base}.png`);
  const { default: sharp } = await import('sharp');
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(pngPath);

  if (outDir === GALLERY) {
    await writeManifest({
      file: `${base}.png`,
      svg: `${base}.svg`,
      title: req.title,
      theme: req.theme,
      layout: req.layout,
      size: req.size,
      issue: issueNumber || null,
      user: user || null,
      date: new Date().toISOString(),
    });
  }
  return { png: pngPath, svg: svgPath };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const args = parseArgs(process.argv.slice(2));
  const req = parseRequest({
    title: args.title ?? process.env.ISSUE_TITLE ?? '',
    body: args.body ?? process.env.ISSUE_BODY ?? '',
  });
  const issueNumber = args.issue ?? process.env.ISSUE_NUMBER ?? '';
  const user = args.user ?? process.env.GH_USER ?? '';
  try {
    const out = await render(req, { issueNumber, user });
    console.log(`PNG=${path.relative(ROOT, out.png)}`);
    console.log(`SVG=${path.relative(ROOT, out.svg)}`);
    console.log(`TITLE=${req.title}`);
    console.log(`SIZE=${req.size}`);
    console.log(`THEME=${req.theme}`);
    console.log(`LAYOUT=${req.layout}`);
    console.log(`URL=https://github.com/${process.env.GITHUB_REPOSITORY || 'OWNER/REPO'}/raw/main/${path.relative(ROOT, out.png)}`);
  } catch (e) {
    console.error('render failed:', e);
    process.exit(1);
  }
}
