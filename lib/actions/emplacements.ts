'use server';

import { cookies } from 'next/headers';

const API_BASE = process.env.FLASK_API_URL || 'http://127.0.0.1:5000';

async function authFetch(url: string, options?: RequestInit) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export async function getEmplacementsAction(params?: {
  num_emplacement?: string;
  num_rack?: string;
  num_rack_id?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.num_emplacement) qs.set('num_emplacement', params.num_emplacement);
  if (params?.num_rack) qs.set('num_rack', params.num_rack);
  if (params?.num_rack_id) qs.set('num_rack_id', String(params.num_rack_id));
  const url = `${API_BASE}/emplacements${qs.toString() ? '?' + qs.toString() : ''}`;
  return authFetch(url);
}

export async function generateEmplacementsAction(num_rack: string) {
  const result = await authFetch(`${API_BASE}/emplacements/generate/${num_rack}`, {
    method: 'POST',
  });

  const emplacements = (result as { emplacements?: unknown[] }).emplacements ?? [];
  const createdCount = Array.isArray(emplacements) ? emplacements.length : 0;

  return {
    emplacements,
    createdCount,
  };
}

export async function deleteEmplacementAction(num_emplacement: string) {
  const res = await fetch(`${API_BASE}/emplacements/${num_emplacement}`, {
    method: 'DELETE',
    headers: { Cookie: (await cookies()).toString() },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Suppression échouée' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return null;
}
