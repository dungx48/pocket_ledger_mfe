export const TRANSACTION_TYPES = {
  income: '1',
  expense: '2',
} as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[keyof typeof TRANSACTION_TYPES];

export function isTransactionType(value: unknown): value is TransactionType {
  const normalized = String(value ?? '').trim();
  return normalized === TRANSACTION_TYPES.income || normalized === TRANSACTION_TYPES.expense;
}

export function normalizeTransactionType(value: unknown): TransactionType {
  const normalized = String(value ?? '').trim();
  if (isTransactionType(normalized)) {
    return normalized;
  }

  throw new Error('transaction_type must be 1 or 2');
}

export function isIncomeTransaction(value: unknown): boolean {
  return String(value ?? '').trim() === TRANSACTION_TYPES.income;
}
