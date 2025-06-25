
import { useState } from 'react';

type StorageKey = 
  | 'user_preferences'
  | 'sidebar_state'
  | 'dashboard_filters'
  | 'template_cache'
  | 'workflow_cache'
  | 'form_drafts'
  | 'template_category'
  | 'template_view_mode';

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  dashboardLayout: string;
  defaultTemplateView: 'grid' | 'list';
}

export const storage = {
  get<T>(key: StorageKey): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  set<T>(key: StorageKey, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  },

  remove(key: StorageKey): void {
    localStorage.removeItem(key);
  },

  clear(): void {
    localStorage.clear();
  }
};

export const useLocalStorage = <T>(key: StorageKey, defaultValue: T) => {
  const [value, setValue] = useState<T>(() => {
    const stored = storage.get<T>(key);
    return stored !== null ? stored : defaultValue;
  });

  const updateValue = (newValue: T) => {
    setValue(newValue);
    storage.set(key, newValue);
  };

  return [value, updateValue] as const;
};
