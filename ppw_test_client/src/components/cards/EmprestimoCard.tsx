'use client';

import { useState } from 'react';
import { Emprestimo } from '@/types/emprestimo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface EmprestimoCardProps {
  item: Emprestimo;
  onRetirar: (id: string) => void;
  onRenovar: (id: string) => void;
  onDevolver: (id: string, temAvaria: boolean, descricaoAvaria?: string) => void;
}

export function EmprestimoCard({ item, onRetirar, onRenovar, onDevolver }: EmprestimoCardProps) {
  const [exibirDevolucao, setExibirDevolucao] = useState(false);
  const [temAvaria, setTemAvaria] = useState(false);
  const [descricaoAvaria, setDescricaoAvaria] = useState('');

  const badgeColors: Record<string, string> = {
    RESERVADO: 'bg-blue-100 text-blue-800 border-blue-300',
    RETIRADO: 'bg-green-100 text-green-800 border-green-300',
    ATRASADO: 'bg-red-100 text-red-800 border-red-300',
    DEVOLVIDO: 'bg-slate-100 text-slate-800 border-slate-300',
  };

  function confirmarDevolucao() {
    onDevolver(item.id, temAvaria, descricaoAvaria);
    setExibirDevolucao(false);
  }

  function formatarData(dataStr?: string | null) {
    if (!dataStr) return '-';
    return new Date(dataStr).toLocaleDateString('pt-BR');
  }

  return (
    <Card className="shadow-sm border">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {item.tipoItem}
          </span>
          <CardTitle className="text-base font-bold text-slate-900">{item.tituloItem}</CardTitle>
          <p className="text-sm text-slate-600">Responsável: {item.usuarioNome}</p>
        </div>
        <Badge variant="outline" className={badgeColors[item.status] || ''}>
          {item.status}
        </Badge>
      </CardHeader>

      <CardContent className="pt-2 text-sm space-y-2">
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded">
          <div>
            <span className="font-medium text-slate-800">Reserva:</span> {formatarData(item.dataReserva)}
          </div>
          <div>
            <span className="font-medium text-slate-800">Retirada:</span> {formatarData(item.dataRetirada)}
          </div>
          <div>
            <span className="font-medium text-slate-800">Devolução Prevista:</span>{' '}
            {formatarData(item.dataPrevistaDevolucao)}
          </div>
          <div>
            <span className="font-medium text-slate-800">Renovações:</span> {item.renovacoesCount}
          </div>
        </div>

        {item.temAvaria && (
          <div className="p-2 bg-red-50 border border-red-200 text-red-800 rounded text-xs">
            <strong>⚠️ Registro de Avaria:</strong> {item.descricaoAvaria || 'Dano não especificado.'}
          </div>
        )}

        <div className="pt-2 flex flex-wrap gap-2">
          {/* Se está RESERVADO */}
          {item.status === 'RESERVADO' && (
            <Button size="sm" onClick={() => onRetirar(item.id)} className="w-full">
              Confirmar Retirada
            </Button>
          )}

          {/* Se está RETIRADO ou ATRASADO */}
          {(item.status === 'RETIRADO' || item.status === 'ATRASADO') && !exibirDevolucao && (
            <>
              <Button size="sm" variant="outline" onClick={() => onRenovar(item.id)}>
                Renovar (+7 dias)
              </Button>
              <Button size="sm" onClick={() => setExibirDevolucao(true)}>
                Devolver Item
              </Button>
            </>
          )}

          {/* Opção para registrar devolução com avaria */}
          {exibirDevolucao && (
            <div className="w-full p-3 border rounded bg-slate-50 space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={temAvaria}
                  onChange={(e) => setTemAvaria(e.target.checked)}
                />
                O item possui alguma avaria/dano?
              </label>

              {temAvaria && (
                <Input
                  placeholder="Descreva a avaria encontrada..."
                  value={descricaoAvaria}
                  onChange={(e) => setDescricaoAvaria(e.target.value)}
                  className="text-xs h-8"
                />
              )}

              <div className="flex gap-2 justify-end pt-1">
                <Button size="sm" variant="ghost" onClick={() => setExibirDevolucao(false)}>
                  Cancelar
                </Button>
                <Button size="sm" onClick={confirmarDevolucao}>
                  Confirmar Devolução
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default EmprestimoCard;
