import { z } from 'zod';

export const couloirSchema = z.object({
  num_couloir: z.string().optional().default(''),
  nom_couloir: z.string().optional().default(''),
  id_depot: z.coerce.number({ message: 'Le dépôt est requis' }),
  num_depot: z.string().optional().default(''),
  nombre: z.coerce.number().min(1, 'Le nombre doit être au moins 1').optional().default(1),
});

export type CouloirFormData = z.infer<typeof couloirSchema>;
