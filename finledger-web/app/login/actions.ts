'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export async function loginAction(email: string, password: string) {
  const data = await apiFetch<{ accessToken: string; refreshToken: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === 'production';
  const accessTokenCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 15,
  };
  const refreshTokenCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  };

  cookieStore.set('accessToken', data.accessToken, accessTokenCookieOptions);
  cookieStore.set('refreshToken', data.refreshToken, refreshTokenCookieOptions);

  redirect('/');
}
