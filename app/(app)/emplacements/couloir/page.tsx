'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { CrudDialog } from '@/components/ui/crud-dialog';
import { CouloirTable, type CouloirRow } from '@/components/features/couloir/couloir-table';
import { CouloirFormFields } from '@/components/features/couloir/couloir-form';
import { DeleteCouloirDialog } from '@/components/features/couloir/delete-couloir-dialog';
import { couloirSchema, type CouloirFormData } from '@/lib/schemas/couloir';
import {
  getCouloirsAction,
  createCouloirAction,
  updateCouloirAction,
  deleteCouloirAction,
} from '@/lib/actions/couloirs';
import { getDepotsAction } from '@/lib/actions/depots';
import { useCouloirDialog } from '@/lib/stores/couloir';

interface DepotOption {
  id: number;
  num_depot: number;
  nom_depot: string;
}

const defaultValues: CouloirFormData = {
  num_couloir: '',
  nom_couloir: '',
  id_depot: 0,
  num_depot: '',
  nombre: 1,
};

export default function CouloirPage() {
  const { user, hydrated } = useAuth();
  const router = useRouter();
  const dialog = useCouloirDialog();

  const [depots, setDepots] = useState<DepotOption[]>([]);
  const [selectedDepotId, setSelectedDepotId] = useState<number | ''>('');
  const [couloirs, setCouloirs] = useState<CouloirRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState<CouloirRow | null>(null);
  const [deleting, startDeleteTransition] = useTransition();

  useEffect(() => {
    if (hydrated && !user) router.push('/login');
  }, [hydrated, user, router]);

  useEffect(() => {
    if (!hydrated || !user) return;
    let cancelled = false;
    getDepotsAction()
      .then((results) => {
        if (!cancelled) setDepots(results as DepotOption[]);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [hydrated, user]);

  useEffect(() => {
    if (!hydrated || !user) return;
    let cancelled = false;
    getCouloirsAction({ id_depot: selectedDepotId || undefined })
      .then((results) => {
        if (!cancelled) {
          setCouloirs(results as CouloirRow[]);
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
  }, [hydrated, user, selectedDepotId, fetchKey]);

  const refresh = () => setFetchKey((k) => k + 1);

  const handleDelete = () => {
    if (!deleteTarget) return;
    startDeleteTransition(async () => {
      try {
        await deleteCouloirAction(deleteTarget.num_couloir);
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
      <PageHeader title="Couloir">
        <select
          value={selectedDepotId}
          onChange={(e) => setSelectedDepotId(e.target.value ? Number(e.target.value) : '')}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tous les dépôts</option>
          {depots.map((d) => (
            <option key={d.id} value={d.id}>
              {d.num_depot} - {d.nom_depot}
            </option>
          ))}
        </select>
        <Button type="button" onClick={dialog.openCreate}>
          + Nouveau couloir
        </Button>
      </PageHeader>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <CouloirTable
        couloirs={couloirs}
        loading={loading}
        onEdit={(couloir) => dialog.openEdit({
          num_couloir: couloir.num_couloir,
          nom_couloir: couloir.nom_couloir,
          id_depot: couloir.id_depot,
          num_depot: couloir.num_depot,
          nombre: 1,
        })}
        onDelete={setDeleteTarget}
      />

      <CrudDialog
        open={dialog.open}
        onClose={dialog.close}
        schema={couloirSchema}
        defaultValues={defaultValues}
        values={dialog.mode === 'edit' && dialog.data ? dialog.data : undefined}
        title={dialog.mode === 'create' ? 'Nouveau couloir' : 'Modifier le couloir'}
        onSubmit={async (data) => {
          const d = data as CouloirFormData;
          if (dialog.mode === 'create') {
            await createCouloirAction(d);
          } else if (dialog.mode === 'edit' && dialog.data) {
            await updateCouloirAction(dialog.data.num_couloir, d);
          }
          refresh();
        }}
      >
        <CouloirFormFields depots={depots} mode={dialog.mode} />
      </CrudDialog>

      <DeleteCouloirDialog
        couloir={deleteTarget}
        deleting={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
