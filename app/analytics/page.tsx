'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { endOfMonth, format, startOfMonth, subMonths } from 'date-fns';
import { BarChart3, LogOut, ReceiptText, RefreshCw } from 'lucide-react';
import {
  AnalyticsByCategory,
  AnalyticsOverview,
  AnalyticsTimeseries,
  clearAuthToken,
  fetchAnalyticsByCategory,
  fetchAnalyticsOverview,
  fetchAnalyticsTimeseries,
  getAuthToken,
} from '@/lib/api';
import { TRANSACTION_TYPES, TransactionType } from '@/lib/transaction-types';
import { useCategories } from '@/app/categories-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type PresetRange = 'current-month' | 'last-3-months' | 'current-year' | 'custom';
type TransactionTypeFilter = TransactionType | 'all';

function formatDateParam(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

function getPresetRange(preset: PresetRange) {
  const now = new Date();

  if (preset === 'last-3-months') {
    return {
      dateFrom: formatDateParam(startOfMonth(subMonths(now, 2))),
      dateTo: formatDateParam(endOfMonth(now)),
    };
  }

  if (preset === 'current-year') {
    return {
      dateFrom: `${format(now, 'yyyy')}-01-01`,
      dateTo: `${format(now, 'yyyy')}-12-31`,
    };
  }

  return {
    dateFrom: formatDateParam(startOfMonth(now)),
    dateTo: formatDateParam(endOfMonth(now)),
  };
}

function formatCurrency(amount: number) {
  return `${amount.toLocaleString('vi-VN')}d`;
}

function getCategoryName(categories: { key: string; description: string }[], key: string) {
  return categories.find((category) => category.key === key)?.description || key;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { categories } = useCategories();
  const initialRange = useMemo(() => getPresetRange('current-month'), []);

  const [preset, setPreset] = useState<PresetRange>('current-month');
  const [dateFrom, setDateFrom] = useState(initialRange.dateFrom);
  const [dateTo, setDateTo] = useState(initialRange.dateTo);
  const [transactionType, setTransactionType] = useState<TransactionTypeFilter>('all');
  const [categoryKey, setCategoryKey] = useState('all');
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [byCategory, setByCategory] = useState<AnalyticsByCategory[]>([]);
  const [timeseries, setTimeseries] = useState<AnalyticsTimeseries[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedCategoryKey = categoryKey === 'all' ? undefined : categoryKey;

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const [nextOverview, nextByCategory, nextTimeseries] = await Promise.all([
        fetchAnalyticsOverview(dateFrom, dateTo, transactionType, selectedCategoryKey),
        fetchAnalyticsByCategory({
          dateFrom,
          dateTo,
          transactionType,
          categoryKey: selectedCategoryKey,
        }),
        fetchAnalyticsTimeseries({
          dateFrom,
          dateTo,
          groupBy: preset === 'current-year' ? 'month' : 'day',
          transactionType,
          categoryKey: selectedCategoryKey,
        }),
      ]);

      setOverview(nextOverview);
      setByCategory(nextByCategory);
      setTimeseries(nextTimeseries);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError(err instanceof Error ? err.message : 'Khong tai duoc du lieu thong ke');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    loadAnalytics();
  }, [dateFrom, dateTo, transactionType, categoryKey, router]);

  const handlePresetChange = (value: PresetRange) => {
    setPreset(value);

    if (value !== 'custom') {
      const range = getPresetRange(value);
      setDateFrom(range.dateFrom);
      setDateTo(range.dateTo);
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    router.push('/login');
  };

  const maxCategoryAmount = Math.max(...byCategory.map((item) => item.amount), 0);
  const maxSeriesExpense = Math.max(...timeseries.map((item) => item.expense), 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quan Ly Chi Tieu</h1>
            <nav className="mt-2 flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/">
                  <ReceiptText className="mr-2 h-4 w-4" />
                  Giao dich
                </Link>
              </Button>
              <Button asChild size="sm" className="bg-indigo-600 text-white hover:bg-indigo-700">
                <Link href="/analytics">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Thong ke
                </Link>
              </Button>
            </nav>
          </div>
          <Button onClick={handleLogout} variant="outline" className="text-gray-700 hover:bg-gray-100">
            <LogOut className="mr-2 h-4 w-4" />
            Dang xuat
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <section className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
          <div className="grid gap-4 md:grid-cols-5">
            <div>
              <Label>Khoang thoi gian</Label>
              <Select value={preset} onValueChange={(value) => handlePresetChange(value as PresetRange)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-month">Thang hien tai</SelectItem>
                  <SelectItem value="last-3-months">3 thang gan nhat</SelectItem>
                  <SelectItem value="current-year">Nam hien tai</SelectItem>
                  <SelectItem value="custom">Tuy chon</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date-from">Tu ngay</Label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(event) => {
                  setPreset('custom');
                  setDateFrom(event.target.value);
                }}
              />
            </div>
            <div>
              <Label htmlFor="date-to">Den ngay</Label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(event) => {
                  setPreset('custom');
                  setDateTo(event.target.value);
                }}
              />
            </div>
            <div>
              <Label>Loai giao dich</Label>
              <Select
                value={transactionType}
                onValueChange={(value) => setTransactionType(value as TransactionTypeFilter)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tat ca</SelectItem>
                  <SelectItem value={TRANSACTION_TYPES.expense}>Chi tieu</SelectItem>
                  <SelectItem value={TRANSACTION_TYPES.income}>Thu nhap</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Danh muc</Label>
              <Select value={categoryKey} onValueChange={setCategoryKey}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tat ca</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.key} value={category.key}>
                      {category.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-500">Tong thu</p>
            <p className="mt-2 text-xl font-bold text-emerald-600">
              {overview ? formatCurrency(overview.income) : '--'}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-500">Tong chi</p>
            <p className="mt-2 text-xl font-bold text-red-600">
              {overview ? formatCurrency(overview.expense) : '--'}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-500">Chenh lech</p>
            <p className="mt-2 text-xl font-bold text-gray-900">
              {overview ? formatCurrency(overview.balance) : '--'}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-500">So giao dich</p>
            <p className="mt-2 text-xl font-bold text-gray-900">
              {overview ? overview.transaction_count.toLocaleString('vi-VN') : '--'}
            </p>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-gray-900">Thong ke theo danh muc</h2>
              <Button type="button" variant="outline" size="sm" onClick={loadAnalytics} disabled={loading}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Tai lai
              </Button>
            </div>
            {loading ? (
              <div className="py-10 text-center text-gray-500">Dang tai...</div>
            ) : byCategory.length === 0 ? (
              <div className="py-10 text-center text-gray-500">Khong co du lieu trong khoang da chon.</div>
            ) : (
              <div className="space-y-4">
                {byCategory.map((item) => {
                  const width = maxCategoryAmount ? `${Math.max((item.amount / maxCategoryAmount) * 100, 3)}%` : '3%';
                  return (
                    <div key={item.category_key}>
                      <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                        <span className="font-medium text-gray-900">
                          {getCategoryName(categories, item.category_key)}
                        </span>
                        <span className="text-gray-600">
                          {formatCurrency(item.amount)} - {item.percentage.toLocaleString('vi-VN')}%
                        </span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full rounded-full bg-indigo-600" style={{ width }} />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">{item.transaction_count} giao dich</p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Chi tieu theo thoi gian</h2>
            {loading ? (
              <div className="py-10 text-center text-gray-500">Dang tai...</div>
            ) : timeseries.length === 0 ? (
              <div className="py-10 text-center text-gray-500">Khong co du lieu trong khoang da chon.</div>
            ) : (
              <div className="space-y-3">
                {timeseries.slice(-12).map((item) => {
                  const width = maxSeriesExpense ? `${Math.max((item.expense / maxSeriesExpense) * 100, 3)}%` : '3%';
                  return (
                    <div key={item.period} className="grid grid-cols-[96px_1fr_110px] items-center gap-3 text-sm">
                      <span className="text-gray-600">{item.period}</span>
                      <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full rounded-full bg-red-500" style={{ width }} />
                      </div>
                      <span className="text-right font-medium text-gray-900">{formatCurrency(item.expense)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
