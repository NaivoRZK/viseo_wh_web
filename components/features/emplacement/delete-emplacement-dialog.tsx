'use client';

import type { EmplacementRow } from './emplacement-table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeleteEmplacementDialogProps {
  emplacement: EmplacementRow | null;
  deleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteEmplacementDialog({
  emplacement,
  deleting,
  onConfirm,
  onClose,
}: DeleteEmplacementDialogProps) {
  if (!emplacement) return null;

  return (
    <Dialog open={!!emplacement} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Supprimer l'emplacement</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer l'emplacement <strong>{emplacement.num_emplacement}</strong> ?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={deleting}>
            {deleting ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
