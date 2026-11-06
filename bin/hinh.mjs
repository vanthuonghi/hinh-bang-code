#!/usr/bin/env node
// CLI điều khiển bộ sinh hình qua GitHub API — thiết kế cho agent (Hermes), CI,
// hoặc người dùng terminal. Không cần dependency ngoài (dùng fetch có sẵn Node ≥ 18).
//
//   node bin/hinh.mjs new --title "Tiêu đề" --theme aurora --size 1080x1350 --wait --out ./anh
//   node bin/hinh.mjs new --preset lo-trinh --title "Lộ trình 3 bước" --wait
//   node bin/hinh.mjs catalog --json
//   node bin/hinh.mjs check --title "X" --theme khong-co     # kiểm tra yêu cầu
//   node bin/hinh.mjs share --title "X" --theme aurora       # in link trang web
//   node bin/hinh.mjs list --json
//   node bin/hinh.mjs get <ten-file.png> --out ./anh
//   node bin/hinh.mjs status
//
// Auth: GITHUB_TOKEN (hoặc GH_TOKEN) trong env, hoặc fallback `gh auth token`.
// Repo: --repo owner/name | HINH_REPO | mặc định vanthuonghi/hinh-bang-code
//
// Mọi lệnh nhận --json: in JSON gọn cho agent đọc; lỗi → exit 1 kèm {"error": ...}.

import { spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {
  THEMES, THEME_LABELS, SIZES, SIZE_LABELS, SIZE_USE, LAYOUTS, LAYOUT_INFO,
  PATTERNS, PRESETS, EXAMPLES, normalize, validateRequest, encodeShare,
} from '../lib/svg.js';

const DEFAULT_REPO = 'vanthuonghi/hinh-bang-code';
const DEFAULT_SITE = 'https://vanthuonghi.github.io/hinh-bang-code';

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) out[key] = true;
      else { out[key] = next; i++; }
    } else out._.push(a);
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
const cmd = args._[0] || 'help';
const REPO = args.repo || process.env.HINH_REPO || DEFAULT_REPO;
const SITE = args.site || process.env.HINH_SITE || DEFAULT_SITE;
const JSON_OUT = !!args.json;

function out(obj) { console.log(JSON_OUT ? JSON.stringify(obj, null, 2) : obj.text ?? obj); }
function die(msg, extra = {}) {
  const payload = { error: msg, ...extra };
  console.error(JSON_OUT ? JSON.stringify(payload) : '❌ ' + msg);
  process.exit(1);
}

function token() {
  const env = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (env) return env.trim();
  const r = spawnSync('gh', ['auth', 'token'], { encoding: 'utf8' });
  if (r.status === 0 && r.stdout.trim()) return r.stdout.trim();
  die('Thiếu token: đặt GITHUB_TOKEN=... (scope repo + workflow) hoặc chạy `gh auth login`.');
}

async function api(pathname, { method = 'GET', body, tok } = {}) {
  const r = await fetch(`https://api.github.com${pathname}`, {
    method,
    headers: {
      Authorization: `Bearer ${tok || token()}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'hinh-cli',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (r.status === 204) return null;
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    die(`GitHub ${r.status} ${method} ${pathname}: ${data.message || r.statusText}`, { status: r.status });
  }
  return data;
}

// Đọc manifest qua Contents API thay vì raw.githubusercontent.com: raw bị CDN
// cache tới ~5 phút nên agent vừa dispatch xong sẽ đọc phải bản cũ. Contents API
// luôn trả bản mới nhất và đọc được cả khi chưa có token (repo public).
async function manifest(tok) {
  const paths = [
    `https://api.github.com/repos/${REPO}/contents/gallery/manifest.json?ref=main`,
    `https://raw.githubusercontent.com/${REPO}/main/gallery/manifest.json`,
  ];
  let last = 0;
  for (const url of paths) {
    const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'hinh-cli' };
    if (tok) headers.Authorization = `Bearer ${tok}`;
    const r = await fetch(url, { headers });
    if (!r.ok) { last = r.status; continue; }
    const body = url.includes('/contents/')
      ? JSON.parse(Buffer.from((await r.json()).content, 'base64').toString('utf8'))
      : await r.json();
    if (body && Array.isArray(body.images)) return body;
  }
  die(`Không đọc được manifest (${last}) — repo chưa có hình nào?`);
}

async function waitRender(startISO, tok) {
  const deadline = Date.now() + 5 * 60 * 1000;
  let run = null;
  while (Date.now() < deadline) {
    const runs = await api(`/repos/${REPO}/actions/workflows/render.yml/runs?event=workflow_dispatch&per_page=20`, { tok });
    // GitHub trả về mới nhất trước; chạy song song phải lấy run CŨ NHẤT tạo
    // sau thời điểm dispatch của mình, nếu không sẽ theo nhầm run của agent khác.
    run = (runs.workflow_runs || [])
      .filter((r) => new Date(r.created_at) >= new Date(startISO))
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))[0] || null;
    if (run && run.status === 'completed') return run;
    await new Promise((r) => setTimeout(r, 6000));
  }
  die('Hết thời gian chờ (5 phút) — kiểm tra tab Actions.', { run });
}

// Gom request từ --preset rồi tới các cờ riêng (cờ riêng thắng preset).
// Trả về giá trị THÔ (chưa normalize) để `check` còn báo được enum sai.
function requestFromArgs() {
  const preset = args.preset && args.preset !== true
    ? PRESETS.find((p) => p.key === String(args.preset))
    : null;
  if (args.preset && args.preset !== true && !preset) {
    die(`Preset không tồn tại: ${args.preset}`, { allowed: PRESETS.map((p) => p.key) });
  }
  const str = (v) => (v === undefined || v === true ? '' : String(v));
  const req = {
    title: str(args.title),
    subtitle: str(args.subtitle),
    author: str(args.author),
    footer: str(args.footer),
    emoji: str(args.emoji),
    theme: str(args.theme) || preset?.theme,
    layout: str(args.layout) || preset?.layout,
    size: str(args.size) || preset?.size,
    pattern: str(args.pattern) || preset?.pattern,
  };
  // --preset mà không có --title: mượn cả bộ nội dung mẫu (tiêu đề + phụ đề +
  // tác giả) để ảnh demo không bị trơ khung. Cờ nào đã đưa thì giữ nguyên.
  if (!req.title) {
    const ex = preset && EXAMPLES.find((e) => e.key === preset.key);
    if (ex) for (const k of ['title', 'subtitle', 'author']) if (!req[k]) req[k] = ex[k] ?? '';
  }
  return req;
}

async function newImage() {
  const raw = requestFromArgs();
  if (!String(raw.title || '').trim()) die('Thiếu --title (hoặc --preset có nội dung mẫu).');
  const { ok, errors, warnings } = validateRequest(raw);
  if (!ok) die(errors.join(' · '), { errors });
  const req = normalize(raw);

  if (args['dry-run']) {
    out({ ok: true, dry_run: true, inputs: req, warnings,
          text: `🧪 Yêu cầu hợp lệ (không gửi đi)\n${JSON.stringify(req, null, 2)}` });
    return;
  }

  const tok = token();
  const started = new Date().toISOString();
  // GitHub đòi `ref` trong body dispatch (mặc định nhánh chính của repo)
  const ref = args.ref === undefined || args.ref === true ? 'refs/heads/main' : String(args.ref);
  await api(`/repos/${REPO}/actions/workflows/render.yml/dispatches`, {
    method: 'POST', body: { ref, inputs: req }, tok,
  });

  if (!args.wait) {
    out({ ok: true, dispatched: true, repo: REPO, inputs: req, warnings, started,
          text: `✅ Đã gửi yêu cầu render (dispatch) — chạy ~30s. Xem: https://github.com/${REPO}/actions` });
    return;
  }

  if (!JSON_OUT) process.stderr.write('⏳ Chờ Actions render');
  const run = await waitRender(started, tok);
  if (!JSON_OUT) process.stderr.write('\n');
  if (run.conclusion !== 'success') die(`Run kết thúc: ${run.conclusion}`, { run_id: run.id, url: run.html_url });

  const m = await manifest(tok);
  const fresh = (m.images || []).filter((i) => new Date(i.date) >= new Date(started));
  // Ưu tiên entry đúng TIÊU ĐỀ mình vừa gửi: nhiều run song song thì entry mới
  // nhất chưa chắc là của mình.
  const want = String(req.title).trim();
  const img = fresh.find((i) => String(i.title).trim() === want) || fresh[0];
  if (!img) die('Run thành công nhưng không thấy entry mới trong manifest.', { run_id: run.id });
  const rawUrl = `https://github.com/${REPO}/raw/main/gallery/${img.file}`;

  let saved = null;
  if (args.out !== undefined) {
    const dir = args.out === true ? '.' : String(args.out);
    await mkdir(dir, { recursive: true });
    const buf = Buffer.from(await (await fetch(rawUrl)).arrayBuffer());
    const dest = path.join(dir, img.file);
    await writeFile(dest, buf);
    saved = path.resolve(dest);
  }
  out({ ok: true, file: img.file, title: img.title, size: img.size, theme: img.theme,
        layout: img.layout, pattern: img.pattern, url: rawUrl,
        svg_url: `https://github.com/${REPO}/raw/main/gallery/${img.svg}`,
        run_id: run.id, saved, warnings,
        text: `✅ ${img.file}\n   PNG: ${rawUrl}\n   ${saved ? 'Đã tải: ' + saved : '(thêm --out <thư mục> để tải về)'}` });
}

async function listImages() {
  const m = await manifest();
  const n = args.n === true ? 10 : Number(args.n || 20);
  const items = (m.images || []).slice(0, n);
  if (JSON_OUT) { out({ ok: true, total: (m.images || []).length, images: items }); return; }
  if (!items.length) { console.log('Chưa có hình nào.'); return; }
  console.log(`${items.length} hình gần nhất (của ${(m.images || []).length} tổng):`);
  for (const i of items) {
    console.log(`  ${i.file}\n     "${i.title}" · ${i.size} · ${i.theme}/${i.layout}${i.user ? ' · ' + i.user : ''}`);
  }
}

async function getImage() {
  const file = args._[1];
  if (!file) die('Dùng: hinh get <tên-file.png> [--out <thư mục>]');
  const dir = args.out === undefined || args.out === true ? '.' : String(args.out);
  const url = `https://github.com/${REPO}/raw/main/gallery/${file}`;
  const r = await fetch(url);
  if (!r.ok) die(`Không tải được ${file} (${r.status})`);
  const buf = Buffer.from(await r.arrayBuffer());
  await mkdir(dir, { recursive: true });
  const dest = path.join(dir, path.basename(file));
  await writeFile(dest, buf);
  out({ ok: true, saved: path.resolve(dest), bytes: buf.length, url, text: `✅ ${path.resolve(dest)} (${buf.length} bytes)` });
}

async function status() {
  const data = await api(`/repos/${REPO}/actions/workflows/render.yml/runs?per_page=5`);
  const runs = (data.workflow_runs || []).map((r) => ({
    id: r.id, event: r.event, status: r.status, conclusion: r.conclusion,
    created_at: r.created_at, title: r.display_title, url: r.html_url,
  }));
  if (JSON_OUT) { out({ ok: true, runs }); return; }
  if (!runs.length) { console.log('Chưa có run nào.'); return; }
  for (const r of runs) console.log(`  ${r.conclusion || r.status} | ${r.event} | ${r.created_at} | ${r.title}\n     ${r.url}`);
}

function catalog() {
  const data = {
    themes: Object.keys(THEMES).map((k) => ({ key: k, label: THEME_LABELS[k] || k, from: THEMES[k].from, to: THEMES[k].to })),
    layouts: Object.keys(LAYOUTS).map((k) => ({ key: k, label: LAYOUTS[k], hint: LAYOUT_INFO[k]?.hint || '', subtitle_hint: LAYOUT_INFO[k]?.subtitle || '' })),
    sizes: Object.keys(SIZES).map((k) => ({ key: k, label: SIZE_LABELS[k] || k, width: SIZES[k][0], height: SIZES[k][1], use: SIZE_USE[k] || '' })),
    patterns: Object.keys(PATTERNS).map((k) => ({ key: k, label: PATTERNS[k] })),
    presets: PRESETS,
    examples: EXAMPLES,
  };
  if (JSON_OUT) { out({ ok: true, catalog: data }); return; }
  console.log('Bảng màu:'); for (const t of data.themes) console.log(`  ${t.key.padEnd(12)} ${t.label}`);
  console.log('\nBố cục:'); for (const l of data.layouts) console.log(`  ${l.key.padEnd(12)} ${l.label} — ${l.hint}`);
  console.log('\nKích thước:'); for (const s of data.sizes) console.log(`  ${s.key.padEnd(12)} ${s.width}×${s.height}  ${s.use}`);
  console.log('\nHoa tiết:'); for (const p of data.patterns) console.log(`  ${p.key.padEnd(12)} ${p.label}`);
  console.log('\nMẫu sẵn:'); for (const p of data.presets) console.log(`  ${p.key.padEnd(12)} ${p.label} (${p.theme}/${p.layout}/${p.size}/${p.pattern})`);
}

function checkRequest() {
  const raw = requestFromArgs();
  const res = validateRequest(raw);
  const req = normalize(raw);
  out({ ok: res.ok, request: req, errors: res.errors, warnings: res.warnings,
        text: res.ok ? `✅ Hợp lệ${res.warnings.length ? '\n💡 ' + res.warnings.join('\n💡 ') : ''}\n${JSON.stringify(req, null, 2)}`
                     : `❌ ${res.errors.join('\n❌ ')}` });
  if (!res.ok) process.exit(1);
}

function shareLink() {
  const req = normalize(requestFromArgs());
  const q = encodeShare(req);
  const url = `${SITE}/${q ? '?' + q : ''}`;
  out({ ok: true, url, inputs: req, text: url });
}

const HELP = `hinh — điều khiển bộ sinh hình trên GitHub

  new    --title "..." [--subtitle] [--author] [--footer] [--emoji 🚀]
         [--theme sunset] [--layout left] [--size 1200x630] [--pattern orb]
         [--preset <key>] [--wait] [--out <dir>] [--dry-run]
  check  <cờ như new>             # chỉ kiểm tra, không gửi
  share  <cờ như new>             # in link mở trang web kèm yêu cầu
  catalog [--json]                # toàn bộ theme/layout/size/pattern/preset
  list   [--n 20] [--json]
  get    <tên-file.png> [--out <dir>]
  status [--json]
  help

Auth: GITHUB_TOKEN / GH_TOKEN hoặc \`gh auth token\`. Repo: --repo | HINH_REPO.
Site (cho share): --site | HINH_SITE
Kích thước: ${Object.keys(SIZES).join(', ')}
Bảng màu:   ${Object.keys(THEMES).join(', ')}
Bố cục:     ${Object.keys(LAYOUTS).join(', ')}
Hoa tiết:   ${Object.keys(PATTERNS).join(', ')}
Preset:     ${PRESETS.map((p) => p.key).join(', ')}`;

switch (cmd) {
  case 'new': await newImage(); break;
  case 'check': checkRequest(); break;
  case 'share': shareLink(); break;
  case 'catalog': catalog(); break;
  case 'list': await listImages(); break;
  case 'get': await getImage(); break;
  case 'status': await status(); break;
  default: console.log(HELP);
}
