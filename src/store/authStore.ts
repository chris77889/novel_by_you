import { create } from 'zustand';
// Removed persist and supabase import

// Keep Profile interface for structure, but it won't be fetched
interface Profile {
  id: string;
  username: string;
  // Remove timestamps or keep if needed for local logic
  // created_at: string;
  // updated_at: string;
}

// Simplified AuthState
interface AuthState {
  user: Profile | null; // Keep the structure, but initialize differently
  // Remove setUser, signUp, signIn, signOut methods
}

// Create a mock user profile
const mockUser: Profile = {
  id: 'local-user', // Static ID for the local session user
  username: 'Local User',
};

// Create the store without persistence and Supabase interactions
export const useAuthStore = create<AuthState>()(() => ({
  // Initialize user as the mock user, effectively skipping login
  user: mockUser,
  // Remove setUser, signUp, signIn, signOut implementations
}));