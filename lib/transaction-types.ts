export const TRANSACTION_TYPES = {
  income: 'income',
  expense: 'expense',
} as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[keyof typeof TRANSACTION_TYPES];

const INCOME_VALUES = new Set(['income', '1', 'thu', 'in']);
const EXPENSE_VALUES = new Set(['expense', '2', 'chi', 'out']);

export function normalizeTransactionType(value: unknown): TransactionType {
  const normalized = String(value ?? '').trim().toLowerCase();

  if (INCOME_VALUES.has(normalized)) {
    return TRANSACTION_TYPES.income;
  }

  if (EXPENSE_VALUES.has(normalized)) {
    return TRANSACTION_TYPES.expense;
  }

  return TRANSACTION_TYPES.expense;
}

export function isIncomeTransaction(value: unknown): boolean {
  return normalizeTransactionType(value) === TRANSACTION_TYPES.income;
}
