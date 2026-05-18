'use client';

import { Button } from '@/components/ui/button';
import { Trash2Icon } from 'lucide-react';

export interface EmplacementRow {
  num_emplacement: string;
  num_niveau: number;
  num_rangee: string;
  quantite: number;
  volume_occupe: number;
  volume_libre: number;
  charge_occupee: number;
  charge_libre: number;
}

interface EmplacementTableProps {
  emplacements: EmplacementRow[];
  loading: boolean;
  onDelete: (emp: EmplacementRow) => void;
}

export function EmplacementTable({ emplacements, loading, onDelete }: EmplacementTableProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">N° Emplacement</th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Niveau</th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Rangée</th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Quantité</th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Vol. occupé</th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Vol. libre</th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Charge occupée</th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Charge libre</th>
            <th className="px-3 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={9} className="px-3 py-8 text-center text-sm text-gray-500">
                Chargement...
              </td>
            </tr>
          ) : emplacements.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-3 py-8 text-center text-sm text-gray-500">
                Aucun emplacement trouvé.
              </td>
            </tr>
          ) : (
            emplacements.map((emp) => (
              <tr key={emp.num_emplacement} className="hover:bg-gray-50">
                <td className="px-3 py-3 text-sm font-medium text-gray-900">{emp.num_emplacement}</td>
                <td className="px-3 py-3 text-sm text-gray-600">{emp.num_niveau}</td>
                <td className="px-3 py-3 text-sm text-gray-600">{emp.num_rangee}</td>
                <td className="px-3 py-3 text-sm text-gray-600">{emp.quantite}</td>
                <td className="px-3 py-3 text-sm text-gray-600">{emp.volume_occupe}</td>
                <td className="px-3 py-3 text-sm text-gray-600">{emp.volume_libre}</td>
                <td className="px-3 py-3 text-sm text-gray-600">{emp.charge_occupee}</td>
                <td className="px-3 py-3 text-sm text-gray-600">{emp.charge_libre}</td>
                <td className="px-3 py-3 text-right whitespace-nowrap">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onDelete(emp)}
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
