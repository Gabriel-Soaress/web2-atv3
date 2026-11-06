'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  AlertCircle,
  AlertTriangle,
  ArrowRightCircle,
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
    header: 'Item Solicitado',
    cell: ({ row }) => {
      const item = row.original;
      const isLivro = item.tipoItem?.toUpperCase().includes('LIVRO');
      return (
        <div className="flex items-center gap-3 min-w-[200px]">
          <div
            className={`p-2 rounded-lg border ${
              isLivro
                ? 'bg-blue-50/80 border-blue-200 text-blue-700'
                : 'bg-violet-50/80 border-violet-200 text-violet-700'
            }`}
          >
            {isLivro ? <BookOpen className="h-4 w-4" /> : <Laptop className="h-4 w-4" />}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-foreground leading-tight line-clamp-1">
              {item.tituloItem}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {item.tipoItem}
              </span>
              <span className="text-muted-foreground/40 text-[10px]">•</span>
              <span className="text-[10px] font-mono text-muted-foreground/70">
                #{item.id.slice(0, 8)}
              </span>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'usuarioNome',
    header: 'Usuário',
    cell: ({ row }) => {
      const nome = row.original.usuarioNome;
      const initials = nome
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join('');

      return (
        <div className="flex items-center gap-2.5 min-w-[150px]">
          <div className="h-7 w-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[11px] font-semibold text-slate-700">
            {initials || <User className="h-3.5 w-3.5 text-slate-500" />}
          </div>
          <span className="font-medium text-sm text-slate-900 leading-tight">{nome}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status (FSM)',
    cell: ({ row }) => {
      const status = row.original.status;
      switch (status) {
        case 'RESERVADO':
          return (
            <Badge
              variant="outline"
              className="bg-amber-50 text-amber-800 border-amber-300 gap-1.5 px-2.5 py-1 font-medium"
            >
              <Clock className="h-3 w-3 text-amber-600 animate-pulse" />
              Reservado
            </Badge>
          );
        case 'RETIRADO':
          return (
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-800 border-blue-300 gap-1.5 px-2.5 py-1 font-medium"
            >
              <ArrowRightCircle className="h-3 w-3 text-blue-600" />
              Retirado (Em Uso)
            </Badge>
          );
        case 'ATRASADO':
          return (
            <Badge
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white gap-1.5 px-2.5 py-1 font-bold shadow-xs animate-pulse"
            >
              <AlertTriangle className="h-3 w-3" />
              Atrasado
            </Badge>
          );
        case 'DEVOLVIDO':
          return (
            <Badge
              variant="outline"
              className="bg-emerald-50 text-emerald-800 border-emerald-300 gap-1.5 px-2.5 py-1 font-medium"
            >
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              Devolvido
            </Badge>
          );
        case 'DEVOLVIDO_COM_MULTA':
          return (
            <Badge
              variant="outline"
              className="bg-rose-50 text-rose-800 border-rose-300 gap-1.5 px-2.5 py-1 font-medium"
            >
              <DollarSign className="h-3 w-3 text-rose-600" />
              Devolvido c/ Multa
            </Badge>
          );
        case 'EXPIRADO':
          return (
            <Badge
              variant="outline"
              className="bg-slate-100 text-slate-700 border-slate-300 gap-1.5 px-2.5 py-1 font-medium"
            >
              <Ban className="h-3 w-3 text-slate-500" />
              Expirado (Lazy)
            </Badge>
          );
        case 'CANCELADO':
          return (
            <Badge
              variant="outline"
              className="bg-zinc-100 text-zinc-500 border-zinc-300 gap-1.5 px-2.5 py-1 font-medium"
            >
              <XCircle className="h-3 w-3 text-zinc-400" />
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
    header: 'Prazos & Detalhes',
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
        <div className="flex flex-col gap-1 text-xs min-w-[210px]">
          {/* Informações de Limite / Devolução */}
          {status === 'RESERVADO' && dataLimiteRetirada && (
            <div className="flex items-center gap-1.5 text-amber-800 bg-amber-50/70 border border-amber-200/60 rounded px-2 py-0.5 font-medium">
              <Clock className="h-3 w-3 text-amber-600 shrink-0" />
              <span>Limite: {new Date(dataLimiteRetirada).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span>
            </div>
          )}

          {dataPrevistaDevolucao && status !== 'RESERVADO' && (
            <div className="flex items-center gap-1.5 text-slate-600">
              <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
              <span>
                Previsto: <strong className="font-semibold text-slate-800">{new Date(dataPrevistaDevolucao).toLocaleDateString('pt-BR')}</strong>
              </span>
            </div>
          )}

          {dataDevolucao && (
            <div className="flex items-center gap-1.5 text-emerald-700">
              <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
              <span>
                Devolvido: <strong>{new Date(dataDevolucao).toLocaleDateString('pt-BR')}</strong>
              </span>
            </div>
          )}

          {/* Indicadores de Multa e Dias de Atraso */}
          {valorMulta !== undefined && valorMulta > 0 && (
            <div className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-700 px-2 py-0.5 rounded font-bold w-fit">
              <DollarSign className="h-3 w-3 shrink-0" />
              <span>R$ {Number(valorMulta).toFixed(2)}</span>
              {diasAtraso !== undefined && diasAtraso > 0 && (
                <span className="text-[10px] font-normal text-rose-600">
                  ({diasAtraso}d atraso)
                </span>
              )}
            </div>
          )}

          {/* Badges de Apoio: Renovações e Avarias */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            {renovacoesCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded border border-blue-200">
                <RefreshCw className="h-2.5 w-2.5" /> {renovacoesCount} {renovacoesCount === 1 ? 'renovação' : 'renovações'}
              </span>
            )}
            {temAvaria && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-red-100 text-red-800 px-1.5 py-0.2 rounded border border-red-300">
                <AlertCircle className="h-2.5 w-2.5 text-red-600" /> Avaria
              </span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: () => <span className="text-right block pr-2">Ações</span>,
    cell: ({ row }) => {
      const item = row.original;

      return (
        <div className="flex items-center justify-end gap-1.5">
          {/* 1. AÇÃO PRIMÁRIA EM DESTAQUE (Contextual ao Ciclo de Vida da FSM) */}
          {item.status === 'RESERVADO' && (
            <Button
              size="sm"
              className="h-8 px-3 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
              onClick={() => onRetirar(item.id)}
            >
              <BookOpen className="h-3.5 w-3.5 mr-1.5" /> Retirar
            </Button>
          )}

          {(item.status === 'RETIRADO' || item.status === 'ATRASADO') && (
            <Button
              size="sm"
              className="h-8 px-3 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              onClick={() => onDevolver(item)}
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Devolver
            </Button>
          )}

          {/* 2. BOTÃO DIRETO DE AUDITORIA (Audit Log ACID) */}
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-900 transition-colors"
            title="Trilha de Auditoria (Audit Log ACID)"
            onClick={() => onHistorico(item)}
          >
            <History className="h-4 w-4" />
          </Button>

          {/* 3. MENU DROPDOWN DE AÇÕES SECUNDÁRIAS ("...") */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Mais Ações"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 shadow-lg">
              <DropdownMenuLabel>Ciclo de Vida FSM</DropdownMenuLabel>

              {/* Renovar (apenas se em uso ou atrasado) */}
              {(item.status === 'RETIRADO' || item.status === 'ATRASADO') && (
                <DropdownMenuItem onClick={() => onRenovar(item.id)}>
                  <RefreshCw className="h-4 w-4 mr-2 text-amber-600" />
                  Renovar Prazo
                </DropdownMenuItem>
              )}

              {/* Cancelar Reserva (apenas se reservado) */}
              {item.status === 'RESERVADO' && (
                <DropdownMenuItem onClick={() => onCancelar(item.id)}>
                  <Ban className="h-4 w-4 mr-2 text-zinc-600" />
                  Cancelar Reserva
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuLabel>Gerenciamento</DropdownMenuLabel>

              <DropdownMenuItem onClick={() => onEdit(item)}>
                <Edit2 className="h-4 w-4 mr-2 text-slate-600" />
                Editar Registro
              </DropdownMenuItem>

              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(item)}
              >
                <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
