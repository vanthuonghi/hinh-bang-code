#!/usr/bin/env node
// CLI điều khiển bộ sinh hình qua GitHub API — thiết kế cho agent (Hermes), CI,
// hoặc người dùng terminal. Không cần dependency ngoài (dùng fetch có sẵn Node ≥18).
//
//   node bin/hinh.mjs new --title "Tiêu đề" --theme aurora --size 1080x1350 --wait
//   node bin/hinh.mjs list --json
//   node bin/hinh.mjs get <ten-file.png> --out ./anh
//   node bin/hinh.mjs status
//
// Auth: GITHUB_TOKEN (hoặc GH_TOKEN) trong env, hoặc fallback `gh auth token`.
// Repo: --repo owner/name | HINH_REPO | mặc định vanthuonghi/hinh-bang-code

import { spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { THEMES, SIZES, LAYOUTS } from '../lib/svg.js';

const DEFAULT_REPO = 'vanthuonghi/hinh-bang-code';

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

async function manifest(tok) {
  const r = await fetch(`https://raw.githubusercontent.com/${REPO}/main/gallery/manifest.json`, {
    headers: tok ? { Authorization: `Bearer ${tok}` } : {},
  });
  if (!r.ok) die(`Không đọc được manifest (${r.status}) — repo chưa có hình nào?`);
  return r.json();
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

async function newImage() {
  if (!args.title) die('Thiếu --title');
  const req = {
    title: String(args.title),
    subtitle: args.subtitle ? String(args.subtitle) : '',
    author: args.author ? String(args.author) : '',
    size: args.size ? String(args.size) : '1200x630',
    theme: args.theme ? String(args.theme) : 'sunset',
    layout: args.layout ? String(args.layout) : 'left',
    footer: args.footer ? String(args.footer) : '',
  };
  if (!SIZES[req.size]) die(`Kích thước không hợp lệ: ${req.size}`, { allowed: Object.keys(SIZES) });
  if (!THEMES[req.theme]) die(`Theme không hợp lệ: ${req.theme}`, { allowed: Object.keys(THEMES) });
  if (!LAYOUTS[req.layout]) die(`Bố cục không hợp lệ: ${req.layout}`, { allowed: Object.keys(LAYOUTS) });

  const tok = token();
  const started = new Date().toISOString();
  // GitHub đòi `ref` trong body dispatch (mặc định nhánh chính của repo)
  const ref = args.ref === undefined || args.ref === true ? 'refs/heads/main' : String(args.ref);
  await api(`/repos/${REPO}/actions/workflows/render.yml/dispatches`, {
    method: 'POST', body: { ref, inputs: req }, tok,
  });

  if (!args.wait) {
    out({ ok: true, dispatched: true, repo: REPO, inputs: req, started, text: `✅ Đã gửi yêu cầu render (dispatch) — chạy ~30s. Xem: https://github.com/${REPO}/actions` });
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
  const want = String(args.title).replace(/^\s*\[render\]\s*/i, '').trim();
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
  out({ ok: true, file: img.file, title: img.title, size: img.size, theme: img.theme, layout: img.layout,
        url: rawUrl, svg_url: `https://github.com/${REPO}/raw/main/gallery/${img.svg}`, run_id: run.id, saved,
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

const HELP = `hinh — điều khiển bộ sinh hình trên GitHub

  new  --title "..." [--subtitle] [--author] [--size 1200x630] [--theme sunset]
            [--layout left] [--footer "..."] [--wait] [--out <dir>]
  list [--n 20] [--json]
  get  <tên-file.png> [--out <dir>]
  status
  help

Auth: GITHUB_TOKEN / GH_TOKEN hoặc \`gh auth token\`. Repo: --repo | HINH_REPO.
Kích thước: ${Object.keys(SIZES).join(', ')}
Bảng màu:   ${Object.keys(THEMES).join(', ')}
Bố cục:     ${Object.keys(LAYOUTS).join(', ')}`;

switch (cmd) {
  case 'new': await newImage(); break;
  case 'list': await listImages(); break;
  case 'get': await getImage(); break;
  case 'status': await status(); break;
  default: console.log(HELP);
}
