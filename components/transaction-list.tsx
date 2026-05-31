'use client';

import { Transaction } from '@/lib/api';
import { useCategories } from '@/app/categories-provider';
import { Button } from '@/components/ui/button';
import { Trash2, Pencil } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { isIncomeTransaction } from '@/lib/transaction-types';

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  income: { label: 'Thu nhập', color: 'bg-green-100 text-green-800' },
  expense: { label: 'Chi tiêu', color: 'bg-red-100 text-red-800' },
  food: { label: 'Ăn uống', color: 'bg-orange-100 text-orange-800' },
  transport: { label: 'Giao thông', color: 'bg-blue-100 text-blue-800' },
  entertainment: { label: 'Giải trí', color: 'bg-purple-100 text-purple-800' },
  utilities: { label: 'Tiện ích', color: 'bg-cyan-100 text-cyan-800' },
  health: { label: 'Sức khỏe', color: 'bg-pink-100 text-pink-800' },
  other: { label: 'Khác', color: 'bg-gray-100 text-gray-800' },
};

interface Props {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

type TransactionWithLegacyCategory = Transaction & {
  category_id?: string;
};

type TransactionGroup = {
  dateKey: string;
  items: Transaction[];
};

function getTransactionDateKey(date: string) {
  return date.slice(0, 10);
}

function formatTransactionDate(dateKey: string) {
  return format(parseISO(dateKey), 'EEEE, dd MMM yyyy', { locale: vi });
}

export function TransactionList({ transactions, onEdit, onDelete, loading }: Props) {
  const { categories } = useCategories();
  const categoryLabelMap = Object.fromEntries(
    categories.flatMap((category) =>
      [category.key, category.value, category.id]
        .filter((key): key is string => Boolean(key))
        .map((key) => [key, category.description]),
    ),
  );

  const groupedTransactions = Array.from(
    transactions
      .reduce<Map<string, TransactionGroup>>((groups, txn) => {
        const dateKey = getTransactionDateKey(txn.date);
        const group = groups.get(dateKey);

        if (group) {
          group.items.push(txn);
        } else {
          groups.set(dateKey, { dateKey, items: [txn] });
        }

        return groups;
      }, new Map())
      .values(),
  );

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Chưa có giao dịch nào. Hãy tạo giao dịch đầu tiên!</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {groupedTransactions.map((group) => {
        const dailyIncome = group.items
          .filter((txn) => isIncomeTransaction(txn.transaction_type))
          .reduce((sum, txn) => sum + txn.amount, 0);
        const dailyExpense = group.items
          .filter((txn) => !isIncomeTransaction(txn.transaction_type))
          .reduce((sum, txn) => sum + txn.amount, 0);

        return (
          <section key={group.dateKey} className="space-y-3">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm ring-1 ring-amber-100">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-7 w-1.5 rounded-full bg-amber-500" />
                  <h3 className="text-sm font-semibold capitalize text-gray-950">
                    {formatTransactionDate(group.dateKey)}
                  </h3>
                </div>
                <p className="ml-3 mt-1 text-xs font-medium text-amber-800">
                  {group.items.length} giao dịch trong ngày
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                {dailyIncome > 0 && (
                  <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-green-700">
                    +{dailyIncome.toLocaleString('vi-VN')}đ
                  </span>
                )}
                {dailyExpense > 0 && (
                  <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-red-700">
                    -{dailyExpense.toLocaleString('vi-VN')}đ
                  </span>
                )}
              </div>
              </div>
            </div>

            <div className="space-y-2">
              {group.items.map((txn) => {
                const categoryKey =
                  (txn as TransactionWithLegacyCategory).category_key ||
                  (txn as TransactionWithLegacyCategory).category_id ||
                  '';
                const category = {
                  label:
                    categoryLabelMap[categoryKey] ||
                    CATEGORY_LABELS[categoryKey]?.label ||
                    categoryKey ||
                    'Không rõ danh mục',
                  color: CATEGORY_LABELS[categoryKey]?.color || 'bg-gray-100 text-gray-800',
                };
                const isIncome = isIncomeTransaction(txn.transaction_type);

                return (
                  <div
                    key={txn.id}
                    className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${category.color}`}>
                          {category.label}
                        </span>
                      </div>
                      {txn.note && <p className="truncate text-sm text-gray-600">{txn.note}</p>}
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <span className={`text-lg font-bold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                        {isIncome ? '+' : '-'}
                        {txn.amount.toLocaleString('vi-VN')}đ
                      </span>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(txn)}
                        disabled={loading}
                        className="px-2"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDelete(txn.id)}
                        disabled={loading}
                        className="border-red-200 px-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
