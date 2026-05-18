'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface DeleteRackDialogProps {
  rack: { num_rack: string } | null;
  deleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteRackDialog({ rack, deleting, onConfirm, onClose }: DeleteRackDialogProps) {
  return (
    <Dialog open={!!rack} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer le rack <strong>{rack?.num_rack}</strong> ?
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
