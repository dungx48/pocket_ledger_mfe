import { config } from './config';
import type { CategoryItem } from './categories';
import type { TransactionType } from './transaction-types';
import { normalizeTransactionType } from './transaction-types';

const API_BASE = config.apiBaseUrl;

let authToken: string | null = null;

export const setAuthToken = (token: string) => {
  authToken = token;
  localStorage.setItem('auth_token', token);
};

export const getAuthToken = () => {
  if (!authToken && typeof window !== 'undefined') {
    authToken = localStorage.getItem('auth_token');
  }
  return authToken;
};

export const clearAuthToken = () => {
  authToken = null;
  localStorage.removeItem('auth_token');
};

export type Transaction = {
  id: string;
  user_id?: string;
  amount: number;
  date: string;
  category_key: string;
  transaction_type: TransactionType;
  note?: string | null;
  created_at?: string;
};

export type TransactionCreate = {
  amount: number;
  date: string;
  category_key: string;
  transaction_type: TransactionType;
  note?: string | null;
};

export type TransactionUpdate = Partial<TransactionCreate>;

export type TransactionListParams = {
  dateFrom?: string;
  dateTo?: string;
  skip?: number;
  limit?: number;
};

export type MonthlyTransactionSummary = {
  month: string;
  expense: number;
  income: number;
  transaction_count: number;
};

export type WeeklyTransactionSummary = {
  week_start: string;
  week_end: string;
  expense: number;
  income: number;
  transaction_count: number;
};

function normalizeTransaction(data: Transaction): Transaction {
  return {
    ...data,
    transaction_type: normalizeTransactionType(data.transaction_type),
  };
}

const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE}${endpoint}`;

  // ✅ KHÔNG set cứng Content-Type = json nữa
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Xử lý 401 Unauthorized - token hết hạn hoặc không hợp lệ
  if (response.status === 401) {
    clearAuthToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Phiên đăng nhập đã hết hạn');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.detail || error.message || 'API Error');
  }

  // với DELETE có thể không có body
  if (response.status === 204) return null;
  return response.json();
};

// ✅ Helper cho JSON endpoints (transactions...)
const apiJson = (endpoint: string, options: RequestInit = {}) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  return apiCall(endpoint, { ...options, headers });
};

// Auth ✅ form-urlencoded đúng với OAuth2PasswordRequestForm
export const login = (username: string, password: string) => {
  const body = new URLSearchParams();
  body.set('username', username);
  body.set('password', password);

  return apiCall('/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
};

// Transactions (giữ JSON)
export const listTransactions = (skip: number = 0, limit: number = 100) => {
  return apiCall(`/transactions/?skip=${skip}&limit=${limit}`, { method: 'GET' }).then((data) =>
    Array.isArray(data) ? data.map(normalizeTransaction) : [],
  );
};

export const listTransactionsByDateRange = ({
  dateFrom,
  dateTo,
  skip = 0,
  limit = 100,
}: TransactionListParams = {}) => {
  const params = new URLSearchParams({
    skip: String(skip),
    limit: String(limit),
  });

  if (dateFrom) params.set('date_from', dateFrom);
  if (dateTo) params.set('date_to', dateTo);

  return apiCall(`/transactions/?${params.toString()}`, { method: 'GET' }).then((data) =>
    Array.isArray(data) ? data.map(normalizeTransaction) : [],
  );
};

export const fetchMonthlyTransactionSummary = (dateFrom?: string, dateTo?: string) => {
  const params = new URLSearchParams();

  if (dateFrom) params.set('date_from', dateFrom);
  if (dateTo) params.set('date_to', dateTo);

  const query = params.toString();

  return apiCall(`/transactions/summary/monthly${query ? `?${query}` : ''}`, {
    method: 'GET',
  }).then((data) => (Array.isArray(data) ? (data as MonthlyTransactionSummary[]) : []));
};

export const fetchWeeklyTransactionSummary = (dateFrom: string, dateTo: string) => {
  const params = new URLSearchParams({
    date_from: dateFrom,
    date_to: dateTo,
  });

  return apiCall(`/transactions/summary/weekly?${params.toString()}`, { method: 'GET' }).then((data) =>
    Array.isArray(data) ? (data as WeeklyTransactionSummary[]) : [],
  );
};

export const createTransaction = (data: TransactionCreate) => {
  return apiJson('/transactions/', {
    method: 'POST',
    body: JSON.stringify({
      ...data,
      transaction_type: normalizeTransactionType(data.transaction_type),
    }),
  }).then(normalizeTransaction);
};

export const updateTransaction = (id: string, data: TransactionUpdate) => {
  return apiJson(`/transactions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(
      data.transaction_type
        ? { ...data, transaction_type: normalizeTransactionType(data.transaction_type) }
        : data,
    ),
  }).then(normalizeTransaction);
};

export const deleteTransaction = (id: string) => {
  return apiCall(`/transactions/${id}`, { method: 'DELETE' });
};

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed: ${res.status}`);
  }

  return (await res.json()) as T;
}

export async function fetchCategories(): Promise<CategoryItem[]> {
  return apiFetch<CategoryItem[]>('/categories');
}
