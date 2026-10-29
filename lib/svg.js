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
  // — mẫu mới (6) —
  coral:    { from: '#ff5f6d', to: '#ffc371', ink: '#3b0d14', sub: '#3b0d14cc', deco: '#ffffff33', bar: '#3b0d14' },
  mint:     { from: '#0ba360', to: '#3cba92', ink: '#04231a', sub: '#04231acc', deco: '#ffffff2e', bar: '#04231a' },
  sand:     { from: '#f5e6ca', to: '#d9b978', ink: '#3a2c14', sub: '#3a2c14cc', deco: '#ffffff55', bar: '#8a5a1e' },
  ink:      { from: '#16181d', to: '#3a3f4b', ink: '#f2f4f8', sub: '#f2f4f8cc', deco: '#ffffff1c', bar: '#eab308' },
  aurora:   { from: '#1a2980', to: '#26d0ce', ink: '#ffffff', sub: '#ffffffd9', deco: '#ffffff26', bar: '#ffe08a' },
  rose:     { from: '#f953c6', to: '#b91d73', ink: '#ffffff', sub: '#ffffffd9', deco: '#ffffff2e', bar: '#ffe9a8' },
  citrus:   { from: '#ffd93d', to: '#ff8c42', ink: '#2b1a00', sub: '#2b1a00cc', deco: '#ffffff59', bar: '#2b1a00' },
  steel:    { from: '#485563', to: '#29323c', ink: '#eef2f7', sub: '#eef2f7cc', deco: '#ffffff22', bar: '#7dd3fc' },
  grape:    { from: '#7048e8', to: '#b197fc', ink: '#1b0f36', sub: '#1b0f36cc', deco: '#ffffff44', bar: '#3b1e8f' },
  blush:    { from: '#ffe5ec', to: '#ffc2d1', ink: '#4a1524', sub: '#4a1524cc', deco: '#ffffff99', bar: '#d6336c' },
  blueprint:{ from: '#0f2027', to: '#2c5364', ink: '#e8f4ff', sub: '#e8f4ffcc', deco: '#ffffff20', bar: '#4fd1c5' },
  clay:     { from: '#c79081', to: '#dfa579', ink: '#2b1a12', sub: '#2b1a12cc', deco: '#ffffff40', bar: '#6b3f2a' },
};

export const SIZES = {
  // — kích thước Facebook —
  '1200x630':  [1200, 630],   // link share (OG)
  '1200x1200': [1200, 1200],  // bài đăng feed vuông
  '1080x1350': [1080, 1350],  // feed dọc (tỷ lệ 4:5 — đẹp nhất trên FB/IG)
  '1080x1920': [1080, 1920],  // story / reel
  '1640x624':  [1640, 624],   // bìa trang Facebook (cover)
  // — mạng xã hội khác —
  '1200x628':  [1200, 628],   // bài LinkedIn / X
  '1280x720':  [1280, 720],   // thumbnail YouTube
  '1000x1500': [1000, 1500],  // Pinterest (2:3)
  '800x1000':  [800, 1000],   // share dọc (Zalo/Messenger)
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
  '1200x628':  'LinkedIn',
  '1280x720':  'YouTube',
  '1000x1500': 'Pinterest',
  '800x1000':  'Share dọc',
  '1080x1080': 'Vuông',
  '1920x1080': 'Slide 16:9',
  '800x800':   'Nhỏ',
};

export const LAYOUTS = {
  left:     'Mặc định',
  center:   'Căn giữa',
  quote:    'Thẻ quote',
  split:    'Chia đôi',
  list:     'Danh sách',
  number:   'Số lớn',
  sticker:  'Thẻ sticker',
  terminal: 'Terminal',
  story:    'Story',
};

// Mẫu có sẵn: bấm một cái là áp đúng bộ màu + bố cục + kích thước.
// Validate bằng test nên đổi key tùy ý, chỉ cần tồn tại trong THEMES/LAYOUTS/SIZES.
export const PRESETS = [
  { key: 'bai-viet', label: 'Bài FB dọc 4:5',  theme: 'rose',     layout: 'split',    size: '1080x1350' },
  { key: 'bia-fb',   label: 'Bìa trang FB',     theme: 'sunset',   layout: 'number',   size: '1640x624'  },
  { key: 'story',    label: 'Story FB',         theme: 'midnight', layout: 'story',    size: '1080x1920' },
  { key: 'trich-dan',label: 'Thẻ trích dẫn',    theme: 'paper',    layout: 'quote',    size: '1200x1200' },
  { key: 'linkedin', label: 'Bài LinkedIn',     theme: 'steel',    layout: 'list',     size: '1200x628'  },
  { key: 'youtube',  label: 'Thumbnail YouTube',theme: 'coral',    layout: 'sticker',  size: '1280x720'  },
];

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

// độ sáng tương đối của màu để chọn chữ tương phản trên nền `bar`
function luminance(hex) {
  const h = String(hex).replace('#', '');
  const n = (i) => parseInt(h.slice(i, i + 2), 16);
  return 0.2126 * n(0) + 0.7152 * n(2) + 0.0722 * n(4);
}

export function buildSVG(req) {
  const [W, H] = SIZES[req.size] || SIZES['1200x630'];
  const t = THEMES[req.theme] || THEMES.sunset;
  const layout = LAYOUTS[req.layout] ? req.layout : 'left';
  const gid = `g-${req.theme}-${layout}`;
  const pad = Math.round(W * 0.07);
  const cx = W / 2;
  const onBar = luminance(t.bar) > 155 ? '#14161c' : '#ffffff';

  // ===== vùng an toàn: khối chữ KHÔNG được đụng dải footer =====
  // (lỗi cũ: pad tính theo chiều rộng nên 1640x624 bị chữ đè lên footer)
  const footFs = Math.max(12, Math.round(W * 0.014));
  const footTop = H - pad - footFs * 1.6;
  const gap = Math.round(pad * 0.35);
  const availTop = pad;
  const availBottom = Math.max(availTop + Math.round(H * 0.1), footTop - gap);
  const availH = availBottom - availTop;

  // ===== khung riêng của từng bố cục (nếu có) =====
  const panelX = pad + Math.round((W - pad * 2) * 0.60);          // mép trái khối màu của `split`
  const cardInset = layout === 'sticker' ? Math.round(pad * 0.55) : 0;
  const termBarH = layout === 'terminal' ? Math.max(26, Math.round(W * 0.05)) : 0;
  const termInset = layout === 'terminal' ? Math.round(pad * 0.5) : 0;
  const tagH = layout === 'sticker' && req.author ? Math.round(pad * 1.15) : 0;

  const centered = layout === 'center' || layout === 'story';
  const x = centered ? cx : pad;
  const anchor = centered ? 'middle' : 'start';
  const maxTextW = layout === 'split'
    ? (panelX - Math.round(W * 0.03)) - pad
    : W - pad * 2;

  const regionTop = availTop + cardInset + termBarH + termInset + tagH;
  const regionBottom = availBottom - cardInset - termInset;
  const regionH = Math.max(Math.round(H * 0.08), regionBottom - regionTop);

  const hasEyebrow = !!req.author && ['left', 'center', 'split', 'list', 'number'].includes(layout);
  const maxCharsFor = (f) => Math.max(6, Math.floor(maxTextW / (f * 0.54)));

  // `number`: tách số đầu tiên trong tiêu đề ra làm số lớn
  const numMatch = layout === 'number' ? String(req.title).match(/\d+(?:[.,]\d+)?\s*%?/) : null;
  let numText = numMatch ? numMatch[0].trim() : '';
  let titleText = String(req.title);
  if (numText) {
    const rest = titleText.replace(numMatch[0], ' ').replace(/\s{2,}/g, ' ').trim();
    if (rest) titleText = rest; else numText = '';   // tiêu đề chỉ có số → giữ nguyên
  }
  // `list`: phụ đề tách thành các dòng bullet
  const bullets = layout === 'list'
    ? String(req.subtitle || '').split(/\s*[;•\n|]\s*/).map((s) => s.trim()).filter(Boolean).slice(0, 4)
    : [];

  // ===== thu nhỏ cỡ chữ tới khi khối vừa vùng an toàn =====
  let fs = Math.round(W * 0.055 * (layout === 'quote' ? 0.9 : 1));
  let m = {};
  for (;;) {
    const subFs = Math.max(16, Math.round(fs * 0.42));
    const eyebrowFs = Math.max(13, Math.round(fs * 0.26));
    const lineH = Math.round(fs * 1.12);
    const subLineH = Math.round(subFs * 1.3);
    const lines = wrap(titleText, maxCharsFor(fs));
    const subLines = (req.subtitle && layout !== 'list')
      ? wrap(req.subtitle, Math.max(6, Math.floor(maxTextW / (subFs * 0.5)))) : [];

    const eyebrowH = hasEyebrow ? Math.round(eyebrowFs * 2.1) : 0;
    const glyphH = layout === 'quote' ? Math.round(fs * 1.25) : 0;
    const titleH = lines.length * lineH;
    const subH = subLines.length ? 18 + subLines.length * subLineH : 0;
    const attributionH = req.author && layout === 'quote' ? Math.round(subFs * 2.4) : 0;
    const numFs = Math.round(fs * 2.1);
    const numH = numText
      ? Math.round(numFs * 1.05) + Math.round(fs * 0.2)
      : Math.round(fs * 0.7);                                  // thanh nhấn khi không có số
    const badgeR = Math.round(subFs * 0.72);
    const bulletIndent = badgeR * 2 + Math.round(subFs * 0.8);
    const rows = bullets.map((b) => wrap(b, Math.max(6, Math.floor((maxTextW - bulletIndent) / (subFs * 0.5)))));
    const itemGap = Math.round(subFs * 0.7);
    const listH = rows.length
      ? Math.round(fs * 0.5) + rows.reduce((a, r) => a + Math.max(badgeR * 2, r.length * subLineH) + itemGap, 0) - itemGap
      : 0;
    const avatarR = Math.round(W * 0.07);
    const avatarH = layout === 'story' && req.author
      ? avatarR * 2 + Math.round(subFs * 1.6) + Math.round(fs * 0.4) : 0;

    let blockH;
    switch (layout) {
      case 'quote':  blockH = glyphH + titleH + subH + attributionH; break;
      case 'list':   blockH = eyebrowH + titleH + listH; break;
      case 'number': blockH = eyebrowH + numH + titleH + subH; break;
      case 'story':  blockH = avatarH + titleH + subH; break;
      default:       blockH = eyebrowH + titleH + subH;             // left / center / split / sticker / terminal
    }

    m = { fs, subFs, eyebrowFs, lineH, subLineH, lines, subLines, eyebrowH, glyphH, numFs, numH,
          badgeR, bulletIndent, rows, itemGap, avatarR, avatarH, blockH, subH, attributionH };
    if (blockH <= regionH || fs <= 16) break;
    fs = Math.max(16, Math.round(fs * 0.88));
  }

  const { subFs, eyebrowFs, lineH, subLineH, lines, subLines, eyebrowH, glyphH, numFs, numH,
          badgeR, rows, itemGap, avatarR, avatarH, blockH, subH, attributionH } = m;
  // căn giữa trong vùng an toàn, clamp để không tràn mép trên
  let y = Math.round(Math.max(regionTop, regionTop + (regionH - blockH) / 2));

  const p = [];
  p.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${FONT}">`);
  p.push(`<defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${t.from}"/><stop offset="1" stop-color="${t.to}"/></linearGradient></defs>`);
  p.push(`<rect width="${W}" height="${H}" fill="url(#${gid})"/>`);
  p.push(`<circle cx="${W * 0.88}" cy="${H * 0.18}" r="${W * 0.16}" fill="${t.deco}"/>`);
  p.push(`<circle cx="${W * 0.12}" cy="${H * 0.92}" r="${W * 0.22}" fill="${t.deco}"/>`);
  p.push(`<circle cx="${W * 0.75}" cy="${H * 0.85}" r="${W * 0.07}" fill="${t.deco}"/>`);

  // ===== khung cố định (không phụ thuộc y) =====
  if (layout === 'split') {
    const panelW = (W - pad) - panelX;
    const panelH = availBottom - availTop;
    p.push(`<rect x="${panelX}" y="${availTop}" width="${panelW}" height="${panelH}" rx="${Math.round(W * 0.03)}" fill="${t.bar}" opacity="0.92"/>`);
    p.push(`<circle cx="${Math.round(panelX + panelW * 0.72)}" cy="${Math.round(availTop + panelH * 0.26)}" r="${Math.round(panelW * 0.33)}" fill="#ffffff2e"/>`);
    p.push(`<circle cx="${Math.round(panelX + panelW * 0.3)}" cy="${Math.round(availTop + panelH * 0.78)}" r="${Math.round(panelW * 0.2)}" fill="#ffffff22"/>`);
    p.push(`<rect x="${Math.round(panelX + panelW * 0.2)}" y="${Math.round(availTop + panelH * 0.47)}" width="${Math.round(panelW * 0.6)}" height="${Math.max(6, Math.round(W * 0.006))}" rx="${Math.round(W * 0.004)}" fill="#ffffff66"/>`);
  }

  if (layout === 'sticker') {
    const cw = W - pad * 2;
    const ch = availBottom - availTop;
    const off = Math.round(W * 0.012);
    p.push(`<rect x="${pad + off}" y="${availTop + off}" width="${cw}" height="${ch}" rx="${Math.round(W * 0.045)}" fill="${t.bar}"/>`);
    p.push(`<rect x="${pad}" y="${availTop}" width="${cw}" height="${ch}" rx="${Math.round(W * 0.045)}" fill="#ffffff1f" stroke="${t.ink}" stroke-opacity="0.55" stroke-width="${Math.max(3, Math.round(W * 0.005))}"/>`);
    if (req.author) {
      const tagFs = Math.max(14, Math.round(fs * 0.3));
      const tagText = String(req.author).toUpperCase();
      const tw = Math.round(tagText.length * tagFs * 0.64 + tagFs * 1.7);
      const th = Math.round(tagFs * 2);
      const tx = (W - pad) - Math.round(pad * 0.55) - tw;
      const ty = availTop + Math.round(pad * 0.5);
      p.push(`<g transform="rotate(7 ${Math.round(tx + tw / 2)} ${Math.round(ty + th / 2)})">` +
        `<rect x="${tx}" y="${ty}" width="${tw}" height="${th}" rx="${Math.round(th / 2)}" fill="${t.bar}"/>` +
        `<text x="${Math.round(tx + tw / 2)}" y="${Math.round(ty + th * 0.68)}" font-size="${tagFs}" font-weight="800" ` +
        `text-anchor="middle" letter-spacing="${Math.round(tagFs * 0.1)}" fill="${onBar}">${esc(tagText)}</text></g>`);
    }
  }

  if (layout === 'terminal') {
    const wx = pad, wy = availTop, ww = W - pad * 2, wh = availBottom - availTop;
    const rx = Math.round(W * 0.022);
    p.push(`<rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" rx="${rx}" fill="#0d1117" opacity="0.95"/>`);
    p.push(`<rect x="${wx}" y="${wy}" width="${ww}" height="${termBarH}" rx="${rx}" fill="#1c2431"/>`);
    p.push(`<rect x="${wx}" y="${wy + termBarH - rx}" width="${ww}" height="${rx}" fill="#1c2431"/>`);
    const dr = Math.round(termBarH * 0.16);
    ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => {
      p.push(`<circle cx="${Math.round(wx + termBarH * 0.6 + i * termBarH * 0.5)}" cy="${Math.round(wy + termBarH / 2)}" r="${dr}" fill="${c}"/>`);
    });
    const titleFs = Math.max(13, Math.round(termBarH * 0.4));
    p.push(`<text x="${Math.round(wx + ww / 2)}" y="${Math.round(wy + termBarH * 0.68)}" font-size="${titleFs}" ` +
      `font-weight="600" text-anchor="middle" fill="#9aa3b5">${esc(req.author || 'hinh — render')}</text>`);
  }

  if (layout === 'story') {
    const segY = Math.round(H * 0.035);
    const segH = Math.max(6, Math.round(H * 0.006));
    const segGap = Math.round(W * 0.018);
    const segW = (W - pad * 2 - segGap * 2) / 3;
    for (let i = 0; i < 3; i++) {
      p.push(`<rect x="${Math.round(pad + i * (segW + segGap))}" y="${segY}" width="${Math.round(segW)}" height="${segH}" ` +
        `rx="${Math.round(segH / 2)}" fill="${i === 0 ? t.bar : '#ffffff55'}"/>`);
    }
  }

  // ===== khối nội dung =====
  if (layout === 'story' && req.author) {
    const cy = y + avatarR;
    const initial = esc(String(req.author).trim().charAt(0).toUpperCase() || '?');
    p.push(`<circle cx="${cx}" cy="${cy}" r="${avatarR}" fill="${t.bar}"/>`);
    p.push(`<text x="${cx}" y="${Math.round(cy + avatarR * 0.36)}" font-size="${Math.round(avatarR * 0.95)}" ` +
      `font-weight="800" text-anchor="middle" fill="${onBar}">${initial}</text>`);
    p.push(`<text x="${cx}" y="${Math.round(y + avatarR * 2 + subFs * 1.1)}" font-size="${subFs}" font-weight="700" ` +
      `letter-spacing="${Math.round(subFs * 0.12)}" text-anchor="middle" fill="${t.sub}">${esc(String(req.author).toUpperCase())}</text>`);
    y += avatarH;
  }

  if (hasEyebrow) {
    p.push(`<text x="${x}" y="${y + eyebrowFs}" font-size="${eyebrowFs}" font-weight="700" ` +
      `letter-spacing="${Math.round(eyebrowFs * 0.18)}" text-anchor="${anchor}" fill="${t.sub}" opacity="0.9">` +
      `${esc(String(req.author).toUpperCase())}</text>`);
    y += eyebrowH;
  }

  if (layout === 'quote') {
    // &ldquo; là entity HTML — XML (librsvg) không định nghĩa nên phải dùng entity số
    const glyphFs = Math.round(fs * 1.6);
    p.push(`<text x="${x}" y="${Math.round(y + glyphFs * 0.78)}" font-size="${glyphFs}" font-weight="800" ` +
      `text-anchor="${anchor}" fill="${t.bar}" opacity="0.85">&#8220;</text>`);
    y += glyphH;
  }

  if (layout === 'number') {
    if (numText) {
      p.push(`<text x="${x}" y="${Math.round(y + numFs * 0.84)}" font-size="${numFs}" font-weight="900" ` +
        `text-anchor="${anchor}" fill="${t.bar}">${esc(numText)}</text>`);
    } else {
      p.push(`<rect x="${x}" y="${y}" width="${Math.round(W * 0.13)}" height="${Math.round(fs * 0.16)}" ` +
        `rx="${Math.round(fs * 0.08)}" fill="${t.bar}"/>`);
    }
    y += numH;
  }

  for (const ln of lines) {
    p.push(`<text x="${x}" y="${Math.round(y + fs * 0.86)}" font-size="${fs}" font-weight="800" ` +
      `text-anchor="${anchor}" fill="${t.ink}">${esc(ln)}</text>`);
    y += lineH;
  }

  if (layout === 'list' && rows.length) {
    y += Math.round(fs * 0.5);
    const badgeCx = pad + badgeR;
    const textX = pad + badgeR * 2 + Math.round(subFs * 0.8);
    rows.forEach((r, i) => {
      const rowH = Math.max(badgeR * 2, r.length * subLineH);
      const bcy = y + Math.round(rowH / 2);
      p.push(`<circle cx="${badgeCx}" cy="${bcy}" r="${badgeR}" fill="${t.bar}"/>`);
      p.push(`<text x="${badgeCx}" y="${Math.round(bcy + badgeR * 0.36)}" font-size="${Math.round(badgeR * 1.05)}" ` +
        `font-weight="800" text-anchor="middle" fill="${onBar}">${i + 1}</text>`);
      let ty = y + subFs * 0.86;
      for (const ln of r) {
        p.push(`<text x="${textX}" y="${Math.round(ty)}" font-size="${subFs}" font-weight="500" fill="${t.sub}">${esc(ln)}</text>`);
        ty += subLineH;
      }
      y += rowH + itemGap;
    });
  } else if (subLines.length) {
    y += 18;
    for (const ln of subLines) {
      p.push(`<text x="${x}" y="${Math.round(y + subFs * 0.86)}" font-size="${subFs}" font-weight="400" ` +
        `text-anchor="${anchor}" fill="${t.sub}">${esc(ln)}</text>`);
      y += subLineH;
    }
  }
  if (subH && subLines.length) y += 0;      // (subH đã tính trong lúc đo)

  if (req.author && layout === 'quote') {
    y += Math.round(subFs * 1.1);
    p.push(`<text x="${x}" y="${Math.round(y + subFs)}" font-size="${subFs}" font-weight="700" ` +
      `letter-spacing="${Math.round(subFs * 0.1)}" text-anchor="${anchor}" fill="${t.bar}">— ${esc(String(req.author).toUpperCase())}</text>`);
  }

  // ===== footer (nằm ngoài vùng nội dung) =====
  const date = new Date().toISOString().slice(0, 10);
  const leftText = req.footer || `sinh bằng code · ${date}`;
  p.push(`<rect x="${pad}" y="${Math.round(H - pad - footFs * 1.6)}" width="${Math.round(W * 0.06)}" ` +
    `height="${Math.max(4, Math.round(footFs * 0.4))}" fill="${t.bar}"/>`);
  p.push(`<text x="${pad}" y="${H - pad}" font-size="${footFs}" font-weight="600" fill="${t.sub}">${esc(leftText)}</text>`);
  p.push(`<text x="${W - pad}" y="${H - pad}" font-size="${footFs}" font-weight="600" text-anchor="end" ` +
    `fill="${t.sub}">${esc(req.theme)} · ${layout} · ${W}×${H}</text>`);
  p.push(`</svg>`);
  return p.join('\n');
}
