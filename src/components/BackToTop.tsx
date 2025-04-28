import React from 'react';
import { ArrowUp } from 'lucide-react';
import { useThemeStore } from './ThemeSwitcher';

interface BackToTopProps {
  contentRef: React.RefObject<HTMLDivElement>;
}

const BackToTop: React.FC<BackToTopProps> = ({ contentRef }) => {
  const theme = useThemeStore((state) => state.theme);

  const scrollToTop = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 ${
        theme === 'dark'
          ? 'bg-purple-600 hover:bg-purple-700 text-white'
          : 'bg-purple-500 hover:bg-purple-600 text-white'
      } rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110`}
      aria-label="返回顶部"
    >
      <ArrowUp size={24} />
    </button>
  );
};

export default BackToTop;