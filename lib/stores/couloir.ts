import { createCrudDialogStore } from './crud-dialog';
import type { CouloirFormData } from '@/lib/schemas/couloir';

export const useCouloirDialog = createCrudDialogStore<CouloirFormData>();
