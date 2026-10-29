# 🎨 Sinh hình bằng code

Trang tĩnh nhập yêu cầu hình → **GitHub Actions tự render ảnh** (SVG → PNG) và trả kết quả ngay trong issue. Có **API + CLI cho agent (Hermes)**, 12 bảng màu, 8 kích thước (đủ size Facebook), 3 bố cục, đăng nhập PAT tùy chọn.

## Cách hoạt động

```
index.html (nhập yêu cầu, đăng nhập PAT tùy chọn)
    │  đã đăng nhập → POST /repos/.../issues  (tạo ngay tại trang)
    │  chưa đăng nhập → mở trang tạo issue của GitHub
    │  máy/agent → POST /actions/workflows/render.yml/dispatches
    ▼
GitHub Issue [render]  hoặc  workflow_dispatch
    │  .github/workflows/render.yml
    ▼
node render.mjs  (lib/svg.js → SVG → sharp → PNG)
    │
    ▼
commit vào gallery/  +  comment ảnh vào issue (nếu là issue)
```

Không cần API key AI, không cần server — chỉ dùng GitHub Actions miễn phí.

## Dùng trên trang

1. Mở <https://vanthuonghi.github.io/hinh-bang-code/> (hoặc `index.html` local).
2. Nhập tiêu đề / phụ đề, chọn **bảng màu (12)**, **bố cục (3)**, **kích thước (8, Facebook đứng đầu)**.
3. Bấm **Tạo yêu cầu trên GitHub** → Actions render ~30s → ảnh nằm trong [`gallery/`](gallery/).
4. *Tùy chọn — đăng nhập*: dán PAT (scope `repo`) 1 lần → trang tạo issue thẳng bằng API, không rời trang, và có nút **Của tôi** lọc gallery theo user. Token chỉ nằm trong `localStorage` của trình duyệt, không gửi đi đâu khác `api.github.com`.

## Kích thước

| Khóa | Dùng cho |
|---|---|
| `1200x630` | Link share Facebook / OG |
| `1200x1200` | Bài đăng feed vuông |
| `1080x1350` | Feed dọc 4:5 (FB/IG) |
| `1080x1920` | Story / Reel |
| `1640x624` | Bìa trang Facebook (cover) |
| `1080x1080`, `1920x1080`, `800x800` | Vuông, slide 16:9, nhỏ |

**Bảng màu:** `sunset`, `ocean`, `forest`, `midnight`, `violet`, `paper`, `coral`, `mint`, `sand`, `ink`, `aurora`, `rose`
**Bố cục:** `left` (mặc định), `center` (căn giữa), `quote` (thẻ quote có dấu “ và tên tác giả)

## Cho agent / CLI (Hermes)

### REST API

Cần token scopes `repo` + `workflow` (đặt `GITHUB_TOKEN`):

```bash
# 1. gửi yêu cầu render
curl -X POST -H "Authorization: Bearer $GITHUB_TOKEN" -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/vanthuonghi/hinh-bang-code/actions/workflows/render.yml/dispatches \
  -d '{"inputs":{"title":"Tiêu đề","subtitle":"Phụ đề","size":"1080x1350","theme":"aurora","layout":"quote"}}'

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
| [.github/workflows/render.yml](.github/workflows/render.yml) | 2 cổng kích hoạt: `issues` (có tiền tố `[render]`) và `workflow_dispatch` |
| `gallery/` | Kho ảnh (commit tự động bởi Actions) |

## Cấu hình

- **Tên repo**: sửa `data-repo="OWNER/TEN-REPO"` ở thẻ `<body>` trong `index.html`.
- **Thêm mẫu**: thêm key vào `THEMES` / `SIZES` / `LAYOUTS` trong `lib/svg.js` — trang tự hiện mục mới (UI dựng từ map), chỉ cần thêm mô tả trong `SIZE_LABELS`/`LAYOUTS` nếu muốn nhãn tiếng Việt.
- **Chặn người lạ dùng Actions**: thêm điều kiện user vào `if:` của job trong workflow.
- **Font**: workflow cài `fonts-noto-core` để dấu tiếng Việt hiển thị đủ khi render trên Actions.
