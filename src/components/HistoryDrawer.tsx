import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Clock } from 'lucide-react';
import { useNovelStore } from '../store/novelStore';

interface HistoryDrawerProps {
  onSelectHistory: (historyId: string) => void;
}

const HistoryDrawer: React.FC<HistoryDrawerProps> = ({ onSelectHistory }) => {
  const histories = useNovelStore((state) => state.histories);

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          className="fixed top-4 right-4 p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
          aria-label="阅读历史"
        >
          <Clock className="w-6 h-6" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed right-0 top-0 h-full w-full max-w-md bg-gray-900 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-semibold">阅读历史</Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-2 hover:bg-gray-800 rounded-full" aria-label="关闭">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>
          
          <div className="space-y-4">
            {histories.length === 0 ? (
              <p className="text-gray-400 text-center py-8">暂无阅读历史</p>
            ) : (
              histories.map((history) => (
                <button
                  key={history.id}
                  onClick={() => {
                    onSelectHistory(history.id);
                  }}
                  className="w-full text-left p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <h3 className="font-medium mb-2">{history.style.name}</h3>
                  <p className="text-sm text-gray-400 line-clamp-2">{history.content}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(history.lastUpdated).toLocaleString()}
                  </p>
                </button>
              ))
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default HistoryDrawer;