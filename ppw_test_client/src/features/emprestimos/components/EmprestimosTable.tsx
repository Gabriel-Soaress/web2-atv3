'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import styles from './emprestimos.module.css';

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

  // Estados dos dialogs
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

  // Contadores para métricas
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
    <div className={styles.wrapper}>
      {/* 1. Grade de Métricas */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span>Reservas</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <div className={styles.metricValue}>{counts.reservado}</div>
          <div className={styles.metricSubtext}>Aguardando retirada</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span>Em Aberto</span>
            <BookOpen size={16} className="text-blue-500" />
          </div>
          <div className={styles.metricValue}>{counts.ativos}</div>
          <div className={styles.metricSubtext}>Empréstimos em uso</div>
        </div>

        <div
          className={`${styles.metricCard} ${
            counts.atrasado > 0 ? styles.metricCardAlert : ''
          }`}
        >
          <div className={styles.metricHeader}>
            <span>Atrasados</span>
            <AlertTriangle
              size={16}
              className={counts.atrasado > 0 ? 'text-red-600' : 'text-slate-400'}
            />
          </div>
          <div className={styles.metricValue}>{counts.atrasado}</div>
          <div className={styles.metricSubtext}>
            {counts.totalMultas > 0
              ? `Multas: R$ ${counts.totalMultas.toFixed(2)}`
              : 'Nenhum atraso'}
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span>Finalizados</span>
            <BookCheck size={16} className="text-emerald-500" />
          </div>
          <div className={styles.metricValue}>{counts.finalizado}</div>
          <div className={styles.metricSubtext}>Devolvidos / Expirados</div>
        </div>
      </div>

      {/* 2. Feedback de Operações e Bloqueios FSM */}
      {feedback && (
        <Alert
          variant={feedback.type === 'error' ? 'destructive' : 'default'}
          className={
            feedback.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-950'
              : 'bg-emerald-50 border-emerald-200 text-emerald-950'
          }
        >
          {feedback.type === 'error' ? (
            <ShieldAlert className="h-4 w-4 text-red-600" />
          ) : (
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          )}
          <AlertTitle className="text-xs font-semibold">
            {feedback.type === 'error' ? 'Bloqueio de Regra de Negócio (FSM)' : 'Sucesso'}
          </AlertTitle>
          <AlertDescription className="text-xs">{feedback.message}</AlertDescription>
        </Alert>
      )}

      {/* 3. Barra de Filtros, Pesquisa e Ações */}
      <div className={styles.toolbar}>
        <div className={styles.filterTabs}>
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`${styles.filterTabBtn} ${
              activeTab === 'ALL' ? styles.filterTabBtnActive : ''
            }`}
          >
            <span>Todos</span>
            <span className={styles.tabBadge}>{counts.total}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('RESERVADO')}
            className={`${styles.filterTabBtn} ${
              activeTab === 'RESERVADO' ? styles.filterTabBtnActive : ''
            }`}
          >
            <span>Reservados</span>
            <span className={styles.tabBadge}>{counts.reservado}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ATIVOS')}
            className={`${styles.filterTabBtn} ${
              activeTab === 'ATIVOS' ? styles.filterTabBtnActive : ''
            }`}
          >
            <span>Em Aberto</span>
            <span className={styles.tabBadge}>{counts.ativos}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ATRASADO')}
            className={`${styles.filterTabBtn} ${
              activeTab === 'ATRASADO' ? styles.filterTabBtnActive : ''
            }`}
          >
            <span>Atrasados</span>
            <span className={styles.tabBadge}>{counts.atrasado}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('FINALIZADO')}
            className={`${styles.filterTabBtn} ${
              activeTab === 'FINALIZADO' ? styles.filterTabBtnActive : ''
            }`}
          >
            <span>Finalizados</span>
            <span className={styles.tabBadge}>{counts.finalizado}</span>
          </button>
        </div>

        <div className={styles.toolbarRight}>
          <div className={styles.searchBox}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar livro, usuário..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className={styles.btnOutline}
            title="Atualizar dados"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className={styles.btnPrimary}
          >
            <PlusCircle size={14} />
            <span>Novo Registro</span>
          </button>
        </div>
      </div>

      {/* 4. Tabela com Larguras Fixas Sem Scroll Horizontal */}
      <div className={styles.tableCard}>
        <table className={styles.customTable}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  let colClass = styles.colItem;
                  if (header.id === 'status') colClass = styles.colStatus;
                  if (header.id === 'datas') colClass = styles.colPrazos;
                  if (header.id === 'actions') colClass = styles.colAcoes;

                  return (
                    <th key={header.id} className={colClass}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    let colClass = styles.colItem;
                    if (cell.column.id === 'status') colClass = styles.colStatus;
                    if (cell.column.id === 'datas') colClass = styles.colPrazos;
                    if (cell.column.id === 'actions') colClass = styles.colAcoes;

                    return (
                      <td key={cell.id} className={colClass}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className={styles.emptyState}>
                  <div className={styles.emptyStateTitle}>
                    Nenhum empréstimo encontrado
                  </div>
                  <div className="text-xs text-slate-500">
                    {globalFilter
                      ? 'Nenhum resultado corresponde à sua pesquisa.'
                      : 'Não há itens nesta categoria.'}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Dialogs */}
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

      <EmprestimoDeleteDialog
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        emprestimoToDelete={deletingItem}
        onSuccess={() => {
          setFeedback({ type: 'success', message: 'Empréstimo excluído com sucesso!' });
          loadData();
        }}
      />

      <EmprestimoDevolverDialog
        isOpen={isDevolverOpen}
        onOpenChange={setIsDevolverOpen}
        emprestimoToReturn={devolvendoItem}
        onSuccess={() => {
          setFeedback({ type: 'success', message: 'Devolução registrada com sucesso!' });
          loadData();
        }}
      />

      <EmprestimoHistoricoDialog
        isOpen={isHistoricoOpen}
        onOpenChange={setIsHistoricoOpen}
        emprestimo={historicoItem}
      />
    </div>
  );
}
