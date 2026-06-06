# Pocket Ledger Frontend

Frontend web cua Pocket Ledger, xay dung bang Next.js 16, React 19, TypeScript, Tailwind CSS va shadcn/Radix UI.

## Main Features

- Login bang `username/password` qua backend `POST /auth/token`.
- CRUD giao dich thu/chi.
- Danh muc va loai giao dich lay tu `GET /categories`, cache vao localStorage.
- Form nhap tien theo don vi nghin:
  - User nhap `1.234`.
  - Submit len backend la `1234000` VND.
- Man hinh giao dich co thong ke theo thang/tuan/ngay va danh sach giao dich theo date range.
- Man hinh analytics moi de thong ke va phan tich tieu dung.

## Routes

- `/login`: login page.
- `/`: authenticated transaction workspace.
- `/analytics`: analytics and spending analysis page.

## Analytics Page

Route `/analytics` dung cac API backend sau:

- `GET /transactions/analytics/overview`
- `GET /transactions/analytics/by-category`
- `GET /transactions/analytics/timeseries`

Filter hien co:

- `date_from`
- `date_to`
- `transaction_type`
- `category_key`

Nguyen tac:

- Khong get all transactions ve frontend de tu tong hop analytics.
- Backend la noi filter va aggregate so lieu.
- `category_key` la optional filter. Neu bo trong thi analytics lay tat ca danh muc.
- Ten hien thi cua category lay tu `CategoriesProvider`/`GET /categories`.

## Requirements

- Node.js 18+
- pnpm

## Run

Install dependencies:

```bash
pnpm install
```

Development:

```bash
pnpm dev
```

App mac dinh chay tai:

```text
http://localhost:3000
```

Build:

```bash
pnpm build
```

Start production build:

```bash
pnpm start
```

## Environment

Frontend doc API base URL tu:

- Browser: `NEXT_PUBLIC_API_BASE_URL`
- Fallback: `http://localhost:5001`

Chi tiet xem `ENV_SETUP.md`.

## Key Files

- `app/page.tsx`: transaction workspace, month/week/day transaction loading.
- `app/analytics/page.tsx`: analytics UI and filters.
- `app/login/page.tsx`: login page.
- `app/categories-provider.tsx`: category and transaction type provider/cache.
- `components/transaction-form.tsx`: create/update transaction form.
- `components/transaction-list.tsx`: transaction list.
- `lib/api.ts`: auth helpers and API client functions.
- `lib/categories.ts`: parse/cache categories.
- `lib/transaction-types.ts`: canonical transaction type helpers.

## Data Contract Used By Frontend

```ts
type Transaction = {
  id: string;
  user_id?: string;
  amount: number;
  date: string;
  category_key: string;
  transaction_type: 'income' | 'expense';
  note?: string | null;
  created_at?: string;
};
```

Analytics types are declared in `lib/api.ts`:

- `AnalyticsOverview`
- `AnalyticsByCategory`
- `AnalyticsTimeseries`

## Related Docs

- Root API contract: `../docs/api-contract.md`
- Analytics task: `../docs/TASK_ANALYTICS_APP_SHELL.md`
- Transaction summary task: `../docs/TASK_TRANSACTION_SUMMARY.md`
- Frontend architecture: `ARCHITECTURE.md`
- Project structure: `PROJECT_STRUCTURE.md`
- Environment setup: `ENV_SETUP.md`

## Docker Compose

```bash
docker compose up -d --build
```

Container exposes frontend port `3000`.
