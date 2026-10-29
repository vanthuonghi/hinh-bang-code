#!/usr/bin/env node
// Sinh hình bằng code từ một yêu cầu (GitHub Issue) — chạy trong Actions hoặc local.
//
// Cách dùng (local):
//   node render.mjs --title "[render] Tiêu đề" --body $'Tiêu đề: ...\nPhụ đề: ...\nTheme: sunset'
// Cách dùng (Actions): đọc env ISSUE_TITLE / ISSUE_BODY / ISSUE_NUMBER / GITHUB_REPOSITORY

import { mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const GALLERY = path.join(ROOT, 'gallery');
const MANIFEST = path.join(GALLERY, 'manifest.json');

const THEMES = {
  sunset:   { from: '#ff7e5f', to: '#feb47b', ink: '#33160f', sub: '#33160fcc', deco: '#ffffff38', bar: '#33160f' },
  ocean:    { from: '#1b3a6b', to: '#4b9fe1', ink: '#ffffff', sub: '#ffffffcc', deco: '#ffffff2e', bar: '#ffd166' },
  forest:   { from: '#143d2b', to: '#4f9d69', ink: '#f4fff7', sub: '#f4fff7cc', deco: '#ffffff2b', bar: '#ffd166' },
  midnight: { from: '#141428', to: '#3b2f63', ink: '#f5f3ff', sub: '#f5f3ffcc', deco: '#ffffff1f', bar: '#8b7cff' },
  violet:   { from: '#6a3be0', to: '#c86dd7', ink: '#ffffff', sub: '#ffffffd9', deco: '#ffffff30', bar: '#ffe08a' },
  paper:    { from: '#f7f4ee', to: '#e7ded0', ink: '#221d16', sub: '#221d16cc', deco: '#00000012', bar: '#c2410c' },
};

const SIZES = {
  '1200x630': [1200, 630],   // ảnh OG / social
  '1080x1080': [1080, 1080], // vuông
  '1920x1080': [1920, 1080], // slide
  '800x800': [800, 800],
};

const FONT = 'Noto Sans, DejaVu Sans, Helvetica Neue, Arial, sans-serif';

// ---------- parse yêu cầu ----------

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) out[argv[i].slice(2)] = argv[i + 1] ?? '';
    i++;
  }
  return out;
}

function parseBody(body) {
  const fields = {};
  const map = {
    'tiêu đề': 'title', 'tieu de': 'title', 'title': 'title',
    'phụ đề': 'subtitle', 'phu de': 'subtitle', 'subtitle': 'subtitle', 'mô tả': 'subtitle', 'mo ta': 'subtitle',
    'tác giả': 'author', 'tac gia': 'author', 'author': 'author', 'nguồn': 'author', 'nguon': 'author',
    'kích thước': 'size', 'kich thuoc': 'size', 'size': 'size',
    'theme': 'theme', 'màu': 'theme', 'mau': 'theme', 'style': 'theme',
    'chú thích': 'footer', 'chu thich': 'footer', 'footer': 'footer',
  };
  for (const line of String(body || '').split(/\r?\n/)) {
    const m = line.match(/^\s*([^:]{1,40}):\s*(.+?)\s*$/);
    if (!m) continue;
    const key = map[m[1].trim().toLowerCase()];
    if (key && !fields[key]) fields[key] = m[2];
  }
  return fields;
}

export function buildRequest({ title = '', body = '' } = {}) {
  const f = parseBody(body);
  // Tiêu đề issue: "[render] abc" → fallback khi body thiếu "Tiêu đề:"
  const issueTitle = String(title).replace(/^\s*\[render\]\s*/i, '').trim();
  const req = {
    title: f.title || issueTitle || 'Yêu cầu hình',
    subtitle: f.subtitle || '',
    author: f.author || '',
    footer: f.footer || '',
    size: SIZES[f.size] ? f.size : '1200x630',
    theme: THEMES[f.theme] ? f.theme : 'sunset',
  };
  return req;
}

// ---------- tiện ích text ----------

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&apos;');

function deaccent(s) {
  return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

function slugify(s) {
  return deaccent(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'hinH';
}

function wrap(text, maxChars) {
  const words = String(text).trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const w of words) {
    if (!line) { line = w; continue; }
    if ((line + ' ' + w).length <= maxChars) line += ' ' + w;
    else { lines.push(line); line = w; }
  }
  if (line) lines.push(line);
  return lines;
}

// ---------- sinh SVG ----------

export function buildSVG(req) {
  const [W, H] = SIZES[req.size];
  const t = THEMES[req.theme];
  const gid = `g-${req.theme}`;
  const pad = Math.round(W * 0.07);
  const titleMaxChars = Math.floor((W - pad * 2) / (W * 0.055 * 0.54));

  // chọn cỡ chữ để tiêu đề gọn trong tối đa 3 dòng
  let fs = Math.round(W * 0.055);
  let lines = wrap(req.title, titleMaxChars);
  while (lines.length > 3 && fs > 24) {
    fs = Math.round(fs * 0.86);
    lines = wrap(req.title, Math.floor((W - pad * 2) / (fs * 0.54)));
  }
  const subFs = Math.max(16, Math.round(fs * 0.42));
  const subLines = req.subtitle ? wrap(req.subtitle, Math.floor((W - pad * 2) / (subFs * 0.5))) : [];

  const blockH = lines.length * fs * 1.12 + (subLines.length ? 18 + subLines.length * subFs * 1.3 : 0);
  const top = Math.round((H - blockH) / 2);

  const parts = [];
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${FONT}">`);
  parts.push(`<defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${t.from}"/><stop offset="1" stop-color="${t.to}"/>
  </linearGradient></defs>`);
  parts.push(`<rect width="${W}" height="${H}" fill="url(#${gid})"/>`);
  // trang trí
  parts.push(`<circle cx="${W * 0.88}" cy="${H * 0.18}" r="${W * 0.16}" fill="${t.deco}"/>`);
  parts.push(`<circle cx="${W * 0.12}" cy="${H * 0.92}" r="${W * 0.22}" fill="${t.deco}"/>`);
  parts.push(`<circle cx="${W * 0.75}" cy="${H * 0.85}" r="${W * 0.07}" fill="${t.deco}"/>`);

  // eyebrow (tác giả)
  let y = top;
  if (req.author) {
    const eyebrowFs = Math.max(13, Math.round(fs * 0.26));
    parts.push(`<text x="${pad}" y="${y}" font-size="${eyebrowFs}" font-weight="700" letter-spacing="${Math.round(eyebrowFs * 0.18)}" fill="${t.sub}" opacity="0.9">${esc(req.author.toUpperCase())}</text>`);
    y += Math.round(eyebrowFs * 2.1);
  }

  // tiêu đề
  for (const ln of lines) {
    parts.push(`<text x="${pad}" y="${y + fs * 0.86}" font-size="${fs}" font-weight="800" fill="${t.ink}">${esc(ln)}</text>`);
    y += Math.round(fs * 1.12);
  }

  // phụ đề
  if (subLines.length) {
    y += 18;
    for (const ln of subLines) {
      parts.push(`<text x="${pad}" y="${y + subFs * 0.86}" font-size="${subFs}" font-weight="400" fill="${t.sub}">${esc(ln)}</text>`);
      y += Math.round(subFs * 1.3);
    }
  }

  // footer
  const footFs = Math.max(12, Math.round(W * 0.014));
  const date = new Date().toISOString().slice(0, 10);
  const left = req.footer || `sinh bằng code · ${date}`;
  parts.push(`<rect x="${pad}" y="${H - pad - footFs * 1.6}" width="${Math.round(W * 0.06)}" height="${Math.max(4, Math.round(footFs * 0.4))}" fill="${t.bar}"/>`);
  parts.push(`<text x="${pad}" y="${H - pad}" font-size="${footFs}" font-weight="600" fill="${t.sub}">${esc(left)}</text>`);
  parts.push(`<text x="${W - pad}" y="${H - pad}" font-size="${footFs}" font-weight="600" text-anchor="end" fill="${t.sub}">${esc(req.theme)} · ${W}×${H}</text>`);
  parts.push(`</svg>`);
  return parts.join('\n');
}

// ---------- manifest ----------

async function writeManifest(newEntry) {
  let manifest = { generated: '', images: [] };
  try { manifest = JSON.parse(await readFile(MANIFEST, 'utf8')); } catch { /* chưa có */ }
  const images = [newEntry, ...(manifest.images || []).filter((i) => i.file !== newEntry.file)].slice(0, 48);
  manifest = { generated: new Date().toISOString(), images };
  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
}

// ---------- main ----------

export async function render(req, { issueNumber = '', outDir = GALLERY } = {}) {
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
      size: req.size,
      issue: issueNumber || null,
      date: new Date().toISOString(),
    });
  }
  return { png: pngPath, svg: svgPath };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const args = parseArgs(process.argv.slice(2));
  const req = buildRequest({
    title: args.title ?? process.env.ISSUE_TITLE ?? '',
    body: args.body ?? process.env.ISSUE_BODY ?? '',
  });
  const issueNumber = args.issue ?? process.env.ISSUE_NUMBER ?? '';
  try {
    const out = await render(req, { issueNumber });
    console.log(`PNG=${path.relative(ROOT, out.png)}`);
    console.log(`SVG=${path.relative(ROOT, out.svg)}`);
    console.log(`TITLE=${req.title}`);
  } catch (e) {
    console.error('render failed:', e);
    process.exit(1);
  }
}
