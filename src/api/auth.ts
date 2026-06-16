import { api } from './client';
import type { AuthTokens, User } from '@/types';

interface AuthResponse extends AuthTokens {
  user?: User;
}

export const authApi = {
  login: (body: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', body).then((r) => r.data),

  register: (body: { email: string; password: string; name: string }) =>
    api.post<AuthResponse>('/auth/register', body).then((r) => r.data),

  // Optional: a /auth/me endpoint to hydrate the user after a reload.
  // If the backend doesn't expose it, this stays unused.
  me: () => api.get<User>('/auth/me').then((r) => r.data),
};
