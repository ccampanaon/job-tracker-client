import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { refreshAccessToken } from '@/api/client';
import { useAuthStore } from '@/store/auth';
import { queryClient } from '@/lib/queryClient';

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setSession({
        user: data.user ?? null,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      navigate('/dashboard');
    },
  });
}

export function useRegister() {
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setSession({
        user: data.user ?? null,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      navigate('/dashboard');
    },
  });
}

export function useLogout() {
  const clear = useAuthStore((s) => s.clear);
  const navigate = useNavigate();
  return () => {
    clear();
    queryClient.clear();
    navigate('/login');
  };
}

// On page reload the access token is gone (memory-only). This hook exchanges
// the persisted refresh token for a fresh access token before any data queries
// fire, preventing a 401 cascade on every protected page load.
export function useRestoreSession() {
  const isRestoring = useAuthStore((s) => s.isRestoring);
  const clear = useAuthStore((s) => s.clear);
  const setIsRestoring = useAuthStore((s) => s.setIsRestoring);

  useEffect(() => {
    if (!isRestoring) return;
    refreshAccessToken()
      .catch(() => clear())
      .finally(() => setIsRestoring(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isRestoring;
}
