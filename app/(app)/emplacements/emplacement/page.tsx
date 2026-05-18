'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { EmplacementTable, type EmplacementRow } from '@/components/features/emplacement/emplacement-table';
import { DeleteEmplacementDialog } from '@/components/features/emplacement/delete-emplacement-dialog';
import { getEmplacementsAction, generateEmplacementsAction, deleteEmplacementAction } from '@/lib/actions/emplacements';
import { getDepotsAction } from '@/lib/actions/depots';
import { getCouloirsAction } from '@/lib/actions/couloirs';
import { getRacksAction } from '@/lib/actions/racks';

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

interface RackOption {
  num_rack: string;
}

export default function EmplacementPage() {
  const { user, hydrated } = useAuth();
  const router = useRouter();

  const [depots, setDepots] = useState<DepotOption[]>([]);
  const [couloirs, setCouloirs] = useState<CouloirOption[]>([]);
  const [racks, setRacks] = useState<RackOption[]>([]);
  const [selectedDepotId, setSelectedDepotId] = useState<number | ''>('');
  const [selectedCouloirId, setSelectedCouloirId] = useState<string>('');
  const [selectedRack, setSelectedRack] = useState<string>('');
  const [emplacements, setEmplacements] = useState<EmplacementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState<EmplacementRow | null>(null);
  const [deleting, startDeleteTransition] = useTransition();
  const [generating, startGenerateTransition] = useTransition();

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
    if (!hydrated || !user || !selectedCouloirId) {
      setRacks([]);
      setEmplacements([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getRacksAction({ num_couloir: selectedCouloirId })
      .then((results) => {
        if (!cancelled) setRacks(results as RackOption[]);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [hydrated, user, selectedCouloirId]);

  useEffect(() => {
    if (!hydrated || !user || !selectedRack) {
      setEmplacements([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getEmplacementsAction({ num_rack: selectedRack })
      .then((results) => {
        if (!cancelled) {
          setEmplacements(results as EmplacementRow[]);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erreur de chargement');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [hydrated, user, selectedRack, fetchKey]);

  const filteredCouloirs = selectedDepotId
    ? couloirs.filter((c) => c.id_depot === selectedDepotId)
    : [];

  const refresh = () => setFetchKey((k) => k + 1);

  const handleGenerate = () => {
    if (!selectedRack) return;
    startGenerateTransition(async () => {
      try {
        const res = await generateEmplacementsAction(selectedRack);
        const { createdCount } = res as { createdCount: number };
        refresh();
        if (createdCount === 0) {
          setError('Aucun emplacement créé. Vérifiez la configuration du rack.');
        } else {
          setSuccessMessage(`${createdCount} emplacement(s) créé(s) avec succès.`);
          setTimeout(() => setSuccessMessage(null), 4000);
        }
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erreur lors de la génération');
      }
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    startDeleteTransition(async () => {
      try {
        await deleteEmplacementAction(deleteTarget.num_emplacement);
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
      <PageHeader title="Emplacement">
        <select
          value={selectedDepotId}
          onChange={(e) => {
            setSelectedDepotId(e.target.value ? Number(e.target.value) : '');
            setSelectedCouloirId('');
            setSelectedRack('');
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
          onChange={(e) => {
            setSelectedCouloirId(e.target.value);
            setSelectedRack('');
          }}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Tous les couloirs</option>
          {filteredCouloirs.map((c) => (
            <option key={c.num_couloir} value={c.num_couloir}>
              {c.num_couloir} - {c.nom_couloir}
            </option>
          ))}
        </select>
        <select
          value={selectedRack}
          disabled={!selectedCouloirId}
          onChange={(e) => setSelectedRack(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Sélectionner un rack</option>
          {racks.map((r) => (
            <option key={r.num_rack} value={r.num_rack}>
              {r.num_rack}
            </option>
          ))}
        </select>
        <Button type="button" onClick={handleGenerate} disabled={!selectedRack || generating}>
          {generating ? 'Génération...' : 'Générer les emplacements'}
        </Button>
      </PageHeader>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
          {successMessage}
        </div>
      )}

      <EmplacementTable
        emplacements={emplacements}
        loading={loading}
        onDelete={setDeleteTarget}
      />

      <DeleteEmplacementDialog
        emplacement={deleteTarget}
        deleting={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
