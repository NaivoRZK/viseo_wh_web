'use server';

import { cookies } from 'next/headers';
import { depotSchema, type DepotFormData } from '@/lib/schemas/depot';

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

export async function getDepotsAction(params?: {
  nom?: string;
  usr?: string;
}) {
  const qs = new URLSearchParams();
  if (params?.nom) qs.set('nom', params.nom);
  if (params?.usr) qs.set('usr', params.usr);
  const url = `${API_BASE}/depots${qs.toString() ? '?' + qs.toString() : ''}`;
  return authFetch(url);
}

export async function createDepotAction(data: DepotFormData) {
  const parsed = depotSchema.parse(data);
  return authFetch(`${API_BASE}/depots`, {
    method: 'POST',
    body: JSON.stringify(parsed),
  });
}

export async function updateDepotAction(num_depot: number, data: Partial<DepotFormData>) {
  const parsed = depotSchema.partial().parse(data);
  return authFetch(`${API_BASE}/depots/${num_depot}`, {
    method: 'PUT',
    body: JSON.stringify(parsed),
  });
}

export async function deleteDepotAction(num_depot: number) {
  const res = await fetch(`${API_BASE}/depots/${num_depot}`, {
    method: 'DELETE',
    headers: {
      Cookie: (await cookies()).toString(),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Suppression échouée' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return null;
}
