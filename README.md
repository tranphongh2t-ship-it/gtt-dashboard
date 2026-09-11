# 📊 GTT Marketing Dashboard

Dashboard quản lý và theo dõi hiệu quả marketing của **GTT** — tổng hợp số liệu từ nhiều nền tảng, lập kế hoạch nội dung, quản lý công việc và theo dõi từ khóa.

## ✨ Tính năng

| Tab | Mô tả |
|---|---|
| **▦ Dashboard** | Tổng quan số liệu theo tháng: KPI, so sánh với tháng trước, đánh giá Google My Business |
| **↗ Biểu đồ** | Xu hướng Views/Impressions, bài đăng (stacked), website conversions, radar hiệu suất, tăng trưởng MoM |
| **⇄ So sánh** | So sánh chi tiết 2 tháng bất kỳ trên tất cả nền tảng |
| **📋 Công Việc** | Quản lý công việc theo tháng: danh mục (Thiết kế, Nội dung, Sự kiện, Quảng cáo...), theo dõi tiến độ, lọc theo ngày |
| **✍️ Plan Content** | Lập kế hoạch nội dung |
| **🏷️ Cấu Trúc DM & Thẻ** | Quản lý cấu trúc DM & thẻ |
| **📊 Từ Khóa** | Theo dõi thứ hạng từ khóa |
| **✎ Nhập liệu** *(chỉ admin)* | Nhập số liệu từng nền tảng theo tháng, thêm tháng mới, thêm URL bài đăng |

**Nền tảng theo dõi:** Website 🌐 · Fanpage 📘 · YouTube ▶️ · TikTok 🎵 · LinkedIn 💼 · Pinterest 📌 · Google My Business 📍

## 🛠 Công nghệ

- **React 18** + **Vite 5** — giao diện & build
- **Recharts** — biểu đồ, đồ thị
- **Netlify Functions** + **Netlify Blobs** — lưu trữ dữ liệu (không cần database)
- Deploy trên **Netlify** (liên kết GitHub, tự động build)

## 📁 Cấu trúc thư mục

```
gtt-dashboard/
├── src/
│   ├── main.jsx         # Điểm khởi động React
│   ├── App.jsx          # Trang chính (dashboard, biểu đồ, so sánh, công việc, nhập liệu)
│   ├── ContentPlan.jsx  # Tab Plan Content
│   ├── CauTruc.jsx      # Tab Cấu trúc DM & Thẻ
│   ├── KeyRank.jsx      # Tab Từ Khóa
│   ├── colors.jsx       # Bảng màu giao diện
│   └── seoData.js       # Dữ liệu SEO
├── netlify/
│   └── functions/store.js  # API đọc/ghi Netlify Blobs
├── netlify.toml         # Cấu hình build & deploy
├── package.json         # Dependencies & lệnh npm
└── index.html
```

## 🚀 Chạy local (máy tính)

Yêu cầu: **Node.js** (bản 18+).

```bash
# 1. Vào thư mục dự án
cd C:\Users\thanhthuyktt\Desktop\gtt-dashboard

# 2. Cài dependencies (chỉ cần 1 lần đầu)
npm install

# 3. Chạy server local (mở http://localhost:5173)
npm run dev
```

> ⚠️ Lưu ý: khi chạy local, các API `/api/store` (đọc/ghi dữ liệu) **không hoạt động** vì cần Netlify Functions. Để test đầy đủ dữ liệu, chạy qua Netlify:
> ```bash
> npx netlify-cli dev
> ```

## 🌐 Deploy lên Netlify

Site: **https://app.netlify.com/projects/thanhthuydata/overview**

### Cách A — Push lên GitHub (Netlify tự deploy) ✅ Khuyên dùng

Mở CMD **tại thư mục dự án** (gõ `cd` đến chỗ có file `package.json`), rồi:

```bash
git add .
git commit -m "mô tả thay đổi"
git push origin main
```

Vào Netlify → tab **Deploys** → đợi build xong (1–2 phút) là web cập nhật.

### Cách B — Deploy trực tiếp bằng Netlify CLI

```bash
# Lần đầu tiên: đăng nhập & liên kết site với thư mục dự án
netlify login
netlify link

# Deploy
npm run build
netlify deploy --prod          # deploy luôn bản build hiện tại
# hoặc: netlify deploy --prod --build   (build mới rồi mới deploy)
```

> Khi chạy `netlify link`, chọn **Use existing site** → chọn `thanhthuydata`.

### 🔑 Biến môi trường bắt buộc (đã cấu hình trên Netlify)

Đặt trong **Site settings → Environment variables**:

| Biến | Mô tả |
|---|---|
| `NETLIFY_SITE_ID` | ID site Netlify (đã có sẵn khi liên kết) |
| `NETLIFY_TOKEN` | Personal Access Token của tài khoản Netlify |

> Thiếu 2 biến này thì API `/api/store` sẽ báo lỗi và dữ liệu không đọc/ghi được.

## 💾 Dữ liệu

- Dữ liệu (số liệu tháng, URL bài đăng, công việc) được lưu trong **Netlify Blobs** — deploy code mới **không làm mất dữ liệu**.
- **Admin:** đăng nhập bằng cách nhấp vào logo (mật khẩu xem trong `src/App.jsx`, biến `ADMIN_PASSWORD`).
- **Sao lưu:** nút **💾 Export JSON** / **📂 Import** nằm ở **góc phải header** của trang — dùng để backup hoặc chuyển dữ liệu giữa máy.

## 📝 Quy trình thêm tháng mới

1. Đăng nhập admin (nhấp logo).
2. Vào tab **Nhập liệu** → **+ Thêm tháng** → chọn tháng → **Tạo**.
3. Nhập số liệu từng nền tảng → **💾 Lưu dữ liệu**.
4. Vào tab **Công Việc** → chọn tháng mới → **➕ Thêm công việc** để bắt đầu giao việc.

---

*Dự án nội bộ — GTT Marketing Team.*
