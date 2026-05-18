'use client';

import { Button } from '@/components/ui/button';
import { PencilIcon, Trash2Icon } from 'lucide-react';

export interface DepotRow {
  id: number;
  num_depot: number;
  nom_depot: string;
  contenu_depot: string;
  usr: string;
}

interface DepotTableProps {
  depots: DepotRow[];
  loading: boolean;
  onEdit: (depot: DepotRow) => void;
  onDelete: (depot: DepotRow) => void;
}

export function DepotTable({ depots, loading, onEdit, onDelete }: DepotTableProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">N° Dépôt</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nom</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Contenu</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Utilisateur</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                Chargement...
              </td>
            </tr>
          ) : depots.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                Aucun dépôt trouvé.
              </td>
            </tr>
          ) : (
            depots.map((depot) => (
              <tr key={depot.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{depot.num_depot}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{depot.nom_depot}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{depot.contenu_depot}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{depot.usr}</td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onEdit(depot)}
                    title="Modifier"
                  >
                    <PencilIcon className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onDelete(depot)}
                    className="text-red-600 hover:text-red-800"
                    title="Supprimer"
                  >
                    <Trash2Icon className="size-4" />
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
