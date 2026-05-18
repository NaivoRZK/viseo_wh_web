'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface DeleteCouloirDialogProps {
  couloir: { nom_couloir: string; num_couloir: string } | null;
  deleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteCouloirDialog({ couloir, deleting, onConfirm, onClose }: DeleteCouloirDialogProps) {
  return (
    <Dialog open={!!couloir} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer le couloir <strong>{couloir?.nom_couloir}</strong> (n°{couloir?.num_couloir}) ?
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
