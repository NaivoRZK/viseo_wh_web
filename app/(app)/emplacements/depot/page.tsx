'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { CrudDialog } from '@/components/ui/crud-dialog';
import { DepotTable, type DepotRow } from '@/components/features/depot/depot-table';
import { DepotFormFields } from '@/components/features/depot/depot-form';
import { DeleteDepotDialog } from '@/components/features/depot/delete-depot-dialog';
import { depotSchema, type DepotFormData } from '@/lib/schemas/depot';
import { getDepotsAction, createDepotAction, updateDepotAction, deleteDepotAction } from '@/lib/actions/depots';
import { useDepotDialog } from '@/lib/stores/depot';

const defaultValues: DepotFormData = {
  num_depot: 0,
  nom_depot: '',
  contenu_depot: '',
  usr: '',
};

export default function DepotPage() {
  const { user, hydrated } = useAuth();
  const router = useRouter();
  const dialog = useDepotDialog();

  const [depots, setDepots] = useState<DepotRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState<DepotRow | null>(null);
  const [deleting, startDeleteTransition] = useTransition();

  useEffect(() => {
    if (hydrated && !user) router.push('/login');
  }, [hydrated, user, router]);

  useEffect(() => {
    if (!hydrated || !user) return;
    let cancelled = false;
    getDepotsAction()
      .then((results) => {
        if (!cancelled) {
          setDepots(results as DepotRow[]);
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
  }, [hydrated, user, fetchKey]);

  const refresh = () => setFetchKey((k) => k + 1);

  const handleDelete = () => {
    if (!deleteTarget) return;
    startDeleteTransition(async () => {
      try {
        await deleteDepotAction(deleteTarget.num_depot);
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
      <PageHeader title="Dépôt">
        <Button type="button" onClick={dialog.openCreate}>
          + Nouveau dépôt
        </Button>
      </PageHeader>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <DepotTable
        depots={depots}
        loading={loading}
        onEdit={(depot) => dialog.openEdit({
          num_depot: depot.num_depot,
          nom_depot: depot.nom_depot,
          contenu_depot: depot.contenu_depot,
          usr: depot.usr,
        })}
        onDelete={setDeleteTarget}
      />

      <CrudDialog
        open={dialog.open}
        onClose={dialog.close}
        schema={depotSchema}
        defaultValues={defaultValues}
        values={dialog.mode === 'edit' && dialog.data ? dialog.data : undefined}
        title={dialog.mode === 'create' ? 'Nouveau dépôt' : 'Modifier le dépôt'}
        onSubmit={async (data) => {
          const d = data as DepotFormData;
          if (dialog.mode === 'create') {
            await createDepotAction(d);
          } else if (dialog.mode === 'edit' && dialog.data) {
            await updateDepotAction(dialog.data.num_depot, d);
          }
          refresh();
        }}
      >
        <DepotFormFields />
      </CrudDialog>

      <DeleteDepotDialog
        depot={deleteTarget}
        deleting={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
