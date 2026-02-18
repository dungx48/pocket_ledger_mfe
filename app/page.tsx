'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  listTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getAuthToken,
  clearAuthToken,
  Transaction,
} from '@/lib/api';
import { TransactionForm } from '@/components/transaction-form';
import { TransactionList } from '@/components/transaction-list';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const PAGE_SIZE = 20;

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  // Check auth
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
    } else {
      loadTransactions(true);
    }
  }, [router]);

  const loadTransactions = async (reset: boolean = false) => {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    const skip = reset ? 0 : offset;
    try {
      const data = await listTransactions(skip, PAGE_SIZE);
      const items = Array.isArray(data) ? data : [];

      setHasMore(items.length === PAGE_SIZE);
      setOffset(skip + items.length);
      setTransactions((prev) => (reset ? items : [...prev, ...items]));
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      if (reset) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  const handleCreateOrUpdate = async (formData: any) => {
    try {
      if (editingId) {
        await updateTransaction(editingId, formData);
        setTransactions((prev) =>
          prev.map((t) => (t.id === editingId ? { ...t, ...formData } : t))
        );
        setEditingId(null);
      } else {
        const newTxn = await createTransaction(formData);
        setTransactions((prev) => [newTxn, ...prev.slice(0, PAGE_SIZE - 1)]);
        setOffset((prev) => Math.max(prev, PAGE_SIZE));
      }
      setShowForm(false);
    } catch (err) {
      console.error('Failed to save transaction:', err);
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn chắc chắn muốn xóa giao dịch này?')) return;

    try {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      setOffset((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to delete transaction:', err);
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    router.push('/login');
  };

  const editingTransaction = transactions.find((t) => t.id === editingId);
  const isIncomeTransaction = (transactionType: unknown) =>
    transactionType === '1' || transactionType === 1 || transactionType === 'income';
  const totalIncome = transactions
    .filter((t) => isIncomeTransaction(t.transaction_type))
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => !isIncomeTransaction(t.transaction_type))
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-200 shadow-sm z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Quản Lý Chi Tiêu</h1>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Đăng xuất
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-700 font-medium mb-1">Thu nhập</p>
            <p className="text-2xl font-bold text-green-600">
              {totalIncome.toLocaleString('vi-VN')}đ
            </p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700 font-medium mb-1">Chi tiêu</p>
            <p className="text-2xl font-bold text-red-600">
              {totalExpense.toLocaleString('vi-VN')}đ
            </p>
          </div>
          <div
            className={`${
              balance >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'
            } border rounded-lg p-4`}
          >
            <p className={`text-sm font-medium mb-1 ${balance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
              Số dư
            </p>
            <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              {balance.toLocaleString('vi-VN')}đ
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-1">
            {showForm || editingId ? (
              <TransactionForm
                onSubmit={handleCreateOrUpdate}
                initialData={editingTransaction}
                loading={loading}
                onCancel={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
              />
            ) : (
              <Button
                onClick={() => setShowForm(true)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-6 text-lg"
              >
                + Thêm giao dịch
              </Button>
            )}
          </div>

          {/* List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">Giao dịch gần đây</h2>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Đang tải...</div>
              ) : (
                <>
                  <TransactionList
                    transactions={transactions}
                    onEdit={(txn) => setEditingId(txn.id)}
                    onDelete={handleDelete}
                    loading={loading || loadingMore}
                  />
                  {hasMore && (
                    <div className="mt-4 flex justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => loadTransactions(false)}
                        disabled={loadingMore}
                      >
                        {loadingMore ? 'Đang tải thêm...' : 'Xem thêm'}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
