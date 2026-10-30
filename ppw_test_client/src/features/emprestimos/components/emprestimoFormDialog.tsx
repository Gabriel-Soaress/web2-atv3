'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { createEmprestimo, updateEmprestimo } from '../api/emprestimo.actions';
import {
  EmprestimoCreateSchema,
  emprestimoCreateSchema,
} from '../schema/emprestimo.schema';
import { Emprestimo, InitialActionState } from '../type/emprestimo.type';

interface EmprestimoFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  emprestimoToEdit?: Emprestimo | null;
  onSuccess?: () => void;
}

export function EmprestimoFormDialog({
  isOpen,
  onOpenChange,
  emprestimoToEdit,
  onSuccess,
}: EmprestimoFormDialogProps) {
  const isEditing = Boolean(emprestimoToEdit);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<EmprestimoCreateSchema>({
    resolver: zodResolver(emprestimoCreateSchema),
    defaultValues: {
      tituloItem: '',
      tipoItem: 'LIVRO',
      usuarioNome: '',
    },
  });

  // Resetar e preencher valores ao abrir dialog
  React.useEffect(() => {
    if (isOpen) {
      form.clearErrors();
      if (emprestimoToEdit) {
        form.reset({
          tituloItem: emprestimoToEdit.tituloItem,
          tipoItem: emprestimoToEdit.tipoItem,
          usuarioNome: emprestimoToEdit.usuarioNome,
        });
      } else {
        form.reset({
          tituloItem: '',
          tipoItem: 'LIVRO',
          usuarioNome: '',
        });
      }
    }
  }, [isOpen, emprestimoToEdit, form]);

  const onSubmit = async (data: EmprestimoCreateSchema) => {
    setIsSubmitting(true);
    try {
      const res = isEditing && emprestimoToEdit
        ? await updateEmprestimo(InitialActionState, { id: emprestimoToEdit.id, data })
        : await createEmprestimo(InitialActionState, data);

      if (res.success) {
        onOpenChange(false);
        onSuccess?.();
      } else {
        if (res.errors) {
          Object.entries(res.errors).forEach(([field, message]) => {
            form.setError(field as keyof EmprestimoCreateSchema, {
              type: 'server',
              message: Array.isArray(message) ? message[0] : (message as string),
            });
          });
        }
        if (res.message) {
          form.setError('root', {
            type: 'server',
            message: res.message,
          });
        }
      }
    } catch (err: any) {
      form.setError('root', {
        type: 'server',
        message: err.message || 'Erro inesperado ao salvar empréstimo.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBusy = isSubmitting;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 border-none bg-transparent shadow-none sm:max-w-md">
        <DialogTitle className="sr-only">
          {isEditing ? 'Alterar Empréstimo' : 'Novo Empréstimo / Reserva'}
        </DialogTitle>
        <Card className="w-full sm:max-w-md">
          <CardHeader>
            <CardTitle>{isEditing ? 'Alterar Empréstimo' : 'Novo Empréstimo / Reserva'}</CardTitle>
            <CardDescription>
              {isEditing
                ? 'Atualize as informações do item ou do usuário.'
                : 'Preencha os campos abaixo para cadastrar uma nova reserva.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form id="form-emprestimo" onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup>
                <Controller
                  name="tituloItem"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="tituloItem">Título do Item</FieldLabel>
                      <Input
                        {...field}
                        id="tituloItem"
                        placeholder="Ex: Livro Clean Architecture, Notebook Dell..."
                        value={field.value ?? ''}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  name="tipoItem"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="tipoItem">Tipo de Item</FieldLabel>
                      <select
                        {...field}
                        id="tipoItem"
                        className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        aria-invalid={fieldState.invalid}
                      >
                        <option value="LIVRO">Livro</option>
                        <option value="EQUIPAMENTO">Equipamento</option>
                      </select>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  name="usuarioNome"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="usuarioNome">Nome do Usuário</FieldLabel>
                      <Input
                        {...field}
                        id="usuarioNome"
                        placeholder="Ex: Carlos Silva, Maria Santos..."
                        value={field.value ?? ''}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </FieldGroup>
              {form.formState.errors.root && (
                <p className="mt-3 text-sm text-destructive font-medium">
                  {form.formState.errors.root.message}
                </p>
              )}
            </form>
          </CardContent>

          <CardFooter>
            <Field orientation="horizontal">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" form="form-emprestimo" disabled={isBusy}>
                {isBusy ? 'Salvando...' : isEditing ? 'Atualizar' : 'Cadastrar Reserva'}
              </Button>
            </Field>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
