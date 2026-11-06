# 🎨 Sinh hình bằng code

Trang tĩnh nhập yêu cầu hình — **tải PNG/SVG ngay trong trình duyệt: miễn phí, không cần đăng nhập, không token, không chờ**. Muốn lưu ảnh vào gallery công khai thì để **GitHub Actions tự render** và trả kết quả trong issue. **30 bảng màu · 13 bố cục · 9 hoa tiết nền · 15 kích thước · 12 mẫu có sẵn**, cùng **API + CLI + `agent.json`/`llms.txt` cho AI agent (Hermes)**. PAT đăng nhập hoàn toàn tuỳ chọn.

> Dành cho agent: mở thẳng <https://vanthuonghi.github.io/hinh-bang-code/agent.html> (bản người đọc)
> hoặc <https://vanthuonghi.github.io/hinh-bang-code/llms.txt> / `agent.json` (bản máy đọc).

## Cách hoạt động

```
index.html (nhập yêu cầu — ai cũng dùng được, không cần đăng nhập)
    │
    │  ⬇ Tải PNG / Tải SVG  →  raster NGAY TRONG TRÌNH DUYỆT  ← không cần gì cả
    │
    │  (tuỳ chọn) Lưu lên gallery GitHub:
    │   đã dán PAT  → POST /repos/.../issues        (tạo ngay tại trang)
    │   chưa đăng nhập → mở trang tạo issue của GitHub
    │   máy/agent  → POST /actions/workflows/render.yml/dispatches
    ▼
GitHub Issue [render]  hoặc  workflow_dispatch
    │  .github/workflows/render.yml  (chạy npm test trước khi render)
    ▼
node render.mjs  (lib/svg.js → SVG → sharp → PNG)
    │
    ▼
commit vào gallery/ + manifest.json  +  comment ảnh vào issue (nếu là issue)
```

Nhánh raster trong trình duyệt **không đụng GitHub Actions**: miễn phí, không giới hạn số lượng, có ngay lập tức. Nhánh Actions (repo public) cũng miễn phí không giới hạn Actions minutes, chỉ mất ~30s và cần tài khoản GitHub để mở issue.

## Dùng trên trang

1. Mở <https://vanthuonghi.github.io/hinh-bang-code/>. Chạy local thì serve thư mục repo (`npx serve` hoặc `python3 -m http.server 8000`) rồi mở `http://localhost:8000` — **bấm đúp `index.html` không được**, trình duyệt chặn `<script type="module">` và `fetch` trên `file://`.
2. Tab **Tạo hình**: nhập tiêu đề (bắt buộc) rồi tuỳ chọn phụ đề, tác giả, chú thích, emoji. Mỗi trường có **hướng dẫn ngay dưới ô** và bảng “Hướng dẫn điền nhanh” ở cuối cột.
3. Chọn **mẫu có sẵn** (12 thumbnail thật, bấm là áp cả bộ) hoặc tự chọn **bảng màu / hoa tiết / bố cục / kích thước**. Nút **🎲 Ngẫu nhiên** để phá bí.
4. **⬇ Tải PNG** render ngay trên máy (không token, không giới hạn). **Tải SVG** nếu muốn mở trong Figma/Illustrator. **🔗 Copy link chia sẻ**: toàn bộ yêu cầu nằm trong URL `?t=…&th=…&l=…&sz=…` nên gửi link là người khác mở ra thấy đúng ảnh đó.
5. *Tuỳ chọn — lưu lên gallery*: **Lưu vào thư viện GitHub** → Actions render ~30s → ảnh nằm trong [`gallery/`](gallery/).

> **Lưu ý font**: PNG tải từ trình duyệt dùng font hệ thống (Helvetica/Arial), bản Actions dùng Noto Sans — bố cục, cỡ chữ, điểm xuống dòng giống nhau, chỉ khác hình dáng chữ.

## Tham số (dùng chung cho web, CLI, API, issue)

| Khoá | Bắt buộc | Ghi chú |
|---|---|---|
| `title` | ✅ | ≤120 ký tự khi lên ảnh; tự xuống dòng + thu nhỏ để không tràn |
| `subtitle` | | Với `list`/`timeline`: tách mục bằng `;` hoặc `\|` |
| `author` | | Nhãn nhỏ trên cùng; thành avatar/nhãn xoay với `story`, `sticker`, `quote` |
| `theme` | | `sunset` (mặc định) · 30 giá trị trong bảng dưới |
| `layout` | | `left` (mặc định) · 13 giá trị |
| `size` | | `1200x630` (mặc định) · 15 giá trị |
| `pattern` | | `orb` (mặc định) · 9 giá trị |
| `emoji` | | Một emoji, hiện lớn trên tiêu đề (trừ quote/sticker/terminal/story) |
| `footer` | | Chú thích góc dưới trái; **để trống thì ảnh không có dòng nào ở đáy** |

**Không bao giờ lỗi vì tham số**: giá trị lạ/thiếu tự về mặc định. Muốn kiểm tra trước khi gửi thì dùng `validateRequest()` (JS) hoặc `node bin/hinh.mjs check …`.

### Kích thước (15)

| Nhóm | Khoá |
|---|---|
| Facebook | `1200x630` (link/OG) · `1200x1200` (feed vuông) · `1080x1350` (feed dọc 4:5) · `1080x1920` (story/reel) · `1640x624` (bìa trang) |
| LinkedIn / X | `1200x628` · `1200x1500` (dọc 4:5) |
| YouTube / slide | `1280x720` · `1920x1080` · `1600x900` |
| Pinterest / Zalo | `1000x1500` (2:3) · `800x1000` (share dọc) |
| Khác | `1080x1080` · `800x800` · `1080x608` |

### Bảng màu (30)

`sunset` `ocean` `forest` `midnight` `violet` `paper` `coral` `mint` `sand` `ink`
`aurora` `rose` `citrus` `steel` `grape` `blush` `blueprint` `clay`
`galaxy` `eclipse` `lagoon` `ember` `cocoa` `sakura` `peach` `ice` `lemon` `moss` `noir` `mono`

### Bố cục (13)

`left` mặc định · `center` căn giữa · `hero` tiêu đề rất lớn · `minimal` nhiều khoảng trắng · `card` thẻ nổi · `list` danh sách đánh số · `timeline` lộ trình dọc · `number` số lớn · `split` chữ trái + khối màu phải · `quote` thẻ trích dẫn · `sticker` viền đậm + nhãn xoay · `terminal` cửa sổ terminal · `story` progress bar + avatar

### Hoa tiết nền (9)

`orb` quầng sáng · `dots` chấm lưới · `grid` kẻ ô · `waves` sóng · `beams` vệt sáng · `rings` vòng đồng tâm · `blobs` mảng mềm · `confetti` · `none` trơn

### Mẫu có sẵn (12)

`bai-viet` · `bia-fb` · `story` · `trich-dan` · `linkedin` · `youtube` · `hero` · `toi-gian` · `the-noi` · `lo-trinh` · `terminal` · `pinterest` — mỗi mẫu là một combo màu × hoa tiết × bố cục × kích thước trong `PRESETS`.

## Cho AI agent (Hermes) / CLI

Ba tài liệu máy đọc, **sinh tự động từ `lib/svg.js`** nên không bao giờ lệch với khả năng thật:

| Tệp | Nội dung |
|---|---|
| [`agent.html`](agent.html) | Trang hướng dẫn tĩnh, đọc bằng mắt hoặc bằng agent: API, polling, CLI, thư viện, bảng giá trị hợp lệ, lỗi thường gặp |
| [`agent.json`](agent.json) | Cùng nội dung ở dạng JSON: endpoint, schema input, toàn bộ catalog, fallback, lỗi |
| [`llms.txt`](llms.txt) | Bản chữ ngắn theo chuẩn llms.txt để agent nạp vào context |

`npm run catalog` ghi lại cả ba + khối bảng trong `index.html`; `npm run catalog:check` (và `npm test`) fail nếu ai đó sửa `lib/svg.js` mà quên sinh lại.

### 1. Gọi REST dispatch (có token `repo` + `workflow`)

```bash
curl -X POST -H "Authorization: Bearer $GITHUB_TOKEN" -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/vanthuonghi/hinh-bang-code/actions/workflows/render.yml/dispatches \
  -d '{"ref":"refs/heads/main","inputs":{
        "title":"3 việc nên tự động hoá ngay",
        "subtitle":"Việc lặp lại;Việc dễ sai;Báo cáo định kỳ",
        "author":"VANHI",
        "theme":"steel","layout":"list","size":"1200x628","pattern":"grid","emoji":"⚡"
      }}'
# thiếu "ref" → 422; input lạ → 422 (workflow chỉ nhận đúng 9 khoá ở bảng trên)
```

### 2. Đọc kết quả

```bash
# manifest mới nhất (Contents API — raw.githubusercontent bị CDN cache tới 5 phút)
curl -s -H "Authorization: Bearer $GITHUB_TOKEN" \
  "https://api.github.com/repos/vanthuonghi/hinh-bang-code/contents/gallery/manifest.json?ref=main"
curl -LO https://github.com/vanthuonghi/hinh-bang-code/raw/main/gallery/<ten-file>.png
```

Manifest: `{ generated, images: [{ file, svg, title, theme, layout, size, pattern, emoji, issue, user, date }] }`, mới nhất trước, giữ 96 mục. **Cách chắc chắn biết ảnh nào của mình**: ghi lại thời điểm dispatch → lọc `date >= START` → khớp `title`.

### 3. CLI trong repo (Node ≥ 20, không cần cài gì)

```bash
export GITHUB_TOKEN=ghp_...          # hoặc: gh auth login

node bin/hinh.mjs new --title "Tiêu đề" --subtitle "Phụ đề" \
  --theme aurora --layout quote --size 1080x1350 --pattern orb --emoji ✨ \
  --wait --out ./anh                  # --wait: chờ run xong; --out: tải PNG về
node bin/hinh.mjs new --preset lo-trinh --title "Lộ trình 3 bước" --wait
node bin/hinh.mjs check --title "X" --theme khong-co   # kiểm tra, exit 1 nếu sai
node bin/hinh.mjs share --title "X" --theme aurora     # in link mở trang web
node bin/hinh.mjs catalog --json     # theme/layout/size/pattern/preset + nhãn
node bin/hinh.mjs list --n 10 --json
node bin/hinh.mjs get <ten-file.png> --out ./anh
node bin/hinh.mjs status --json
```

`--json` in JSON cho agent đọc, lỗi exit 1 kèm `{"error": ...}`. Đổi repo bằng `--repo owner/name` hoặc `HINH_REPO`.

### 4. Sinh ảnh cục bộ, không cần clone repo, không cần token

`lib/svg.js` là ESM thuần, không import gì — nạp thẳng từ URL cũng chạy:

```js
const src = await (await fetch(
  'https://raw.githubusercontent.com/vanthuonghi/hinh-bang-code/main/lib/svg.js')).text();
const { buildSVG, normalize, validateRequest } =
  await import(`data:text/javascript;charset=utf-8,${encodeURIComponent(src)}`);

const req = normalize({ title: 'Xin chào', theme: 'aurora', layout: 'hero' });
if (!validateRequest(req).ok) throw new Error('yêu cầu sai');
const svg = buildSVG(req);            // chuỗi SVG, không side-effect
```

## Chạy local

```bash
npm install
node render.mjs --title "[render] Bài test" --body $'Tiêu đề: Bài test\nTheme: ocean\nBố cục: center'
node bin/contact-sheet.mjs          # xuất ảnh kiểm tra trực quan ra out/
```

## Files

| File | Vai trò |
|---|---|
| [index.html](index.html) | Trang tĩnh: form + preview realtime, 3 tab (Tạo hình / Thư viện / Hướng dẫn Agent), PAT tuỳ chọn |
| [lib/svg.js](lib/svg.js) | **Nguồn sự thật**: theme, size, layout, pattern, preset, `buildSVG`, `parseRequest`, `normalize`, `validateRequest` |
| [lib/catalog.js](lib/catalog.js) | Sinh `agent.json`, `llms.txt`, `agent.html`, bảng trong `index.html` từ `lib/svg.js` |
| [bin/catalog.mjs](bin/catalog.mjs) | `npm run catalog` / `--check` (chặn lệch tài liệu) |
| [render.mjs](render.mjs) | Yêu cầu (issue/dispatch) → PNG bằng `sharp`, cập nhật `gallery/manifest.json` |
| [bin/hinh.mjs](bin/hinh.mjs) | CLI cho agent: `new` `check` `share` `catalog` `list` `get` `status` |
| [bin/contact-sheet.mjs](bin/contact-sheet.mjs) | Xuất bảng so sánh mọi preset/bố cục/hoa tiết/theme ra `out/` |
| [test/svg.test.js](test/svg.test.js) | Ma trận $theme × size × layout không đè footer, không tràn ngang, escape XML, parse, validate |
| [test/catalog.test.js](test/catalog.test.js) | `agent.json`/`llms.txt`/`agent.html`/`index.html` khớp `lib/svg.js` |
| [.github/workflows/render.yml](.github/workflows/render.yml) | 2 cổng: `issues` (`[render]`) và `workflow_dispatch` (9 input, có `pattern` + `emoji`) |
| `gallery/` | Kho ảnh + `manifest.json` (Actions commit) |

## Test

```bash
npm test              # 18 test: ma trận bố cục + chống lệch tài liệu agent + workflow input
npm run catalog:check # chỉ kiểm tra tài liệu máy đọc
```

Test là **tấm đai chống tràn**: mọi tổ hợp màu × kích thước × bố cục phải nằm trong vùng an toàn, không đè dải footer, không tràn mép ngang kể cả với từ dài. Workflow render chạy `npm test` trước khi render — layout hỏng không tới lượt commit.

## Cấu hình

- **Tên repo**: sửa `data-repo="OWNER/TEN-REPO"` ở thẻ `<body>` trong `index.html` và các hằng trong `lib/catalog.js`.
- **Thêm màu / size / bố cục / hoa tiết / preset**: chỉ sửa map tương ứng trong `lib/svg.js` (kèm nhãn `*_LABELS`, `SIZE_USE`, `LAYOUT_INFO` nếu muốn có chữ hướng dẫn) rồi chạy `npm run catalog && npm test` — UI, thumbnail, tài liệu agent và test ma trận tự cập nhật.
- **Chặn người lạ dùng Actions**: thêm điều kiện user vào `if:` của job.
- **Font**: workflow cài `fonts-noto-core` để dấu tiếng Việt hiển thị đủ khi render trên Actions.
