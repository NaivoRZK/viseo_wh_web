'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface DeleteDepotDialogProps {
  depot: { nom_depot: string; num_depot: number } | null;
  deleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteDepotDialog({ depot, deleting, onConfirm, onClose }: DeleteDepotDialogProps) {
  return (
    <Dialog open={!!depot} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer le dépôt <strong>{depot?.nom_depot}</strong> (n°{depot?.num_depot}) ?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter showCloseButton>
          <Button variant="destructive" onClick={onConfirm} disabled={deleting}>
            {deleting ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
