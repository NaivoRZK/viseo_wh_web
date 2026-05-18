'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { CrudDialog } from '@/components/ui/crud-dialog';
import { RackTable, type RackRow } from '@/components/features/rack/rack-table';
import { RackFormFields } from '@/components/features/rack/rack-form';
import { DeleteRackDialog } from '@/components/features/rack/delete-rack-dialog';
import { rackSchema, type RackFormData } from '@/lib/schemas/rack';
import { getRacksAction, createRackAction, updateRackAction, deleteRackAction } from '@/lib/actions/racks';
import { getDepotsAction } from '@/lib/actions/depots';
import { getCouloirsAction } from '@/lib/actions/couloirs';
import { useRackDialog } from '@/lib/stores/rack';

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

const defaultValues: RackFormData = {
  num_rack: '',
  num_couloir: '',
  couloir_num_couloir: '',
  num_rack_dans_couloir: 0,
  nb_rangee: 1,
  nb_niveau: 1,
  charge_max: 0,
  hauteur_case: 0,
  largeur_case: 0,
  profondeur_case: 0,
  nombre: 1,
};

export default function RackPage() {
  const { user, hydrated } = useAuth();
  const router = useRouter();
  const dialog = useRackDialog();

  const [depots, setDepots] = useState<DepotOption[]>([]);
  const [couloirs, setCouloirs] = useState<CouloirOption[]>([]);
  const [selectedDepotId, setSelectedDepotId] = useState<number | ''>('');
  const [selectedCouloirId, setSelectedCouloirId] = useState<string>('');
  const [racks, setRacks] = useState<RackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState<RackRow | null>(null);
  const [deleting, startDeleteTransition] = useTransition();

  useEffect(() => {
    if (hydrated && !user) router.push('/login');
  }, [hydrated, user, router]);

  useEffect(() => {
    if (!hydrated || !user) return;
    let cancelled = false;
    Promise.all([
      getDepotsAction(),
      getCouloirsAction(),
    ]).then(([depotsRes, couloirsRes]) => {
      if (!cancelled) {
        setDepots(depotsRes as DepotOption[]);
        setCouloirs(couloirsRes as CouloirOption[]);
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [hydrated, user]);

  useEffect(() => {
    if (!hydrated || !user) return;
    let cancelled = false;
    getRacksAction({ num_couloir: selectedCouloirId || undefined })
      .then((results) => {
        if (!cancelled) {
          setRacks(results as RackRow[]);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erreur de chargement');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [hydrated, user, selectedCouloirId, fetchKey]);

  const filteredCouloirs = selectedDepotId
    ? couloirs.filter((c) => c.id_depot === selectedDepotId)
    : [];

  const refresh = () => setFetchKey((k) => k + 1);

  const handleDelete = () => {
    if (!deleteTarget) return;
    startDeleteTransition(async () => {
      try {
        await deleteRackAction(deleteTarget.num_rack);
        setDeleteTarget(null);
        refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      }
    });
  };

  if (!hydrated || !user) return null;

  return (
    <div>
      <PageHeader title="Rack">
        <select
          value={selectedDepotId}
          onChange={(e) => {
            setSelectedDepotId(e.target.value ? Number(e.target.value) : '');
            setSelectedCouloirId('');
          }}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tous les dépôts</option>
          {depots.map((d) => (
            <option key={d.id} value={d.id}>
              {d.num_depot} - {d.nom_depot}
            </option>
          ))}
        </select>
        <select
          value={selectedCouloirId}
          disabled={!selectedDepotId}
          onChange={(e) => setSelectedCouloirId(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Tous les couloirs</option>
          {filteredCouloirs.map((c) => (
            <option key={c.num_couloir} value={c.num_couloir}>
              {c.num_couloir} - {c.nom_couloir}
            </option>
          ))}
        </select>
        <Button type="button" onClick={dialog.openCreate}>
          + Nouveau rack
        </Button>
      </PageHeader>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <RackTable
        racks={racks}
        loading={loading}
        onEdit={(rack) => {
          const couloir = couloirs.find((c) => c.num_couloir === rack.num_couloir);
          if (couloir) {
            setSelectedDepotId(couloir.id_depot);
          }
          dialog.openEdit({
            num_rack: rack.num_rack,
            num_couloir: rack.num_couloir,
            couloir_num_couloir: rack.num_couloir,
            num_rack_dans_couloir: rack.num_rack_dans_couloir,
            nb_rangee: rack.nb_rangee,
            nb_niveau: rack.nb_niveau,
            charge_max: rack.charge_max,
            hauteur_case: rack.hauteur_case,
            largeur_case: rack.largeur_case,
            profondeur_case: rack.profondeur_case,
            nombre: 1,
          });
        }}
        onDelete={setDeleteTarget}
      />

      <CrudDialog
        open={dialog.open}
        onClose={dialog.close}
        schema={rackSchema}
        defaultValues={defaultValues}
        values={dialog.mode === 'edit' && dialog.data ? dialog.data : undefined}
        title={dialog.mode === 'create' ? 'Nouveau rack' : 'Modifier le rack'}
        onSubmit={async (data) => {
          const d = data as RackFormData;
          if (dialog.mode === 'create') {
            await createRackAction(d);
          } else if (dialog.mode === 'edit' && dialog.data) {
            await updateRackAction(dialog.data.num_rack, d);
          }
          refresh();
        }}
      >
        <RackFormFields
          depots={depots}
          couloirs={couloirs}
          selectedDepotId={selectedDepotId}
          onDepotChange={setSelectedDepotId}
          mode={dialog.mode}
        />
      </CrudDialog>

      <DeleteRackDialog
        rack={deleteTarget}
        deleting={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
