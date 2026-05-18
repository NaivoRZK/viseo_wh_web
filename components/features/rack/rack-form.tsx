'use client';

import { useFormContext } from 'react-hook-form';
import type { RackFormData } from '@/lib/schemas/rack';

interface DepotOption {
  id: number;
  num_depot: number;
  nom_depot: string;
}

interface CouloirOption {
  num_couloir: string;
  nom_couloir: string;
  id_depot: number;
}

interface RackFormFieldsProps {
  depots: DepotOption[];
  couloirs: CouloirOption[];
  selectedDepotId: number | '';
  onDepotChange: (id: number | '') => void;
  mode: 'create' | 'edit' | null;
}

export function RackFormFields({ depots, couloirs, selectedDepotId, onDepotChange, mode }: RackFormFieldsProps) {
  const { register, setValue, watch, formState: { errors } } = useFormContext<RackFormData>();

  const filteredCouloirs = selectedDepotId
    ? couloirs.filter((c) => c.id_depot === selectedDepotId)
    : [];

  return (
    <>
      <div>
        <label htmlFor="depot" className="block text-sm font-medium text-gray-700 mb-1">Dépôt</label>
        <select
          id="depot"
          value={selectedDepotId}
          onChange={(e) => {
            onDepotChange(e.target.value ? Number(e.target.value) : '');
            setValue('num_couloir', '');
            setValue('couloir_num_couloir', '');
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Sélectionner un dépôt</option>
          {depots.map((d) => (
            <option key={d.id} value={d.id}>
              {d.num_depot} - {d.nom_depot}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="num_couloir" className="block text-sm font-medium text-gray-700 mb-1">Couloir</label>
        <select
          id="num_couloir"
          disabled={!selectedDepotId}
          value={watch('num_couloir') || ''}
          onChange={(e) => {
            const val = e.target.value;
            setValue('num_couloir', val);
            setValue('couloir_num_couloir', val);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Sélectionner un couloir</option>
          {filteredCouloirs.map((c) => (
            <option key={c.num_couloir} value={c.num_couloir}>
              {c.num_couloir} - {c.nom_couloir}
            </option>
          ))}
        </select>
        {errors.num_couloir && (
          <p className="mt-1 text-xs text-red-600">{errors.num_couloir.message}</p>
        )}
      </div>

      {mode === 'create' ? (
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre de racks</label>
          <input
            id="nombre"
            type="number"
            min={1}
            defaultValue={1}
            {...register('nombre', { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.nombre && (
            <p className="mt-1 text-xs text-red-600">{errors.nombre.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">Les numéros seront générés automatiquement.</p>
        </div>
      ) : (
        <div>
          <label htmlFor="num_rack" className="block text-sm font-medium text-gray-700 mb-1">N° Rack</label>
          <input
            id="num_rack"
            type="text"
            {...register('num_rack')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
            readOnly
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="nb_rangee" className="block text-sm font-medium text-gray-700 mb-1">Nombre de rangées</label>
          <input
            id="nb_rangee"
            type="number"
            min={1}
            {...register('nb_rangee', { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.nb_rangee && (
            <p className="mt-1 text-xs text-red-600">{errors.nb_rangee.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="nb_niveau" className="block text-sm font-medium text-gray-700 mb-1">Nombre de niveaux</label>
          <input
            id="nb_niveau"
            type="number"
            min={1}
            {...register('nb_niveau', { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.nb_niveau && (
            <p className="mt-1 text-xs text-red-600">{errors.nb_niveau.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="charge_max" className="block text-sm font-medium text-gray-700 mb-1">Charge max (kg)</label>
        <input
          id="charge_max"
          type="number"
          step="0.01"
          {...register('charge_max', { valueAsNumber: true })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.charge_max && (
          <p className="mt-1 text-xs text-red-600">{errors.charge_max.message}</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="hauteur_case" className="block text-sm font-medium text-gray-700 mb-1">Hauteur case (m)</label>
          <input
            id="hauteur_case"
            type="number"
            step="0.01"
            {...register('hauteur_case', { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.hauteur_case && (
            <p className="mt-1 text-xs text-red-600">{errors.hauteur_case.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="largeur_case" className="block text-sm font-medium text-gray-700 mb-1">Largeur case (m)</label>
          <input
            id="largeur_case"
            type="number"
            step="0.01"
            {...register('largeur_case', { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.largeur_case && (
            <p className="mt-1 text-xs text-red-600">{errors.largeur_case.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="profondeur_case" className="block text-sm font-medium text-gray-700 mb-1">Profondeur case (m)</label>
          <input
            id="profondeur_case"
            type="number"
            step="0.01"
            {...register('profondeur_case', { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.profondeur_case && (
            <p className="mt-1 text-xs text-red-600">{errors.profondeur_case.message}</p>
          )}
        </div>
      </div>
    </>
  );
}
