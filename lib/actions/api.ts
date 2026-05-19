'use server';

import { cookies } from 'next/headers';

export const API_BASE = 'http://127.0.0.1:5000';

export async function authFetch(url: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    const refreshToken = cookieStore.get('refresh_token')?.value;
    if (refreshToken) {
      const refreshRes = await fetch(`${API_BASE}/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        cookieStore.set('access_token', data.access_token, {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          path: '/',
        });

        headers['Authorization'] = `Bearer ${data.access_token}`;
        const retryRes = await fetch(url, { ...options, headers });
        return retryRes.json();
      } else {
        cookieStore.delete('access_token');
        cookieStore.delete('refresh_token');
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
    }
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Erreur HTTP ${res.status}`);
  }

  return res.json();
}
