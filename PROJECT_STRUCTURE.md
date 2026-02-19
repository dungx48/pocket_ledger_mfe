# Cấu Trúc Thư Mục

```
pocket_ledger_mfe/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── categories-provider.tsx
│   ├── globals.css
│   └── login/
│       └── page.tsx
│
├── components/
│   ├── transaction-form.tsx
│   ├── transaction-list.tsx
│   ├── theme-provider.tsx
│   └── ui/
│       └── ...shadcn components
│
├── lib/
│   ├── api.ts
│   ├── categories.ts
│   ├── config.ts
│   └── utils.ts
│
├── hooks/
├── public/
├── styles/
├── ARCHITECTURE.md
├── ENV_SETUP.md
├── README.md
└── PROJECT_STRUCTURE.md
```

## Mô tả nhanh

### `app/`

- `page.tsx`: dashboard, CRUD giao dịch, thống kê, load-more pagination.
- `categories-provider.tsx`: load/cache categories + transaction types.
- `login/page.tsx`: đăng nhập.

### `components/`

- `transaction-form.tsx`: form thêm/sửa giao dịch.
  - nhập tiền theo đơn vị nghìn.
  - submit payload chuẩn `amount`, `category_key`, `transaction_type`.
- `transaction-list.tsx`: danh sách giao dịch gần đây.
  - badge danh mục lấy từ provider.
  - dấu +/- theo `transaction_type`.

### `lib/`

- `api.ts`: API client, token management, endpoint functions.
- `categories.ts`: parse và cache dữ liệu danh mục.
- `config.ts`: đọc API base URL từ env.
- `utils.ts`: helper chung.

## Luồng phụ thuộc chính

- `app/page.tsx` -> `components/transaction-form.tsx` + `components/transaction-list.tsx`.
- `components/*` -> `lib/api.ts` (qua callbacks hoặc type).
- `components/transaction-form.tsx` + `components/transaction-list.tsx` -> `app/categories-provider.tsx`.
- `app/categories-provider.tsx` -> `lib/categories.ts` + `lib/api.ts`.

## Các điểm cần đồng bộ khi đổi nghiệp vụ

- Đổi schema transaction: cập nhật `lib/api.ts`, `app/page.tsx`, `components/transaction-form.tsx`, `components/transaction-list.tsx`.
- Đổi logic danh mục/loại giao dịch: cập nhật `lib/categories.ts` và `app/categories-provider.tsx`.
- Đổi pagination: cập nhật `app/page.tsx` và tài liệu `README.md`, `ARCHITECTURE.md`.
