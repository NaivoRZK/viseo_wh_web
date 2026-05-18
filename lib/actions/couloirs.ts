'use server';

import { cookies } from 'next/headers';
import { couloirSchema, type CouloirFormData } from '@/lib/schemas/couloir';

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

export async function generateNextCouloirNameAction(id_depot: number) {
  return authFetch(`${API_BASE}/couloirs/generate-next/${id_depot}`);
}

export async function getCouloirsAction(params?: {
  num_couloir?: string;
  nom_couloir?: string;
  id_depot?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.num_couloir) qs.set('num_couloir', params.num_couloir);
  if (params?.nom_couloir) qs.set('nom_couloir', params.nom_couloir);
  if (params?.id_depot) qs.set('id_depot', String(params.id_depot));
  const url = `${API_BASE}/couloirs${qs.toString() ? '?' + qs.toString() : ''}`;
  return authFetch(url);
}

export async function createCouloirAction(data: CouloirFormData & { auto_generate?: boolean }) {
  const parsed = couloirSchema.parse(data);
  const nombre = parsed.nombre ?? 1;
  const body: Record<string, unknown> = {
    id_depot: parsed.id_depot,
    nombre,
    auto_generate: true,
  };
  return authFetch(`${API_BASE}/couloirs`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateCouloirAction(num_couloir: string, data: Partial<CouloirFormData>) {
  const parsed = couloirSchema.partial().parse(data);
  return authFetch(`${API_BASE}/couloirs/${num_couloir}`, {
    method: 'PUT',
    body: JSON.stringify(parsed),
  });
}

export async function deleteCouloirAction(num_couloir: string) {
  const res = await fetch(`${API_BASE}/couloirs/${num_couloir}`, {
    method: 'DELETE',
    headers: { Cookie: (await cookies()).toString() },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Suppression échouée' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return null;
}
