'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  AlertTriangle,
  BookCheck,
  BookOpen,
  Clock,
  PlusCircle,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
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

type StatusFilterTab = 'ALL' | 'RESERVADO' | 'ATIVOS' | 'ATRASADO' | 'FINALIZADO';

export function EmprestimosTable({ initialData = [] }: EmprestimosTableProps) {
  const [data, setData] = useState<Emprestimo[]>(initialData);
  const [globalFilter, setGlobalFilter] = useState('');
  const [activeTab, setActiveTab] = useState<StatusFilterTab>('ALL');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    try {
      const list = await getAllEmprestimos();
      setData(list);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Contagens para métricas e tabs
  const counts = useMemo(() => {
    const total = data.length;
    const reservado = data.filter((item) => item.status === 'RESERVADO').length;
    const ativos = data.filter((item) => item.status === 'RETIRADO').length;
    const atrasado = data.filter((item) => item.status === 'ATRASADO').length;
    const finalizado = data.filter(
      (item) =>
        item.status === 'DEVOLVIDO' ||
        item.status === 'DEVOLVIDO_COM_MULTA' ||
        item.status === 'EXPIRADO' ||
        item.status === 'CANCELADO',
    ).length;
    const totalMultas = data.reduce((acc, curr) => acc + (Number(curr.valorMulta) || 0), 0);

    return { total, reservado, ativos, atrasado, finalizado, totalMultas };
  }, [data]);

  // Filtragem conforme a tab ativa
  const filteredData = useMemo(() => {
    if (activeTab === 'ALL') return data;
    if (activeTab === 'RESERVADO') return data.filter((d) => d.status === 'RESERVADO');
    if (activeTab === 'ATIVOS') return data.filter((d) => d.status === 'RETIRADO');
    if (activeTab === 'ATRASADO') return data.filter((d) => d.status === 'ATRASADO');
    if (activeTab === 'FINALIZADO') {
      return data.filter(
        (d) =>
          d.status === 'DEVOLVIDO' ||
          d.status === 'DEVOLVIDO_COM_MULTA' ||
          d.status === 'EXPIRADO' ||
          d.status === 'CANCELADO',
      );
    }
    return data;
  }, [data, activeTab]);

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
    data: filteredData,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-5">
      {/* Cards de Métricas e Resumo Rápido */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white border border-slate-200/80 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Reservas</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-slate-800">{counts.reservado}</div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Aguardando retirada</p>
        </div>

        <div className="p-3.5 bg-white border border-slate-200/80 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Em Uso (Ativos)</span>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-xl font-bold text-slate-800">{counts.ativos}</div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Com usuários</p>
        </div>

        <div
          className={`p-3.5 border rounded-xl shadow-xs ${
            counts.atrasado > 0
              ? 'bg-red-50/60 border-red-200 text-red-900'
              : 'bg-white border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium">Atrasados</span>
            <AlertTriangle
              className={`h-4 w-4 ${counts.atrasado > 0 ? 'text-red-600 animate-bounce' : 'text-slate-400'}`}
            />
          </div>
          <div className="text-xl font-bold">{counts.atrasado}</div>
          <p className="text-[11px] opacity-80 mt-0.5">
            {counts.totalMultas > 0
              ? `Multas acumuladas: R$ ${counts.totalMultas.toFixed(2)}`
              : 'Nenhum atraso'}
          </p>
        </div>

        <div className="p-3.5 bg-white border border-slate-200/80 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Finalizados</span>
            <BookCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-slate-800">{counts.finalizado}</div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Devolvidos / Expirados</p>
        </div>
      </div>

      {/* Alerta de Feedback com suporte a erros de domínio (HTTP 422) */}
      {feedback && (
        <Alert
          variant={feedback.type === 'error' ? 'destructive' : 'default'}
          className={`transition-all duration-200 ${
            feedback.type === 'error'
              ? 'bg-red-50 border-red-300 text-red-900'
              : 'bg-emerald-50 border-emerald-300 text-emerald-900'
          }`}
        >
          {feedback.type === 'error' ? (
            <ShieldAlert className="h-4 w-4 text-red-600" />
          ) : (
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          )}
          <AlertTitle className="font-semibold text-sm">
            {feedback.type === 'error' ? 'Bloqueio de Regra de Negócio (FSM)' : 'Operação Realizada'}
          </AlertTitle>
          <AlertDescription className="text-xs mt-0.5">{feedback.message}</AlertDescription>
        </Alert>
      )}

      {/* Barra de Filtros e Ações Principais */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        {/* Abas / Pills de Filtragem por Estado */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Todos
            <Badge
              variant="secondary"
              className={`text-[10px] px-1.5 py-0 h-4 ${
                activeTab === 'ALL' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {counts.total}
            </Badge>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('RESERVADO')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'RESERVADO'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Reservados
            <Badge
              variant="secondary"
              className={`text-[10px] px-1.5 py-0 h-4 ${
                activeTab === 'RESERVADO' ? 'bg-amber-700 text-white' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {counts.reservado}
            </Badge>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ATIVOS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'ATIVOS'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Em Aberto
            <Badge
              variant="secondary"
              className={`text-[10px] px-1.5 py-0 h-4 ${
                activeTab === 'ATIVOS' ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-800'
              }`}
            >
              {counts.ativos}
            </Badge>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ATRASADO')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'ATRASADO'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Atrasados
            <Badge
              variant="secondary"
              className={`text-[10px] px-1.5 py-0 h-4 ${
                activeTab === 'ATRASADO' ? 'bg-red-700 text-white' : 'bg-red-100 text-red-800'
              }`}
            >
              {counts.atrasado}
            </Badge>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('FINALIZADO')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'FINALIZADO'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Finalizados
            <Badge
              variant="secondary"
              className={`text-[10px] px-1.5 py-0 h-4 ${
                activeTab === 'FINALIZADO'
                  ? 'bg-emerald-800 text-white'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {counts.finalizado}
            </Badge>
          </button>
        </div>

        {/* Campo de Busca e Botões de Ação */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar livro, usuário..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="h-9 w-full pl-8 pr-3 rounded-lg border border-slate-200 bg-slate-50 text-xs shadow-none focus-visible:bg-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
            className="h-9 px-2.5 text-xs text-slate-700 border-slate-200 hover:bg-slate-50"
            title="Atualizar lista"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>

          <Button
            onClick={handleOpenCreate}
            size="sm"
            className="h-9 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white shadow-xs gap-1.5"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Novo Registro</span>
          </Button>
        </div>
      </div>

      {/* Tabela TanStack com visual limpo */}
      <div className="border border-slate-200 rounded-xl bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/75 border-b border-slate-200">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-xs font-bold uppercase tracking-wider text-slate-500 py-3"
                    >
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
                  <TableRow
                    key={row.id}
                    className="hover:bg-slate-50/70 border-b border-slate-100 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-36 text-center text-muted-foreground text-sm"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="font-medium text-slate-600">
                        Nenhum registro encontrado para este filtro.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setActiveTab('ALL');
                          setGlobalFilter('');
                        }}
                        className="text-xs"
                      >
                        Limpar Filtros
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
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
