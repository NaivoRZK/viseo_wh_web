import { createCrudDialogStore } from './crud-dialog';
import type { RackFormData } from '@/lib/schemas/rack';

export const useRackDialog = createCrudDialogStore<RackFormData>();
