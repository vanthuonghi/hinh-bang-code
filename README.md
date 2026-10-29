# 🎨 Sinh hình bằng code

Trang tĩnh nhập yêu cầu hình — **tải PNG/SVG ngay trong trình duyệt: miễn phí, không cần đăng nhập, không token, không chờ**. Muốn lưu ảnh vào gallery công khai thì để **GitHub Actions tự render** và trả kết quả trong issue. Có **API + CLI cho agent (Hermes)**, 18 bảng màu, 12 kích thước (đủ size Facebook + LinkedIn/YouTube/Pinterest), 9 bố cục, 6 mẫu có sẵn, đăng nhập PAT hoàn toàn tuỳ chọn.

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
    │  .github/workflows/render.yml
    ▼
node render.mjs  (lib/svg.js → SVG → sharp → PNG)
    │
    ▼
commit vào gallery/  +  comment ảnh vào issue (nếu là issue)
```

Nhánh raster trong trình duyệt **không đụng GitHub Actions**: miễn phí, không giới hạn số lượng, có ngay lập tức. Nhánh Actions (repo public) cũng **miễn phí không giới hạn Actions minutes**, chỉ mất ~30s và cần tài khoản GitHub để mở issue.

## Dùng trên trang

1. Mở <https://vanthuonghi.github.io/hinh-bang-code/> (hoặc `index.html` local).
2. Nhập tiêu đề / phụ đề, chọn **bảng màu (18)**, **bố cục (9)**, **kích thước (12, Facebook đứng đầu)** — hoặc bấm nhanh 1 trong **6 mẫu có sẵn**.
3. Bấm **⬇ Tải PNG** → ảnh render ngay trên máy bạn: **không đăng nhập, không token, không chờ** (dùng được với mọi size, không giới hạn số lượng). Nút **Tải SVG** nếu muốn mở tay trong Illustrator/Figma.
4. *Tuỳ chọn — Lưu lên gallery GitHub*: nút **Lưu vào gallery GitHub** → Actions render ~30s → ảnh nằm trong [`gallery/`](gallery/). Dán PAT 1 lần nếu muốn tạo issue ngay tại trang và có nút **Của tôi**; token chỉ nằm trong `localStorage`, không gửi đi đâu khác `api.github.com`. Không dán PAT thì trang mở trang tạo issue của GitHub như bình thường.

> **Lưu ý font**: PNG tải từ trình duyệt dùng font hệ thống (Helvetica/Arial), bản render trên Actions dùng Noto Sans — bố cục, cỡ chữ, dòng xuống hàng như nhau, chỉ khác hình dáng chữ một chút.

## Kích thước

| Khóa | Dùng cho |
|---|---|
| `1200x630` | Link share Facebook / OG |
| `1200x1200` | Bài đăng feed vuông |
| `1080x1350` | Feed dọc 4:5 (FB/IG) |
| `1080x1920` | Story / Reel |
| `1640x624` | Bìa trang Facebook (cover) |
| `1200x628` | Bài LinkedIn / X |
| `1280x720` | Thumbnail YouTube |
| `1000x1500` | Pinterest (2:3) |
| `800x1000` | Share dọc (Zalo / Messenger) |
| `1080x1080`, `1920x1080`, `800x800` | Vuông, slide 16:9, nhỏ |

**Bảng màu (18):** `sunset`, `ocean`, `forest`, `midnight`, `violet`, `paper`, `coral`, `mint`, `sand`, `ink`, `aurora`, `rose`, `citrus`, `steel`, `grape`, `blush`, `blueprint`, `clay`

**Bố cục (9):** `left` (mặc định) · `center` (căn giữa) · `quote` (thẻ quote) · `split` (chữ trái + khối màu phải) · `list` (danh sách đánh số) · `number` (số lớn kiểu infographic) · `sticker` (thẻ viền đậm + nhãn xoay góc) · `terminal` (khung terminal) · `story` (progress bar + avatar)

**Mẫu có sẵn:** 6 combo màu × bố cục × kích thước, bấm một cái là áp ngay trên trang — dữ liệu nằm ở `PRESETS` trong [lib/svg.js](lib/svg.js).

## Cho agent / CLI (Hermes)

### REST API

Cần token scopes `repo` + `workflow` (đặt `GITHUB_TOKEN`):

```bash
# 1. gửi yêu cầu render
curl -X POST -H "Authorization: Bearer $GITHUB_TOKEN" -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/vanthuonghi/hinh-bang-code/actions/workflows/render.yml/dispatches \
  -d '{"ref":"refs/heads/main","inputs":{"title":"Tiêu đề","subtitle":"Phụ đề","size":"1080x1350","theme":"aurora","layout":"quote"}}'
# lưu ý: thiếu "ref" sẽ bị 422

# 2. đọc manifest (có trường user, issue, size, theme, layout, date)
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/repos/vanthuonghi/hinh-bang-code/contents/gallery/manifest.json

# 3. tải ảnh
curl -LO https://github.com/vanthuonghi/hinh-bang-code/raw/main/gallery/<ten-file>.png

# 4. theo dõi run
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  "https://api.github.com/repos/vanthuonghi/hinh-bang-code/actions/workflows/render.yml/runs?event=workflow_dispatch"
```

### CLI (đi kèm repo, Node ≥20, không cần cài gì)

```bash
export GITHUB_TOKEN=ghp_...          # hoặc: gh auth login

node bin/hinh.mjs new --title "Tiêu đề" --subtitle "Phụ đề" \
  --theme aurora --layout quote --size 1080x1350 --wait --out ./anh
node bin/hinh.mjs list --n 10 --json
node bin/hinh.mjs get ten-file.png --out ./anh
node bin/hinh.mjs status
```

`--json` in kết quả dạng JSON cho agent đọc; lỗi exit mã 1 kèm `{"error": ...}`. `--wait` poll tới khi run xong rồi trả URL + (nếu có `--out`) tải file về.

Repo đổi được bằng `--repo owner/name` hoặc env `HINH_REPO`.

## Chạy local

```bash
npm install
node render.mjs --title "[render] Bài test" --body $'Tiêu đề: Bài test\nTheme: ocean\nBố cục: center'
```

Kết quả trong `gallery/`. Muốn tự mở issue mà không qua trang:

```bash
gh issue create --repo OWNER/REPO --title "[render] Tiêu đề hình" \
  --body "$(printf 'Tiêu đề: Tiêu đề hình\nTheme: violet\nBố cục: quote\nKích thước: 1200x630')"
```

## Files

| File | Vai trò |
|---|---|
| [index.html](index.html) | Trang tĩnh: form, xem trước realtime, đăng nhập PAT, gallery, tài liệu API |
| [lib/svg.js](lib/svg.js) | **Thư viện SVG dùng chung** — màu, kích thước, bố cục, parse yêu cầu. Trang và Actions đều import file này nên xem trước khớp bản render |
| [render.mjs](render.mjs) | Nhập yêu cầu (issue/dispatch) → sinh PNG bằng `sharp`, giữ `gallery/manifest.json` |
| [bin/hinh.mjs](bin/hinh.mjs) | CLI cho agent/người dùng terminal |
| [test/svg.test.js](test/svg.test.js) | **Test hồi quy** — ma trận 18×12×9 không đè footer, escape XML, parse yêu cầu, preset hợp lệ |
| [.github/workflows/render.yml](.github/workflows/render.yml) | 2 cổng kích hoạt: `issues` (có tiền tố `[render]`) và `workflow_dispatch` |
| `gallery/` | Kho ảnh (commit tự động bởi Actions) |

## Test hồi quy

```bash
npm test          # node --test — 8 test, quét toàn bộ ma trận bố cục
```

Test chính là **tấm đai chống tràn**: mọi tổ hợp màu × kích thước × bố cục phải nằm trong vùng an toàn, không đè dải footer. Workflow render cũng chạy `npm test` trước khi render — layout hỏng không tới lượt commit.

## Cấu hình

- **Tên repo**: sửa `data-repo="OWNER/TEN-REPO"` ở thẻ `<body>` trong `index.html`.
- **Thêm mẫu**: thêm key vào `THEMES` / `SIZES` / `LAYOUTS` trong `lib/svg.js` — trang tự hiện mục mới (UI dựng từ map), chỉ cần thêm nhãn trong `SIZE_LABELS`/`LAYOUTS` nếu muốn chữ tiếng Việt. Thêm `PRESETS` nếu muốn combo mẫu. **Rồi chạy `npm test`** để ma trận tự kiểm lại.
- **Chặn người lạ dùng Actions**: thêm điều kiện user vào `if:` của job trong workflow.
- **Font**: workflow cài `fonts-noto-core` để dấu tiếng Việt hiển thị đủ khi render trên Actions.
