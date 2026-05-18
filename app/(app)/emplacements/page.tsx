'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { getDepotsAction } from '@/lib/actions/depots';
import { getCouloirsAction } from '@/lib/actions/couloirs';
import { getRacksAction } from '@/lib/actions/racks';
import { generateEmplacementsAction } from '@/lib/actions/emplacements';

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

export default function EmplacementsPage() {
  const { user, hydrated } = useAuth();
  const router = useRouter();

  const [depots, setDepots] = useState<DepotOption[]>([]);
  const [couloirs, setCouloirs] = useState<CouloirOption[]>([]);
  const [racks, setRacks] = useState<RackOption[]>([]);
  const [selectedDepotId, setSelectedDepotId] = useState<number | ''>('');
  const [selectedCouloirId, setSelectedCouloirId] = useState<string>('');
  const [selectedRack, setSelectedRack] = useState<string>('');
  const [result, setResult] = useState<{ success: boolean; count: number; message: string } | null>(null);
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
      return;
    }
    let cancelled = false;
    getRacksAction({ num_couloir: selectedCouloirId })
      .then((results) => {
        if (!cancelled) setRacks(results as RackOption[]);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [hydrated, user, selectedCouloirId]);

  const filteredCouloirs = selectedDepotId
    ? couloirs.filter((c) => c.id_depot === selectedDepotId)
    : [];

  const handleGenerate = () => {
    if (!selectedRack) return;
    startGenerateTransition(async () => {
      try {
        const res = await generateEmplacementsAction(selectedRack);
        const { createdCount } = res as { createdCount: number };
        if (createdCount === 0) {
          setResult({
            success: false,
            count: 0,
            message: 'Aucun emplacement créé. Vérifiez la configuration du rack.',
          });
        } else {
          setResult({
            success: true,
            count: createdCount,
            message: `${createdCount} emplacement(s) créé(s) avec succès (vérifié via retour API).`,
          });
        }
      } catch (err) {
        setResult({
          success: false,
          count: 0,
          message: err instanceof Error ? err.message : 'Erreur lors de la génération',
        });
      }
    });
  };

  if (!hydrated || !user) return null;

  return (
    <div>
      <PageHeader title="Création emplacements" />

      <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-lg mx-auto mt-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dépôt</label>
            <select
              value={selectedDepotId}
              onChange={(e) => {
                setSelectedDepotId(e.target.value ? Number(e.target.value) : '');
                setSelectedCouloirId('');
                setSelectedRack('');
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Couloir</label>
            <select
              value={selectedCouloirId}
              disabled={!selectedDepotId}
              onChange={(e) => {
                setSelectedCouloirId(e.target.value);
                setSelectedRack('');
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
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rack</label>
            <select
              value={selectedRack}
              disabled={!selectedCouloirId}
              onChange={(e) => setSelectedRack(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Sélectionner un rack</option>
              {racks.map((r) => (
                <option key={r.num_rack} value={r.num_rack}>
                  {r.num_rack}
                </option>
              ))}
            </select>
          </div>
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={!selectedRack || generating}
            className="w-full"
          >
            {generating ? 'Génération en cours...' : 'Générer les emplacements'}
          </Button>
          {result && (
            <div className={`p-3 rounded-md text-sm ${result.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {result.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
