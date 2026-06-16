import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { isAxiosError } from 'axios';
import { useLogin, useRegister } from '@/features/auth/useAuth';

const schema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
});
type FormValues = z.infer<typeof schema>;

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const login = useLogin();
  const register = useRegister();
  const pending = login.isPending || register.isPending;
  const serverError = login.error ?? register.error;

  const {
    register: field,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (values: FormValues) => {
    if (mode === 'login') {
      login.mutate({ email: values.email, password: values.password });
    } else {
      register.mutate({
        name: values.name ?? '',
        email: values.email,
        password: values.password,
      });
    }
  };

  return (
    <div className="grid min-h-screen place-items-center px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-xl2 bg-brand text-lg font-bold text-white">
            T
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Keep every application in one calm place.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4 p-6">
          {mode === 'register' && (
            <div>
              <label className="label">Name</label>
              <input className="field" placeholder="Jordan Lee" {...field('name')} />
              {errors.name && (
                <p className="mt-1 text-xs text-stage-rejected">
                  {errors.name.message}
                </p>
              )}
            </div>
          )}
          <div>
            <label className="label">Email</label>
            <input
              className="field"
              type="email"
              placeholder="you@email.com"
              autoComplete="email"
              {...field('email')}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-stage-rejected">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <label className="label">Password</label>
            <input
              className="field"
              type="password"
              autoComplete={
                mode === 'login' ? 'current-password' : 'new-password'
              }
              {...field('password')}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-stage-rejected">
                {errors.password.message}
              </p>
            )}
          </div>

          {serverError && (
            <p className="text-sm text-stage-rejected">
              {isAxiosError(serverError)
                ? (serverError.response?.data as { message?: string })
                    ?.message ?? 'Something went wrong. Try again.'
                : 'Something went wrong. Try again.'}
            </p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={pending}>
            {pending
              ? 'Working…'
              : mode === 'login'
                ? 'Sign in'
                : 'Create account'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-ink-500">
          {mode === 'login' ? "Don't have an account?" : 'Already registered?'}{' '}
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="font-medium text-brand hover:underline"
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
