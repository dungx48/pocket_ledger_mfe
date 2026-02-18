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
      key: item.key,
      description: item.description,
      value: item.value,
    }));
}

// Parse transaction types from API response
export function parseTransactionTypes(data: CategoryItem[]): Category[] {
  return data
    .filter((item) => item.field_name === 'transaction_type' && item.is_active === '1')
    .map((item) => ({
      key: item.key,
      description: item.description,
      value: item.value,
    }));
}

// Get categories from localStorage or empty array
export function getCategoriesFromCache(): Category[] {
  if (typeof window === 'undefined') return [];
  const cached = localStorage.getItem(CACHE_KEY_CATEGORIES);
  console.log('[v0] getCategoriesFromCache - stored value:', cached);
  return cached ? JSON.parse(cached) : [];
}

// Get transaction types from localStorage or empty array
export function getTransactionTypesFromCache(): Category[] {
  if (typeof window === 'undefined') return [];
  const cached = localStorage.getItem(CACHE_KEY_TRANSACTION_TYPES);
  console.log('[v0] getTransactionTypesFromCache - stored value:', cached);
  return cached ? JSON.parse(cached) : [];
}

// Save categories to localStorage
export function saveCategoriesCache(categories: Category[]): void {
  if (typeof window === 'undefined') return;
  console.log('[v0] Saving categories to localStorage:', categories);
  localStorage.setItem(CACHE_KEY_CATEGORIES, JSON.stringify(categories));
}

// Save transaction types to localStorage
export function saveTransactionTypesCache(types: Category[]): void {
  if (typeof window === 'undefined') return;
  console.log('[v0] Saving transaction types to localStorage:', types);
  localStorage.setItem(CACHE_KEY_TRANSACTION_TYPES, JSON.stringify(types));
}

// Save all categories data to cache
export function saveCategoriesData(data: CategoryItem[]): void {
  console.log('[v0] saveCategoriesData called with:', data);
  const categories = parseCategories(data);
  const transactionTypes = parseTransactionTypes(data);
  console.log('[v0] Parsed categories:', categories);
  console.log('[v0] Parsed transaction types:', transactionTypes);
  saveCategoriesCache(categories);
  saveTransactionTypesCache(transactionTypes);
}
