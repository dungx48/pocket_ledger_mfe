'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchCategories } from '@/lib/api';
import {
  Category,
  getCategoriesFromCache,
  getTransactionTypesFromCache,
  saveCategoriesData,
} from '@/lib/categories';

interface CategoriesContextType {
  categories: Category[];
  transactionTypes: Category[];
  loading: boolean;
  error: string | null;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

// Mock data for fallback (khi API không available)
const MOCK_DATA = [
  {
    id: '1',
    description: 'Thu nhập',
    key: 'income',
    value: 'income',
    is_active: '1',
    table_name: 'categories',
    field_name: 'transaction_type',
  },
  {
    id: '2',
    description: 'Chi tiêu',
    key: 'expense',
    value: 'expense',
    is_active: '1',
    table_name: 'categories',
    field_name: 'transaction_type',
  },
  {
    id: '3',
    description: 'Ăn uống',
    key: 'food',
    value: 'food',
    is_active: '1',
    table_name: 'categories',
    field_name: 'category_key',
  },
  {
    id: '4',
    description: 'Giao thông',
    key: 'transport',
    value: 'transport',
    is_active: '1',
    table_name: 'categories',
    field_name: 'category_key',
  },
  {
    id: '5',
    description: 'Giải trí',
    key: 'entertainment',
    value: 'entertainment',
    is_active: '1',
    table_name: 'categories',
    field_name: 'category_key',
  },
  {
    id: '6',
    description: 'Tiện ích',
    key: 'utilities',
    value: 'utilities',
    is_active: '1',
    table_name: 'categories',
    field_name: 'category_key',
  },
  {
    id: '7',
    description: 'Sức khỏe',
    key: 'health',
    value: 'health',
    is_active: '1',
    table_name: 'categories',
    field_name: 'category_key',
  },
  {
    id: '8',
    description: 'Khác',
    key: 'other',
    value: 'other',
    is_active: '1',
    table_name: 'categories',
    field_name: 'category_key',
  },
];

export function CategoriesProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactionTypes, setTransactionTypes] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load from cache first
    const cachedCategories = getCategoriesFromCache();
    const cachedTransactionTypes = getTransactionTypesFromCache();

    if (cachedCategories.length > 0 && cachedTransactionTypes.length > 0) {
      console.log('[app] Categories loaded from cache');
      setCategories(cachedCategories);
      setTransactionTypes(cachedTransactionTypes);
      setLoading(false);
      return;
    }

    // Fetch from API if not cached
    const loadCategories = async () => {
      try {
        console.log('[app] Fetching categories from API...');
        const data = await fetchCategories();
        console.log('[app] Categories API response:', data);
        
        saveCategoriesData(data);

        const newCategories = getCategoriesFromCache();
        const newTransactionTypes = getTransactionTypesFromCache();

        console.log('[app] Parsed categories:', newCategories);
        console.log('[app] Parsed transaction types:', newTransactionTypes);

        setCategories(newCategories);
        setTransactionTypes(newTransactionTypes);
      } catch (err) {
        console.error('[app] Failed to load categories from API:', err);
        console.log('[app] Using mock data as fallback...');
        
        // Use mock data as fallback
        saveCategoriesData(MOCK_DATA);
        const fallbackCategories = getCategoriesFromCache();
        const fallbackTransactionTypes = getTransactionTypesFromCache();
        
        setCategories(fallbackCategories);
        setTransactionTypes(fallbackTransactionTypes);
        setError('Using offline data - API temporarily unavailable');
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  return (
    <CategoriesContext.Provider
      value={{
        categories,
        transactionTypes,
        loading,
        error,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error('useCategories must be used within CategoriesProvider');
  }
  return context;
}
