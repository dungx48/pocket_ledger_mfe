# Quản Lý Chi Tiêu Cá Nhân

Ứng dụng web quản lý thu chi cá nhân, xây dựng với Next.js 16, TypeScript, Tailwind CSS và shadcn/ui.

## Tính năng chính

- Đăng nhập bằng `username/password` (OAuth2 password flow).
- CRUD giao dịch.
- Phân loại theo:
  - `transaction_type` (thu/chi).
  - `category_key` (danh mục chi tiết).
- Danh mục và loại giao dịch lấy từ API `/categories`, cache localStorage.
- Form nhập số tiền theo **đơn vị nghìn**:
  - người dùng nhập `1234` => hiển thị `1.234`.
  - khi submit gửi `1,234,000` VND.
- Dashboard hiển thị:
  - Tổng thu nhập.
  - Tổng chi tiêu.
  - Số dư.
- Danh sách “Giao dịch gần đây” dùng `Load more` theo trang (không render vô hạn).

## Yêu cầu

- Node.js 18+
- pnpm

## Chạy dự án

### 1) Cài dependencies

```bash
pnpm install
```

### 2) Cấu hình môi trường

Dự án dùng:

- `.env.local` cho local
- `.env.prod` cho production

Chi tiết: `ENV_SETUP.md`.

### 3) Development

```bash
pnpm dev
```

App chạy ở `http://localhost:3000`.

### 4) Build/Start

```bash
pnpm build
NODE_ENV=production pnpm start
```

## Kiến trúc nhanh

- `app/page.tsx`: dashboard, thống kê, phân trang `Load more`.
- `app/categories-provider.tsx`: load/cache danh mục + transaction types.
- `components/transaction-form.tsx`: form thêm/sửa giao dịch.
- `components/transaction-list.tsx`: list giao dịch + badge danh mục + dấu +/- theo `transaction_type`.
- `lib/api.ts`: auth + API calls.
- `lib/categories.ts`: parse/cache danh mục.

## Data contract hiện tại

> Backend thực tế là nguồn sự thật. Interface dưới đây phản ánh cách app đang dùng.

```ts
type Transaction = {
  id: string;
  amount: number; // VND
  date: string; // YYYY-MM-DD
  category_key: string;
  transaction_type: string; // ví dụ: '1' = thu
  note?: string;
};

type TransactionCreate = {
  amount: number; // VND
  date: string;
  category_key: string;
  transaction_type: string;
  note?: string;
};
```

## Danh mục và loại giao dịch

- Nguồn dữ liệu: API `/categories`.
- Parse tại `lib/categories.ts`:
  - `field_name === 'category_key'` => danh mục.
  - `field_name === 'transaction_type'` => loại giao dịch.
- Cache keys:
  - `app_categories`
  - `app_transaction_types`

Muốn thêm danh mục mới: cập nhật dữ liệu backend `/categories` (không hard-code trong form).

## UI/UX hiện tại

- `Số tiền (nghìn đ)` có hậu tố `000`, nhập có dấu chấm phân tách.
- Trong list giao dịch:
  - badge hiển thị tên danh mục.
  - dòng dưới chỉ hiển thị ghi chú (không lặp danh mục).
- Dấu tiền `+/-` và tính tổng thu/chi dựa theo `transaction_type`.

## Troubleshooting

- Lỗi lock khi chạy dev:
  - `Unable to acquire lock ... .next/dev/lock`
  - nguyên nhân: có instance `next dev` cũ đang chạy.
- Lỗi danh mục `undefined`:
  - kiểm tra cache `app_categories` có dữ liệu.
  - kiểm tra transaction trả về có `category_key`.

## Tài liệu liên quan

- `ARCHITECTURE.md`: kiến trúc chi tiết.
- `PROJECT_STRUCTURE.md`: cấu trúc thư mục.
- `ENV_SETUP.md`: cấu hình môi trường.

## Docker production

### Build image local

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_BASE_URL=http://localhost:5001 \
  -t pocket-ledger:local .
```

### Run container local

```bash
docker run --rm -p 3000:3000 \
  -e API_BASE_URL=http://localhost:5001 \
  -e NEXT_PUBLIC_API_BASE_URL=http://localhost:5001 \
  pocket-ledger:local
```

## CI/CD bằng GitHub Actions

Repo đã có workflow: `.github/workflows/cicd.yml`

Flow:

1. Push vào `main`.
2. GitHub Actions build Docker image và push lên GHCR:
   - `ghcr.io/<owner>/<repo>:latest`
   - `ghcr.io/<owner>/<repo>:<commit-sha>`
3. Action SSH vào server, tạo/cập nhật `.env.prod`, rồi:
   - `docker compose pull`
   - `docker compose up -d`

### Secrets cần tạo trong GitHub repo

- `NEXT_PUBLIC_API_BASE_URL` (dùng build-time + runtime)
- `API_BASE_URL` (runtime, server-side fetch)
- `SERVER_HOST`
- `SERVER_PORT` (ví dụ `22`)
- `SERVER_USER`
- `SERVER_SSH_KEY` (private key để SSH)
- `SERVER_APP_DIR` (ví dụ `/opt/pocket_ledger_mfe_v0`)
- `SERVER_GHCR_USERNAME`
- `SERVER_GHCR_TOKEN` (PAT có quyền đọc package GHCR)

### Yêu cầu trên server

- Cài Docker + Docker Compose plugin.
- User deploy có quyền chạy `docker`.
- Mở port `3000` hoặc đặt reverse proxy (Nginx/Caddy) phía trước.
