# ✈️ TourQuote Pro

Ứng dụng báo giá tour du lịch chuyên nghiệp — hỗ trợ đa tiền tệ (VND/USD/CNY), đa ngôn ngữ (VI/EN/ZH), xuất Excel & PDF.

---

## 🚀 Cài đặt & Chạy

### Yêu cầu
- **Node.js** phiên bản 18 trở lên → tải tại https://nodejs.org (chọn bản LTS)

### Bước 1 — Cài dependencies

Mở **Command Prompt** (Windows) hoặc **Terminal** (macOS), `cd` vào thư mục này rồi chạy:

```bash
npm install
```

> Lần đầu sẽ mất khoảng 1–2 phút để tải các thư viện.

### Bước 2 — Chạy ứng dụng

```bash
npm run dev
```

Trình duyệt sẽ tự mở tại **http://localhost:5173**

---

## 📦 Build (tùy chọn)

Nếu muốn build thành file tĩnh để deploy lên hosting:

```bash
npm run build
```

File output sẽ nằm trong thư mục `dist/`.

---

## 🗂 Cấu trúc thư mục

```
tourquote/
├── public/
│   └── favicon.svg
├── src/
│   ├── TourQuoteFinal.jsx   ← Toàn bộ logic & UI ứng dụng
│   ├── main.jsx             ← Entry point + localStorage shim
│   └── index.css            ← Global reset CSS
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 💾 Lưu trữ dữ liệu

Dữ liệu (báo giá đã lưu, template) được lưu vào **localStorage** của trình duyệt.
- **Không bị mất** khi đóng tab hay tắt máy
- **Bị mất** nếu xóa cache/dữ liệu trình duyệt

---

## ✨ Tính năng

| Tính năng | Mô tả |
|-----------|-------|
| 📋 Báo giá đầy đủ | 6 hạng mục: Lưu trú, Giao thông, Cảnh điểm, HDV, Nhà hàng, Khác |
| 💰 Công thức | Số lượng × Đơn giá × Số lần = Thành tiền |
| ⚙️ Cài đặt giá | Markup %, Chiết khấu %, VAT % |
| 💱 Đa tiền tệ | VND / USD / CNY — nhập đơn giá từng dịch vụ theo loại tiền khác nhau |
| 🌐 Đa ngôn ngữ | Tiếng Việt / English / 中文 |
| 📊 Xuất Excel | Tổng quan + sheet chi tiết từng hạng mục |
| 📄 Xuất PDF | In hoặc lưu PDF qua trình duyệt |
| 📁 Lịch sử | Lưu, tải, nhân bản, xóa báo giá |
| 🎨 Template | 6 preset có sẵn + tự tạo template từ báo giá |

---

## 🛠 Công nghệ

- **React 18** + **Vite 5**
- **SheetJS (xlsx)** — xuất Excel
- **Google Fonts** — Cormorant Garamond, DM Sans, Noto Sans SC
