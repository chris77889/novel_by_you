import { create } from 'zustand';

interface RetryState {
  isRetrying: boolean;
  retryCount: number;
  maxRetries: number;
  startRetrying: (maxRetries: number) => void;
  updateRetry: (count: number) => void;
  stopRetrying: () => void;
}

export const useRetryStore = create<RetryState>((set) => ({
  isRetrying: false,
  retryCount: 0,
  maxRetries: 5,
  startRetrying: (maxRetries: number) => set({ 
    isRetrying: true, 
    retryCount: 1,
    maxRetries 
  }),
  updateRetry: (count: number) => set({
    retryCount: count
  }),
  stopRetrying: () => set({ 
    isRetrying: false, 
    retryCount: 0 
  })
})); 