'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { assignBarcodeAction } from '@/lib/actions/produits';
import { TagInput, type Tag } from 'emblor';
import { BarcodeIcon, FileDownIcon, LinkIcon } from 'lucide-react';

export default function BarcodePage() {
  const { user, hydrated } = useAuth();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [ref, setRef] = useState('');
  const [barcode, setBarcode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [batchTags, setBatchTags] = useState<Tag[]>([]);
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchError, setBatchError] = useState<string | null>(null);

  const handleBatchGenerate = useCallback(async () => {
    const refs = batchTags.map((t) => t.text);
    if (refs.length === 0) {
      setBatchError('Ajoutez au moins une référence.');
      return;
    }

    setBatchLoading(true);
    setBatchError(null);

    try {
      const res = await fetch('/api/products/barcodes/batch', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refs }),
      });

      const contentType = res.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de la génération du PDF.');
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      setBatchError(err instanceof Error ? err.message : 'Erreur lors de la génération du PDF.');
    } finally {
      setBatchLoading(false);
    }
  }, [batchTags]);

  useEffect(() => {
    if (hydrated && !user) router.push('/login');
  }, [hydrated, user, router]);

  if (!hydrated || !user) return null;

  const resetForm = () => {
    setRef('');
    setBarcode('');
    setMessage(null);
  };

  const handleSubmit = async () => {
    setMessage(null);

    if (!ref.trim() || !barcode.trim()) {
      setMessage({ type: 'error', text: 'Les champs "ref" et "barcode" sont requis.' });
      return;
    }

    setSubmitting(true);
    try {
      await assignBarcodeAction(ref.trim(), barcode.trim());
      setMessage({ type: 'success', text: 'Code-barre assigné avec succès.' });
      setTimeout(() => {
        setOpen(false);
        resetForm();
      }, 1200);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Erreur lors de l\'assignation du code-barre.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Liaison article à un code barre">
        <Button type="button" onClick={() => { resetForm(); setOpen(true); }}>
          <LinkIcon className="size-4" />
          Nouvelle liaison
        </Button>
      </PageHeader>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <BarcodeIcon className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Assignation par lot</h2>
            <p className="text-sm text-gray-500">
              Ajoutez les références articles et générez un PDF de codes-barres
            </p>
          </div>
        </div>

        <div className="mb-4">
          <TagInput
            tags={batchTags}
            setTags={setBatchTags}
            placeholder="Saisir une référence article puis Entrée..."
            activeTagIndex={activeTagIndex}
            setActiveTagIndex={setActiveTagIndex}
            variant="primary"
            styleClasses={{
              inlineTagsContainer:
                'flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100',
              input:
                'w-full min-w-[160px] bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none',
              tag: {
                body: 'inline-flex items-center gap-1 rounded-md bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-sm text-blue-700 font-medium',
                closeButton:
                  'inline-flex items-center justify-center rounded-full text-blue-400 hover:text-blue-700 hover:bg-blue-100 transition-colors size-4',
              },
            }}
            inlineTags
            delimiterList={[',', ';', '|', 'Enter']}
            addOnPaste
            clearAll
          />
        </div>

        {batchError && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span className="size-1.5 rounded-full bg-red-500 shrink-0" />
            {batchError}
          </div>
        )}

        <Button
          type="button"
          onClick={handleBatchGenerate}
          disabled={batchLoading || batchTags.length === 0}
          className="gap-2"
        >
          {batchLoading ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Génération...
            </>
          ) : (
            <>
              <FileDownIcon className="size-4" />
              Générer le PDF
            </>
          )}
        </Button>
      </div>

      <Dialog open={open} onOpenChange={(next) => { if (!next) { setOpen(false); resetForm(); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvelle liaison</DialogTitle>
          </DialogHeader>

          {message && (
            <div className={`mx-6 p-3 border rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <div className="flex items-center gap-2">
                <span className={`size-1.5 rounded-full shrink-0 ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
                {message.text}
              </div>
            </div>
          )}

          <div className="space-y-5 px-6 py-4">
            <div>
              <label htmlFor="ref" className="block text-sm font-medium text-gray-700 mb-1.5">
                Référence article
              </label>
              <input
                id="ref"
                type="text"
                value={ref}
                onChange={(e) => setRef(e.target.value)}
                placeholder="Ex: ART-001"
                className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm outline-none transition-colors placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-1.5">
                Code-barre
              </label>
              <input
                id="barcode"
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Ex: 1234567890128"
                className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm outline-none transition-colors placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <DialogFooter showCloseButton>
            <Button type="button" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
