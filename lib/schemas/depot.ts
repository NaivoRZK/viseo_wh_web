import { z } from 'zod';

export const depotSchema = z.object({
  num_depot: z.coerce.number({ message: 'Le numéro de dépôt est requis' }),
  nom_depot: z.string().min(1, 'Le nom du dépôt est requis'),
  contenu_depot: z.string().optional().default(''),
  usr: z.string().optional().default(''),
});

export type DepotFormData = z.infer<typeof depotSchema>;
