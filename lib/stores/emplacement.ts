import { createCrudDialogStore } from './crud-dialog';
import type { EmplacementFormData } from '@/lib/schemas/emplacement';

export const useEmplacementDialog = createCrudDialogStore<EmplacementFormData>();
