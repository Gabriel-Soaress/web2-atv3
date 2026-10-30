'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { BookOpen, CheckCircle, Clock, Edit, History, RefreshCw, Trash2 } from 'lucide-react';
import { Emprestimo } from '../type/emprestimo.type';

interface EmprestimoColumnsProps {
  onEdit: (item: Emprestimo) => void;
  onDelete: (item: Emprestimo) => void;
  onRetirar: (id: string) => void;
  onRenovar: (id: string) => void;
  onDevolver: (item: Emprestimo) => void;
}

export const getEmprestimoColumns = ({
  onEdit,
  onDelete,
  onRetirar,
  onRenovar,
  onDevolver,
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
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;
      switch (status) {
        case 'RESERVADO':
          return <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-300">Reservado</Badge>;
        case 'RETIRADO':
          return <Badge variant="default" className="bg-blue-600 text-white">Retirado</Badge>;
        case 'ATRASADO':
          return <Badge variant="destructive">Atrasado</Badge>;
        case 'DEVOLVIDO':
          return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">Devolvido</Badge>;
        default:
          return <Badge variant="outline">{status}</Badge>;
      }
    },
  },
  {
    accessorKey: 'datas',
    header: 'Prazos / Datas',
    cell: ({ row }) => {
      const { dataPrevistaDevolucao, dataDevolucao, renovacoesCount, temAvaria } = row.original;
      return (
        <div className="text-xs space-y-0.5">
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
          {temAvaria && <div className="text-red-600 font-semibold">⚠️ Com avaria</div>}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: () => <span className="text-right block">Ações</span>,
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

          {/* Ação de fluxo: Renovar */}
          {(item.status === 'RETIRADO' || item.status === 'ATRASADO') && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
              onClick={() => onRenovar(item.id)}
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1" /> Renovar (+7d)
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
