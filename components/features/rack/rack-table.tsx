'use client';

import { Button } from '@/components/ui/button';
import { PencilIcon, Trash2Icon } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export interface RackRow {
  num_rack: string;
  num_couloir: string;
  num_rack_dans_couloir: number;
  nb_rangee: number;
  nb_niveau: number;
  charge_max: number;
  hauteur_case: number;
  largeur_case: number;
  profondeur_case: number;
  nb_cases: number;
  volume_case: number;
  charge_max_case: number;
}

interface RackTableProps {
  racks: RackRow[];
  loading: boolean;
  onEdit: (rack: RackRow) => void;
  onDelete: (rack: RackRow) => void;
}

export function RackTable({ racks, loading, onEdit, onDelete }: RackTableProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">N° Rack</th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">N° Couloir</th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">N° ds Couloir</th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Rangées</th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Niveaux</th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Charge max</th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">H. case</th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">L. case</th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">P. case</th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Cases</th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Volume</th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Charge/case</th>
            <th className="px-3 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={13} className="px-3 py-8 text-center text-sm text-gray-500">
                <LoadingSpinner size={24} />
              </td>
            </tr>
          ) : racks.length === 0 ? (
            <tr>
              <td colSpan={13} className="px-3 py-8 text-center text-sm text-gray-500">
                Aucun rack trouvé.
              </td>
            </tr>
          ) : (
            racks.map((rack) => (
              <tr key={rack.num_rack} className="hover:bg-gray-50">
                <td className="px-3 py-3 text-sm font-medium text-gray-900">{rack.num_rack}</td>
                <td className="px-3 py-3 text-sm text-gray-600">{rack.num_couloir}</td>
                <td className="px-3 py-3 text-sm text-gray-600">{rack.num_rack_dans_couloir}</td>
                <td className="px-3 py-3 text-sm text-gray-600">{rack.nb_rangee}</td>
                <td className="px-3 py-3 text-sm text-gray-600">{rack.nb_niveau}</td>
                <td className="px-3 py-3 text-sm text-gray-600">{rack.charge_max}</td>
                <td className="px-3 py-3 text-sm text-gray-600">{rack.hauteur_case}</td>
                <td className="px-3 py-3 text-sm text-gray-600">{rack.largeur_case}</td>
                <td className="px-3 py-3 text-sm text-gray-600">{rack.profondeur_case}</td>
                <td className="px-3 py-3 text-sm text-gray-600">{rack.nb_cases}</td>
                <td className="px-3 py-3 text-sm text-gray-600">{rack.volume_case}</td>
                <td className="px-3 py-3 text-sm text-gray-600">{rack.charge_max_case}</td>
                <td className="px-3 py-3 text-right whitespace-nowrap">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onEdit(rack)}
                    title="Modifier"
                  >
                    <PencilIcon className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onDelete(rack)}
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
