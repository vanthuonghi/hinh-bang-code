// Thư viện sinh SVG thuần — dùng CHUNG cho cả render.mjs (Node/Actions) và
// index.html (trình duyệt). Không phụ thuộc gì ngoài JS nên import được cả 2 nơi:
//   - Node:    import { buildSVG } from './lib/svg.js'
//   - Browser: <script type="module"> import { buildSVG } from './lib/svg.js'
// Giữ mọi thay đổi bố cục/màu/kích thước ở ĐÂY để xem trước khớp bản render.
//
// Mọi thứ "liệt kê được" (theme, size, layout, pattern, preset) đều là map/danh
// sách export ra ngoài: trang web dựng UI từ đó, bin/catalog.mjs sinh agent.json
// + llms.txt từ đó, test quét toàn bộ ma trận từ đó. Thêm một key = có mặt ở mọi
// nơi, không phải sửa tay chỗ nào khác.

export const FONT = 'Noto Sans, DejaVu Sans, Segoe UI, Helvetica Neue, Arial, sans-serif';
export const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, Noto Sans Mono, monospace';

// ===== bảng màu =====
// from/to: gradient · ink: chữ chính · sub: chữ phụ · deco: hoạ tiết nền ·
// bar: khối nhấn (badge, số lớn, dấu quote)
export const THEMES = {
  sunset:    { from: '#ff7e5f', to: '#feb47b', ink: '#33160f', sub: '#33160fcc', deco: '#ffffff38', bar: '#33160f' },
  ocean:     { from: '#1b3a6b', to: '#4b9fe1', ink: '#ffffff', sub: '#ffffffcc', deco: '#ffffff2e', bar: '#ffd166' },
  forest:    { from: '#143d2b', to: '#4f9d69', ink: '#f4fff7', sub: '#f4fff7cc', deco: '#ffffff2b', bar: '#ffd166' },
  midnight:  { from: '#141428', to: '#3b2f63', ink: '#f5f3ff', sub: '#f5f3ffcc', deco: '#ffffff1f', bar: '#8b7cff' },
  violet:    { from: '#6a3be0', to: '#c86dd7', ink: '#ffffff', sub: '#ffffffd9', deco: '#ffffff30', bar: '#ffe08a' },
  paper:     { from: '#f7f4ee', to: '#e7ded0', ink: '#221d16', sub: '#221d16cc', deco: '#00000012', bar: '#c2410c' },
  coral:     { from: '#ff5f6d', to: '#ffc371', ink: '#3b0d14', sub: '#3b0d14cc', deco: '#ffffff33', bar: '#3b0d14' },
  mint:      { from: '#0ba360', to: '#3cba92', ink: '#04231a', sub: '#04231acc', deco: '#ffffff2e', bar: '#04231a' },
  sand:      { from: '#f5e6ca', to: '#d9b978', ink: '#3a2c14', sub: '#3a2c14cc', deco: '#ffffff55', bar: '#8a5a1e' },
  ink:       { from: '#16181d', to: '#3a3f4b', ink: '#f2f4f8', sub: '#f2f4f8cc', deco: '#ffffff1c', bar: '#eab308' },
  aurora:    { from: '#1a2980', to: '#26d0ce', ink: '#ffffff', sub: '#ffffffd9', deco: '#ffffff26', bar: '#ffe08a' },
  rose:      { from: '#f953c6', to: '#b91d73', ink: '#ffffff', sub: '#ffffffd9', deco: '#ffffff2e', bar: '#ffe9a8' },
  citrus:    { from: '#ffd93d', to: '#ff8c42', ink: '#2b1a00', sub: '#2b1a00cc', deco: '#ffffff59', bar: '#2b1a00' },
  steel:     { from: '#485563', to: '#29323c', ink: '#eef2f7', sub: '#eef2f7cc', deco: '#ffffff22', bar: '#7dd3fc' },
  grape:     { from: '#7048e8', to: '#b197fc', ink: '#1b0f36', sub: '#1b0f36cc', deco: '#ffffff44', bar: '#3b1e8f' },
  blush:     { from: '#ffe5ec', to: '#ffc2d1', ink: '#4a1524', sub: '#4a1524cc', deco: '#ffffff99', bar: '#d6336c' },
  blueprint: { from: '#0f2027', to: '#2c5364', ink: '#e8f4ff', sub: '#e8f4ffcc', deco: '#ffffff20', bar: '#4fd1c5' },
  clay:      { from: '#c79081', to: '#dfa579', ink: '#2b1a12', sub: '#2b1a12cc', deco: '#ffffff40', bar: '#6b3f2a' },
  // — 12 mẫu mới —
  galaxy:    { from: '#10122b', to: '#5b2c83', ink: '#f6f2ff', sub: '#f6f2ffcc', deco: '#ffffff2a', bar: '#ffd166' },
  eclipse:   { from: '#0b0f19', to: '#2a1b4d', ink: '#eef1ff', sub: '#eef1ffcc', deco: '#ffffff1e', bar: '#7cf5d0' },
  lagoon:    { from: '#00b4db', to: '#0083b0', ink: '#032026', sub: '#032026d9', deco: '#ffffff33', bar: '#052e35' },
  ember:     { from: '#2b0a0a', to: '#b33c1a', ink: '#fff2e9', sub: '#fff2e9cc', deco: '#ffffff22', bar: '#ffc46b' },
  cocoa:     { from: '#3e2723', to: '#8d6e63', ink: '#fff8f2', sub: '#fff8f2cc', deco: '#ffffff24', bar: '#ffd8a8' },
  sakura:    { from: '#ffe3ef', to: '#ffb3cd', ink: '#4a1226', sub: '#4a1226cc', deco: '#ffffff9c', bar: '#c2185b' },
  peach:     { from: '#ffc3a0', to: '#ff9db6', ink: '#3d1220', sub: '#3d1220cc', deco: '#ffffff5c', bar: '#8c1d40' },
  ice:       { from: '#e3ecfb', to: '#b6ccf7', ink: '#10213d', sub: '#10213dcc', deco: '#ffffff9c', bar: '#1d4ed8' },
  lemon:     { from: '#f6f3a8', to: '#e0d24a', ink: '#2a2708', sub: '#2a2708cc', deco: '#ffffff70', bar: '#5b5303' },
  moss:      { from: '#22361a', to: '#7ba05b', ink: '#f3faee', sub: '#f3faeecc', deco: '#ffffff26', bar: '#ffd166' },
  noir:      { from: '#050506', to: '#26262b', ink: '#f5f5f7', sub: '#f5f5f7cc', deco: '#ffffff18', bar: '#ff4d4d' },
  mono:      { from: '#fafafa', to: '#d5d5db', ink: '#121317', sub: '#121317cc', deco: '#00000014', bar: '#121317' },
};

// Nhãn tiếng Việt — dùng cho UI, không ảnh hưởng render.
export const THEME_LABELS = {
  sunset: 'Hoàng hôn', ocean: 'Đại dương', forest: 'Rừng sâu', midnight: 'Nửa đêm',
  violet: 'Tím mộng', paper: 'Giấy cũ', coral: 'San hô', mint: 'Bạc hà',
  sand: 'Cát vàng', ink: 'Mực đêm', aurora: 'Cực quang', rose: 'Hồng đào',
  citrus: 'Chanh cam', steel: 'Thép xanh', grape: 'Nho chín', blush: 'Má hồng',
  blueprint: 'Bản vẽ kỹ thuật', clay: 'Đất nung', galaxy: 'Dải ngân hà', eclipse: 'Nhật thực',
  lagoon: 'Vũng ngọc', ember: 'Than hồng', cocoa: 'Ca cao', sakura: 'Anh đào',
  peach: 'Đào mật', ice: 'Băng giá', lemon: 'Chanh vàng', moss: 'Rêu xanh',
  noir: 'Đen tuyền', mono: 'Xám tối giản',
};

// ===== hoa tiết nền (thay cho "3 vòng tròn" cố định cũ) =====
export const PATTERNS = {
  orb:      'Quầng sáng',
  dots:     'Chấm lưới',
  grid:     'Kẻ ô',
  waves:    'Sóng',
  beams:    'Vệt sáng',
  rings:    'Vòng đồng tâm',
  blobs:    'Mảng mềm',
  confetti: 'Confetti',
  none:     'Trơn',
};

// ===== kích thước =====
export const SIZES = {
  // — Facebook —
  '1200x630':  [1200, 630],   // link share (OG)
  '1200x1200': [1200, 1200],  // bài đăng feed vuông
  '1080x1350': [1080, 1350],  // feed dọc (4:5 — đẹp nhất trên FB/IG)
  '1080x1920': [1080, 1920],  // story / reel
  '1640x624':  [1640, 624],   // bìa trang Facebook
  // — LinkedIn / X —
  '1200x628':  [1200, 628],
  '1200x1500': [1200, 1500],  // LinkedIn dọc 4:5
  // — YouTube / slide —
  '1280x720':  [1280, 720],
  '1920x1080': [1920, 1080],
  '1600x900':  [1600, 900],
  // — Pinterest / Zalo —
  '1000x1500': [1000, 1500],
  '800x1000':  [800, 1000],
  // — chung —
  '1080x1080': [1080, 1080],
  '800x800':   [800, 800],
  '1080x608':  [1080, 608],
};

export const SIZE_LABELS = {
  '1200x630':  'Link FB',
  '1200x1200': 'Bài FB vuông',
  '1080x1350': 'FB dọc 4:5',
  '1080x1920': 'Story FB',
  '1640x624':  'Bìa FB',
  '1200x628':  'LinkedIn ngang',
  '1200x1500': 'LinkedIn dọc',
  '1280x720':  'YouTube',
  '1920x1080': 'Slide 16:9',
  '1600x900':  'Slide HD',
  '1000x1500': 'Pinterest',
  '800x1000':  'Share dọc',
  '1080x1080': 'Vuông',
  '800x800':   'Nhỏ',
  '1080x608':  'Link FB nhỏ',
};

// Dùng cho ai / ở đâu — hiện trong tài liệu và trong tooltip của UI.
export const SIZE_USE = {
  '1200x630':  'Link share Facebook / OG image',
  '1200x1200': 'Bài đăng feed vuông (FB/IG)',
  '1080x1350': 'Feed dọc 4:5 — tỷ lệ đẹp nhất trên FB/IG',
  '1080x1920': 'Story / Reel',
  '1640x624':  'Ảnh bìa trang Facebook',
  '1200x628':  'Bài LinkedIn / X (ngang)',
  '1200x1500': 'Bài LinkedIn dọc 4:5',
  '1280x720':  'Thumbnail YouTube',
  '1920x1080': 'Slide 16:9 full HD',
  '1600x900':  'Slide 16:9 nhẹ',
  '1000x1500': 'Pinterest (2:3)',
  '800x1000':  'Share dọc Zalo / Messenger',
  '1080x1080': 'Ảnh vuông chung',
  '800x800':   'Ảnh nhỏ, icon, preview',
  '1080x608':  'Link Facebook tỷ lệ 1.91:1 (nhẹ)',
};

// Nhóm kích thước cho UI (thứ tự hiển thị). Test kiểm tra phủ đủ mọi size.
export const SIZE_GROUPS = [
  { label: 'Facebook', keys: ['1200x630', '1200x1200', '1080x1350', '1080x1920', '1640x624'] },
  { label: 'LinkedIn / X', keys: ['1200x628', '1200x1500'] },
  { label: 'YouTube / slide', keys: ['1280x720', '1920x1080', '1600x900'] },
  { label: 'Pinterest / Zalo', keys: ['1000x1500', '800x1000'] },
  { label: 'Khác', keys: ['1080x1080', '800x800', '1080x608'] },
];

// ===== bố cục =====
export const LAYOUTS = {
  left:     'Mặc định',
  center:   'Căn giữa',
  hero:     'Hero lớn',
  quote:    'Thẻ quote',
  split:    'Chia đôi',
  list:     'Danh sách',
  timeline: 'Lộ trình',
  number:   'Số lớn',
  sticker:  'Thẻ sticker',
  card:     'Thẻ nổi',
  minimal:  'Tối giản',
  terminal: 'Terminal',
  story:    'Story',
};

// Hướng dẫn ngắn cho từng bố cục — hiện trong UI và trong tài liệu cho agent.
export const LAYOUT_INFO = {
  left:     { hint: 'An toàn nhất cho mọi nội dung. Tiêu đề trái, phụ đề ngay dưới.', subtitle: 'Một câu mô tả ngắn.' },
  center:   { hint: 'Căn giữa, hợp câu thông điệp ngắn và ảnh đăng feed.', subtitle: 'Một câu ngắn (dưới 90 ký tự).' },
  hero:     { hint: 'Tiêu đề rất lớn + gạch nhấn màu. Hợp thông báo, cover, thumbnail.', subtitle: 'Một dòng bổ trợ, có thể bỏ trống.' },
  quote:    { hint: 'Dấu ngoặc kép lớn + tên tác giả ở dưới. Hợp trích dẫn.', subtitle: 'Để trống; dùng "Tác giả" cho phần ký tên.' },
  split:    { hint: 'Chữ bên trái, khối màu bên phải. Hợp bài viết có tiêu đề dài.', subtitle: 'Một câu mô tả ngắn.' },
  list:     { hint: 'Phụ đề tách theo dấu ; hoặc | thành các mục đánh số.', subtitle: 'Ví dụ: Tự động hoá việc lặp;Đo lường kết quả;Lan toả nội bộ' },
  timeline: { hint: 'Các mục thành lộ trình dọc có đường nối, tối đa 5 bước.', subtitle: 'Ví dụ: Khảo sát;Thử nghiệm;Nhân rộng' },
  number:   { hint: 'Tách số đầu tiên trong tiêu đề ra làm số lớn (vd "40%").', subtitle: 'Một câu giải thích con số.' },
  sticker:  { hint: 'Khung viền đậm + nhãn tác giả xoay góc. Hợp ảnh bìa vui.', subtitle: 'Một câu ngắn.' },
  card:     { hint: 'Thẻ nổi bo tròn trên nền gradient, có đổ bóng.', subtitle: 'Một câu ngắn, tối đa 2 dòng.' },
  minimal:  { hint: 'Rất nhiều khoảng trắng, gạch nhấn mảnh. Hợp ảnh sang, ít chữ.', subtitle: 'Một dòng phụ đề ngắn hoặc để trống.' },
  terminal: { hint: 'Cửa sổ terminal với 3 nút màu, chữ monospace. Hợp nội dung dev.', subtitle: 'Một dòng lệnh hoặc mô tả ngắn.' },
  story:    { hint: 'Thanh tiến trình trên cùng + avatar chữ cái đầu của tác giả.', subtitle: 'Một câu ngắn; cần "Tác giả" để có avatar.' },
};

export const LAYOUT_GROUPS = [
  { label: 'Cơ bản', keys: ['left', 'center', 'hero', 'minimal', 'card'] },
  { label: 'Nhiều nội dung', keys: ['list', 'timeline', 'number', 'split'] },
  { label: 'Trang trí', keys: ['quote', 'sticker', 'terminal', 'story'] },
];

// Mẫu có sẵn: bấm một cái là áp đúng bộ màu + hoa tiết + bố cục + kích thước.
// `demo` chỉ điền vào form khi tiêu đề đang trống (không đè chữ người dùng đã gõ).
export const PRESETS = [
  { key: 'bai-viet',  label: 'Bài FB dọc 4:5',   theme: 'rose',     pattern: 'orb',      layout: 'split',    size: '1080x1350' },
  { key: 'bia-fb',    label: 'Bìa trang FB',     theme: 'sunset',   pattern: 'beams',    layout: 'number',   size: '1640x624' },
  { key: 'story',     label: 'Story FB',         theme: 'midnight', pattern: 'orb',      layout: 'story',    size: '1080x1920' },
  { key: 'trich-dan', label: 'Thẻ trích dẫn',    theme: 'paper',    pattern: 'none',     layout: 'quote',    size: '1200x1200' },
  { key: 'linkedin',  label: 'Bài LinkedIn',     theme: 'steel',    pattern: 'grid',     layout: 'list',     size: '1200x628' },
  { key: 'youtube',   label: 'Thumbnail YouTube',theme: 'coral',    pattern: 'confetti', layout: 'sticker',  size: '1280x720' },
  { key: 'hero',      label: 'Hero thông báo',   theme: 'aurora',   pattern: 'waves',    layout: 'hero',     size: '1200x630' },
  { key: 'toi-gian',  label: 'Tối giản sang',    theme: 'paper',    pattern: 'none',     layout: 'minimal',  size: '1200x1500' },
  { key: 'the-noi',   label: 'Thẻ nổi',          theme: 'galaxy',   pattern: 'rings',    layout: 'card',     size: '1200x1200' },
  { key: 'lo-trinh',  label: 'Lộ trình 3 bước',  theme: 'lagoon',   pattern: 'dots',     layout: 'timeline', size: '1080x1350' },
  { key: 'terminal',  label: 'Khung terminal',   theme: 'noir',     pattern: 'none',     layout: 'terminal', size: '1200x630' },
  { key: 'pinterest', label: 'Pinterest 2:3',    theme: 'sakura',   pattern: 'blobs',    layout: 'hero',     size: '1000x1500' },
];

// Nội dung mẫu để thử nhanh — "Điền ví dụ" trên trang.
export const EXAMPLES = [
  { key: 'thoi-quen', label: 'Thói quen buổi sáng', title: '5 phút mỗi sáng thay đổi ngày của bạn',
    subtitle: 'Một nghi thức nhỏ, hiệu quả bất ngờ', author: 'VANHI', theme: 'sunset', layout: 'left', size: '1080x1350', pattern: 'orb' },
  { key: 'tu-dong', label: 'Tự động hoá', title: '3 việc nên tự động hoá ngay',
    subtitle: 'Việc lặp lại;Việc dễ sai;Báo cáo định kỳ', author: 'VANHI', theme: 'steel', layout: 'list', size: '1200x628', pattern: 'grid' },
  { key: 'so-lieu', label: 'Số liệu ấn tượng', title: 'tiết kiệm 12 giờ mỗi tuần',
    subtitle: 'Sau khi chuyển quy trình giấy tờ sang tự động', author: 'BÁO CÁO', theme: 'ocean', layout: 'number', size: '1200x1200', pattern: 'orb' },
  { key: 'trich-dan', label: 'Trích dẫn', title: 'Cách tốt nhất để dự đoán tương lai là tạo ra nó',
    subtitle: '', author: 'Alan Kay', theme: 'paper', layout: 'quote', size: '1200x1200', pattern: 'none' },
  { key: 'ra-mat', label: 'Ra mắt sản phẩm', title: 'Bản cập nhật 2.0 đã sẵn sàng',
    subtitle: 'Nhanh hơn gấp đôi, vẫn miễn phí', author: 'HINH BẰNG CODE', theme: 'aurora', layout: 'hero', size: '1200x630', pattern: 'waves' },
  { key: 'lo-trinh', label: 'Lộ trình', title: 'Lộ trình 3 bước để bắt đầu',
    subtitle: 'Khảo sát hiện trạng;Chọn một việc lặp lại;Đo kết quả sau 2 tuần', author: 'VANHI', theme: 'lagoon', layout: 'timeline', size: '1080x1350', pattern: 'dots' },
];

// ===== tiện ích chuỗi =====
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

// Ước lượng bề rộng chữ theo em — đủ chính xác cho sans-serif đậm và chạy y hệt
// nhau ở trình duyệt lẫn Node (không cần canvas/DOM). Cố tình ước lượng DƯ một
// chút: thà chữ nhỏ hơn một nhịp còn hơn tràn mép khung.
const NARROW = new Set('iljtrf.,:;!\'|`()[]-/\\');
const WIDE = new Set('mwMW@%');
export function estimateWidth(text, fs, weight = 800) {
  let em = 0;
  for (const ch of String(text)) {
    if (ch === ' ') em += 0.27;
    else if (NARROW.has(ch)) em += 0.3;
    else if (WIDE.has(ch)) em += 0.92;
    else if (ch >= 'A' && ch <= 'Z') em += 0.7;
    else if (ch >= '0' && ch <= '9') em += 0.58;
    else if (ch >= '\u00C0') em += 0.62;          // chữ có dấu tiếng Việt
    else em += 0.56;
  }
  return em * fs * (weight >= 700 ? 1.03 : 1);
}

// Ngắt dòng theo bề rộng thật (ước lượng) thay vì đếm ký tự.
export function fitLines(text, maxWidth, fs, weight = 800) {
  const words = String(text).trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const w of words) {
    if (!line) {
      if (estimateWidth(w, fs, weight) > maxWidth) {      // từ dài hơn cả dòng
        const parts = [];
        let chunk = '';
        for (const ch of w) {
          if (chunk && estimateWidth(chunk + ch, fs, weight) > maxWidth) { parts.push(chunk); chunk = ch; }
          else chunk += ch;
        }
        if (chunk) parts.push(chunk);
        lines.push(...parts.slice(0, -1));
        line = parts[parts.length - 1] || '';
      } else line = w;
      continue;
    }
    if (estimateWidth(line + ' ' + w, fs, weight) <= maxWidth) line += ' ' + w;
    else { lines.push(line); line = w; }
  }
  if (line) lines.push(line);
  return lines;
}

export function wrap(text, maxChars) {
  const words = String(text).trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const w of words) {
    const long = w.length > maxChars;
    if (long) {
      // từ quá dài (URL, từ tiếng Anh dài) — cắt cứng để không tràn khung
      if (line) { lines.push(line); line = ''; }
      for (let i = 0; i < w.length; i += maxChars) lines.push(w.slice(i, i + maxChars));
      continue;
    }
    if (!line) { line = w; continue; }
    if ((line + ' ' + w).length <= maxChars) line += ' ' + w;
    else { lines.push(line); line = w; }
  }
  if (line) lines.push(line);
  return lines;
}

export const DEFAULT_REQUEST = {
  title: 'Yêu cầu hình',
  subtitle: '',
  author: '',
  footer: '',
  theme: 'sunset',
  layout: 'left',
  size: '1200x630',
  pattern: 'orb',
  emoji: '',
};

const REQUEST_KEYS = {
  'tiêu đề': 'title', 'tieu de': 'title', 'title': 'title',
  'phụ đề': 'subtitle', 'phu de': 'subtitle', 'subtitle': 'subtitle', 'mô tả': 'subtitle', 'mo ta': 'subtitle',
  'tác giả': 'author', 'tac gia': 'author', 'author': 'author', 'nguồn': 'author', 'nguon': 'author',
  'kích thước': 'size', 'kich thuoc': 'size', 'size': 'size', 'khổ': 'size', 'kho': 'size',
  'theme': 'theme', 'màu': 'theme', 'mau': 'theme', 'style': 'theme', 'bảng màu': 'theme', 'bang mau': 'theme',
  'bố cục': 'layout', 'bo cuc': 'layout', 'layout': 'layout',
  'hoa tiết': 'pattern', 'hoa tiet': 'pattern', 'pattern': 'pattern', 'nền': 'pattern', 'nen': 'pattern',
  'emoji': 'emoji', 'biểu tượng': 'emoji', 'bieu tuong': 'emoji', 'icon': 'emoji',
  'chú thích': 'footer', 'chu thich': 'footer', 'footer': 'footer', 'ghi chú': 'footer', 'ghi chu': 'footer',
};

// Parse body issue / input của workflow_dispatch thành request chuẩn hóa.
export function parseRequest({ title = '', body = '' } = {}) {
  const f = {};
  for (const line of String(body || '').split(/\r?\n/)) {
    const m = line.match(/^\s*([^:]{1,40}):\s*(.+?)\s*$/);
    if (!m) continue;
    const key = REQUEST_KEYS[m[1].trim().toLowerCase()];
    if (key && !f[key]) f[key] = m[2];
  }
  const issueTitle = String(title).replace(/^\s*\[render\]\s*/i, '').trim();
  return normalize({
    ...f,
    title: f.title || issueTitle || DEFAULT_REQUEST.title,
  });
}

// Chuẩn hoá + fallback an toàn: mọi giá trị lạ đều về mặc định, không bao giờ throw.
export function normalize(req = {}) {
  const pick = (map, value, fallback) => (value && map[value] ? value : fallback);
  return {
    // Cắt đúng bằng giới hạn mà UI/docs công bố (agent gửi dài hơn cũng không lỗi).
    title: String(req.title ?? '').trim().slice(0, 120) || DEFAULT_REQUEST.title,
    subtitle: String(req.subtitle ?? '').trim().slice(0, 160),
    author: String(req.author ?? '').trim().slice(0, 40),
    footer: String(req.footer ?? '').trim().slice(0, 80),
    theme: pick(THEMES, req.theme, DEFAULT_REQUEST.theme),
    layout: pick(LAYOUTS, req.layout, DEFAULT_REQUEST.layout),
    size: pick(SIZES, req.size, DEFAULT_REQUEST.size),
    pattern: pick(PATTERNS, req.pattern, DEFAULT_REQUEST.pattern),
    emoji: String(req.emoji ?? '').trim().slice(0, 8),
  };
}

// Kiểm tra trước khi gửi: lỗi chặn gửi, cảnh báo chỉ nhắc người dùng.
export function validateRequest(raw = {}) {
  const errors = [];
  const warnings = [];
  const req = normalize(raw);
  const [W, H] = SIZES[req.size];
  if (!String(raw.title ?? '').trim()) errors.push('Thiếu tiêu đề hình (title).');
  if (raw.theme && !THEMES[raw.theme]) errors.push(`Bảng màu không tồn tại: ${raw.theme}`);
  if (raw.layout && !LAYOUTS[raw.layout]) errors.push(`Bố cục không tồn tại: ${raw.layout}`);
  if (raw.size && !SIZES[raw.size]) errors.push(`Kích thước không tồn tại: ${raw.size}`);
  if (raw.pattern && !PATTERNS[raw.pattern]) errors.push(`Hoa tiết không tồn tại: ${raw.pattern}`);

  const ratio = W / H;
  if (req.title.length > 90) warnings.push('Tiêu đề dài hơn 90 ký tự — chữ sẽ nhỏ lại để vừa khung.');
  if (ratio < 1 && req.title.length > 60) warnings.push('Kích thước dọc mà tiêu đề dài — cân nhắc rút gọn còn ~50 ký tự.');
  if (['list', 'timeline'].includes(req.layout) && !/[;•|\n]/.test(req.subtitle)) {
    warnings.push('Bố cục danh sách/lộ trình tách mục bằng dấu ";" — phụ đề hiện chỉ có 1 mục.');
  }
  if (req.layout === 'story' && !req.author) warnings.push('Bố cục story đẹp nhất khi có "Tác giả" (avatar chữ cái đầu).');
  if (req.layout === 'number' && !/\d/.test(req.title)) warnings.push('Bố cục "Số lớn" cần một con số trong tiêu đề, nếu không sẽ chỉ có thanh nhấn.');
  if (req.title.length > 0 && req.title.length < 8) warnings.push('Tiêu đề rất ngắn — bố cục hero/number sẽ trông trống.');
  return { ok: errors.length === 0, errors, warnings, request: req };
}

// ===== chia sẻ yêu cầu qua URL (?t=...&th=...) =====
const SHARE_KEYS = { title: 't', subtitle: 's', author: 'a', footer: 'f', theme: 'th', layout: 'l', size: 'sz', pattern: 'p', emoji: 'e' };

export function encodeShare(raw = {}) {
  const req = normalize(raw);
  const q = new URLSearchParams();
  for (const [field, key] of Object.entries(SHARE_KEYS)) {
    const def = DEFAULT_REQUEST[field];
    if (req[field] && req[field] !== def) q.set(key, req[field]);
  }
  return q.toString();
}

export function decodeShare(search = '') {
  const q = new URLSearchParams(String(search).replace(/^\?/, '').replace(/^#/, ''));
  const out = {};
  for (const [field, key] of Object.entries(SHARE_KEYS)) {
    const v = q.get(key);
    if (v !== null) out[field] = v;
  }
  return out;
}

// ===== màu & số =====
function luminance(hex) {
  const h = String(hex).replace('#', '');
  const n = (i) => parseInt(h.slice(i, i + 2), 16);
  return 0.2126 * n(0) + 0.7152 * n(2) + 0.0722 * n(4);
}

const R = (v) => Math.round(v);
// PRNG tất định: cùng seed ⇒ cùng hoa tiết ở trình duyệt và trên Actions.
function mulberry32(a) {
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function seedOf(str) {
  let h = 2166136261;
  for (const ch of String(str)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// hướng gradient xoay theo tên theme để 30 bảng màu không cùng một góc
function gradientDir(theme) {
  const dirs = [[0, 0, 1, 1], [0, 0.1, 1, 0.85], [0, 1, 1, 0], [0.1, 0, 0.9, 1], [0, 0.35, 1, 0.65]];
  return dirs[seedOf(theme) % dirs.length];
}

function drawPattern(name, W, H, t) {
  const out = [];
  const rand = mulberry32(seedOf(`${name}-${t.from}-${t.to}`));
  switch (name) {
    case 'dots': {
      const step = Math.max(14, W * 0.032);
      const r = Math.max(1.6, W * 0.0024);
      for (let y = step * 0.8; y < H; y += step)
        for (let x = step * 0.8; x < W; x += step)
          out.push(`<circle cx="${R(x)}" cy="${R(y)}" r="${R(r * 10) / 10}" fill="${t.deco}"/>`);
      break;
    }
    case 'grid': {
      const step = Math.max(28, W * 0.06);
      const w = Math.max(1, W * 0.0012);
      for (let x = step; x < W; x += step) out.push(`<rect x="${R(x)}" y="0" width="${R(w * 100) / 100}" height="${H}" fill="${t.deco}"/>`);
      for (let y = step; y < H; y += step) out.push(`<rect x="0" y="${R(y)}" width="${W}" height="${R(w * 100) / 100}" fill="${t.deco}"/>`);
      break;
    }
    case 'waves': {
      for (let i = 0; i < 4; i++) {
        const y0 = H * (0.2 + i * 0.2);
        const amp = H * (0.05 + i * 0.012);
        const sw = Math.max(1.5, W * 0.0035);
        out.push(`<path d="M ${R(-W * 0.05)} ${R(y0)} C ${R(W * 0.25)} ${R(y0 - amp)} ${R(W * 0.35)} ${R(y0 + amp)} ${R(W * 0.55)} ${R(y0)} S ${R(W * 0.85)} ${R(y0 - amp)} ${R(W * 1.05)} ${R(y0)}"` +
          ` fill="none" stroke="${t.deco}" stroke-width="${R(sw * 100) / 100}" stroke-linecap="round"/>`);
      }
      break;
    }
    case 'beams': {
      for (let i = 0; i < 5; i++) {
        const w = W * (0.05 + rand() * 0.09);
        const x = -W * 0.15 + i * W * 0.24 + rand() * W * 0.05;
        out.push(`<rect x="${R(x)}" y="${R(-H * 0.2)}" width="${R(w)}" height="${R(H * 1.6)}" fill="${t.deco}" opacity="${(0.45 + rand() * 0.5).toFixed(2)}" transform="rotate(18 ${R(x)} ${R(H / 2)})"/>`);
      }
      break;
    }
    case 'rings': {
      for (let i = 0; i < 6; i++) {
        const r = W * (0.18 + i * 0.11);
        out.push(`<circle cx="${R(W * 1.02)}" cy="${R(-H * 0.1)}" r="${R(r)}" fill="none" stroke="${t.deco}" stroke-width="${R(Math.max(1.2, W * 0.0025) * 100) / 100}"/>`);
      }
      out.push(`<circle cx="${R(W * 0.1)}" cy="${R(H * 0.95)}" r="${R(W * 0.22)}" fill="${t.deco}"/>`);
      break;
    }
    case 'blobs': {
      for (let i = 0; i < 4; i++) {
        const cx0 = W * (0.1 + rand() * 0.85);
        const cy0 = H * (0.1 + rand() * 0.85);
        const r = W * (0.12 + rand() * 0.18);
        const k1 = 0.7 + rand() * 0.6, k2 = 0.7 + rand() * 0.6;
        out.push(`<path d="M ${R(cx0 - r)} ${R(cy0)} C ${R(cx0 - r * k1)} ${R(cy0 - r * k1)} ${R(cx0 - r * 0.2)} ${R(cy0 - r * k2)} ${R(cx0 + r * 0.4)} ${R(cy0 - r * 0.8)}` +
          ` C ${R(cx0 + r * 1.2)} ${R(cy0 - r * 0.6)} ${R(cx0 + r * 1.1)} ${R(cy0 + r * 0.7)} ${R(cx0 + r * 0.2)} ${R(cy0 + r * 0.9)}` +
          ` C ${R(cx0 - r * 0.7)} ${R(cy0 + r * 1.1)} ${R(cx0 - r * 1.2)} ${R(cy0 + r * 0.6)} ${R(cx0 - r)} ${R(cy0)} Z" fill="${t.deco}"/>`);
      }
      break;
    }
    case 'confetti': {
      const colors = [t.deco, t.bar];
      const n = Math.min(90, Math.round(W / 16));
      for (let i = 0; i < n; i++) {
        const x = rand() * W, y = rand() * H;
        const s = W * (0.004 + rand() * 0.009);
        const rot = R(rand() * 360);
        const fill = colors[i % colors.length];
        const op = (0.25 + rand() * 0.45).toFixed(2);
        if (i % 3 === 0) out.push(`<circle cx="${R(x)}" cy="${R(y)}" r="${R(s * 60) / 100}" fill="${fill}" opacity="${op}"/>`);
        else out.push(`<rect x="${R(x)}" y="${R(y)}" width="${R(s * 100) / 100}" height="${R(s * 220) / 100}" rx="${R(s * 30) / 100}" fill="${fill}" opacity="${op}" transform="rotate(${rot} ${R(x)} ${R(y)})"/>`);
      }
      break;
    }
    case 'orb':
    default: {
      out.push(`<circle cx="${R(W * 0.88)}" cy="${R(H * 0.18)}" r="${R(W * 0.16)}" fill="${t.deco}"/>`);
      out.push(`<circle cx="${R(W * 0.12)}" cy="${R(H * 0.92)}" r="${R(W * 0.22)}" fill="${t.deco}"/>`);
      out.push(`<circle cx="${R(W * 0.75)}" cy="${R(H * 0.85)}" r="${R(W * 0.07)}" fill="${t.deco}"/>`);
      break;
    }
  }
  return out;
}

// ===== khung hình học =====
function geometry(W, H) {
  const pad = R(W * 0.07);
  const footFs = Math.max(11, R(W * 0.0135));
  const footTop = H - pad - footFs * 1.7;
  const gap = R(pad * 0.35);
  const availTop = pad;
  const availBottom = Math.max(availTop + R(H * 0.1), footTop - gap);
  return { pad, footFs, footTop, availTop, availBottom };
}

const EMOJI_LAYOUTS = new Set(['left', 'center', 'hero', 'card', 'minimal', 'split', 'list', 'timeline', 'number']);
const EYEBROW_LAYOUTS = new Set(['left', 'center', 'hero', 'card', 'minimal', 'split', 'list', 'timeline', 'number']);
const BULLET_LAYOUTS = new Set(['list', 'timeline']);

// Tỉ lệ vùng an toàn mà khối chữ nên chiếm, và trần cỡ chữ theo bề rộng ảnh.
// Khối chữ vừa khít trông "được thiết kế"; chữ tí xíu giữa ảnh lớn thì không.
const FILL = { hero: 0.86, quote: 0.82, number: 0.84, minimal: 0.66, story: 0.72, card: 0.74,
               list: 0.78, timeline: 0.78, split: 0.76, sticker: 0.74, terminal: 0.74, center: 0.74, left: 0.74 };
const CAP  = { hero: 0.115, quote: 0.105, number: 0.072, minimal: 0.085, story: 0.085, card: 0.085,
               list: 0.078, timeline: 0.078, split: 0.078, sticker: 0.082, terminal: 0.075, center: 0.08, left: 0.08 };

// ===== đo khối nội dung: thu nhỏ nếu tràn, phóng to nếu còn trống =====
function measure(req, layout, ctx) {
  const { W, H, textW, regionH, numWide } = ctx;
  const emoji = EMOJI_LAYOUTS.has(layout) ? req.emoji : '';
  const hasEyebrow = EYEBROW_LAYOUTS.has(layout) && !!req.author;
  const useBullets = BULLET_LAYOUTS.has(layout);
  const bullets = useBullets
    ? String(req.subtitle || '').split(/\s*[;•|\n]\s*/).map((s) => s.trim()).filter(Boolean).slice(0, 5)
    : [];

  const numMatch = layout === 'number' ? String(req.title).match(/\d+(?:[.,]\d+)?\s*%?/) : null;
  let numText = numMatch ? numMatch[0].trim() : '';
  let titleText = String(req.title);
  if (numText) {
    const rest = titleText.replace(numMatch[0], ' ').replace(/\s{2,}/g, ' ').trim();
    if (rest) titleText = rest;
    else numText = '';                       // tiêu đề chỉ có số → giữ nguyên chữ
  }

  const startFactor = { hero: 0.088, minimal: 0.062, quote: 0.052, number: 0.058, story: 0.062, center: 0.058 }[layout] || 0.056;
  const start = R(W * startFactor);

  const compute = (fs) => {
    const subFs = Math.max(13, R(fs * 0.4));
    const eyebrowFs = Math.max(11, R(fs * 0.23));
    const lineH = R(fs * 1.13);
    const subLineH = R(subFs * 1.34);
    const numFs = R(fs * (numWide ? 2.15 : 2.05));
    const numW = numWide
      ? (numText ? R(estimateWidth(numText, numFs, 900)) : R(W * 0.13))
      : 0;
    const numGap = numWide ? R(fs * 0.55) : 0;
    const titleW = Math.max(R(W * 0.18), textW - (numWide ? numW + numGap : 0));
    const titleLines = fitLines(titleText, titleW, fs, 800);
    const subLines = (req.subtitle && !useBullets) ? fitLines(req.subtitle, titleW, subFs, 400) : [];
    const rows = bullets.map((b) => fitLines(b, Math.max(fs, textW - R(subFs * 3.2)), subFs, 500));

    const hEmoji = emoji ? R(fs * 1.05) + R(fs * 0.28) : 0;
    const hEyebrow = hasEyebrow ? R(eyebrowFs * 2.2) : 0;
    const hTitle = titleLines.length * lineH;
    const hSub = subLines.length ? R(subFs * 1.25) + subLines.length * subLineH : 0;
    const hGlyph = layout === 'quote' ? R(fs * 1.15) : 0;
    const hRule = layout === 'minimal' ? R(fs * 0.09) + R(fs * 0.6) : 0;
    const hAccent = layout === 'hero' ? R(fs * 0.16) + R(fs * 0.5) : 0;
    const avatarR = R(W * 0.065);
    const hAvatar = layout === 'story' && req.author ? avatarR * 2 + R(subFs * 1.7) + R(fs * 0.4) : 0;
    const hAttrib = layout === 'quote' && req.author ? R(subFs * 2.3) : 0;
    const hNum = layout !== 'number' ? 0
      : numText ? R(numFs * 1.04) + R(fs * 0.2) : R(fs * 0.16) + R(fs * 0.35);
    const rowHeights = rows.map((r) => Math.max(R(subFs * 1.5), r.length * subLineH));
    const itemGap = R(subFs * 0.62);
    const hList = rows.length
      ? R(fs * 0.5) + rowHeights.reduce((a, b) => a + b, 0) + itemGap * (rows.length - 1)
      : 0;

    let blockH;
    switch (layout) {
      case 'quote':    blockH = hGlyph + hTitle + hSub + hAttrib; break;
      case 'number':   blockH = numWide ? hEyebrow + Math.max(hNum, hTitle + hSub) : hEyebrow + hNum + hTitle + hSub; break;
      case 'story':    blockH = hAvatar + hTitle + hSub; break;
      case 'list':
      case 'timeline': blockH = hEyebrow + hTitle + hList; break;
      case 'hero':     blockH = hEmoji + hEyebrow + hTitle + hAccent + hSub; break;
      case 'minimal':  blockH = hRule + hEyebrow + hTitle + hSub; break;
      default:         blockH = hEmoji + hEyebrow + hTitle + hSub;
    }

    return { fs, subFs, eyebrowFs, lineH, subLineH, titleLines, subLines, rows, rowHeights, itemGap,
             hEmoji, hEyebrow, hTitle, hSub, hGlyph, hRule, hAccent, hAvatar, avatarR, hAttrib, numFs, hNum, hList,
             numText, titleText, bullets, hasEyebrow, blockH, numW, numGap };
  };

  let fs = start;
  let M = compute(fs);
  if (M.blockH > regionH) {
    while (M.blockH > regionH && fs > 14) { fs = Math.max(14, R(fs * 0.88)); M = compute(fs); }
    return M;
  }

  // còn chỗ trống → lớn dần theo cấp số nhân, lùi dần cho tới khi vừa
  const fill = FILL[layout] ?? 0.74;
  const cap = R(W * (CAP[layout] ?? 0.08));
  let step = 0.18;
  while (step > 0.015) {
    const next = Math.min(cap, R(fs * (1 + step)));
    if (next <= fs) break;
    const cand = compute(next);
    if (cand.blockH <= regionH * fill) { fs = next; M = cand; }
    else step *= 0.55;
  }
  return M;
}

// ===== vẽ =====
export function buildSVG(raw = {}) {
  const req = normalize(raw);
  const [W, H] = SIZES[req.size];
  const t = THEMES[req.theme];
  const layout = req.layout;
  const gid = `g-${req.theme}-${R(seedOf(req.theme) % 1000)}`;
  const bg = geometry(W, H);
  const { pad, footFs, footTop, availTop, availBottom } = bg;
  const cx = W / 2;
  const onBar = luminance(t.bar) > 155 ? '#14161c' : '#ffffff';

  // ===== khung riêng của từng bố cục → vùng an toàn cho chữ =====
  let insetX = 0, insetTop = 0, insetBottom = 0;
  const tagH = layout === 'sticker' && req.author ? R(pad * 1.15) : 0;
  const termBarH = layout === 'terminal' ? Math.max(24, R(W * 0.045)) : 0;
  if (layout === 'card') { const k = R(pad * 0.9); insetX = k; insetTop = k; insetBottom = k; }
  if (layout === 'sticker') { const k = R(pad * 0.6); insetX = k; insetTop = k + tagH; insetBottom = k; }
  if (layout === 'terminal') { insetX = R(pad * 0.5); insetTop = termBarH + R(pad * 0.35); insetBottom = R(pad * 0.3); }
  if (layout === 'minimal') { const k = R(pad * 0.3); insetX = k; insetTop = k; insetBottom = k; }

  const regionX = pad + insetX;
  const regionTop = availTop + insetTop;
  const regionBottom = availBottom - insetBottom;
  const regionH = Math.max(R(H * 0.08), regionBottom - regionTop);

  // `split` trên ảnh dọc: khối màu nằm ở ĐÁY (chữ có bề ngang đầy đủ, không bị bó
  // vào 60% như bản ngang). `number` trên ảnh rất ngang: số bên trái, chữ bên phải.
  const splitV = layout === 'split' && H > W * 1.05;
  const numWide = layout === 'number' && W / H >= 2;
  const footZone = R((regionBottom - regionTop) * (splitV ? 0.58 : 1));
  const textTop = regionTop;
  const textBottom = splitV ? regionTop + footZone : regionBottom;
  const regionHText = Math.max(R(H * 0.08), textBottom - textTop);

  const panelX = pad + R((W - pad * 2) * 0.6);           // mép trái khối màu của `split`
  const textW = layout === 'split' && !splitV
    ? Math.max(R(W * 0.2), panelX - R(W * 0.035) - regionX)
    : W - 2 * regionX;

  const M = measure(req, layout, { W, H, textW, regionH: regionHText, numWide });
  const { fs, subFs, eyebrowFs, lineH, subLineH, titleLines, subLines, rows, rowHeights, itemGap,
          hEmoji, hEyebrow, hTitle, hSub, hGlyph, hRule, hAccent, hAvatar, avatarR, hAttrib, numFs, hNum, hList,
          numText, titleText, hasEyebrow, numW, numGap } = M;

  const centered = layout === 'center' || layout === 'story' || layout === 'hero';
  const anchor = centered ? 'middle' : 'start';
  const x = centered ? cx : regionX;
  let y = textTop + Math.max(0, (regionHText - M.blockH) / 2);

  const p = [];
  p.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${FONT}" role="img">`);
  p.push(`<title>${esc(req.title)}</title>`);
  const [gx1, gy1, gx2, gy2] = gradientDir(req.theme);
  p.push(`<defs><linearGradient id="${gid}" x1="${gx1}" y1="${gy1}" x2="${gx2}" y2="${gy2}">` +
    `<stop offset="0" stop-color="${t.from}"/><stop offset="1" stop-color="${t.to}"/></linearGradient></defs>`);
  p.push(`<rect width="${W}" height="${H}" fill="url(#${gid})"/>`);
  for (const el of drawPattern(req.pattern, W, H, t)) p.push(el);

  // ===== khung cố định (không phụ thuộc y) =====
  if (layout === 'split' && !splitV) {
    const panelW = (W - pad) - panelX;
    const panelH = availBottom - availTop;
    p.push(`<rect x="${panelX}" y="${availTop}" width="${panelW}" height="${panelH}" rx="${R(W * 0.03)}" fill="${t.bar}" opacity="0.92"/>`);
    p.push(`<circle cx="${R(panelX + panelW * 0.72)}" cy="${R(availTop + panelH * 0.26)} r="${R(panelW * 0.33)}" fill="#ffffff2e"/>`);
    p.push(`<circle cx="${R(panelX + panelW * 0.3)}" cy="${R(availTop + panelH * 0.78)} r="${R(panelW * 0.2)}" fill="#ffffff22"/>`);
    p.push(`<rect x="${R(panelX + panelW * 0.2)}" y="${R(availTop + panelH * 0.47)}" width="${R(panelW * 0.6)}" height="${Math.max(6, R(W * 0.006))}" rx="${R(W * 0.004)}" fill="#ffffff66"/>`);
  }

  if (splitV) {
    // khối màu chiếm dải dưới — chữ ở trên có trọn bề ngang
    const panelY = availTop + R((availBottom - availTop) * 0.64);
    const panelH = availBottom - panelY;
    const panelW = W - pad * 2;
    p.push(`<rect x="${pad}" y="${panelY}" width="${panelW}" height="${panelH}" rx="${R(W * 0.03)}" fill="${t.bar}" opacity="0.92"/>`);
    p.push(`<circle cx="${R(pad + panelW * 0.3)}" cy="${R(panelY + panelH * 0.55)}" r="${R(panelH * 0.55)}" fill="#ffffff26"/>`);
    p.push(`<circle cx="${R(pad + panelW * 0.72)}" cy="${R(panelY + panelH * 0.42)}" r="${R(panelH * 0.34)}" fill="#ffffff1f"/>`);
    p.push(`<rect x="${R(pad + panelW * 0.12)}" y="${R(panelY + panelH * 0.5)}" width="${R(panelW * 0.5)}" height="${Math.max(6, R(W * 0.006))}" rx="${R(W * 0.004)}" fill="#ffffff5c"/>`);
  }

  if (layout === 'sticker') {
    const cw = W - pad * 2;
    const ch = availBottom - availTop;
    const off = R(W * 0.012);
    p.push(`<rect x="${pad + off}" y="${availTop + off}" width="${cw}" height="${ch}" rx="${R(W * 0.045)}" fill="${t.bar}"/>`);
    p.push(`<rect x="${pad}" y="${availTop}" width="${cw}" height="${ch}" rx="${R(W * 0.045)}" fill="url(#${gid})" stroke="${t.ink}" stroke-opacity="0.55" stroke-width="${Math.max(3, R(W * 0.005))}"/>`);
    if (req.author) {
      const tagFs = Math.max(13, R(fs * 0.3));
      const tagText = String(req.author).toUpperCase();
      const tw = R(tagText.length * tagFs * 0.62 + tagFs * 1.6);
      const th = R(tagFs * 2);
      const tx = (W - pad) - R(pad * 0.55) - tw;
      const ty = availTop + R(pad * 0.5);
      p.push(`<g transform="rotate(7 ${R(tx + tw / 2)} ${R(ty + th / 2)})">` +
        `<rect x="${tx}" y="${ty}" width="${tw}" height="${th}" rx="${R(th / 2)}" fill="${t.bar}"/>` +
        `<text x="${R(tx + tw / 2)}" y="${R(ty + th * 0.69)}" font-size="${tagFs}" font-weight="800" ` +
        `text-anchor="middle" letter-spacing="${R(tagFs * 0.1)}" fill="${onBar}">${esc(tagText)}</text></g>`);
    }
  }

  if (layout === 'card') {
    const cw = W - pad * 2;
    const ch = availBottom - availTop;
    const off = R(W * 0.008);
    p.push(`<rect x="${pad + off}" y="${availTop + off}" width="${cw}" height="${ch}" rx="${R(W * 0.04)}" fill="#00000038"/>`);
    p.push(`<rect x="${pad}" y="${availTop}" width="${cw}" height="${ch}" rx="${R(W * 0.04)}" fill="url(#${gid})" stroke="${t.ink}" stroke-opacity="0.22" stroke-width="${Math.max(1, R(W * 0.0016))}"/>`);
  }

  if (layout === 'terminal') {
    const wx = pad, wy = availTop, ww = W - pad * 2, wh = availBottom - availTop;
    const rx = R(W * 0.022);
    p.push(`<rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" rx="${rx}" fill="#0d1117" opacity="0.96"/>`);
    p.push(`<rect x="${wx}" y="${wy}" width="${ww}" height="${termBarH}" rx="${rx}" fill="#1c2431"/>`);
    p.push(`<rect x="${wx}" y="${wy + termBarH - rx}" width="${ww}" height="${rx}" fill="#1c2431"/>`);
    const dr = Math.max(3, R(termBarH * 0.16));
    ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => {
      p.push(`<circle cx="${R(wx + termBarH * 0.6 + i * termBarH * 0.5)}" cy="${R(wy + termBarH / 2)}" r="${dr}" fill="${c}"/>`);
    });
    const titleFs = Math.max(12, R(termBarH * 0.4));
    p.push(`<text x="${R(wx + ww / 2)}" y="${R(wy + termBarH * 0.68)}" font-size="${titleFs}" ` +
      `font-weight="600" text-anchor="middle" fill="#9aa3b5" font-family="${MONO}">${esc(req.author || 'hinh — render')}</text>`);
  }

  if (layout === 'story') {
    const segY = R(H * 0.035);
    const segH = Math.max(6, R(H * 0.006));
    const segGap = R(W * 0.018);
    const segW = (W - pad * 2 - segGap * 2) / 3;
    for (let i = 0; i < 3; i++) {
      p.push(`<rect x="${R(pad + i * (segW + segGap))}" y="${segY}" width="${R(segW)}" height="${segH}" ` +
        `rx="${R(segH / 2)}" fill="${i === 0 ? t.bar : '#ffffff55'}"/>`);
    }
  }

  if (layout === 'minimal') {
    // viền mảnh bao quanh, tạo cảm giác "poster" sang trọng
    const k = R(pad * 0.45);
    p.push(`<rect x="${k}" y="${k}" width="${W - k * 2}" height="${H - k * 2}" rx="${R(W * 0.01)}" ` +
      `fill="none" stroke="${t.ink}" stroke-opacity="0.18" stroke-width="${Math.max(1, R(W * 0.0015))}"/>`);
  }

  // ===== khối nội dung =====
  if (layout === 'story' && req.author) {
    const cy0 = y + avatarR;
    const initial = esc(String(req.author).trim().charAt(0).toUpperCase() || '?');
    p.push(`<circle cx="${cx}" cy="${cy0}" r="${avatarR}" fill="${t.bar}"/>`);
    p.push(`<text x="${cx}" y="${R(cy0 + avatarR * 0.36)}" font-size="${R(avatarR * 0.95)}" ` +
      `font-weight="800" text-anchor="middle" fill="${onBar}">${initial}</text>`);
    p.push(`<text x="${cx}" y="${R(y + avatarR * 2 + subFs * 1.15)}" font-size="${subFs}" font-weight="700" ` +
      `letter-spacing="${R(subFs * 0.12)}" text-anchor="middle" fill="${t.sub}">${esc(String(req.author).toUpperCase())}</text>`);
    y += hAvatar;
  }

  if (layout === 'minimal') {
    const barW = Math.round(W * 0.1);
    const barH = Math.max(3, R(fs * 0.09));
    p.push(`<rect x="${regionX}" y="${R(y)}" width="${barW}" height="${barH}" rx="${R(barH / 2)}" fill="${t.bar}"/>`);
    y += hRule;
  }

  if (hEmoji && req.emoji) {
    p.push(`<text x="${x}" y="${R(y + fs * 0.92)}" font-size="${R(fs * 0.95)}" text-anchor="${anchor}" ` +
      `font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif">${esc(req.emoji)}</text>`);
    y += hEmoji;
  }

  if (hasEyebrow) {
    p.push(`<text x="${x}" y="${R(y + eyebrowFs)}" font-size="${eyebrowFs}" font-weight="700" ` +
      `letter-spacing="${R(eyebrowFs * 0.2)}" text-anchor="${anchor}" fill="${t.sub}" opacity="0.92">` +
      `${esc(String(req.author).toUpperCase())}</text>`);
    y += hEyebrow;
  }

  if (layout === 'quote') {
    // &ldquo; là entity HTML — XML (librsvg) không định nghĩa nên phải dùng entity số
    const glyphFs = R(fs * 1.55);
    p.push(`<text x="${x}" y="${R(y + glyphFs * 0.8)}" font-size="${glyphFs}" font-weight="800" ` +
      `text-anchor="${anchor}" fill="${t.bar}" opacity="0.85">&#8220;</text>`);
    y += hGlyph;
  }

  if (layout === 'number' && numWide) {
    // số lớn bên trái, tiêu đề bên phải — dùng hết bề ngang ảnh cover/landscape
    const numTop = y + Math.max(0, (M.blockH - hNum) / 2);
    if (numText) {
      p.push(`<text x="${regionX}" y="${R(numTop + numFs * 0.84)}" font-size="${numFs}" font-weight="900" ` +
        `letter-spacing="${R(numFs * -0.02)}" fill="${t.bar}">${esc(numText)}</text>`);
    } else {
      const bw = R(W * 0.1), bh = Math.max(5, R(fs * 0.12));
      p.push(`<rect x="${regionX}" y="${R(numTop + fs * 0.12)}" width="${bw}" height="${bh}" rx="${R(bh / 2)}" fill="${t.bar}"/>`);
    }
    y += Math.max(0, (M.blockH - (hTitle + hSub)) / 2);
  } else if (layout === 'number') {
    if (numText) {
      p.push(`<text x="${x}" y="${R(y + numFs * 0.84)}" font-size="${numFs}" font-weight="900" ` +
        `letter-spacing="${R(numFs * -0.01)}" text-anchor="${anchor}" fill="${t.bar}">${esc(numText)}</text>`);
    } else {
      const bw = R(W * 0.13), bh = Math.max(5, R(fs * 0.12));
      p.push(`<rect x="${x}" y="${R(y + fs * 0.12)}" width="${bw}" height="${bh}" rx="${R(bh / 2)}" fill="${t.bar}"/>`);
    }
    y += hNum;
  }

  const titleFont = layout === 'terminal' ? MONO : FONT;
  const titleX = numWide ? regionX + numW + numGap : x;
  for (const ln of titleLines) {
    p.push(`<text x="${titleX}" y="${R(y + fs * 0.85)}" font-size="${fs}" font-weight="800" ` +
      `letter-spacing="${R(fs * (layout === 'hero' ? -0.02 : -0.012))}" text-anchor="${anchor}" ` +
      `fill="${layout === 'terminal' ? '#e6edf3' : t.ink}" font-family="${titleFont}">${esc(ln)}</text>`);
    y += lineH;
  }

  if (layout === 'hero') {
    // gạch nhấn đặt NGAY DƯỚI tiêu đề, giữa ảnh
    const barW = Math.round(W * 0.14);
    const barH = Math.max(4, R(fs * 0.1));
    p.push(`<rect x="${R(cx - barW / 2)}" y="${R(y + fs * 0.28)}" width="${barW}" height="${barH}" rx="${R(barH / 2)}" fill="${t.bar}"/>`);
    y += hAccent;
  }

  if (layout === 'list' && rows.length) {
    y += R(fs * 0.5);
    const badgeR = R(subFs * 0.66);
    const badgeCx = regionX + badgeR;
    const textX = regionX + badgeR * 2 + R(subFs * 0.8);
    rows.forEach((r, i) => {
      const rowH = rowHeights[i];
      const bcy = y + R(rowH / 2);
      p.push(`<circle cx="${badgeCx}" cy="${bcy}" r="${badgeR}" fill="${t.bar}"/>`);
      p.push(`<text x="${badgeCx}" y="${R(bcy + badgeR * 0.36)}" font-size="${R(badgeR * 1.05)}" ` +
        `font-weight="800" text-anchor="middle" fill="${onBar}">${i + 1}</text>`);
      let ty = y + subFs * 0.9;
      for (const ln of r) {
        p.push(`<text x="${textX}" y="${R(ty)}" font-size="${subFs}" font-weight="500" fill="${t.sub}">${esc(ln)}</text>`);
        ty += subLineH;
      }
      y += rowH + itemGap;
    });
  } else if (layout === 'timeline' && rows.length) {
    y += R(fs * 0.5);
    const dotR = Math.max(4, R(subFs * 0.3));
    const dotCx = regionX + R(subFs * 0.6);
    const textX = dotCx + R(subFs * 1.2);
    const totalH = rowHeights.reduce((a, b) => a + b, 0) + itemGap * (rows.length - 1);
    p.push(`<rect x="${dotCx - 1}" y="${y + R(subFs * 0.7)}" width="2" height="${Math.max(0, totalH - R(subFs * 1.4))}" fill="${t.sub}" opacity="0.35"/>`);
    rows.forEach((r, i) => {
      const rowH = rowHeights[i];
      const dy = y + R(subFs * 0.75);
      p.push(`<circle cx="${dotCx}" cy="${dy}" r="${i === 0 ? dotR + 2 : dotR}" fill="${i === 0 ? t.bar : t.sub}"/>`);
      if (i === 0) p.push(`<circle cx="${dotCx}" cy="${dy}" r="${dotR + 6}" fill="none" stroke="${t.bar}" stroke-width="2" opacity="0.55"/>`);
      let ty = y + subFs * 0.9;
      for (const ln of r) {
        p.push(`<text x="${textX}" y="${R(ty)}" font-size="${subFs}" font-weight="${i === 0 ? 700 : 500}" fill="${t.sub}">${esc(ln)}</text>`);
        ty += subLineH;
      }
      y += rowH + itemGap;
    });
  } else if (subLines.length) {
    y += R(subFs * 1.25);
    for (const ln of subLines) {
      p.push(`<text x="${titleX}" y="${R(y + subFs * 0.9)}" font-size="${subFs}" font-weight="400" ` +
        `text-anchor="${anchor}" fill="${layout === 'terminal' ? '#9aa3b5' : t.sub}" font-family="${titleFont}">${esc(ln)}</text>`);
      y += subLineH;
    }
  }

  if (layout === 'quote' && req.author) {
    y += R(subFs * 1.1);
    p.push(`<text x="${x}" y="${R(y + subFs)}" font-size="${subFs}" font-weight="700" ` +
      `letter-spacing="${R(subFs * 0.1)}" text-anchor="${anchor}" fill="${t.bar}">— ${esc(String(req.author).toUpperCase())}</text>`);
  }

  // ===== footer (nằm ngoài vùng nội dung) =====
  // Chỉ vẽ khi người dùng thật sự nhập "Chú thích": ảnh cuối không được có
  // chữ rác kiểu "sinh bằng code · ngày" hay "theme · layout · size".
  const footText = String(req.footer || '').trim();
  if (footText) {
    p.push(`<rect x="${pad}" y="${R(footTop)}" width="${R(W * 0.055)}" height="${Math.max(4, R(footFs * 0.4))}" rx="${R(footFs * 0.2)}" fill="${t.bar}"/>`);
    p.push(`<text x="${pad}" y="${H - pad}" font-size="${footFs}" font-weight="600" fill="${t.sub}">${esc(footText)}</text>`);
  }
  p.push(`</svg>`);
  return p.join('\n');
}
