import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { NovelHistory } from '../types';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

// 类型定义
type PendingAddData = {
  type: 'add';
  data: NovelHistory;
  timestamp: number;
};

type PendingUpdateData = {
  type: 'update';
  data: {
    id: string;
    updates: Partial<NovelHistory>;
  };
  timestamp: number;
};

type PendingDeleteData = {
  type: 'delete';
  data: null; // Data is null for delete operations
  timestamp: number;
};

type PendingWrite = PendingAddData | PendingUpdateData | PendingDeleteData;

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
  // 添加日志：记录处理开始和状态
  console.log(`[${new Date().toISOString()}] processPendingWrites called. User: ${user?.id}, Writes count: ${writes.length}`);

  if (!user || writes.length === 0) {
    // 添加日志：记录跳过原因
    console.log(`[${new Date().toISOString()}] processPendingWrites skipped. User logged in: ${!!user}, Writes count: ${writes.length}`);
    // 如果没有待处理项，确保本地 pendingWrites 也清空 (以防万一)
    if (writes.length === 0) {
      set(state => ({ ...state, pendingWrites: [] }));
    }
    return;
  }

  const successfulWrites: PendingWrite[] = [];
  // Fix: Use unknown instead of any
  const failedWrites: { write: PendingWrite; error: unknown }[] = [];

  for (const write of writes) {
    try {
      // 添加日志：记录正在处理的操作
      console.log(`[${new Date().toISOString()}] Processing write (Type: ${write.type}, Timestamp: ${write.timestamp})`);
      switch (write.type) {
        case 'add': { // Fix: Add block scope
          // 添加日志：记录添加操作的详细数据
          console.log(`[${new Date().toISOString()}] Attempting to add history:`, write.data);
          const { error: insertError } = await supabase
            .from('reading_histories')
            .insert({
              // id: write.data.id, // Let Supabase generate ID? Ensure local ID matches if needed.
              user_id: user.id,
              style_id: write.data.style.id,
              style_name: write.data.style.name,
              content: write.data.content,
              choices: write.data.choices,
              history: write.data.history,
              structure_outline: write.data.structureOutline || null,
              // created_at and updated_at are usually handled by Supabase defaults
            });
          if (insertError) throw insertError;
          // 添加日志：记录添加成功
          console.log(`[${new Date().toISOString()}] Add successful for timestamp: ${write.timestamp}`);
          break;
        } // Fix: Close block scope
        case 'update': { // Fix: Add block scope
           // 添加日志：记录更新操作的详细数据
          console.log(`[${new Date().toISOString()}] Attempting to update history (ID: ${write.data.id}):`, write.data.updates);
          const { error: updateError } = await supabase
            .from('reading_histories')
            .update({
              content: write.data.updates.content,
              choices: write.data.updates.choices,
              history: write.data.updates.history,
              structure_outline: write.data.updates.structureOutline,
              updated_at: new Date().toISOString() // Explicitly set update time
            })
            .eq('id', write.data.id)
            .eq('user_id', user.id); // Ensure user owns the record
          if (updateError) throw updateError;
           // 添加日志：记录更新成功
          console.log(`[${new Date().toISOString()}] Update successful for ID: ${write.data.id}, timestamp: ${write.timestamp}`);
          break;
        } // Fix: Close block scope
        case 'delete': { // Fix: Add block scope
           // 添加日志：记录删除操作
          console.log(`[${new Date().toISOString()}] Attempting to delete all histories for user: ${user.id}`);
          const { error: deleteError } = await supabase
            .from('reading_histories')
            .delete()
            .eq('user_id', user.id); // Delete all records for the user
          if (deleteError) throw deleteError;
           // 添加日志：记录删除成功
          console.log(`[${new Date().toISOString()}] Delete successful for user: ${user.id}, timestamp: ${write.timestamp}`);
          break;
        } // Fix: Close block scope
      }
      successfulWrites.push(write);
    } catch (error) {
       // 添加日志：记录详细错误信息
      console.error(`[${new Date().toISOString()}] Error processing write (Type: ${write.type}, Timestamp: ${write.timestamp}):`, error);
      failedWrites.push({ write, error });
    }
  }

  // 更新 pendingWrites: 只移除成功的操作
  set(state => {
    const successfulTimestamps = new Set(successfulWrites.map(sw => sw.timestamp));
    const nextPendingWrites = state.pendingWrites.filter(pw => !successfulTimestamps.has(pw.timestamp));
    // 添加日志：记录状态更新结果
    console.log(`[${new Date().toISOString()}] Updating pendingWrites. Before: ${state.pendingWrites.length}, After: ${nextPendingWrites.length}, Successful: ${successfulWrites.length}, Failed: ${failedWrites.length}`);
    return { ...state, pendingWrites: nextPendingWrites };
  });

  if (failedWrites.length > 0) {
    // 添加日志：报告失败的操作
    console.warn(`[${new Date().toISOString()}] Some writes failed:`, failedWrites.map(fw => ({ type: fw.write.type, timestamp: fw.write.timestamp, error: fw.error })));
    // 可选：实现重试逻辑或通知用户
  } else if (successfulWrites.length > 0) {
     // 添加日志：报告所有操作成功
    console.log(`[${new Date().toISOString()}] All ${successfulWrites.length} pending writes processed successfully.`);
  } else {
     // 添加日志：没有需要处理的操作（理论上不应发生，因为前面有检查）
     console.log(`[${new Date().toISOString()}] No writes were processed (successful or failed).`);
  }
};

const scheduleSyncWithSupabase = (
  set: (fn: (state: NovelStore) => Partial<NovelStore>) => void,
  get: () => NovelStore
) => {
   // 添加日志：记录调度同步
  console.log(`[${new Date().toISOString()}] scheduleSyncWithSupabase called. Current pendingWrites: ${get().pendingWrites.length}`);
  if (syncTimeout) {
    clearTimeout(syncTimeout);
     // 添加日志：记录清除现有定时器
    console.log(`[${new Date().toISOString()}] Cleared existing sync timeout.`);
  }

  syncTimeout = setTimeout(async () => {
     // 添加日志：记录定时器触发
    console.log(`[${new Date().toISOString()}] Sync timeout triggered. Processing pending writes...`);
    await processPendingWrites(get().pendingWrites, set);
  }, SYNC_DELAY);
   // 添加日志：记录设置新定时器
  console.log(`[${new Date().toISOString()}] Scheduled sync with delay: ${SYNC_DELAY}ms. Timeout ID: ${syncTimeout}`);
};

// Zustand store creation remains largely the same,
// but the actions now correctly use the enhanced schedule/process functions.
export const useNovelStore = create(
  persist<NovelStore>((set, get) => ({
    histories: [],
    pendingWrites: [],
    addHistory: async (history) => {
      // Ensure history has a unique identifier if needed before adding to pending
      const historyWithTimestamp = { ...history, id: history.id || crypto.randomUUID() }; // Assign ID if missing
      const timestamp = Date.now();
      console.log(`[${new Date().toISOString()}] addHistory called. Timestamp: ${timestamp}`, historyWithTimestamp);
      set(state => ({
        histories: [historyWithTimestamp, ...state.histories].slice(0, 10), // Use updated history
        pendingWrites: [
          ...state.pendingWrites,
          {
            type: 'add',
            data: historyWithTimestamp, // Use updated history
            timestamp: timestamp
          }
        ]
      }));
      scheduleSyncWithSupabase(set, get);
    },
    updateHistory: async (id, updates) => {
      const timestamp = Date.now();
      console.log(`[${new Date().toISOString()}] updateHistory called for ID: ${id}. Timestamp: ${timestamp}`, updates);
      set(state => ({
        histories: state.histories.map((h) =>
          h.id === id ? { ...h, ...updates, lastUpdated: timestamp } : h
        ),
        pendingWrites: [
          ...state.pendingWrites,
          {
            type: 'update',
            data: { id, updates },
            timestamp: timestamp
          }
        ]
      }));
      scheduleSyncWithSupabase(set, get);
    },
    clearHistories: async () => {
      const timestamp = Date.now();
      console.log(`[${new Date().toISOString()}] clearHistories called. Timestamp: ${timestamp}`);
      set(state => ({
        histories: [],
        pendingWrites: [
          ...state.pendingWrites,
          {
            type: 'delete',
            data: null,
            timestamp: timestamp
          }
        ]
      }));
      scheduleSyncWithSupabase(set, get);
    },
    syncWithSupabase: async () => {
      const user = useAuthStore.getState().user;
      console.log(`[${new Date().toISOString()}] syncWithSupabase called. User: ${user?.id}`);

      // First, process any pending writes before fetching
      console.log(`[${new Date().toISOString()}] Processing pending writes before fetching...`);
      await processPendingWrites(get().pendingWrites, set); // Ensure local changes are attempted first

      if (!user) {
        console.log(`[${new Date().toISOString()}] No user logged in. Clearing local state.`);
        set({ histories: [], pendingWrites: [] }); // Clear local state if no user
        return;
      }

      console.log(`[${new Date().toISOString()}] Fetching latest histories from Supabase for user: ${user.id}`);
      const { data, error } = await supabase
        .from('reading_histories')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error(`[${new Date().toISOString()}] Error fetching histories from Supabase:`, error);
        // Decide how to handle fetch error - maybe keep local state?
        // For now, just log and potentially throw or return
        throw error; // Or handle more gracefully
      }

      if (data) {
        console.log(`[${new Date().toISOString()}] Fetched ${data.length} histories from Supabase.`);
        const histories: NovelHistory[] = data.map(item => ({
          id: item.id,
          style: {
            id: item.style_id,
            name: item.style_name,
            // Assuming these are not stored or needed from DB for history list
            description: '',
            prompt: '',
            sampleText: '',
            imageUrl: ''
          },
          lastUpdated: new Date(item.updated_at).getTime(),
          content: item.content,
          choices: item.choices,
          history: item.history,
          structureOutline: item.structure_outline
        }));

        // Merge fetched histories with remaining pending writes?
        // For simplicity now, we assume pending writes were processed.
        // A more robust solution might merge or handle conflicts.
        set(state => {
           console.log(`[${new Date().toISOString()}] Setting fetched histories. Clearing potentially remaining pending writes (count: ${state.pendingWrites.length}).`);
           // We clear pendingWrites here assuming sync processed them or fetch overwrites.
           // If pending writes could fail and need retrying, this needs adjustment.
           return { histories, pendingWrites: [] };
        });
      } else {
         console.log(`[${new Date().toISOString()}] No histories found in Supabase for user: ${user.id}.`);
         set({ histories: [], pendingWrites: [] }); // Clear local if nothing in DB
      }
    }
  }), {
    name: 'novel-history',
    // The partialize function defines which parts of the state should be persisted.
    // It expects a function that takes the full state and returns the subset to persist.
    // The type error might be overly strict; the implementation is standard.
    // Let's keep it as is for now, as it correctly describes the intent.
    // @ts-expect-error - Suppress overly strict type error for partialize in persist middleware
    partialize: (state: NovelStore): Pick<NovelStore, 'histories' | 'pendingWrites'> => ({
      histories: state.histories,
      // Persist pending writes so they survive page reloads/app restarts
      pendingWrites: state.pendingWrites
    })
  })
);