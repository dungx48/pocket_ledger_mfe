import { isTransactionType, normalizeTransactionType, TRANSACTION_TYPES } from './transaction-types';

// Category types
export interface CategoryItem {
  id: string;
  description: string;
  key: string;
  value: string;
  is_active: string;
  table_name: string;
  field_name: string;
}

export interface Category {
  id?: string;
  key: string;
  description: string;
  value: string;
}

const CACHE_KEY_CATEGORIES = 'app_categories';
const CACHE_KEY_TRANSACTION_TYPES = 'app_transaction_types';

// Parse categories from API response
export function parseCategories(data: CategoryItem[]): Category[] {
  return data
    .filter((item) => item.field_name === 'category_key' && item.is_active === '1')
    .map((item) => ({
      id: item.id,
      key: item.key,
      description: item.description,
      value: item.value,
    }));
}

// Parse transaction types from API response
export function parseTransactionTypes(data: CategoryItem[]): Category[] {
  const parsed = data
    .filter((item) => item.field_name === 'transaction_type' && item.is_active === '1')
    .filter((item) => isTransactionType(item.key))
    .map((item) => ({
      id: item.id,
      key: normalizeTransactionType(item.key),
      description: item.description,
      value: normalizeTransactionType(item.key),
    }));

  const byKey = new Map<string, Category>();
  for (const item of parsed) {
    byKey.set(item.key, item);
  }

  if (!byKey.has(TRANSACTION_TYPES.income)) {
    byKey.set(TRANSACTION_TYPES.income, {
      key: TRANSACTION_TYPES.income,
      description: 'Thu nhập',
      value: TRANSACTION_TYPES.income,
    });
  }

  if (!byKey.has(TRANSACTION_TYPES.expense)) {
    byKey.set(TRANSACTION_TYPES.expense, {
      key: TRANSACTION_TYPES.expense,
      description: 'Chi tiêu',
      value: TRANSACTION_TYPES.expense,
    });
  }

  return Array.from(byKey.values());
}

// Get categories from localStorage or empty array
export function getCategoriesFromCache(): Category[] {
  if (typeof window === 'undefined') return [];
  const cached = localStorage.getItem(CACHE_KEY_CATEGORIES);
  console.log('[app] getCategoriesFromCache - stored value:', cached);
  return cached ? JSON.parse(cached) : [];
}

// Get transaction types from localStorage or empty array
export function getTransactionTypesFromCache(): Category[] {
  if (typeof window === 'undefined') return [];
  const cached = localStorage.getItem(CACHE_KEY_TRANSACTION_TYPES);
  console.log('[app] getTransactionTypesFromCache - stored value:', cached);
  if (!cached) return [];

  return (JSON.parse(cached) as Category[])
    .filter((item) => isTransactionType(item.key))
    .map((item) => ({
      ...item,
      key: normalizeTransactionType(item.key),
      value: normalizeTransactionType(item.key),
    }));
}

// Save categories to localStorage
export function saveCategoriesCache(categories: Category[]): void {
  if (typeof window === 'undefined') return;
  console.log('[app] Saving categories to localStorage:', categories);
  localStorage.setItem(CACHE_KEY_CATEGORIES, JSON.stringify(categories));
}

// Save transaction types to localStorage
export function saveTransactionTypesCache(types: Category[]): void {
  if (typeof window === 'undefined') return;
  console.log('[app] Saving transaction types to localStorage:', types);
  localStorage.setItem(CACHE_KEY_TRANSACTION_TYPES, JSON.stringify(types));
}

// Save all categories data to cache
export function saveCategoriesData(data: CategoryItem[]): void {
  console.log('[app] saveCategoriesData called with:', data);
  const categories = parseCategories(data);
  const transactionTypes = parseTransactionTypes(data);
  console.log('[app] Parsed categories:', categories);
  console.log('[app] Parsed transaction types:', transactionTypes);
  saveCategoriesCache(categories);
  saveTransactionTypesCache(transactionTypes);
}
