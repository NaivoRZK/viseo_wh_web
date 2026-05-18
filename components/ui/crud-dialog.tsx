'use client';

import { useTransition } from 'react';
import {
  useForm,
  FormProvider,
  type DefaultValues,
  type FieldValues,
  type SubmitHandler,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export interface CrudDialogProps {
  open: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: z.ZodType<any, any, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValues: DefaultValues<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values?: any;
  title: string;
  description?: string;
  onSubmit: (data: FieldValues) => Promise<void>;
  children: React.ReactNode;
}

export function CrudDialog({
  open,
  onClose,
  schema,
  defaultValues,
  values,
  title,
  description,
  onSubmit,
  children,
}: CrudDialogProps) {
  const [isPending, startTransition] = useTransition();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    values,
  });

  const handleSubmit: SubmitHandler<FieldValues> = (data) => {
    startTransition(async () => {
      await onSubmit(data);
      onClose();
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="space-y-4 px-6 py-4">
              {children}
            </div>
            <DialogFooter showCloseButton>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
