import { create } from 'zustand';

export interface CrudDialogState<T = Record<string, unknown>> {
  open: boolean;
  mode: 'create' | 'edit' | null;
  data: T | null;
  openCreate: () => void;
  openEdit: (data: T) => void;
  close: () => void;
}

export function createCrudDialogStore<T>() {
  return create<CrudDialogState<T>>((set) => ({
    open: false,
    mode: null,
    data: null,
    openCreate: () => set({ open: true, mode: 'create', data: null }),
    openEdit: (data) => set({ open: true, mode: 'edit', data }),
    close: () => set({ open: false, mode: null, data: null }),
  }));
}
