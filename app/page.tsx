'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  addDays,
  compareDesc,
  endOfMonth,
  format,
  parseISO,
  startOfMonth,
  subDays,
} from 'date-fns';
import {
  createTransaction,
  deleteTransaction,
  fetchMonthlyTransactionSummary,
  fetchWeeklyTransactionSummary,
  getAuthToken,
  clearAuthToken,
  listTransactionsByDateRange,
  MonthlyTransactionSummary,
  Transaction,
  updateTransaction,
  WeeklyTransactionSummary,
} from '@/lib/api';
import { TransactionForm } from '@/components/transaction-form';
import { TransactionList } from '@/components/transaction-list';
import { Button } from '@/components/ui/button';
import { BarChart3, ChevronDown, ChevronRight, LogOut, ReceiptText } from 'lucide-react';

const PAGE_SIZE = 100;
const DEFAULT_WINDOW_DAYS = 7;

type SelectedRange =
  | { type: 'default'; page: number }
  | { type: 'month'; monthKey: string }
  | { type: 'week'; monthKey: string; weekIndex: number };

type DateRange = {
  dateFrom: string;
  dateTo: string;
};

type WeekSummary = {
  index: number;
  start: Date;
  end: Date;
  expense: number;
  transactionCount: number;
};

type MonthSummary = {
  key: string;
  start: Date;
  end: Date;
  expense: number;
  transactionCount: number;
};

function parseTransactionDate(transaction: Transaction) {
  return parseISO(transaction.date.slice(0, 10));
}

function sortTransactions(transactions: Transaction[]) {
  return [...transactions].sort((a, b) => compareDesc(parseTransactionDate(a), parseTransactionDate(b)));
}

function formatDateParam(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

function getDefaultWindowRange(page: number): DateRange {
  const end = subDays(new Date(), page * DEFAULT_WINDOW_DAYS);
  const start = subDays(end, DEFAULT_WINDOW_DAYS - 1);

  return {
    dateFrom: formatDateParam(start),
    dateTo: formatDateParam(end),
  };
}

function getDefaultAccumulatedRange(page: number): DateRange {
  const end = new Date();
  const start = subDays(end, (page + 1) * DEFAULT_WINDOW_DAYS - 1);

  return {
    dateFrom: formatDateParam(start),
    dateTo: formatDateParam(end),
  };
}

function getMonthRange(monthKey: string): DateRange {
  const start = startOfMonth(parseISO(`${monthKey}-01`));
  const end = endOfMonth(start);

  return {
    dateFrom: formatDateParam(start),
    dateTo: formatDateParam(end),
  };
}

function formatCurrency(amount: number) {
  return `${amount.toLocaleString('vi-VN')}đ`;
}

function formatDayRange(start: Date, end: Date) {
  return `${format(start, 'dd/MM')} - ${format(end, 'dd/MM')}`;
}

function mapMonthSummary(summary: MonthlyTransactionSummary): MonthSummary {
  const start = startOfMonth(parseISO(`${summary.month}-01`));

  return {
    key: summary.month,
    start,
    end: endOfMonth(start),
    expense: summary.expense,
    transactionCount: summary.transaction_count,
  };
}

function mapWeekSummary(summary: WeeklyTransactionSummary, index: number): WeekSummary {
  return {
    index,
    start: parseISO(summary.week_start),
    end: parseISO(summary.week_end),
    expense: summary.expense,
    transactionCount: summary.transaction_count,
  };
}

async function fetchAllTransactionsInRange(range: DateRange) {
  const transactions: Transaction[] = [];
  let skip = 0;
  let hasNextPage = true;

  while (hasNextPage) {
    const items = await listTransactionsByDateRange({
      dateFrom: range.dateFrom,
      dateTo: range.dateTo,
      skip,
      limit: PAGE_SIZE,
    });

    transactions.push(...items);
    skip += items.length;
    hasNextPage = items.length === PAGE_SIZE;
  }

  return sortTransactions(transactions);
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlySummaries, setMonthlySummaries] = useState<MonthSummary[]>([]);
  const [weeklySummariesByMonth, setWeeklySummariesByMonth] = useState<Record<string, WeekSummary[]>>({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedRange, setSelectedRange] = useState<SelectedRange>({ type: 'default', page: 0 });
  const [expandedMonthKey, setExpandedMonthKey] = useState<string | null>(null);
  const initialLoadStartedRef = useRef(false);
  const weeklySummaryRequestsRef = useRef<Partial<Record<string, Promise<WeekSummary[]>>>>({});
  const router = useRouter();

  useEffect(() => {
    if (initialLoadStartedRef.current) return;

    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    initialLoadStartedRef.current = true;
    loadInitialData();
  }, [router]);

  const loadMonthlySummaries = async () => {
    const summaries = await fetchMonthlyTransactionSummary();
    setMonthlySummaries(summaries.map(mapMonthSummary));
  };

  const loadWeeklySummaries = async (monthKey: string) => {
    if (weeklySummariesByMonth[monthKey]) return weeklySummariesByMonth[monthKey];
    if (weeklySummaryRequestsRef.current[monthKey]) return weeklySummaryRequestsRef.current[monthKey];

    const monthRange = getMonthRange(monthKey);
    const request = fetchWeeklyTransactionSummary(monthRange.dateFrom, monthRange.dateTo)
      .then((summaries) => {
        const weeks = summaries.map(mapWeekSummary);

        setWeeklySummariesByMonth((prev) => ({ ...prev, [monthKey]: weeks }));
        return weeks;
      })
      .finally(() => {
        delete weeklySummaryRequestsRef.current[monthKey];
      });

    weeklySummaryRequestsRef.current[monthKey] = request;
    return request;
  };

  const loadInitialData = async () => {
    setLoading(true);

    try {
      const [summaries, defaultTransactions] = await Promise.all([
        fetchMonthlyTransactionSummary(),
        fetchAllTransactionsInRange(getDefaultWindowRange(0)),
      ]);

      setMonthlySummaries(summaries.map(mapMonthSummary));
      setTransactions(defaultTransactions);
      setSelectedRange({ type: 'default', page: 0 });
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const reloadCurrentTransactions = async (range: SelectedRange = selectedRange) => {
    if (range.type === 'month') {
      setTransactions(await fetchAllTransactionsInRange(getMonthRange(range.monthKey)));
      return;
    }

    if (range.type === 'week') {
      const weeks = await loadWeeklySummaries(range.monthKey);
      const week = weeks[range.weekIndex];
      if (!week) {
        setTransactions([]);
        return;
      }

      setTransactions(
        await fetchAllTransactionsInRange({
          dateFrom: formatDateParam(week.start),
          dateTo: formatDateParam(week.end),
        }),
      );
      return;
    }

    setTransactions(await fetchAllTransactionsInRange(getDefaultAccumulatedRange(range.page)));
  };

  const handleCreateOrUpdate = async (formData: any) => {
    try {
      if (editingId) {
        await updateTransaction(editingId, formData);
        setEditingId(null);
      } else {
        await createTransaction(formData);
      }

      await Promise.all([loadMonthlySummaries(), reloadCurrentTransactions()]);
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
      await Promise.all([loadMonthlySummaries(), reloadCurrentTransactions()]);
    } catch (err) {
      console.error('Failed to delete transaction:', err);
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    router.push('/login');
  };

  const handleSelectMonth = async (month: MonthSummary, expanded: boolean) => {
    const isSelectedMonth = selectedRange.type !== 'default' && selectedRange.monthKey === month.key;

    if (expanded) {
      setExpandedMonthKey(null);
      return;
    }

    setExpandedMonthKey(month.key);

    if (isSelectedMonth) {
      if (!weeklySummariesByMonth[month.key]) {
        setLoading(true);
        try {
          await loadWeeklySummaries(month.key);
        } catch (err) {
          console.error('Failed to load weekly summary:', err);
        } finally {
          setLoading(false);
        }
      }
      return;
    }

    const nextRange: SelectedRange = { type: 'month', monthKey: month.key };

    setSelectedRange(nextRange);
    setLoading(true);

    try {
      await Promise.all([
        fetchAllTransactionsInRange(getMonthRange(month.key)).then(setTransactions),
        loadWeeklySummaries(month.key),
      ]);
    } catch (err) {
      console.error('Failed to load month data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectWeek = async (monthKey: string, week: WeekSummary) => {
    const nextRange: SelectedRange = { type: 'week', monthKey, weekIndex: week.index };

    setSelectedRange(nextRange);
    setLoading(true);

    try {
      setTransactions(
        await fetchAllTransactionsInRange({
          dateFrom: formatDateParam(week.start),
          dateTo: formatDateParam(week.end),
        }),
      );
    } catch (err) {
      console.error('Failed to load week transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetRecent = async () => {
    const nextRange: SelectedRange = { type: 'default', page: 0 };

    setSelectedRange(nextRange);
    setLoading(true);

    try {
      setTransactions(await fetchAllTransactionsInRange(getDefaultWindowRange(0)));
    } catch (err) {
      console.error('Failed to load recent transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadPreviousDays = async () => {
    if (selectedRange.type !== 'default') return;

    const nextPage = selectedRange.page + 1;
    setLoadingMore(true);

    try {
      const olderTransactions = await fetchAllTransactionsInRange(getDefaultWindowRange(nextPage));
      setTransactions((prev) => sortTransactions([...prev, ...olderTransactions]));
      setSelectedRange({ type: 'default', page: nextPage });
    } catch (err) {
      console.error('Failed to load previous transactions:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const editingTransaction = transactions.find((transaction) => transaction.id === editingId);

  const hasMoreDefaultDays = useMemo(() => {
    if (selectedRange.type !== 'default' || monthlySummaries.length === 0) return false;

    const currentRange = getDefaultAccumulatedRange(selectedRange.page);
    const oldestMonth = monthlySummaries[monthlySummaries.length - 1];

    return parseISO(currentRange.dateFrom) > oldestMonth.start;
  }, [monthlySummaries, selectedRange]);

  const listTitle = useMemo(() => {
    if (selectedRange.type === 'month') {
      const month = monthlySummaries.find((item) => item.key === selectedRange.monthKey);
      return month ? `Giao dịch tháng ${format(month.start, 'MM/yyyy')}` : 'Giao dịch';
    }

    if (selectedRange.type === 'week') {
      const week = weeklySummariesByMonth[selectedRange.monthKey]?.[selectedRange.weekIndex];
      return week
        ? `Giao dịch tuần ${week.index + 1} (${formatDayRange(week.start, week.end)})`
        : 'Giao dịch';
    }

    const range = getDefaultAccumulatedRange(selectedRange.page);
    return `Giao dịch gần đây (${formatDayRange(parseISO(range.dateFrom), parseISO(range.dateTo))})`;
  }, [monthlySummaries, selectedRange, weeklySummariesByMonth]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản Lý Chi Tiêu</h1>
            <nav className="mt-2 flex gap-2">
              <Button size="sm" className="bg-indigo-600 text-white hover:bg-indigo-700">
                <ReceiptText className="mr-2 h-4 w-4" />
                Giao dịch
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/analytics">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Thống kê
                </Link>
              </Button>
            </nav>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Đăng xuất
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
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
              <div className="space-y-4">
                <Button
                  onClick={() => setShowForm(true)}
                  className="w-full bg-indigo-600 py-6 text-lg font-medium text-white hover:bg-indigo-700"
                >
                  + Thêm giao dịch
                </Button>

                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h2 className="text-base font-semibold text-gray-900">Thống kê theo tháng</h2>
                    {selectedRange.type !== 'default' && (
                      <Button type="button" variant="outline" size="sm" onClick={handleResetRecent}>
                        Gần đây
                      </Button>
                    )}
                  </div>

                  {monthlySummaries.length === 0 ? (
                    <p className="py-6 text-center text-sm text-gray-500">Chưa có dữ liệu thống kê.</p>
                  ) : (
                    <div className="space-y-2">
                      {monthlySummaries.map((month) => {
                        const expanded = expandedMonthKey === month.key;
                        const selected = selectedRange.type !== 'default' && selectedRange.monthKey === month.key;
                        const weeks = weeklySummariesByMonth[month.key] || [];

                        return (
                          <div
                            key={month.key}
                            className={`rounded-lg border ${
                              selected ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200 bg-white'
                            }`}
                          >
                            <button
                              type="button"
                              className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left"
                              onClick={() => handleSelectMonth(month, expanded)}
                            >
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-950">
                                  Tháng {format(month.start, 'MM/yyyy')}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {month.transactionCount} giao dịch
                                </p>
                              </div>
                              <div className="flex shrink-0 items-center gap-2">
                                <span className="font-bold text-red-600">{formatCurrency(month.expense)}</span>
                                {expanded ? (
                                  <ChevronDown className="h-4 w-4 text-gray-500" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-gray-500" />
                                )}
                              </div>
                            </button>

                            {expanded && (
                              <div className="space-y-1 border-t border-gray-200 px-2 py-2">
                                {weeks.map((week) => {
                                  const weekSelected =
                                    selectedRange.type === 'week' &&
                                    selectedRange.monthKey === month.key &&
                                    selectedRange.weekIndex === week.index;

                                  return (
                                    <button
                                      key={`${month.key}-${week.index}`}
                                      type="button"
                                      className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm ${
                                        weekSelected
                                          ? 'bg-indigo-100 text-indigo-900'
                                          : 'text-gray-700 hover:bg-gray-50'
                                      }`}
                                      onClick={() => handleSelectWeek(month.key, week)}
                                    >
                                      <span>
                                        Tuần {week.index + 1} ({formatDayRange(week.start, week.end)})
                                      </span>
                                      <span className="shrink-0 font-semibold text-red-600">
                                        {formatCurrency(week.expense)}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">{listTitle}</h2>
              {loading ? (
                <div className="py-8 text-center text-gray-500">Đang tải...</div>
              ) : (
                <>
                  <TransactionList
                    transactions={transactions}
                    onEdit={(transaction) => setEditingId(transaction.id)}
                    onDelete={handleDelete}
                    loading={loading || loadingMore}
                  />
                  {hasMoreDefaultDays && (
                    <div className="mt-4 flex justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleLoadPreviousDays}
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
