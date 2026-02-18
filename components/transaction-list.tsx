'use client';

import { Transaction } from '@/lib/api';
import { useCategories } from '@/app/categories-provider';
import { Button } from '@/components/ui/button';
import { Trash2, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

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

export function TransactionList({ transactions, onEdit, onDelete, loading }: Props) {
  const { categories } = useCategories();
  const isIncomeTransaction = (transactionType: unknown) =>
    transactionType === '1' || transactionType === 1 || transactionType === 'income';
  const categoryLabelMap = Object.fromEntries(
    categories.map((category) => [category.key, category.description]),
  );

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Chưa có giao dịch nào. Hãy tạo giao dịch đầu tiên!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((txn) => {
        const categoryKey =
          (txn as Transaction & { category_key?: string; category_id?: string }).category_key ||
          (txn as Transaction & { category_key?: string; category_id?: string }).category_id ||
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
            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${category.color}`}>
                  {category.label}
                </span>
                <span className="text-sm text-gray-500">
                  {format(new Date(txn.date), 'dd MMM yyyy', { locale: vi })}
                </span>
              </div>
              {txn.note && <p className="text-sm text-gray-600">{txn.note}</p>}
            </div>

            <div className="flex items-center gap-3">
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
                <Pencil className="w-4 h-4" />
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(txn.id)}
                disabled={loading}
                className="px-2 text-red-600 hover:text-red-700 border-red-200"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
