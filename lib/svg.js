// Thư viện sinh SVG thuần — dùng CHUNG cho cả render.mjs (Node/Actions) và
// index.html (trình duyệt). Không phụ thuộc gì ngoài JS nên import được cả 2 nơi:
//   - Node:    import { buildSVG } from './lib/svg.js'
//   - Browser: <script type="module"> import { buildSVG } from './lib/svg.js'
// Giữ mọi thay đổi bố cục/màu/kích thước ở ĐÂY để xem trước khớp bản render.

export const FONT = 'Noto Sans, DejaVu Sans, Helvetica Neue, Arial, sans-serif';

export const THEMES = {
  sunset:   { from: '#ff7e5f', to: '#feb47b', ink: '#33160f', sub: '#33160fcc', deco: '#ffffff38', bar: '#33160f' },
  ocean:    { from: '#1b3a6b', to: '#4b9fe1', ink: '#ffffff', sub: '#ffffffcc', deco: '#ffffff2e', bar: '#ffd166' },
  forest:   { from: '#143d2b', to: '#4f9d69', ink: '#f4fff7', sub: '#f4fff7cc', deco: '#ffffff2b', bar: '#ffd166' },
  midnight: { from: '#141428', to: '#3b2f63', ink: '#f5f3ff', sub: '#f5f3ffcc', deco: '#ffffff1f', bar: '#8b7cff' },
  violet:   { from: '#6a3be0', to: '#c86dd7', ink: '#ffffff', sub: '#ffffffd9', deco: '#ffffff30', bar: '#ffe08a' },
  paper:    { from: '#f7f4ee', to: '#e7ded0', ink: '#221d16', sub: '#221d16cc', deco: '#00000012', bar: '#c2410c' },
  // — mẫu mới —
  coral:    { from: '#ff5f6d', to: '#ffc371', ink: '#3b0d14', sub: '#3b0d14cc', deco: '#ffffff33', bar: '#3b0d14' },
  mint:     { from: '#0ba360', to: '#3cba92', ink: '#04231a', sub: '#04231acc', deco: '#ffffff2e', bar: '#04231a' },
  sand:     { from: '#f5e6ca', to: '#d9b978', ink: '#3a2c14', sub: '#3a2c14cc', deco: '#ffffff55', bar: '#8a5a1e' },
  ink:      { from: '#16181d', to: '#3a3f4b', ink: '#f2f4f8', sub: '#f2f4f8cc', deco: '#ffffff1c', bar: '#eab308' },
  aurora:   { from: '#1a2980', to: '#26d0ce', ink: '#ffffff', sub: '#ffffffd9', deco: '#ffffff26', bar: '#ffe08a' },
  rose:     { from: '#f953c6', to: '#b91d73', ink: '#ffffff', sub: '#ffffffd9', deco: '#ffffff2e', bar: '#ffe9a8' },
};

export const SIZES = {
  // — kích thước Facebook —
  '1200x630':  [1200, 630],   // link share (OG)
  '1200x1200': [1200, 1200],  // bài đăng feed vuông
  '1080x1350': [1080, 1350],  // feed dọc (tỷ lệ 4:5 — đẹp nhất trên FB/IG)
  '1080x1920': [1080, 1920],  // story / reel
  '1640x624':  [1640, 624],   // bìa trang Facebook (cover)
  // — chung —
  '1080x1080': [1080, 1080],
  '1920x1080': [1920, 1080],
  '800x800':   [800, 800],
};

export const SIZE_LABELS = {
  '1200x630':  'Link FB',
  '1200x1200': 'Bài FB vuông',
  '1080x1350': 'FB dọc 4:5',
  '1080x1920': 'Story FB',
  '1640x624':  'Bìa FB',
  '1080x1080': 'Vuông',
  '1920x1080': 'Slide 16:9',
  '800x800':   'Nhỏ',
};

export const LAYOUTS = {
  left:   'Mặc định',
  center: 'Căn giữa',
  quote:  'Thẻ quote',
};

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&apos;');

export function deaccent(s) {
  return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

export function slugify(s) {
  return deaccent(s).toLowerCase().replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '').slice(0, 48) || 'hinh';
}

export function wrap(text, maxChars) {
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

// Parse body issue / input của workflow_dispatch thành request chuẩn hóa.
export function parseRequest({ title = '', body = '' } = {}) {
  const f = {};
  const map = {
    'tiêu đề': 'title', 'tieu de': 'title', 'title': 'title',
    'phụ đề': 'subtitle', 'phu de': 'subtitle', 'subtitle': 'subtitle', 'mô tả': 'subtitle', 'mo ta': 'subtitle',
    'tác giả': 'author', 'tac gia': 'author', 'author': 'author', 'nguồn': 'author', 'nguon': 'author',
    'kích thước': 'size', 'kich thuoc': 'size', 'size': 'size',
    'theme': 'theme', 'màu': 'theme', 'mau': 'theme', 'style': 'theme',
    'bố cục': 'layout', 'bo cuc': 'layout', 'layout': 'layout',
    'chú thích': 'footer', 'chu thich': 'footer', 'footer': 'footer',
  };
  for (const line of String(body || '').split(/\r?\n/)) {
    const m = line.match(/^\s*([^:]{1,40}):\s*(.+?)\s*$/);
    if (!m) continue;
    const key = map[m[1].trim().toLowerCase()];
    if (key && !f[key]) f[key] = m[2];
  }
  const issueTitle = String(title).replace(/^\s*\[render\]\s*/i, '').trim();
  return {
    title: f.title || issueTitle || 'Yêu cầu hình',
    subtitle: f.subtitle || '',
    author: f.author || '',
    footer: f.footer || '',
    size: SIZES[f.size] ? f.size : '1200x630',
    theme: THEMES[f.theme] ? f.theme : 'sunset',
    layout: LAYOUTS[f.layout] ? f.layout : 'left',
  };
}

export function buildSVG(req) {
  const [W, H] = SIZES[req.size] || SIZES['1200x630'];
  const t = THEMES[req.theme] || THEMES.sunset;
  const layout = LAYOUTS[req.layout] ? req.layout : 'left';
  const centered = layout === 'center';
  const gid = `g-${req.theme}-${layout}`;
  const pad = Math.round(W * 0.07);
  const maxTextW = W - pad * 2;
  const cx = W / 2;
  const anchor = centered ? 'middle' : 'start';
  const x = centered ? cx : pad;
  const titleMul = layout === 'quote' ? 0.9 : 1;

  // chọn cỡ chữ: tối đa 3 dòng
  const maxCharsFor = (f) => Math.max(6, Math.floor(maxTextW / (f * 0.54)));
  let fs = Math.round(W * 0.055 * titleMul);
  let lines = wrap(req.title, maxCharsFor(fs));
  while (lines.length > 3 && fs > 24) {
    fs = Math.round(fs * 0.86);
    lines = wrap(req.title, maxCharsFor(fs));
  }
  const subFs = Math.max(16, Math.round(fs * 0.42));
  const subLines = req.subtitle ? wrap(req.subtitle, Math.max(6, Math.floor(maxTextW / (subFs * 0.5)))) : [];

  // chiều cao khối nội dung để căn giữa dọc
  const eyebrowFs = Math.max(13, Math.round(fs * 0.26));
  const showEyebrowAbove = !!req.author && layout !== 'quote';
  const eyebrowH = showEyebrowAbove ? Math.round(eyebrowFs * 2.1) : 0;
  const glyphH = layout === 'quote' ? Math.round(fs * 1.25) : 0;
  const titleH = lines.length * Math.round(fs * 1.12);
  const subH = subLines.length ? 18 + subLines.length * Math.round(subFs * 1.3) : 0;
  const attributionH = req.author && layout === 'quote' ? Math.round(subFs * 2.4) : 0;
  const blockH = eyebrowH + glyphH + titleH + subH + attributionH;
  let y = Math.round((H - blockH) / 2);

  const p = [];
  p.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${FONT}">`);
  p.push(`<defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${t.from}"/><stop offset="1" stop-color="${t.to}"/></linearGradient></defs>`);
  p.push(`<rect width="${W}" height="${H}" fill="url(#${gid})"/>`);
  // trang trí
  p.push(`<circle cx="${W * 0.88}" cy="${H * 0.18}" r="${W * 0.16}" fill="${t.deco}"/>`);
  p.push(`<circle cx="${W * 0.12}" cy="${H * 0.92}" r="${W * 0.22}" fill="${t.deco}"/>`);
  p.push(`<circle cx="${W * 0.75}" cy="${H * 0.85}" r="${W * 0.07}" fill="${t.deco}"/>`);

  // eyebrow (trên đầu, bỏ qua với quote)
  if (showEyebrowAbove) {
    p.push(`<text x="${x}" y="${y + eyebrowFs}" font-size="${eyebrowFs}" font-weight="700" ` +
      `letter-spacing="${Math.round(eyebrowFs * 0.18)}" text-anchor="${anchor}" fill="${t.sub}" opacity="0.9">` +
      `${esc(req.author.toUpperCase())}</text>`);
    y += eyebrowH;
  }

  // dấu ngoặc kép lớn (layout quote)
  if (layout === 'quote') {
    const glyphFs = Math.round(fs * 1.6);      // &ldquo; là entity HTML — XML (librsvg) không định nghĩa nên phải dùng entity số
      p.push(`<text x="${x}" y="${y + glyphFs * 0.78}" font-size="${glyphFs}" font-weight="800" ` +
      `text-anchor="${anchor}" fill="${t.bar}" opacity="0.85">&#8220;</text>`);
    y += glyphH;
  }

  // tiêu đề
  for (const ln of lines) {
    p.push(`<text x="${x}" y="${y + fs * 0.86}" font-size="${fs}" font-weight="800" ` +
      `text-anchor="${anchor}" fill="${t.ink}">${esc(ln)}</text>`);
    y += Math.round(fs * 1.12);
  }

  // phụ đề
  if (subLines.length) {
    y += 18;
    for (const ln of subLines) {
      p.push(`<text x="${x}" y="${y + subFs * 0.86}" font-size="${subFs}" font-weight="400" ` +
        `text-anchor="${anchor}" fill="${t.sub}">${esc(ln)}</text>`);
      y += Math.round(subFs * 1.3);
    }
  }

  // tác giả dạng "— TÊN" dưới cùng (layout quote)
  if (req.author && layout === 'quote') {
    y += Math.round(subFs * 1.1);
    p.push(`<text x="${x}" y="${y + subFs}" font-size="${subFs}" font-weight="700" ` +
      `letter-spacing="${Math.round(subFs * 0.1)}" text-anchor="${anchor}" fill="${t.bar}">— ${esc(req.author.toUpperCase())}</text>`);
  }

  // footer
  const footFs = Math.max(12, Math.round(W * 0.014));
  const date = new Date().toISOString().slice(0, 10);
  const leftText = req.footer || `sinh bằng code · ${date}`;
  p.push(`<rect x="${pad}" y="${H - pad - footFs * 1.6}" width="${Math.round(W * 0.06)}" ` +
    `height="${Math.max(4, Math.round(footFs * 0.4))}" fill="${t.bar}"/>`);
  p.push(`<text x="${pad}" y="${H - pad}" font-size="${footFs}" font-weight="600" fill="${t.sub}">${esc(leftText)}</text>`);
  p.push(`<text x="${W - pad}" y="${H - pad}" font-size="${footFs}" font-weight="600" text-anchor="end" ` +
    `fill="${t.sub}">${esc(req.theme)} · ${layout} · ${W}×${H}</text>`);
  p.push(`</svg>`);
  return p.join('\n');
}
