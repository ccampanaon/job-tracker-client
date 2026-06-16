import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './auth';

const REFRESH_KEY = 'jt.refreshToken';

beforeEach(() => {
  localStorage.clear();
  useAuthStore.getState().clear();
});

describe('useAuthStore', () => {
  describe('initial state', () => {
    it('starts unauthenticated when no refresh token in storage', () => {
      const { isAuthenticated, accessToken, user } = useAuthStore.getState();
      expect(isAuthenticated).toBe(false);
      expect(accessToken).toBeNull();
      expect(user).toBeNull();
    });
  });

  describe('setSession', () => {
    it('sets authenticated state and persists refresh token', () => {
      useAuthStore.getState().setSession({
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
        accessToken: 'access-abc',
        refreshToken: 'refresh-xyz',
      });

      const { isAuthenticated, accessToken, user, refreshToken } = useAuthStore.getState();
      expect(isAuthenticated).toBe(true);
      expect(accessToken).toBe('access-abc');
      expect(refreshToken).toBe('refresh-xyz');
      expect(user?.email).toBe('test@example.com');
      expect(localStorage.getItem(REFRESH_KEY)).toBe('refresh-xyz');
    });
  });

  describe('setAccessToken', () => {
    it('updates the access token without affecting other state', () => {
      useAuthStore.getState().setSession({
        user: { id: '1', email: 'a@b.com', name: 'A' },
        accessToken: 'old-token',
        refreshToken: 'refresh-xyz',
      });
      useAuthStore.getState().setAccessToken('new-token');
      expect(useAuthStore.getState().accessToken).toBe('new-token');
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });
  });

  describe('clear', () => {
    it('resets all state and removes refresh token from storage', () => {
      useAuthStore.getState().setSession({
        user: { id: '1', email: 'a@b.com', name: 'A' },
        accessToken: 'access-abc',
        refreshToken: 'refresh-xyz',
      });

      useAuthStore.getState().clear();

      const { isAuthenticated, accessToken, user, refreshToken, isRestoring } =
        useAuthStore.getState();
      expect(isAuthenticated).toBe(false);
      expect(accessToken).toBeNull();
      expect(user).toBeNull();
      expect(refreshToken).toBeNull();
      expect(isRestoring).toBe(false);
      expect(localStorage.getItem(REFRESH_KEY)).toBeNull();
    });
  });

  describe('setIsRestoring', () => {
    it('toggles the restoring flag', () => {
      useAuthStore.getState().setIsRestoring(true);
      expect(useAuthStore.getState().isRestoring).toBe(true);
      useAuthStore.getState().setIsRestoring(false);
      expect(useAuthStore.getState().isRestoring).toBe(false);
    });
  });
});
