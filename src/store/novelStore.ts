import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { NovelStyle, HistoryItem } from '../types';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

interface NovelHistory {
  id: string;
  style: NovelStyle;
  lastUpdated: number;
  content: string;
  choices: Array<{id: string, text: string}>;
  history: HistoryItem[];
}

interface PendingWrite {
  type: 'add' | 'update' | 'delete';
  data: any;
  timestamp: number;
}

interface NovelStore {
  histories: NovelHistory[];
  pendingWrites: PendingWrite[];
  addHistory: (history: NovelHistory) => Promise<void>;
  updateHistory: (id: string, updates: Partial<NovelHistory>) => Promise<void>;
  clearHistories: () => Promise<void>;
  syncWithSupabase: () => Promise<void>;
}

let syncTimeout: NodeJS.Timeout | null = null;
const SYNC_DELAY = 2000; // 2 seconds

const processPendingWrites = async (
  writes: PendingWrite[],
  set: (fn: (state: NovelStore) => Partial<NovelStore>) => void
) => {
  const user = useAuthStore.getState().user;
  if (!user || writes.length === 0) return;

  try {
    for (const write of writes) {
      switch (write.type) {
        case 'add':
          await supabase
            .from('reading_histories')
            .insert({
              user_id: user.id,
              style_id: write.data.style.id,
              style_name: write.data.style.name,
              content: write.data.content,
              choices: write.data.choices,
              history: write.data.history
            });
          break;
        case 'update':
          await supabase
            .from('reading_histories')
            .update({
              content: write.data.updates.content,
              choices: write.data.updates.choices,
              history: write.data.updates.history,
              updated_at: new Date().toISOString()
            })
            .eq('id', write.data.id)
            .eq('user_id', user.id);
          break;
        case 'delete':
          await supabase
            .from('reading_histories')
            .delete()
            .eq('user_id', user.id);
          break;
      }
    }
    
    set(state => ({ ...state, pendingWrites: [] }));
  } catch (error) {
    console.error('Error processing pending writes:', error);
  }
};

const scheduleSyncWithSupabase = (
  set: (fn: (state: NovelStore) => Partial<NovelStore>) => void,
  get: () => NovelStore
) => {
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }

  syncTimeout = setTimeout(async () => {
    await processPendingWrites(get().pendingWrites, set);
  }, SYNC_DELAY);
};

export const useNovelStore = create<NovelStore>()(
  persist(
    (set, get) => ({
      histories: [],
      pendingWrites: [],
      addHistory: async (history) => {
        // Update local state immediately
        set(state => ({
          histories: [history, ...state.histories].slice(0, 10),
          pendingWrites: [
            ...state.pendingWrites,
            {
              type: 'add',
              data: history,
              timestamp: Date.now()
            }
          ]
        }));

        // Schedule sync with Supabase
        scheduleSyncWithSupabase(set, get);
      },
      updateHistory: async (id, updates) => {
        // Update local state immediately
        set(state => ({
          histories: state.histories.map((h) => 
            h.id === id ? { ...h, ...updates, lastUpdated: Date.now() } : h
          ),
          pendingWrites: [
            ...state.pendingWrites,
            {
              type: 'update',
              data: { id, updates },
              timestamp: Date.now()
            }
          ]
        }));

        // Schedule sync with Supabase
        scheduleSyncWithSupabase(set, get);
      },
      clearHistories: async () => {
        // Update local state immediately
        set(state => ({
          histories: [],
          pendingWrites: [
            ...state.pendingWrites,
            {
              type: 'delete',
              data: null,
              timestamp: Date.now()
            }
          ]
        }));

        // Schedule sync with Supabase
        scheduleSyncWithSupabase(set, get);
      },
      syncWithSupabase: async () => {
        const user = useAuthStore.getState().user;
        
        if (!user) {
          set({ histories: [], pendingWrites: [] });
          return;
        }
        
        const { data, error } = await supabase
          .from('reading_histories')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(10);
          
        if (error) throw error;
        
        if (data) {
          const histories: NovelHistory[] = data.map(item => ({
            id: item.id,
            style: {
              id: item.style_id,
              name: item.style_name,
              description: '',
              prompt: '',
              sampleText: '',
              imageUrl: ''
            },
            lastUpdated: new Date(item.updated_at).getTime(),
            content: item.content,
            choices: item.choices,
            history: item.history
          }));
          
          set({ histories, pendingWrites: [] });
        }
      }
    }),
    {
      name: 'novel-history',
      partialize: (state) => ({
        histories: state.histories,
        pendingWrites: state.pendingWrites
      })
    }
  )
);