'use server';
import { authFetch } from '@/lib/actions/api';

const API_BASE = 'http://127.0.0.1:5000';

export async function assignBarcodeAction(ref: string, barcode: string) {
  if (!ref || !barcode) {
    throw new Error('Les champs "ref" et "barcode" sont requis.');
  }
  return authFetch(`${API_BASE}/products/barcode`, {
    method: 'POST',
    body: JSON.stringify({ ref, barcode }),
  });
}
