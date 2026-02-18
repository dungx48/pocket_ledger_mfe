import { config } from './config';
import type { CategoryItem } from './categories';

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

const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE}${endpoint}`;

  // ✅ KHÔNG set cứng Content-Type = json nữa
  const headers: HeadersInit = {
    ...(options.headers || {}),
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

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
  return apiCall(`/transactions/?skip=${skip}&limit=${limit}`, { method: 'GET' });
};

export const createTransaction = (data: TransactionCreate) => {
  return apiJson('/transactions/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateTransaction = (id: string, data: TransactionUpdate) => {
  return apiJson(`/transactions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
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
