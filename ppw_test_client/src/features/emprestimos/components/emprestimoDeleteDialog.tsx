'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldGroup } from '@/components/ui/field';
import * as React from 'react';
import { deleteEmprestimo } from '../api/emprestimo.actions';
import { Emprestimo, InitialActionState } from '../type/emprestimo.type';

interface EmprestimoDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  emprestimoToDelete: Emprestimo | null;
  onSuccess?: () => void;
}

export function EmprestimoDeleteDialog({
  isOpen,
  onOpenChange,
  emprestimoToDelete,
  onSuccess,
}: EmprestimoDeleteDialogProps) {
  const [isPending, setIsPending] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');

  React.useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
    }
  }, [isOpen]);

  const handleDelete = async () => {
    if (!emprestimoToDelete) return;
    setIsPending(true);
    setErrorMsg('');
    try {
      const res = await deleteEmprestimo(InitialActionState, { id: emprestimoToDelete.id });
      if (res.success) {
        onOpenChange(false);
        onSuccess?.();
      } else {
        setErrorMsg(res.message || 'Erro ao excluir empréstimo.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao comunicar com o servidor.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 border-none bg-transparent shadow-none sm:max-w-md">
        <DialogTitle className="sr-only">Excluir Empréstimo</DialogTitle>
        <Card className="w-full sm:max-w-md border-destructive/30">
          <CardHeader>
            <CardTitle className="text-destructive">Confirmar Exclusão</CardTitle>
            <CardDescription>
              Tem certeza que deseja excluir o empréstimo do item{' '}
              <strong className="text-zinc-900">{emprestimoToDelete?.tituloItem}</strong> pertencente
              ao usuário <strong className="text-zinc-900">{emprestimoToDelete?.usuarioNome}</strong>?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Esta ação removerá o registro permanentemente do banco de dados.
            </p>
            {errorMsg && <p className="mt-2 text-xs text-destructive font-medium">{errorMsg}</p>}
          </CardContent>
          <CardFooter>
            <Field orientation="horizontal">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={isPending}
                onClick={handleDelete}
              >
                {isPending ? 'Excluindo...' : 'Excluir Definitivamente'}
              </Button>
            </Field>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
