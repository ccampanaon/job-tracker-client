import { create } from 'zustand';
import type { User } from '@/types';

// Access token lives in memory only (cleared on refresh/tab close).
// Refresh token is persisted so the session survives a reload; if your
// backend supports httpOnly refresh cookies, drop the localStorage line.
const REFRESH_KEY = 'jt.refreshToken';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  // True on first load when we have a refresh token but need to exchange it
  // for a fresh access token before making any authenticated requests.
  isRestoring: boolean;
  setSession: (p: {
    user?: User | null;
    accessToken: string;
    refreshToken: string;
  }) => void;
  setUser: (user: User) => void;
  setAccessToken: (token: string) => void;
  setIsRestoring: (v: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: localStorage.getItem(REFRESH_KEY),
  isAuthenticated: !!localStorage.getItem(REFRESH_KEY),
  isRestoring: !!localStorage.getItem(REFRESH_KEY),

  setSession: ({ user, accessToken, refreshToken }) => {
    localStorage.setItem(REFRESH_KEY, refreshToken);
    set((s) => ({
      user: user ?? s.user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
    }));
  },

  setUser: (user) => set({ user }),

  setAccessToken: (accessToken) => set({ accessToken }),

  setIsRestoring: (isRestoring) => set({ isRestoring }),

  clear: () => {
    localStorage.removeItem(REFRESH_KEY);
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isRestoring: false,
    });
  },
}));
