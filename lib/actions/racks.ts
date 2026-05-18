'use server';

import { cookies } from 'next/headers';
import { rackSchema, type RackFormData } from '@/lib/schemas/rack';

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

export async function getRacksAction(params?: {
  num_couloir?: string;
  num_rack?: string;
}) {
  const qs = new URLSearchParams();
  if (params?.num_couloir) qs.set('num_couloir', params.num_couloir);
  if (params?.num_rack) qs.set('num_rack', params.num_rack);
  const url = `${API_BASE}/racks${qs.toString() ? '?' + qs.toString() : ''}`;
  return authFetch(url);
}

export async function createRackAction(data: RackFormData & { auto_generate?: boolean }) {
  const parsed = rackSchema.parse(data);
  const nombre = parsed.nombre ?? 1;
  const body: Record<string, unknown> = {
    num_couloir: parsed.num_couloir,
    couloir_num_couloir: parsed.couloir_num_couloir,
    nombre,
    auto_generate: true,
    nb_rangee: parsed.nb_rangee ?? 1,
    nb_niveau: parsed.nb_niveau ?? 1,
    charge_max: parsed.charge_max ?? 0,
    hauteur_case: parsed.hauteur_case ?? 0,
    largeur_case: parsed.largeur_case ?? 0,
    profondeur_case: parsed.profondeur_case ?? 0,
  };
  return authFetch(`${API_BASE}/racks`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateRackAction(num_rack: string, data: Partial<RackFormData>) {
  const parsed = rackSchema.partial().parse(data);
  return authFetch(`${API_BASE}/racks/${num_rack}`, {
    method: 'PUT',
    body: JSON.stringify(parsed),
  });
}

export async function deleteRackAction(num_rack: string) {
  const res = await fetch(`${API_BASE}/racks/${num_rack}`, {
    method: 'DELETE',
    headers: { Cookie: (await cookies()).toString() },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Suppression échouée' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return null;
}
