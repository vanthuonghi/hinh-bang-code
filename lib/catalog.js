// Sinh tài liệu cho agent từ MỘT nguồn sự thật: các map trong lib/svg.js.
// Không có dữ liệu nào được chép tay ở đây, nên thêm theme/layout/size/pattern
// là agent.json, llms.txt, agent.html và bảng trong index.html tự cập nhật.
//
//   node bin/catalog.mjs      # ghi lại 3 file + khối bảng trong index.html
//
// test/catalog.test.js so sánh bản trên đĩa với kết quả sinh lại → lệch là fail.

import {
  THEMES, THEME_LABELS, SIZES, SIZE_LABELS, SIZE_GROUPS, SIZE_USE,
  LAYOUTS, LAYOUT_INFO, LAYOUT_GROUPS, PATTERNS, PRESETS, EXAMPLES,
} from './svg.js';

export const REPO = 'vanthuonghi/hinh-bang-code';
export const BRANCH = 'main';
export const SITE = 'https://vanthuonghi.github.io/hinh-bang-code';
export const WORKFLOW = 'render.yml';

const rawBase = (branch = BRANCH) => `https://raw.githubusercontent.com/${REPO}/${branch}`;
const ghBase = `https://github.com/${REPO}`;

export const fieldDocs = [
  { key: 'title', label: 'Tiêu đề', type: 'string', required: true, max: 120,
    description: 'Nội dung chính của ảnh. Chữ tự xuống dòng và tự thu nhỏ để vừa khung.',
    example: '3 việc nên tự động hoá ngay' },
  { key: 'subtitle', label: 'Phụ đề', type: 'string', required: false, max: 160,
    description: 'Một câu bổ trợ. Với layout list/timeline, mỗi mục cách nhau bằng dấu ";" hoặc "|".',
    example: 'Việc lặp lại;Việc dễ sai;Báo cáo định kỳ' },
  { key: 'author', label: 'Tác giả / nhãn', type: 'string', required: false, max: 40,
    description: 'Dòng nhỏ trên cùng; thành avatar/nhãn xoay với layout story/sticker/quote.',
    example: 'VANHI' },
  { key: 'theme', label: 'Bảng màu', type: 'enum', required: false, default: 'sunset',
    description: 'Khoá trong catalog.themes. Giá trị lạ tự fallback về sunset.', example: 'aurora' },
  { key: 'layout', label: 'Bố cục', type: 'enum', required: false, default: 'left',
    description: 'Khoá trong catalog.layouts. Giá trị lạ tự fallback về left.', example: 'list' },
  { key: 'size', label: 'Kích thước', type: 'enum', required: false, default: '1200x630',
    description: 'Khoá dạng "RxC" trong catalog.sizes. Giá trị lạ tự fallback về 1200x630.', example: '1080x1350' },
  { key: 'pattern', label: 'Hoa tiết nền', type: 'enum', required: false, default: 'orb',
    description: 'Khoá trong catalog.patterns. Giá trị lạ tự fallback về orb.', example: 'grid' },
  { key: 'emoji', label: 'Emoji', type: 'string', required: false, max: 8,
    description: 'Một emoji, hiện lớn phía trên tiêu đề (trừ quote/sticker/terminal/story).', example: '🚀' },
  { key: 'footer', label: 'Chú thích', type: 'string', required: false, max: 80,
    description: 'Dòng chữ nhỏ góc dưới trái. Để trống thì ảnh KHÔNG có dòng nào ở đáy.', example: 'vanthuonghi.com' },
];

export function buildCatalog(version = '2.0.0') {
  return {
    name: 'hinh-bang-code',
    version,
    summary: 'Sinh ảnh mạng xã hội bằng code: SVG thuần → PNG. Không cần API key để tạo ảnh cục bộ; dùng GitHub Actions để render và lưu ảnh công khai.',
    locale: 'vi',
    site: SITE,
    repo: REPO,
    branch: BRANCH,
    docs: {
      agent_page: `${SITE}/agent.html`,
      llms_txt: `${SITE}/llms.txt`,
      this_file: `${SITE}/agent.json`,
      readme: `${ghBase}#readme`,
      source_lib: `${ghBase}/blob/${BRANCH}/lib/svg.js`,
    },
    entrypoints: {
      local_js: {
        install: 'Không cần cài — import trực tiếp file trong repo (ESM, không dependency).',
        import: "import { buildSVG, normalize, validateRequest } from './lib/svg.js'",
        output: 'buildSVG(req) trả về chuỗi SVG (string). Thêm sharp để ra PNG.',
      },
      cli: {
        command: 'node bin/hinh.mjs',
        requires: 'Node >= 20, GITHUB_TOKEN (scope repo + workflow) hoặc `gh auth login`',
        commands: {
          new: 'node bin/hinh.mjs new --title "Tiêu đề" --theme aurora --layout hero --size 1200x630 --wait --out ./anh',
          preset: 'node bin/hinh.mjs new --preset lo-trinh --title "Lộ trình 3 bước" --wait',
          catalog: 'node bin/hinh.mjs catalog --json',
          list: 'node bin/hinh.mjs list --n 10 --json',
          get: 'node bin/hinh.mjs get <ten-file.png> --out ./anh',
          status: 'node bin/hinh.mjs status --json',
        },
      },
      github_actions: {
        dispatch: {
          method: 'POST',
          url: `https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW}/dispatches`,
          headers: { Authorization: 'Bearer $GITHUB_TOKEN', Accept: 'application/vnd.github+json' },
          body: { ref: `refs/heads/${BRANCH}`, inputs: { title: 'Tiêu đề', theme: 'aurora', layout: 'hero', size: '1200x630' } },
          notes: ['Thiếu "ref" sẽ trả 422.', 'Run được xếp hàng tuần tự (concurrency), không chạy song song.'],
        },
        issue: {
          url: `${ghBase}/issues/new`,
          rule: 'Tiêu đề issue bắt đầu bằng "[render]". Thân issue dạng "Khoá: giá trị", mỗi dòng một khoá.',
          result_comment: 'Mỗi issue được trả về một comment kèm ảnh và một khối ```json {ok,file,svg,png_url,svg_url,title,theme,layout,size,pattern,issue,run_id,run_url} — agent parse khối đó thay vì bóc chữ.',
          body_example: '[render] 3 việc nên tự động hoá ngay\n\nTiêu đề: 3 việc nên tự động hoá ngay\nPhụ đề: Việc lặp lại;Việc dễ sai;Báo cáo định kỳ\nTác giả: VANHI\nKích thước: 1200x628\nTheme: steel\nBố cục: list\nHoa tiết: grid',
        },
        read_result: {
          manifest: `${rawBase()}/gallery/manifest.json`,
          png: `${ghBase}/raw/${BRANCH}/gallery/{file}`,
          svg: `${ghBase}/raw/${BRANCH}/gallery/{svg}`,
          manifest_contents_api: `https://api.github.com/repos/${REPO}/contents/gallery/manifest.json?ref=${BRANCH}`,
          manifest_cache_note: 'raw.githubusercontent.com bị CDN cache tới ~5 phút; Contents API luôn trả bản mới nhất.',
          runs: `https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW}/runs?event=workflow_dispatch&per_page=20`,
          manifest_fields: ['file', 'svg', 'title', 'theme', 'layout', 'size', 'pattern', 'issue', 'user', 'date'],
        },
      },
      browser: {
        url: SITE,
        notes: 'Tải PNG/SVG ngay trong trình duyệt, không cần đăng nhập. Trang giữ yêu cầu trong URL (?t=…&th=…&l=…&sz=…&p=…) để chia sẻ.',
      },
    },
    inputs: fieldDocs,
    fallbacks: {
      note: 'Mọi input đều được chuẩn hoá: giá trị lạ/thiếu không gây lỗi, chỉ về mặc định.',
      theme: 'sunset', layout: 'left', size: '1200x630', pattern: 'orb',
      title: 'Yêu cầu hình', max_lengths: { title: 120, subtitle: 160, author: 40, footer: 80 },
    },
    catalog: {
      themes: Object.keys(THEMES).map((key) => ({
        key, label: THEME_LABELS[key] || key, from: THEMES[key].from, to: THEMES[key].to,
      })),
      layouts: Object.keys(LAYOUTS).map((key) => ({
        key, label: LAYOUTS[key],
        hint: LAYOUT_INFO[key]?.hint || '',
        subtitle_hint: LAYOUT_INFO[key]?.subtitle || '',
      })),
      sizes: Object.keys(SIZES).map((key) => ({
        key, label: SIZE_LABELS[key] || key, width: SIZES[key][0], height: SIZES[key][1],
        use: SIZE_USE[key] || '',
      })),
      patterns: Object.keys(PATTERNS).map((key) => ({ key, label: PATTERNS[key] })),
      presets: PRESETS.map((p) => ({ ...p })),
      examples: EXAMPLES.map((e) => ({ ...e })),
      groups: { sizes: SIZE_GROUPS, layouts: LAYOUT_GROUPS },
    },
    limits: {
      max_bullets: 5,
      min_title_font_px: 14,
      manifest_entries: 96,
      gallery_commit: 'Actions commit ảnh + manifest.json; chờ ~30 giây sau khi dispatch.',
      fonts: 'Actions cài fonts-noto-core; trình duyệt dùng font hệ thống nên nét chữ hơi khác.',
    },
    errors: {
      '422 dispatch': 'Thiếu "ref" hoặc workflow không có ở nhánh đó → dùng refs/heads/main.',
      '403/404': 'Token thiếu scope repo + workflow.',
      'manifest chưa có ảnh': 'Commit của Actions chưa xong — chờ vài giây, đọc lại manifest, lọc theo date và title.',
      'trùng run': 'Lọc run theo created_at >= thời điểm dispatch; chọn run cũ nhất trong số đó.',
    },
  };
}

export function renderAgentJson(version) {
  return JSON.stringify(buildCatalog(version), null, 2) + '\n';
}

// ---------------- các bảng dùng chung (HTML) ----------------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function rows(list, cols) {
  return list.map((item) => `<tr>${cols.map((c) => `<td>${c(item)}</td>`).join('')}</tr>`).join('\n        ');
}

export function catalogTables() {
  const themes = rows(Object.keys(THEMES), [(k) => `<code>${k}</code>`, (k) => esc(THEME_LABELS[k] || ''),
    (k) => `<span style="display:inline-block;width:34px;height:14px;border-radius:4px;background:linear-gradient(135deg,${THEMES[k].from},${THEMES[k].to});vertical-align:middle"></span>`]);
  const layouts = rows(Object.keys(LAYOUTS), [(k) => `<code>${k}</code>`, (k) => esc(LAYOUTS[k]),
    (k) => esc(LAYOUT_INFO[k]?.hint || '')]);
  const sizes = rows(Object.keys(SIZES), [
    (k) => `<code>${k}</code>`,
    (k) => esc(SIZE_LABELS[k] || ''),
    (k) => `${SIZES[k][0]}×${SIZES[k][1]}`,
    (k) => esc(SIZE_USE[k] || ''),
  ]);
  const patterns = rows(Object.keys(PATTERNS), [(k) => `<code>${k}</code>`, (k) => esc(PATTERNS[k])]);
  return { themes, layouts, sizes, patterns };
}

function tablesHtml() {
  const t = catalogTables();
  return `<h4>Bảng màu — <code>theme</code> (${Object.keys(THEMES).length})</h4>
      <div class="tablewrap"><table>
        <tr><th>Khoá</th><th>Nhãn</th><th>Xem trước</th></tr>
        ${t.themes}
      </table></div>

      <h4>Bố cục — <code>layout</code> (${Object.keys(LAYOUTS).length})</h4>
      <div class="tablewrap"><table>
        <tr><th>Khoá</th><th>Nhãn</th><th>Dùng khi nào</th></tr>
        ${t.layouts}
      </table></div>

      <h4>Kích thước — <code>size</code> (${Object.keys(SIZES).length})</h4>
      <div class="tablewrap"><table>
        <tr><th>Khoá</th><th>Nhãn</th><th>Pixel</th><th>Dùng cho</th></tr>
        ${t.sizes}
      </table></div>

      <h4>Hoa tiết nền — <code>pattern</code> (${Object.keys(PATTERNS).length})</h4>
      <div class="tablewrap"><table>
        <tr><th>Khoá</th><th>Nhãn</th></tr>
        ${t.patterns}
      </table></div>`;
}

export function renderIndexBlock() {
  return tablesHtml();
}

// ---------------- llms.txt ----------------
export function renderLlms(version) {
  const themes = Object.keys(THEMES).join(', ');
  const layouts = Object.keys(LAYOUTS).join(', ');
  const sizes = Object.keys(SIZES).join(', ');
  const patterns = Object.keys(PATTERNS).join(', ');
  return `# Sinh hình bằng code (hinh-bang-code) v${version}

> Trang tĩnh + GitHub Actions sinh ảnh mạng xã hội từ yêu cầu văn bản.
> SVG → PNG bằng code, không cần thiết kế. Có API, CLI và thư viện JS cho agent.
> Tạo ảnh cục bộ KHÔNG cần token. Chỉ nhánh lưu ảnh lên GitHub mới cần token.

## Dùng nhanh nhất (không cần token)
- Thư viện JS: import { buildSVG, normalize } from './lib/svg.js' → buildSVG(req) trả về chuỗi SVG.
- Không có repo trên máy? Nạp thẳng file từ URL (ESM thuần, không import gì):
  const src = await (await fetch('${rawBase()}/lib/svg.js')).text();
  const { buildSVG, normalize, validateRequest } = await import(\`data:text/javascript;charset=utf-8,\${encodeURIComponent(src)}\`);
- Trang web: ${SITE} — nhập tiêu đề rồi tải PNG/SVG ngay trong trình duyệt.
- Máy đọc danh mục đầy đủ: ${SITE}/agent.json

## Render qua GitHub Actions (cần token scope repo + workflow)
POST https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW}/dispatches
Authorization: Bearer $GITHUB_TOKEN
Content-Type: application/json

{"ref":"refs/heads/${BRANCH}","inputs":{"title":"Tiêu đề","subtitle":"Phụ đề","author":"VANHI","theme":"aurora","layout":"hero","size":"1200x630","pattern":"orb","emoji":"🚀"}}

Kết quả: https://api.github.com/repos/${REPO}/contents/gallery/manifest.json?ref=${BRANCH}
         (raw.githubusercontent.com bị CDN cache ~5 phút — đừng dùng để poll)
Ảnh:      https://github.com/${REPO}/raw/${BRANCH}/gallery/{file}
Run:      https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW}/runs?per_page=20
Lưu ý: thiếu "ref" → 422. Run xếp hàng tuần tự, chờ ~30s. Lọc ảnh mới theo "date" và khớp "title".

## Hoặc mở issue (không cần token trên máy)
Tiêu đề: [render] Tiêu đề hình
Thân: mỗi dòng "Khoá: giá trị" — Tiêu đề / Phụ đề / Tác giả / Kích thước / Theme / Bố cục / Hoa tiết / Emoji / Chú thích.
URL: https://github.com/${REPO}/issues/new
Kết quả: comment trong issue có ảnh + khối \`\`\`json {ok,file,svg,png_url,svg_url,title,theme,layout,size,pattern,issue,run_id,run_url}.

## Hoặc dùng CLI trong repo
node bin/hinh.mjs new --title "Tiêu đề" --theme aurora --layout hero --size 1200x630 --wait --out ./anh
node bin/hinh.mjs new --preset lo-trinh --title "Lộ trình" --wait
node bin/hinh.mjs catalog --json
node bin/hinh.mjs list --n 10 --json
node bin/hinh.mjs get <ten-file.png> --out ./anh
node bin/hinh.mjs status --json
(node >= 20; auth: GITHUB_TOKEN / GH_TOKEN / gh auth token; repo: --repo hoặc HINH_REPO)

## Trường đầu vào
title    string  BẮT BUỘC, ≤120 ký tự. Nội dung chính.
subtitle string  ≤160. Với layout list/timeline: các mục cách nhau bằng ";" hoặc "|".
author   string  ≤40. Nhãn nhỏ trên cùng; avatar/nhãn với story, sticker, quote.
theme    enum    ${themes}
layout   enum    ${layouts}
size     enum    ${sizes}
pattern  enum    ${patterns}
emoji    string  ≤8. Một emoji, hiện lớn trên tiêu đề (trừ quote/sticker/terminal/story).
footer   string  ≤80. Chú thích góc dưới trái.

Sai enum hoặc thiếu trường → tự fallback (sunset/left/1200x630/orb), không bao giờ lỗi render.

## Quy ước
- Tiếng Việt có dấu được hỗ trợ đầy đủ; XML được escape an toàn.
- Chữ tự động xuống dòng + thu nhỏ để không tràn khung; tiêu đề nên ≤ 60 ký tự để chữ to, đẹp.
- Manifest giữ 96 mục gần nhất; ảnh cũ vẫn nằm trong gallery/.
- Repo: https://github.com/${REPO} · Trang hướng dẫn cho agent: ${SITE}/agent.html
`;
}

// ---------------- agent.html ----------------
export function renderAgentHtml(version) {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Hướng dẫn cho AI agent — Sinh hình bằng code</title>
<meta name="description" content="Hướng dẫn máy đọc cho agent: gọi API render ảnh qua GitHub Actions, dùng CLI hoặc thư viện JS. Kèm danh mục theme/layout/size/pattern." />
<style>
  :root { --bg:#0e1016; --card:#161a24; --border:#252b39; --ink:#e9ecf3; --muted:#98a1b4; --accent:#7c9cff; --accent-2:#63e0b8; }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--bg); color:var(--ink);
    font:15px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif; }
  .wrap { max-width:1000px; margin:0 auto; padding:26px 20px 80px; }
  a { color:var(--accent); }
  h1 { font-size:28px; letter-spacing:-.6px; margin:8px 0 6px; }
  h2 { font-size:19px; margin:38px 0 10px; letter-spacing:-.3px; }
  h3 { font-size:15px; margin:22px 0 6px; }
  h4 { font-size:13px; text-transform:uppercase; letter-spacing:.08em; color:var(--muted); margin:20px 0 8px; }
  p, li { color:var(--muted); }
  b, strong { color:var(--ink); }
  code { color:var(--accent-2); font-size:13px; }
  pre { background:#0a0d13; border:1px solid var(--border); border-radius:12px; padding:14px;
    overflow:auto; font-size:12.5px; line-height:1.65; color:#cfd7e6;
    font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; }
  .card { background:var(--card); border:1px solid var(--border); border-radius:14px; padding:18px 20px; margin-top:14px; }
  .tablewrap { overflow-x:auto; border:1px solid var(--border); border-radius:12px; }
  table { border-collapse:collapse; width:100%; font-size:13px; }
  th,td { text-align:left; padding:8px 12px; border-bottom:1px solid var(--border); vertical-align:top; }
  th { background:#ffffff05; font-size:11.5px; text-transform:uppercase; letter-spacing:.08em; color:var(--muted); }
  tr:last-child td { border-bottom:none; }
  .top { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:18px; font-size:13px; }
  .pill { border:1px solid var(--border); border-radius:999px; padding:5px 11px; color:var(--muted); }
  .note { font-size:13px; color:var(--muted); }
  ul { padding-left:20px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="top">
    <a class="pill" href="./">← Trang tạo hình</a>
    <a class="pill" href="agent.json">agent.json</a>
    <a class="pill" href="llms.txt">llms.txt</a>
    <a class="pill" href="https://github.com/${REPO}" target="_blank" rel="noopener">GitHub ↗</a>
  </div>

  <h1>Hướng dẫn cho AI agent</h1>
  <p>Trang này viết cho <b>agent</b> (Hermes, bot, script) đọc rồi gọi luôn. Bản máy-đọc đầy đủ:
    <a href="agent.json">agent.json</a> · bản chữ ngắn: <a href="llms.txt">llms.txt</a> · phiên bản ${version}.</p>

  <div class="card">
    <b>3 đường đi, chọn theo nhu cầu</b>
    <ul>
      <li><b>Không cần token, có ảnh ngay:</b> import <code>lib/svg.js</code> (ESM thuần, không dependency) và gọi <code>buildSVG(req)</code> → chuỗi SVG. Thêm <code>sharp</code> nếu cần PNG. Chạy được cả Node ≥ 18 và trình duyệt.</li>
      <li><b>Có token, không cần clone repo:</b> POST <code>workflow_dispatch</code> rồi đọc <code>gallery/manifest.json</code>. Ảnh được commit công khai, URL ổn định.</li>
      <li><b>Có repo trên máy:</b> <code>node bin/hinh.mjs new … --wait --out ./anh</code> — một lệnh là xong, in JSON khi thêm <code>--json</code>.</li>
    </ul>
  </div>

  <h2>1. Gọi API render</h2>
  <p>Token GitHub cần scope <code>repo</code> + <code>workflow</code>. <b>Luôn gửi <code>ref</code></b>, thiếu sẽ bị <code>422</code>.</p>
<pre>POST https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW}/dispatches
Authorization: Bearer $GITHUB_TOKEN
Accept: application/vnd.github+json
Content-Type: application/json

{
  "ref": "refs/heads/${BRANCH}",
  "inputs": {
    "title": "3 việc nên tự động hoá ngay",
    "subtitle": "Việc lặp lại;Việc dễ sai;Báo cáo định kỳ",
    "author": "VANHI",
    "theme": "steel",
    "layout": "list",
    "size": "1200x628",
    "pattern": "grid",
    "emoji": "",
    "footer": ""
  }
}</pre>
  <p class="note">Input nào bỏ trống sẽ dùng mặc định. Enum sai → fallback im lặng về <code>sunset</code>/<code>left</code>/<code>1200x630</code>/<code>orb</code>.</p>

  <h2>2. Lấy kết quả</h2>
  <p>Manifest là nguồn sự thật, mới nhất trước, tối đa 96 mục. Đọc qua <b>Contents API</b> khi vừa dispatch xong:
    <code>raw.githubusercontent.com</code> bị CDN cache tới ~5 phút nên dễ trả bản cũ.</p>
<pre># bản mới nhất (khuyến nghị khi vừa dispatch)
curl -s -H "Authorization: Bearer $GITHUB_TOKEN" \\
  "https://api.github.com/repos/${REPO}/contents/gallery/manifest.json?ref=${BRANCH}"

# bản tiện cho người đọc / ít thay đổi
curl -s ${rawBase()}/gallery/manifest.json
# → { "generated": "…", "images": [ { "file": "…png", "svg": "…svg", "title": "…",
#       "theme": "steel", "layout": "list", "size": "1200x628", "pattern": "grid",
#       "issue": null, "user": "…", "date": "…ISO…" } ] }

# tải ảnh
curl -LO https://github.com/${REPO}/raw/${BRANCH}/gallery/&lt;file&gt;</pre>
  <p class="note">Cách chắc chắn để biết ảnh nào của mình: ghi lại thời điểm dispatch, lọc <code>date &gt;= START</code>, rồi khớp <code>title</code> đã gửi. Đừng đoán theo mục đầu tiên — có thể là của agent khác.</p>

  <h2>3. Vòng chờ bằng Node</h2>
<pre>const REPO = '${REPO}';
const HEAD = { Authorization: \`Bearer \${process.env.GITHUB_TOKEN}\`, Accept: 'application/vnd.github+json' };
const start = new Date().toISOString();

await fetch(\`https://api.github.com/repos/\${REPO}/actions/workflows/${WORKFLOW}/dispatches\`, {
  method: 'POST', headers: { ...HEAD, 'Content-Type': 'application/json' },
  body: JSON.stringify({ ref: 'refs/heads/${BRANCH}', inputs: { title: 'Tiêu đề', theme: 'aurora', layout: 'hero' } }),
});

for (let i = 0; i &lt; 40; i++) {
  await new Promise((r) =&gt; setTimeout(r, 6000));
  const runs = await (await fetch(
    \`https://api.github.com/repos/\${REPO}/actions/workflows/${WORKFLOW}/runs?event=workflow_dispatch&amp;per_page=20\`, { headers: HEAD })).json();
  const mine = (runs.workflow_runs || [])
    .filter((r) =&gt; new Date(r.created_at) &gt;= new Date(start))
    .sort((a, b) =&gt; new Date(a.created_at) - new Date(b.created_at))[0];
  if (!mine || mine.status !== 'completed') continue;
  if (mine.conclusion !== 'success') throw new Error('run failed: ' + mine.html_url);

  // Contents API: raw.githubusercontent.com bị cache ~5 phút nên dễ đọc bản cũ
  const gh = await (await fetch(
    \`https://api.github.com/repos/\${REPO}/contents/gallery/manifest.json?ref=${BRANCH}\`, { headers: HEAD })).json();
  const m = JSON.parse(Buffer.from(gh.content, 'base64').toString('utf8'));
  const img = (m.images || []).find((x) =&gt; new Date(x.date) &gt;= new Date(start) &amp;&amp; x.title === 'Tiêu đề');
  if (img) { console.log(\`https://github.com/\${REPO}/raw/${BRANCH}/gallery/\` + img.file); break; }
}</pre>

  <h2>4. Dùng thư viện trực tiếp (không cần token)</h2>
<pre>import { buildSVG, normalize, validateRequest } from './lib/svg.js';

const req = normalize({ title: 'Xin chào', theme: 'aurora', layout: 'hero', size: '1200x630' });
const { ok, errors, warnings } = validateRequest(req);   // kiểm tra trước khi gửi
const svg = buildSVG(req);                               // string, không side-effect

// PNG: import sharp from 'sharp';
// await sharp(Buffer.from(svg)).png().toFile('out.png');</pre>
  <p class="note">Cùng hàm này dùng cho trang xem trước và cho Actions, nên kết quả luôn khớp nhau.</p>
  <p><b>Không có repo trên máy?</b> Nạp thẳng file từ URL — ESM thuần, không import gì, không cần cài:</p>
<pre>const src = await (await fetch('${rawBase()}/lib/svg.js')).text();
const { buildSVG, normalize, validateRequest } =
  await import(\`data:text/javascript;charset=utf-8,\${encodeURIComponent(src)}\`);

const svg = buildSVG(normalize({ title: 'Xin chào', theme: 'aurora', layout: 'hero' }));</pre>

  <h2>5. Mở issue (không cần token trên máy)</h2>
<pre>[render] 3 việc nên tự động hoá ngay

Tiêu đề: 3 việc nên tự động hoá ngay
Phụ đề: Việc lặp lại;Việc dễ sai;Báo cáo định kỳ
Tác giả: VANHI
Kích thước: 1200x628
Theme: steel
Bố cục: list
Hoa tiết: grid
Chú thích: vanthuonghi.com</pre>
  <p class="note">Chấp nhận cả khoá không dấu (<code>tieu de</code>, <code>kich thuoc</code>) và tiếng Anh (<code>title</code>, <code>size</code>).</p>
  <p class="note">Bot trả lời bằng một comment chứa ảnh <b>và một khối JSON</b>:
    <code>{ ok, file, svg, png_url, svg_url, title, theme, layout, size, pattern, issue, run_id, run_url }</code>
    — agent chỉ cần parse khối đó, không phải bóc chữ trong comment.</p>

  <h2>6. Danh mục giá trị hợp lệ</h2>
  ${tablesHtml()}

  <h2>7. Lỗi thường gặp</h2>
  <div class="tablewrap"><table>
    <tr><th>Lỗi</th><th>Nguyên nhân / cách xử lý</th></tr>
    <tr><td><code>422</code></td><td>Thiếu <code>ref</code> hoặc workflow không có ở nhánh đó.</td></tr>
    <tr><td><code>403</code>/<code>404</code></td><td>Token thiếu scope <code>repo</code> + <code>workflow</code>.</td></tr>
    <tr><td>Manifest chưa có ảnh mới</td><td>Actions chưa commit xong — đợi vài giây rồi đọc lại; run được xếp hàng nên có thể lâu hơn 30s.</td></tr>
    <tr><td>Nhầm ảnh của agent khác</td><td>Lọc theo <code>date</code> ≥ thời điểm dispatch và khớp <code>title</code>.</td></tr>
    <tr><td>Tiếng Việt lệch nét</td><td>PNG trong trình duyệt dùng font hệ thống; Actions dùng Noto Sans. Bố cục giống nhau.</td></tr>
    <tr><td>Tiêu đề quá dài</td><td>Chữ tự thu nhỏ tới 14px; giữ ≤ 120 ký tự, lý tưởng ≤ 60.</td></tr>
  </table></div>

  <h2>8. Bản đồ file</h2>
  <div class="tablewrap"><table>
    <tr><th>File</th><th>Vai trò</th></tr>
    <tr><td><code>lib/svg.js</code></td><td>Nguồn sự thật: theme, size, layout, pattern, buildSVG, parseRequest, validate.</td></tr>
    <tr><td><code>lib/catalog.js</code></td><td>Sinh agent.json / llms.txt / agent.html / bảng trong index.html.</td></tr>
    <tr><td><code>render.mjs</code></td><td>Nhận issue hoặc dispatch → PNG bằng sharp, cập nhật manifest.</td></tr>
    <tr><td><code>bin/hinh.mjs</code></td><td>CLI cho agent: new / list / get / status / catalog / share.</td></tr>
    <tr><td><code>.github/workflows/render.yml</code></td><td>Hai cổng kích hoạt: issue <code>[render]</code> và workflow_dispatch.</td></tr>
    <tr><td><code>gallery/</code></td><td>Ảnh + manifest.json (Actions commit).</td></tr>
  </table></div>
</div>
</body>
</html>
`;
}
