import React from 'react';
import { Home, Clock } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useNovelStore } from '../store/novelStore';
import ThemeSwitcher from './ThemeSwitcher';
import { useThemeStore } from './ThemeSwitcher';

interface NavigationProps {
  onHome: () => void;
  onSelectHistory: (historyId: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ onHome, onSelectHistory }) => {
  const histories = useNovelStore((state) => state.histories);
  const theme = useThemeStore((state) => state.theme);

  return (
    <div className={`fixed top-0 left-0 right-0 ${theme === 'dark' ? 'bg-gray-900/80' : 'bg-white/80'} backdrop-blur-sm p-4 flex items-center justify-between z-50`}>
      <button
        onClick={onHome}
        className={`p-2 ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} rounded-full transition-colors flex items-center gap-2`}
        aria-label="返回首页"
      >
        <Home className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`} />
        <span>返回首页</span>
      </button>

      <div className="flex items-center gap-4">
        <Dialog.Root>
          <Dialog.Trigger asChild>
            <button
              className={`p-2 ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} rounded-full transition-colors flex items-center gap-2`}
              aria-label="阅读历史"
            >
              <Clock className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`} />
              <span>历史记录</span>
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
            <Dialog.Content className={`fixed right-0 top-0 h-full w-full max-w-md ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} p-6 shadow-xl animate-slide-in-right`}>
              <div className="flex items-center justify-between mb-6">
                <Dialog.Title className={`text-xl font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>阅读历史</Dialog.Title>
                <Dialog.Close asChild>
                  <button className={`p-2 ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} rounded-full`} aria-label="关闭">
                    <X className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`} />
                  </button>
                </Dialog.Close>
              </div>
              
              <div className="space-y-4">
                {histories.length === 0 ? (
                  <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>暂无阅读历史</p>
                ) : (
                  histories.map((history) => (
                    <button
                      key={history.id}
                      onClick={() => {
                        onSelectHistory(history.id);
                      }}
                      className={`w-full text-left p-4 ${
                        theme === 'dark' 
                          ? 'bg-gray-800 hover:bg-gray-700 text-gray-200' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      } rounded-lg transition-colors`}
                    >
                      <h3 className="font-medium mb-2">{history.style.name}</h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} line-clamp-2`}>
                        {history.content}
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mt-2`}>
                        {new Date(history.lastUpdated).toLocaleString()}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
        <ThemeSwitcher />
      </div>
    </div>
  );
};

export default Navigation;