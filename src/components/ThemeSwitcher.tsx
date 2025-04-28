import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeStore {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'dark' ? 'light' : 'dark' 
      })),
    }),
    {
      name: 'theme-storage',
    }
  )
);

const ThemeSwitcher: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore();

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-full transition-colors flex items-center gap-2 ${
        theme === 'dark'
          ? 'bg-gray-800 hover:bg-gray-700 text-gray-200'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
      }`}
      aria-label={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
      <span>{theme === 'dark' ? '浅色模式' : '深色模式'}</span>
    </button>
  );
};

export default ThemeSwitcher;