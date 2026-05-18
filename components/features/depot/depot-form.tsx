'use client';

import { useFormContext } from 'react-hook-form';
import type { DepotFormData } from '@/lib/schemas/depot';

export function DepotFormFields() {
  const { register, formState: { errors } } = useFormContext<DepotFormData>();

  return (
    <>
      <div>
        <label htmlFor="num_depot" className="block text-sm font-medium text-gray-700 mb-1">N° Dépôt</label>
        <input
          id="num_depot"
          type="number"
          {...register('num_depot')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.num_depot && (
          <p className="mt-1 text-xs text-red-600">{errors.num_depot.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="nom_depot" className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
        <input
          id="nom_depot"
          type="text"
          {...register('nom_depot')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.nom_depot && (
          <p className="mt-1 text-xs text-red-600">{errors.nom_depot.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="contenu_depot" className="block text-sm font-medium text-gray-700 mb-1">Contenu</label>
        <input
          id="contenu_depot"
          type="text"
          {...register('contenu_depot')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.contenu_depot && (
          <p className="mt-1 text-xs text-red-600">{errors.contenu_depot.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="usr" className="block text-sm font-medium text-gray-700 mb-1">Utilisateur</label>
        <input
          id="usr"
          type="text"
          {...register('usr')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.usr && (
          <p className="mt-1 text-xs text-red-600">{errors.usr.message}</p>
        )}
      </div>
    </>
  );
}
