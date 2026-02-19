# Environment Configuration Guide

## Tổng Quan

Dự án sử dụng 2 file cấu hình riêng cho mỗi môi trường:
- **.env.local** - Dùng khi phát triển trên localhost
- **.env.prod** - Dùng khi deploy lên production server

## File & Thư Mục Liên Quan

```
📦 Project Root
├── .env.local          # Local development config (git-ignored)
├── .env.prod           # Production config (git-ignored)
├── .env.example        # Template reference (git tracked)
└── lib/
    └── config.ts       # Config loader & manager
```

## Cách Sử Dụng

### 1. Local Development (Localhost)

**Setup:**
```bash
# File .env.local đã được tạo sẵn với nội dung:
NEXT_PUBLIC_API_BASE_URL=http://localhost:5001
API_BASE_URL=http://localhost:5001
NODE_ENV=development
```

**Để chạy:**
```bash
pnpm dev
```

Next.js sẽ tự động load `.env.local` cho development.

**Kiểm tra:**
- App chạy trên `http://localhost:3000`
- API call sẽ gửi tới `http://localhost:5001`

---

### 2. Production Deployment

**Setup:**
```bash
# File .env.prod đã được tạo sẵn với nội dung:
NEXT_PUBLIC_API_BASE_URL=http://15.235.185.158:5001
API_BASE_URL=http://15.235.185.158:5001
NODE_ENV=production
```

**Để build & deploy:**
```bash
# Build với production config
pnpm build

# Hoặc set NODE_ENV trước
NODE_ENV=production pnpm build
```

**Kiểm tra:**
- App chạy trên production server (domain của bạn)
- API call sẽ gửi tới `http://15.235.185.158:5001`

---

## Cấu Trúc Các Biến Environment

### NEXT_PUBLIC_API_BASE_URL
- **Dùng ở:** Client-side (trình duyệt)
- **Kiểu:** Public (có tiền tố `NEXT_PUBLIC_`)
- **Giá trị:**
  - Local: `http://localhost:5001`
  - Prod: `http://15.235.185.158:5001`

### API_BASE_URL
- **Dùng ở:** Server-side (Next.js server)
- **Kiểu:** Private (không có tiền tố)
- **Giá trị:**
  - Local: `http://localhost:5001`
  - Prod: `http://15.235.185.158:5001`

### NODE_ENV
- **Giá trị:** `development` hoặc `production`
- **Tác dụng:**
  - `development`: bật source maps, verbose logging
  - `production`: tối ưu hiệu suất, minify code

---

## Cách Config Load Hoạt Động

File `lib/config.ts` tự động chọn giá trị:

```typescript
export const getApiBaseUrl = (): string => {
  // Client-side: dùng NEXT_PUBLIC_API_BASE_URL
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001';
  }
  
  // Server-side: dùng API_BASE_URL
  return process.env.API_BASE_URL || 'http://localhost:5001';
};
```

**Default fallback:** `http://localhost:5001` (nếu không set biến nào)

---

## Git Management

`.env.local` và `.env.prod` đều trong `.gitignore` để:
- ✅ Bảo vệ API endpoints
- ✅ Mỗi developer/server có config riêng
- ✅ Tránh commit credentials

**Để chia sẻ config template với team:**
- Dùng `.env.example` - file này được git track
- Team members copy từ `.env.example` rồi edit giá trị

---

## Troubleshooting

### API call gửi đến wrong endpoint?

**Check:**
```bash
# Terminal - xem giá trị hiện tại
echo $NEXT_PUBLIC_API_BASE_URL

# Hoặc trong browser console:
console.log(process.env.NEXT_PUBLIC_API_BASE_URL)
```

**Fix:**
1. Đảm bảo bạn đang dùng đúng file `.env.local` hoặc `.env.prod`
2. Restart dev server sau khi sửa `.env` file
3. Hard refresh browser (Cmd+Shift+R hoặc Ctrl+Shift+R)

---

### Làm sao biết app đang dùng config nào?

**Local development:**
```bash
pnpm dev
# Terminal sẽ log:
# ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

**Check current URL:**
- Nếu truy cập `http://localhost:3000` → dùng `.env.local`
- Nếu truy cập domain khác → dùng environment variables của platform

---

## Mở Rộng Config

Nếu muốn thêm biến environment khác, edit cả:
1. `.env.local` (local)
2. `.env.prod` (production)
3. `.env.example` (template)
4. `lib/config.ts` (loader)

**Ví dụ:**
```typescript
// lib/config.ts
export const config = {
  apiBaseUrl: getApiBaseUrl(),
  apiTimeout: 10000,
  logLevel: process.env.LOG_LEVEL || 'info',
  // Thêm biến mới ở đây
};
```

---

## Ghi Chú

- Next.js sẽ reload app khi `.env.local` thay đổi (development mode)
- Production build cần rebuild để nhận config mới
- `NEXT_PUBLIC_*` variables nhúng vào client bundle → không lưu secrets ở đây
- API keys/passwords phải dùng biến private (không có `NEXT_PUBLIC_`)
