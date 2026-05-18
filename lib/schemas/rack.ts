import { z } from 'zod';

export const rackSchema = z.object({
  num_rack: z.string().optional().default(''),
  num_couloir: z.string().min(1, 'Le couloir est requis'),
  couloir_num_couloir: z.string().optional().default(''),
  num_rack_dans_couloir: z.coerce.number().optional().default(0),
  nb_rangee: z.coerce.number().min(1, 'Min 1').optional().default(1),
  nb_niveau: z.coerce.number().min(1, 'Min 1').optional().default(1),
  charge_max: z.coerce.number().optional().default(0),
  hauteur_case: z.coerce.number().optional().default(0),
  largeur_case: z.coerce.number().optional().default(0),
  profondeur_case: z.coerce.number().optional().default(0),
  nombre: z.coerce.number().min(1, 'Min 1').optional().default(1),
});

export type RackFormData = z.infer<typeof rackSchema>;
