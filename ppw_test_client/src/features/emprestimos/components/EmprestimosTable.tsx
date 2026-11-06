'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Info, PlusCircle, RefreshCw, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  cancelarEmprestimo,
  getAllEmprestimos,
  renovarEmprestimo,
  retirarEmprestimo,
} from '../api/emprestimo.actions';
import { Emprestimo } from '../type/emprestimo.type';
import { EmprestimoDeleteDialog } from './emprestimoDeleteDialog';
import { EmprestimoDevolverDialog } from './emprestimoDevolverDialog';
import { EmprestimoFormDialog } from './emprestimoFormDialog';
import { EmprestimoHistoricoDialog } from './EmprestimoHistoricoDialog';
import { getEmprestimoColumns } from './emprestimos-columns';

interface EmprestimosTableProps {
  initialData?: Emprestimo[];
}

export function EmprestimosTable({ initialData = [] }: EmprestimosTableProps) {
  const [data, setData] = useState<Emprestimo[]>(initialData);
  const [globalFilter, setGlobalFilter] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );

  // Estados dos modais/dialogs
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Emprestimo | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Emprestimo | null>(null);

  const [isDevolverOpen, setIsDevolverOpen] = useState(false);
  const [devolvendoItem, setDevolvendoItem] = useState<Emprestimo | null>(null);

  const [isHistoricoOpen, setIsHistoricoOpen] = useState(false);
  const [historicoItem, setHistoricoItem] = useState<Emprestimo | null>(null);

  // Recarregar dados
  const loadData = useCallback(async () => {
    const list = await getAllEmprestimos();
    setData(list);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const handleOpenCreate = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: Emprestimo) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (item: Emprestimo) => {
    setDeletingItem(item);
    setIsDeleteOpen(true);
  };

  const handleOpenDevolver = (item: Emprestimo) => {
    setDevolvendoItem(item);
    setIsDevolverOpen(true);
  };

  const handleOpenHistorico = (item: Emprestimo) => {
    setHistoricoItem(item);
    setIsHistoricoOpen(true);
  };

  const handleRetirar = async (id: string) => {
    const res = await retirarEmprestimo(id);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message || 'Retirada registrada com sucesso!' });
      await loadData();
    } else {
      setFeedback({ type: 'error', message: res.message || 'Erro ao registrar retirada.' });
    }
  };

  const handleRenovar = async (id: string) => {
    const res = await renovarEmprestimo(id);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message || 'Prazo renovado com sucesso!' });
      await loadData();
    } else {
      setFeedback({ type: 'error', message: res.message || 'Erro ao renovar prazo.' });
    }
  };

  const handleCancelar = async (id: string) => {
    const res = await cancelarEmprestimo(id);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message || 'Reserva cancelada com sucesso!' });
      await loadData();
    } else {
      setFeedback({ type: 'error', message: res.message || 'Erro ao cancelar reserva.' });
    }
  };

  const columns = useMemo<ColumnDef<Emprestimo>[]>(
    () =>
      getEmprestimoColumns({
        onEdit: handleOpenEdit,
        onDelete: handleOpenDelete,
        onRetirar: handleRetirar,
        onRenovar: handleRenovar,
        onDevolver: handleOpenDevolver,
        onCancelar: handleCancelar,
        onHistorico: handleOpenHistorico,
      }),
    [loadData],
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-4">
      {/* Alerta de Feedback com suporte a erros de domínio (HTTP 422) */}
      {feedback && (
        <Alert variant={feedback.type === 'error' ? 'destructive' : 'default'} className="mb-4">
          {feedback.type === 'error' ? (
            <ShieldAlert className="h-4 w-4" />
          ) : (
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          )}
          <AlertTitle>
            {feedback.type === 'error' ? 'Bloqueio de Regra de Negócio' : 'Sucesso'}
          </AlertTitle>
          <AlertDescription>{feedback.message}</AlertDescription>
        </Alert>
      )}

      {/* Barra de Ações superiores e filtro */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <input
          type="text"
          placeholder="Buscar por usuário, livro, status..."
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="h-10 w-full sm:max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button variant="outline" size="sm" onClick={loadData} title="Atualizar lista">
            <RefreshCw className="h-4 w-4 mr-1" /> Atualizar
          </Button>
          <Button onClick={handleOpenCreate} className="bg-primary text-primary-foreground">
            <PlusCircle className="h-4 w-4 mr-1.5" /> Nova Reserva / Empréstimo
          </Button>
        </div>
      </div>

      {/* Tabela TanStack */}
      <div className="border rounded-lg bg-card shadow-xs overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                  Nenhum empréstimo cadastrado. Clique em &quot;Nova Reserva&quot; para começar!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog para Incluir / Alterar */}
      <EmprestimoFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        emprestimoToEdit={editingItem}
        onSuccess={() => {
          setFeedback({
            type: 'success',
            message: editingItem
              ? 'Empréstimo alterado com sucesso!'
              : 'Empréstimo/Reserva incluído com sucesso!',
          });
          loadData();
        }}
      />

      {/* Dialog para Excluir */}
      <EmprestimoDeleteDialog
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        emprestimoToDelete={deletingItem}
        onSuccess={() => {
          setFeedback({ type: 'success', message: 'Empréstimo excluído com sucesso!' });
          loadData();
        }}
      />

      {/* Dialog para Devolver */}
      <EmprestimoDevolverDialog
        isOpen={isDevolverOpen}
        onOpenChange={setIsDevolverOpen}
        emprestimoToReturn={devolvendoItem}
        onSuccess={() => {
          setFeedback({ type: 'success', message: 'Devolução registrada com sucesso!' });
          loadData();
        }}
      />

      {/* Dialog para Trilha de Auditoria (Audit Log) */}
      <EmprestimoHistoricoDialog
        isOpen={isHistoricoOpen}
        onOpenChange={setIsHistoricoOpen}
        emprestimo={historicoItem}
      />
    </div>
  );
}
