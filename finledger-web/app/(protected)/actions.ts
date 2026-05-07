'use server';

import { apiFetch } from '@/lib/api';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function logoutAction() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (accessToken) {
    try {
      await apiFetch('/auth/logout', { method: 'POST', token: accessToken });
    } catch {
      // best-effort — clear local cookies regardless
    }
  }

  cookieStore.delete({ name: 'accessToken', path: '/' });
  cookieStore.delete({ name: 'refreshToken', path: '/' });
  redirect('/login');
}
