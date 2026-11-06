'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import {
  AlertTriangle,
  Ban,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Edit2,
  History,
  Laptop,
  MoreHorizontal,
  RefreshCw,
  Trash2,
  User,
  XCircle,
} from 'lucide-react';
import { Emprestimo } from '../type/emprestimo.type';
import styles from './emprestimos.module.css';

interface EmprestimoColumnsProps {
  onEdit: (item: Emprestimo) => void;
  onDelete: (item: Emprestimo) => void;
  onRetirar: (id: string) => void;
  onRenovar: (id: string) => void;
  onDevolver: (item: Emprestimo) => void;
  onCancelar: (id: string) => void;
  onHistorico: (item: Emprestimo) => void;
}

export const getEmprestimoColumns = ({
  onEdit,
  onDelete,
  onRetirar,
  onRenovar,
  onDevolver,
  onCancelar,
  onHistorico,
}: EmprestimoColumnsProps): ColumnDef<Emprestimo>[] => [
  {
    accessorKey: 'tituloItem',
    header: () => <span>Item & Solicitante</span>,
    cell: ({ row }) => {
      const item = row.original;
      const isLivro = item.tipoItem?.toUpperCase().includes('LIVRO');
      return (
        <div className={styles.itemCell}>
          <div
            className={`${styles.itemIconWrapper} ${
              isLivro ? styles.iconLivro : styles.iconEquipamento
            }`}
          >
            {isLivro ? <BookOpen size={16} /> : <Laptop size={16} />}
          </div>
          <div className={styles.itemInfo}>
            <span className={styles.itemTitle} title={item.tituloItem}>
              {item.tituloItem}
            </span>
            <div className={styles.itemSubtext}>
              <User size={12} className="shrink-0" />
              <span className={styles.itemUser}>{item.usuarioNome}</span>
              <span>•</span>
              <span className="uppercase">{item.tipoItem}</span>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: () => <span>Status (FSM)</span>,
    cell: ({ row }) => {
      const status = row.original.status;
      switch (status) {
        case 'RESERVADO':
          return (
            <span className={`${styles.badgeFsm} ${styles.badgeReservado}`}>
              <Clock size={12} />
              Reservado
            </span>
          );
        case 'RETIRADO':
          return (
            <span className={`${styles.badgeFsm} ${styles.badgeRetirado}`}>
              <BookOpen size={12} />
              Em Uso
            </span>
          );
        case 'ATRASADO':
          return (
            <span className={`${styles.badgeFsm} ${styles.badgeAtrasado}`}>
              <AlertTriangle size={12} />
              Atrasado
            </span>
          );
        case 'DEVOLVIDO':
          return (
            <span className={`${styles.badgeFsm} ${styles.badgeDevolvido}`}>
              <CheckCircle2 size={12} />
              Devolvido
            </span>
          );
        case 'DEVOLVIDO_COM_MULTA':
          return (
            <span className={`${styles.badgeFsm} ${styles.badgeDevolvidoMulta}`}>
              <DollarSign size={12} />
              Devolvido c/ Multa
            </span>
          );
        case 'EXPIRADO':
          return (
            <span className={`${styles.badgeFsm} ${styles.badgeExpirado}`}>
              <Ban size={12} />
              Expirado (Lazy)
            </span>
          );
        case 'CANCELADO':
          return (
            <span className={`${styles.badgeFsm} ${styles.badgeCancelado}`}>
              <XCircle size={12} />
              Cancelado
            </span>
          );
        default:
          return <span className={styles.badgeFsm}>{status}</span>;
      }
    },
  },
  {
    accessorKey: 'datas',
    header: () => <span>Prazos / Multa</span>,
    cell: ({ row }) => {
      const {
        dataLimiteRetirada,
        dataPrevistaDevolucao,
        dataDevolucao,
        renovacoesCount,
        temAvaria,
        status,
        valorMulta,
        diasAtraso,
      } = row.original;

      return (
        <div className={styles.prazoInfo}>
          {status === 'RESERVADO' && dataLimiteRetirada && (
            <div className={styles.prazoRow}>
              <Clock size={12} className="text-amber-600 shrink-0" />
              <span>
                Retirar: <strong>{new Date(dataLimiteRetirada).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</strong>
              </span>
            </div>
          )}

          {dataPrevistaDevolucao && status !== 'RESERVADO' && !dataDevolucao && (
            <div className={styles.prazoRow}>
              <Calendar size={12} className="text-slate-400 shrink-0" />
              <span>
                Previsto: <strong>{new Date(dataPrevistaDevolucao).toLocaleDateString('pt-BR')}</strong>
              </span>
            </div>
          )}

          {dataDevolucao && (
            <div className={styles.prazoRow}>
              <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
              <span>
                Devolvido: <strong>{new Date(dataDevolucao).toLocaleDateString('pt-BR')}</strong>
              </span>
            </div>
          )}

          {valorMulta !== undefined && valorMulta > 0 && (
            <div className={styles.multaTag}>
              <DollarSign size={11} className="shrink-0" />
              <span>R$ {Number(valorMulta).toFixed(2)}</span>
              {diasAtraso !== undefined && diasAtraso > 0 && (
                <span className="font-normal opacity-85">({diasAtraso}d)</span>
              )}
            </div>
          )}

          {renovacoesCount > 0 && (
            <span className="text-[11px] text-blue-600 font-medium">
              ↻ {renovacoesCount} {renovacoesCount === 1 ? 'renovação' : 'renovações'}
            </span>
          )}

          {temAvaria && (
            <span className="text-[10px] text-red-600 font-bold">
              ⚠️ Avaria
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: () => <span className="block text-right pr-2">Ações</span>,
    cell: ({ row }) => {
      const item = row.original;

      return (
        <div className={styles.actionsCell}>
          {/* AÇÕES DE FLUXO PARA 'RESERVADO': Retirar e Cancelar */}
          {item.status === 'RESERVADO' && (
            <>
              <button
                type="button"
                className={styles.actionBtnRetirar}
                onClick={() => onRetirar(item.id)}
                title="Confirmar retirada do item"
              >
                <BookOpen size={12} />
                <span>Retirar</span>
              </button>
              <button
                type="button"
                className={styles.actionBtnCancelar}
                onClick={() => onCancelar(item.id)}
                title="Cancelar reserva"
              >
                <Ban size={12} />
                <span>Cancelar</span>
              </button>
            </>
          )}

          {/* AÇÕES DE FLUXO PARA 'RETIRADO' OU 'ATRASADO': Devolver e RENOVAR NA BARRA */}
          {(item.status === 'RETIRADO' || item.status === 'ATRASADO') && (
            <>
              <button
                type="button"
                className={styles.actionBtnDevolver}
                onClick={() => onDevolver(item)}
                title="Registrar devolução do item"
              >
                <CheckCircle2 size={12} />
                <span>Devolver</span>
              </button>
              <button
                type="button"
                className={styles.actionBtnRenovar}
                onClick={() => onRenovar(item.id)}
                title="Renovar prazo de empréstimo"
              >
                <RefreshCw size={12} />
                <span>Renovar</span>
              </button>
            </>
          )}

          {/* AUDITORIA INSTANTÂNEA (HISTÓRICO ACID) */}
          <button
            type="button"
            className={`${styles.actionIconBtn} ${styles.actionIconBtnAudit}`}
            title="Trilha de Auditoria (Audit Log ACID)"
            onClick={() => onHistorico(item)}
          >
            <History size={13} />
          </button>

          {/* MENU SUSPENSO DE GESTÃO DO REGISTRO */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={styles.actionIconBtn}
                title="Mais Opções"
              >
                <MoreHorizontal size={13} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Gerenciamento</DropdownMenuLabel>

              <DropdownMenuItem onClick={() => onEdit(item)}>
                <Edit2 className="mr-2 h-3.5 w-3.5 text-slate-600" />
                Editar Dados
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(item)}
              >
                <Trash2 className="mr-2 h-3.5 w-3.5 text-red-600" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
