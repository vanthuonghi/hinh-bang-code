# 🎨 Sinh hình bằng code

Trang tĩnh nhập yêu cầu hình → **GitHub Actions tự render ảnh** (SVG → PNG) và trả kết quả ngay trong issue.

## Cách hoạt động

```
index.html (nhập yêu cầu)
    │  bấm "Tạo yêu cầu trên GitHub"
    ▼
GitHub Issue có tiêu đề [render] ...
    │  on: issues → opened
    ▼
.github/workflows/render.yml
    │  node render.mjs  (sinh SVG → sharp → PNG)
    ▼
commit vào gallery/  +  comment ảnh vào issue
```

Không cần API key, không cần server — chỉ dùng GitHub Actions miễn phí (2.000 phút/tháng).

## Dùng

1. Mở `index.html` (hoặc trang GitHub Pages của repo).
2. Nhập **tiêu đề**, phụ đề, chọn bảng màu + kích thước → bấm **Tạo yêu cầu trên GitHub**.
3. GitHub mở trang tạo issue sẵn nội dung → bấm *Submit new issue*.
4. Vài chục giây sau, bot `github-actions` comment ảnh PNG vào chính issue đó.
5. Hình được lưu vĩnh viễn trong [`gallery/`](gallery/).

Định dạng hỗ trợ: `1200×630` (OG/social), `1080×1080` (vuông), `1920×1080` (slide), `800×800`.
Bảng màu: `sunset`, `ocean`, `forest`, `midnight`, `violet`, `paper`.

## Chạy local

```bash
npm install
node render.mjs --title "[render] Bài test" --body $'Tiêu đề: Bài test\nTheme: ocean\nKích thước: 1080x1080'
```

Kết quả nằm trong `gallery/`. Muốn tự mở issue mà không qua trang tĩnh:

```bash
gh issue create --repo OWNER/REPO --title "[render] Tiêu đề hình" \
  --body "$(printf 'Tiêu đề: Tiêu đề hình\nPhụ đề: Mô tả ngắn\nTheme: violet\nKích thước: 1200x630')"
```

## Cấu hình repo

- **Trang tĩnh**: sửa `data-repo="OWNER/TEN-REPO"` trong [index.html](index.html) (dòng `<body>`), rồi bật GitHub Pages (Settings → Pages → Deploy from branch `main`).
- **Bảng màu / kích thước**: thêm key vào `THEMES` / `SIZES` trong [render.mjs](render.mjs) (và `THEMES`/`SIZES` trong `index.html` để xem trước khớp).
- **Font**: workflow cài `fonts-noto-core` để tiếng Việt (dấu) hiển thị đủ.

## Files

| File | Vai trò |
|---|---|
| [index.html](index.html) | Trang tĩnh nhập yêu cầu + xem trước SVG realtime |
| [render.mjs](render.mjs) | Sinh SVG từ yêu cầu, xuất PNG bằng `sharp`, giữ `gallery/manifest.json` |
| [.github/workflows/render.yml](.github/workflows/render.yml) | Chạy khi issue `[render]` mở: render → commit → comment ảnh |
| `gallery/` | Kho ảnh đã render (commit tự động bởi Actions) |
