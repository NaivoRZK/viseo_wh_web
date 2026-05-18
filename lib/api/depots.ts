const API_BASE = '/api';

export interface Depot {
  id: number;
  num_depot: number;
  nom_depot: string;
  contenu_depot: string;
  usr: string;
}

export interface DepotInput {
  num_depot: number;
  nom_depot: string;
  contenu_depot: string;
  usr: string;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function createDepot(data: DepotInput): Promise<Depot> {
  return request<Depot>(`${API_BASE}/depots`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getDepot(num_depot: number): Promise<Depot> {
  return request<Depot>(`${API_BASE}/depots/${num_depot}`);
}

export async function searchDepots(params: {
  nom?: string;
  usr?: string;
}): Promise<Depot[]> {
  const qs = new URLSearchParams();
  if (params.nom) qs.set('nom', params.nom);
  if (params.usr) qs.set('usr', params.usr);
  const url = `${API_BASE}/depots${qs.toString() ? '?' + qs.toString() : ''}`;
  return request<Depot[]>(url);
}

export async function updateDepot(
  num_depot: number,
  data: Partial<DepotInput>
): Promise<Depot> {
  return request<Depot>(`${API_BASE}/depots/${num_depot}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteDepot(num_depot: number): Promise<void> {
  await fetch(`${API_BASE}/depots/${num_depot}`, {
    method: 'DELETE',
    credentials: 'include',
  });
}
