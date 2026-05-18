'use client';

import { useFormContext } from 'react-hook-form';
import type { CouloirFormData } from '@/lib/schemas/couloir';

interface DepotOption {
  id: number;
  num_depot: number;
  nom_depot: string;
}

interface CouloirFormFieldsProps {
  depots: DepotOption[];
  mode: 'create' | 'edit' | null;
}

export function CouloirFormFields({ depots, mode }: CouloirFormFieldsProps) {
  const { register, formState: { errors } } = useFormContext<CouloirFormData>();

  return (
    <>
      <div>
        <label htmlFor="id_depot" className="block text-sm font-medium text-gray-700 mb-1">Dépôt</label>
        <select
          id="id_depot"
          {...register('id_depot')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Sélectionner un dépôt</option>
          {depots.map((d) => (
            <option key={d.id} value={d.id}>
              {d.num_depot} - {d.nom_depot}
            </option>
          ))}
        </select>
        {errors.id_depot && (
          <p className="mt-1 text-xs text-red-600">{errors.id_depot.message}</p>
        )}
      </div>

      {mode === 'create' ? (
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre de couloirs</label>
          <input
            id="nombre"
            type="number"
            min={1}
            defaultValue={1}
            {...register('nombre')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.nombre && (
            <p className="mt-1 text-xs text-red-600">{errors.nombre.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">Les numéros et noms seront générés automatiquement.</p>
        </div>
      ) : (
        <>
          <div>
            <label htmlFor="num_couloir" className="block text-sm font-medium text-gray-700 mb-1">N° Couloir</label>
            <input
              id="num_couloir"
              type="text"
              {...register('num_couloir')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.num_couloir && (
              <p className="mt-1 text-xs text-red-600">{errors.num_couloir.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="nom_couloir" className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input
              id="nom_couloir"
              type="text"
              {...register('nom_couloir')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.nom_couloir && (
              <p className="mt-1 text-xs text-red-600">{errors.nom_couloir.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="num_depot" className="block text-sm font-medium text-gray-700 mb-1">N° Dépôt (affichage)</label>
            <input
              id="num_depot"
              type="text"
              {...register('num_depot')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.num_depot && (
              <p className="mt-1 text-xs text-red-600">{errors.num_depot.message}</p>
            )}
          </div>
        </>
      )}
    </>
  );
}
