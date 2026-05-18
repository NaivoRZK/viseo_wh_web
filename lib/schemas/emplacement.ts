import { z } from 'zod';

export const emplacementSchema = z.object({
  num_emplacement: z.string().optional().default(''),
  num_niveau: z.coerce.number().optional().default(0),
  num_rangee: z.string().optional().default(''),
  quantite: z.coerce.number().optional().default(0),
  volume_occupe: z.coerce.number().optional().default(0),
  volume_libre: z.coerce.number().optional().default(0),
  charge_occupee: z.coerce.number().optional().default(0),
  charge_libre: z.coerce.number().optional().default(0),
});

export type EmplacementFormData = z.infer<typeof emplacementSchema>;
