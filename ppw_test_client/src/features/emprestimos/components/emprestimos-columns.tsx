'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import {
  AlertTriangle,
  Ban,
  BookOpen,
  CheckCircle,
  Clock,
  DollarSign,
  Edit,
  History,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { Emprestimo } from '../type/emprestimo.type';

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
    header: 'Item',
    cell: ({ row }) => (
      <div>
        <span className="font-semibold block">{row.original.tituloItem}</span>
        <span className="text-xs text-muted-foreground">{row.original.tipoItem}</span>
      </div>
    ),
  },
  {
    accessorKey: 'usuarioNome',
    header: 'Usuário',
    cell: ({ row }) => <span className="font-medium text-sm">{row.original.usuarioNome}</span>,
  },
  {
    accessorKey: 'status',
    header: 'Status (FSM)',
    cell: ({ row }) => {
      const status = row.original.status;
      switch (status) {
        case 'RESERVADO':
          return (
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-300">
              Reservado
            </Badge>
          );
        case 'RETIRADO':
          return (
            <Badge variant="default" className="bg-blue-600 text-white">
              Retirado
            </Badge>
          );
        case 'ATRASADO':
          return (
            <Badge variant="destructive" className="bg-red-600 text-white animate-pulse">
              Atrasado
            </Badge>
          );
        case 'DEVOLVIDO':
          return (
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
              Devolvido
            </Badge>
          );
        case 'DEVOLVIDO_COM_MULTA':
          return (
            <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-300">
              Devolvido c/ Multa
            </Badge>
          );
        case 'EXPIRADO':
          return (
            <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-300">
              Expirado (Lazy)
            </Badge>
          );
        case 'CANCELADO':
          return (
            <Badge variant="outline" className="bg-zinc-100 text-zinc-500 border-zinc-300">
              Cancelado
            </Badge>
          );
        default:
          return <Badge variant="outline">{status}</Badge>;
      }
    },
  },
  {
    accessorKey: 'datas',
    header: 'Prazos / Penalidades',
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
        <div className="text-xs space-y-0.5">
          {status === 'RESERVADO' && dataLimiteRetirada && (
            <div className="text-amber-700 font-medium">
              Limite retirada: {new Date(dataLimiteRetirada).toLocaleString('pt-BR')}
            </div>
          )}
          {dataPrevistaDevolucao && (
            <div className="text-muted-foreground">
              Previsto: {new Date(dataPrevistaDevolucao).toLocaleDateString('pt-BR')}
            </div>
          )}
          {dataDevolucao && (
            <div className="text-emerald-700 font-medium">
              Entregue: {new Date(dataDevolucao).toLocaleDateString('pt-BR')}
            </div>
          )}
          {renovacoesCount > 0 && (
            <div className="text-blue-600">Renovações: {renovacoesCount}</div>
          )}
          {valorMulta !== undefined && valorMulta > 0 && (
            <div className="text-rose-600 font-bold flex items-center gap-0.5">
              <DollarSign className="h-3 w-3" />
              Multa: R$ {Number(valorMulta).toFixed(2)} ({diasAtraso}d atraso)
            </div>
          )}
          {temAvaria && <div className="text-red-600 font-semibold">⚠️ Com avaria</div>}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: () => <span className="text-right block">Ações Semânticas</span>,
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex items-center justify-end gap-1 flex-wrap">
          {/* Ação de fluxo: Retirar */}
          {item.status === 'RESERVADO' && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
              onClick={() => onRetirar(item.id)}
            >
              <BookOpen className="h-3.5 w-3.5 mr-1" /> Retirar
            </Button>
          )}

          {/* Ação de fluxo: Cancelar Reserva */}
          {item.status === 'RESERVADO' && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100"
              onClick={() => onCancelar(item.id)}
            >
              <Ban className="h-3.5 w-3.5 mr-1" /> Cancelar
            </Button>
          )}

          {/* Ação de fluxo: Renovar */}
          {(item.status === 'RETIRADO' || item.status === 'ATRASADO') && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
              onClick={() => onRenovar(item.id)}
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1" /> Renovar
            </Button>
          )}

          {/* Ação de fluxo: Devolver */}
          {(item.status === 'RETIRADO' || item.status === 'ATRASADO') && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
              onClick={() => onDevolver(item)}
            >
              <CheckCircle className="h-3.5 w-3.5 mr-1" /> Devolver
            </Button>
          )}

          {/* Auditoria / Histórico */}
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 text-indigo-700 border-indigo-200 bg-indigo-50 hover:bg-indigo-100"
            title="Ver Trilha de Auditoria (Audit Log)"
            onClick={() => onHistorico(item)}
          >
            <History className="h-3.5 w-3.5" />
          </Button>

          {/* Alterar (Editar) */}
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 text-zinc-700"
            title="Alterar Empréstimo"
            onClick={() => onEdit(item)}
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>

          {/* Excluir */}
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive hover:bg-red-50 hover:text-red-700"
            title="Excluir Empréstimo"
            onClick={() => onDelete(item)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      );
    },
  },
];
