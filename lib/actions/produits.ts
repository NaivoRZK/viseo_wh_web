'use server';
import { authFetch, API_BASE } from '@/lib/actions/api';

export async function assignBarcodeAction(ref: string, barcode: string) {
  if (!ref || !barcode) {
    throw new Error('Les champs "ref" et "barcode" sont requis.');
  }
  return authFetch(`${API_BASE}/products/barcode`, {
    method: 'POST',
    body: JSON.stringify({ ref, barcode }),
  });
}
