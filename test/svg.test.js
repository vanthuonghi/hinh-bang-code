// Test hồi quy cho lib/svg.js — chạy bằng `npm test` (node --test, không cần cài gì).
// Mục đích chính: không bao giờ tái phát lỗi chữ đè footer (1640x624) và
// mọi mẫu mới thêm vào THEMES / SIZES / LAYOUTS / PRESETS đều render được.

import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSVG, parseRequest, slugify, wrap,
         THEMES, SIZES, SIZE_LABELS, LAYOUTS, PRESETS } from '../lib/svg.js';

const LONG_TITLE = 'Đây là tiêu đề cực dài dùng để kiểm tra tràn khung khi kích thước hình nhỏ và nội dung nhiều dòng';
const LONG_SUB = 'Phụ đề cũng khá dài để xem khối nội dung có vượt quá chiều cao của ảnh hay không nhé bạn ơi';
const BULLET_SUB = 'Một;Hai;Ba;Bốn';

// ölçü helper: toạ độ <text> thật trong SVG (loại 2 dòng footer, luôn nằm ở y = H - pad)
function measure(svg, sizeKey) {
  const [W, H] = SIZES[sizeKey];
  const pad = Math.round(W * 0.07);
  const footFs = Math.max(12, Math.round(W * 0.014));
  const footTop = H - pad - footFs * 1.6;
  const texts = [...svg.matchAll(/<text [^>]*y="([\d.]+)"[^>]*font-size="([\d.]+)"/g)]
    .map((m) => ({ y: +m[1], fs: +m[2] }))
    .filter((t) => Math.abs(t.y - (H - pad)) > 0.5);
  assert.ok(texts.length > 0, 'phải có ít nhất 1 dòng chữ ngoài footer');
  return {
    top: Math.min(...texts.map((t) => t.y - t.fs * 0.75)),
    bottom: Math.max(...texts.map((t) => t.y + t.fs * 0.25)),
    footTop, pad,
  };
}

test('mẫu có sẵn (PRESETS) trỏ đúng theme/layout/size và có nhãn', () => {
  assert.ok(PRESETS.length >= 6, 'ít nhất 6 preset');
  for (const p of PRESETS) {
    assert.ok(THEMES[p.theme], `preset ${p.key}: theme "${p.theme}" không tồn tại`);
    assert.ok(LAYOUTS[p.layout], `preset ${p.key}: layout "${p.layout}" không tồn tại`);
    assert.ok(SIZES[p.size], `preset ${p.key}: size "${p.size}" không tồn tại`);
    assert.ok(p.label && p.key, 'preset phải có key + label');
  }
});

test('SIZE_LABELS phủ đủ mọi kích thước', () => {
  for (const k of Object.keys(SIZES)) assert.ok(SIZE_LABELS[k], `thiếu nhãn cho ${k}`);
  for (const k of Object.keys(SIZE_LABELS)) assert.ok(SIZES[k], `nhãn thừa cho ${k}`);
});

test('parseRequest chuẩn hóa và fallback an toàn', () => {
  const r = parseRequest({
    title: '[render] Bài test',
    body: ['Tiêu đề: Từ body', 'Phụ đề: Sub', 'Theme: aurora', 'Bố cục: quote',
           'Kích thước: 1080x1350', 'Tác giả: VANHI', 'Chú thích: ghi chú'].join('\n'),
  });
  assert.equal(r.title, 'Từ body');          // body thắng title của issue
  assert.equal(r.theme, 'aurora');
  assert.equal(r.layout, 'quote');
  assert.equal(r.size, '1080x1350');
  assert.equal(r.author, 'VANHI');

  const bad = parseRequest({ title: '[render] Chỉ title', body: 'Theme: khong-ton-tai\nBố cục: xxx\nKích thước: 1x1' });
  assert.equal(bad.title, 'Chỉ title');
  assert.equal(bad.theme, 'sunset');   // fallback
  assert.equal(bad.layout, 'left');
  assert.equal(bad.size, '1200x630');

  const empty = parseRequest({});
  assert.ok(empty.title.length > 0, 'không bao giờ rỗng');
});

test('escape HTML/XML trong chữ người dùng', () => {
  const svg = buildSVG({ title: 'A <b> & "x" \'y\'', subtitle: '', author: '', footer: '',
                         theme: 'sunset', size: '1200x630', layout: 'left' });
  assert.ok(!/<b>/.test(svg), 'không được thô <b> vào SVG');
  assert.ok(svg.includes('&lt;b&gt;'));
  assert.ok(svg.includes('&amp;'));
});

test('chỉ dùng entity số — librsvg không định nghĩa entity HTML (lỗi &ldquo; cũ)', () => {
  for (const layout of Object.keys(LAYOUTS)) {
    const svg = buildSVG({ title: 'Tiêu đề có “ngoặc kép”', subtitle: '', author: 'TÁC GIẢ', footer: '',
                           theme: 'paper', size: '1200x630', layout });
    const named = svg.match(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;)[a-zA-Z]+;/g);
    assert.equal(named, null, `layout ${layout} chứa entity không hợp lệ với XML: ${named}`);
  }
});

test('toàn bộ ma trận 18 màu × 12 size × 9 bố cục: không đè footer, không tràn mép trên', () => {
  const cases = [
    { title: LONG_TITLE, subtitle: LONG_SUB },
    { title: LONG_TITLE, subtitle: BULLET_SUB },
    { title: 'Ngắn gọn', subtitle: '' },
  ];
  let checked = 0;
  for (const theme of Object.keys(THEMES))
    for (const size of Object.keys(SIZES))
      for (const layout of Object.keys(LAYOUTS))
        for (const c of cases) {
          const req = { ...c, author: 'VANHI', footer: 'x', theme, size, layout };
          const svg = buildSVG(req);
          assert.ok(svg.startsWith('<svg') && svg.endsWith('</svg>'), `SVG hỏng: ${theme}/${size}/${layout}`);
          const m = measure(svg, size);
          assert.ok(m.bottom <= m.footTop,
            `đè footer: ${theme}/${size}/${layout} → đáy ${m.bottom.toFixed(0)} > ${m.footTop.toFixed(0)}`);
          assert.ok(m.top >= m.pad,
            `tràn mép trên: ${theme}/${size}/${layout} → ${m.top.toFixed(0)} < ${m.pad}`);
          checked++;
        }
  assert.equal(checked, Object.keys(THEMES).length * Object.keys(SIZES).length * Object.keys(LAYOUTS).length * cases.length);
});

test('bố cục không có tiêu đề/trắng vẫn render được', () => {
  for (const layout of Object.keys(LAYOUTS)) {
    const svg = buildSVG({ title: '', subtitle: '', author: '', footer: '', theme: 'sunset', size: '1200x630', layout });
    assert.ok(svg.endsWith('</svg>'));
  }
});

test('wrap / slugify cơ bản', () => {
  assert.deepEqual(wrap('một hai ba', 7), ['một hai', 'ba']);
  assert.equal(slugify('Hành trình Tự động hoá!'), 'hanh-trinh-tu-dong-hoa');
});
