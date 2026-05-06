'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export async function loginAction(email: string, password: string) {
    const data = await apiFetch<{ accessToken: string, refreshToken: string }>(
        '/auth/login',
        {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }
    );

    const cookieStore = await cookies();
    cookieStore.set('accessToken', data.accessToken, { httpOnly: true, path: '/' });
    cookieStore.set('refreshToken', data.refreshToken, { httpOnly: true, path: '/' });
    
    redirect('/');
}