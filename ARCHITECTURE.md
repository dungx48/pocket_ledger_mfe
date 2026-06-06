# Frontend Architecture

Pocket Ledger frontend la Next.js App Router application.

## Runtime Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- shadcn/Radix UI primitives
- lucide-react icons

## Route Structure

- `/login`: public login page.
- `/`: authenticated transaction workspace.
- `/analytics`: authenticated spending analytics page.

This is currently a lightweight app shell inside the same Next.js app. Navigation lives in the authenticated pages and can later be extracted into a shared authenticated layout if more modules are added.

## Authentication Flow

1. User submits login form on `/login`.
2. Frontend calls `POST /auth/token` using form-urlencoded body.
3. Access token is saved in localStorage key `auth_token`.
4. Protected pages call `getAuthToken()`.
5. If no token exists, user is redirected to `/login`.
6. `lib/api.ts` sends `Authorization: Bearer <token>` for authenticated API calls.
7. API `401` clears token and redirects to `/login`.

## Category Flow

1. `CategoriesProvider` reads localStorage:
   - `app_categories`
   - `app_transaction_types`
2. If cache is missing, it calls `GET /categories`.
3. `lib/categories.ts` parses:
   - `field_name === "category_key"` as transaction categories.
   - `field_name === "transaction_type"` as transaction type options.
4. Parsed values are exposed through `useCategories()`.

## Transaction Workspace

Primary file: `app/page.tsx`.

Responsibilities:

- Auth gate for transaction screen.
- Create/update/delete transaction callbacks.
- Load monthly summaries via `GET /transactions/summary/monthly`.
- Load weekly summaries via `GET /transactions/summary/weekly`.
- Load transaction list by date range via `GET /transactions/?date_from=...&date_to=...`.
- Keep existing transaction UI/UX stable.

Important rule:

- Do not get all transactions for summary when backend has date-range and summary endpoints.

## Analytics Workspace

Primary file: `app/analytics/page.tsx`.

Responsibilities:

- Auth gate for analytics screen.
- Filter analytics by date range, transaction type and category.
- Load aggregate data from backend analytics endpoints.
- Show overview cards, category analysis and time-series analysis.

API functions live in `lib/api.ts`:

- `fetchAnalyticsOverview(dateFrom, dateTo, transactionType?, categoryKey?)`
- `fetchAnalyticsByCategory({ dateFrom, dateTo, transactionType?, categoryKey? })`
- `fetchAnalyticsTimeseries({ dateFrom, dateTo, groupBy?, transactionType?, categoryKey? })`

Analytics backend endpoints:

- `GET /transactions/analytics/overview`
- `GET /transactions/analytics/by-category`
- `GET /transactions/analytics/timeseries`

Filter params:

- `date_from`
- `date_to`
- `transaction_type`
- `category_key`
- `group_by` for timeseries only

Important rule:

- Analytics aggregation belongs to backend. Frontend only renders returned aggregates.

## API Layer

Primary file: `lib/api.ts`.

Responsibilities:

- Token helpers: `setAuthToken`, `getAuthToken`, `clearAuthToken`.
- Low-level API calls and error handling.
- Transaction CRUD functions.
- Transaction summary functions.
- Analytics functions.
- Category fetch.

## Shared Types

Canonical transaction types are:

- `income`
- `expense`

Normalization helpers live in `lib/transaction-types.ts`.

## Future App Shell Direction

Current recommendation:

- Keep transactions and analytics inside one Next.js app for now.
- Treat `/` and `/analytics` as modules under a lightweight shell.
- Extract a shared authenticated layout when more modules are added.

Only split into separate apps/ports when independent deploy, independent teams or true micro frontend requirements exist.
