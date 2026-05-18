'use client';

import { Button } from '@/components/ui/button';
import { PencilIcon, Trash2Icon } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export interface CouloirRow {
  num_couloir: string;
  nom_couloir: string;
  id_depot: number;
  num_depot: string;
}

interface CouloirTableProps {
  couloirs: CouloirRow[];
  loading: boolean;
  onEdit: (couloir: CouloirRow) => void;
  onDelete: (couloir: CouloirRow) => void;
}

export function CouloirTable({ couloirs, loading, onEdit, onDelete }: CouloirTableProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">N° Couloir</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nom</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Dépôt</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                <LoadingSpinner size={24} />
              </td>
            </tr>
          ) : couloirs.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                Aucun couloir trouvé.
              </td>
            </tr>
          ) : (
            couloirs.map((couloir) => (
              <tr key={couloir.num_couloir} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{couloir.num_couloir}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{couloir.nom_couloir}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{couloir.num_depot}</td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onEdit(couloir)}
                    title="Modifier"
                  >
                    <PencilIcon className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onDelete(couloir)}
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
