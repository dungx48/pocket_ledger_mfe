'use client';

import { useState, FormEvent, useEffect } from 'react';
import { Transaction, TransactionCreate, TransactionUpdate } from '@/lib/api';
import { useCategories } from '@/app/categories-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface Props {
  onSubmit: (data: TransactionCreate | TransactionUpdate) => Promise<void>;
  initialData?: Transaction;
  loading?: boolean;
  onCancel?: () => void;
}

export function TransactionForm({ onSubmit, initialData, loading, onCancel }: Props) {
  const {
    categories,
    transactionTypes,
    loading: loadingCategories,
    error: categoryError,
  } = useCategories();
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [categoryKey, setCategoryKey] = useState('');
  const [transactionType, setTransactionType] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const formatWithDot = (value: string) => value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const formatThousandInput = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (!digits) return '';
    return formatWithDot(digits);
  };
  const parseThousandInput = (value: string) => Number(value.replace(/\./g, ''));

  // Set form values khi edit / create
  useEffect(() => {
    if (initialData) {
      setAmount(formatThousandInput(String(Math.round(initialData.amount / 1000))));
      setDate(initialData.date);
      setCategoryKey(initialData.category_key);
      setTransactionType(initialData.transaction_type);
      setNote(initialData.note || '');
    } else {
      const today = new Date().toISOString().split('T')[0];
      setDate(today);

      if (categories.length > 0 && !categoryKey) {
        setCategoryKey(categories[0].key);
      }
      if (transactionTypes.length > 0 && !transactionType) {
        const preferredType = transactionTypes.find((type) => type.key === 'expense');
        setTransactionType(preferredType?.key || transactionTypes[0].key);
      }
    }
  }, [initialData, categories, transactionTypes, categoryKey, transactionType]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const parsedAmount = parseThousandInput(amount);
      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        throw new Error('Số tiền không hợp lệ');
      }
      const data = {
        amount: parsedAmount * 1000,
        date,
        category_key: categoryKey,
        transaction_type: transactionType,
        ...(note && { note }),
      };
      await onSubmit(data);

      if (!initialData) {
        setAmount('');
        setNote('');
        if (categories.length > 0) {
          setCategoryKey(categories[0].key);
        }
        if (transactionTypes.length > 0) {
          const preferredType = transactionTypes.find((type) => type.key === 'expense');
          setTransactionType(preferredType?.key || transactionTypes[0].key);
        }
        const today = new Date().toISOString().split('T')[0];
        setDate(today);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi lưu giao dịch');
    } finally {
      setSubmitting(false);
    }
  };

  const disabledAll = submitting || !!loading;

  return (
    <Card className="p-6 bg-white border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">
        {initialData ? 'Chỉnh sửa giao dịch' : 'Thêm giao dịch mới'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số tiền (nghìn đ)
            </label>
            <div className="relative">
              <Input
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(formatThousandInput(e.target.value))}
                placeholder="0"
                required
                disabled={disabledAll}
                className="pr-12"
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-gray-500">
                000
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày giao dịch
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              disabled={disabledAll}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Loại giao dịch
          </label>
          <select
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value)}
            disabled={submitting || loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
          >
            <option value="">Chọn loại giao dịch</option>
            {transactionTypes.map((type) => (
              <option key={type.key} value={type.key}>
                {type.description}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Danh mục
          </label>

          <select
            value={categoryKey}
            onChange={(e) => setCategoryKey(e.target.value)}
            disabled={disabledAll || loadingCategories || categories.length === 0}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
            required
          >
            <option value="">Chọn danh mục</option>
            {categories.map((cat) => (
              <option key={cat.key} value={cat.key}>
                {cat.description}
              </option>
            ))}
          </select>

          {categoryError && (
            <div className="mt-2 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded">
              {categoryError}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ghi chú
          </label>
          <Input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            required
            placeholder="Nhập ghi chú..."
            disabled={disabledAll}
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={submitting || loading || !amount || !categoryKey || !transactionType}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
          >
            {submitting ? 'Đang lưu...' : initialData ? 'Cập nhật' : 'Thêm giao dịch'}
          </Button>

          {initialData && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={disabledAll}
            >
              Hủy
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
