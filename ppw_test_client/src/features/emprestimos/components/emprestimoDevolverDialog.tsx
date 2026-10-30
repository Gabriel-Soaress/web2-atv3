'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import * as React from 'react';
import { useState } from 'react';
import { devolverEmprestimo } from '../api/emprestimo.actions';
import { Emprestimo } from '../type/emprestimo.type';

interface EmprestimoDevolverDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  emprestimoToReturn: Emprestimo | null;
  onSuccess?: () => void;
}

export function EmprestimoDevolverDialog({
  isOpen,
  onOpenChange,
  emprestimoToReturn,
  onSuccess,
}: EmprestimoDevolverDialogProps) {
  const [temAvaria, setTemAvaria] = useState(false);
  const [descricaoAvaria, setDescricaoAvaria] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setTemAvaria(false);
      setDescricaoAvaria('');
      setErrorMsg('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emprestimoToReturn) return;

    if (temAvaria && !descricaoAvaria.trim()) {
      setErrorMsg('Informe a descrição da avaria detectada.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await devolverEmprestimo(emprestimoToReturn.id, {
        temAvaria,
        descricaoAvaria: temAvaria ? descricaoAvaria : undefined,
      });

      if (res.success) {
        onOpenChange(false);
        onSuccess?.();
      } else {
        setErrorMsg(res.message || 'Erro ao registrar devolução.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro inesperado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 border-none bg-transparent shadow-none sm:max-w-md">
        <DialogTitle className="sr-only">Registrar Devolução</DialogTitle>
        <Card className="w-full sm:max-w-md">
          <CardHeader>
            <CardTitle>Registrar Devolução</CardTitle>
            <CardDescription>
              Finalizar o empréstimo do item <strong>{emprestimoToReturn?.tituloItem}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form id="form-devolver" onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="temAvariaCheck"
                  checked={temAvaria}
                  onChange={(e) => setTemAvaria(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="temAvariaCheck" className="text-sm font-medium text-zinc-900 cursor-pointer">
                  Item devolvido com avaria / dano
                </label>
              </div>

              {temAvaria && (
                <Field>
                  <FieldLabel htmlFor="descAvaria">Descrição do Dano / Avaria</FieldLabel>
                  <Input
                    id="descAvaria"
                    placeholder="Ex: Capa rasgada, tela riscada, cabo com mau contato..."
                    value={descricaoAvaria}
                    onChange={(e) => setDescricaoAvaria(e.target.value)}
                  />
                </Field>
              )}

              {errorMsg && <p className="text-sm text-destructive font-medium">{errorMsg}</p>}
            </form>
          </CardContent>
          <CardFooter>
            <Field orientation="horizontal">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" form="form-devolver" disabled={isSubmitting}>
                {isSubmitting ? 'Processando...' : 'Confirmar Devolução'}
              </Button>
            </Field>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
