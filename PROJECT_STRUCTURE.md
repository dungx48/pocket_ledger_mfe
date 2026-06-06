# Project Structure

```text
pocket_ledger_mfe/
  app/
    layout.tsx
    page.tsx
    categories-provider.tsx
    globals.css
    analytics/
      page.tsx
    login/
      page.tsx
  components/
    transaction-form.tsx
    transaction-list.tsx
    theme-provider.tsx
    ui/
      ...shadcn components
  hooks/
  lib/
    api.ts
    categories.ts
    config.ts
    transaction-types.ts
    utils.ts
  public/
  styles/
  ARCHITECTURE.md
  ENV_SETUP.md
  README.md
  PROJECT_STRUCTURE.md
```

## `app/`

- `layout.tsx`: root layout and `CategoriesProvider`.
- `page.tsx`: transaction workspace.
- `analytics/page.tsx`: spending analytics workspace.
- `login/page.tsx`: login page.
- `categories-provider.tsx`: category and transaction type context.

## `components/`

- `transaction-form.tsx`: create/update transaction form.
- `transaction-list.tsx`: transaction list, category badge, edit/delete controls.
- `ui/`: shadcn/Radix UI primitives.

## `lib/`

- `api.ts`: API client, auth token helpers, transaction APIs, summary APIs and analytics APIs.
- `categories.ts`: parse and cache category data.
- `config.ts`: resolves API base URL.
- `transaction-types.ts`: canonical transaction type helpers.
- `utils.ts`: common UI helpers.

## Main Dependency Flow

- `app/page.tsx` -> `components/transaction-form.tsx`, `components/transaction-list.tsx`, `lib/api.ts`.
- `app/analytics/page.tsx` -> `lib/api.ts`, `app/categories-provider.tsx`.
- `components/transaction-form.tsx` -> `app/categories-provider.tsx`.
- `components/transaction-list.tsx` -> `app/categories-provider.tsx`.
- `app/categories-provider.tsx` -> `lib/categories.ts`, `lib/api.ts`.

## Update Checklist

When changing transaction schema:

- Update `lib/api.ts`.
- Update `components/transaction-form.tsx`.
- Update `components/transaction-list.tsx`.
- Update `app/page.tsx` if display or filtering changes.
- Update root docs in `../docs`.

When changing analytics contract:

- Update `lib/api.ts`.
- Update `app/analytics/page.tsx`.
- Update `../docs/api-contract.md`.
- Update backend docs in `../pocket_ledger_mcrs`.

When adding a new authenticated module:

- Add a route under `app/`.
- Reuse auth/token helpers from `lib/api.ts`.
- Keep navigation consistent with `/` and `/analytics`.
- Consider extracting shared shell/layout only when duplication becomes meaningful.
