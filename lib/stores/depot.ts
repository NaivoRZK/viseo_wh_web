import { createCrudDialogStore } from './crud-dialog';
import type { DepotFormData } from '@/lib/schemas/depot';

export const useDepotDialog = createCrudDialogStore<DepotFormData>();
