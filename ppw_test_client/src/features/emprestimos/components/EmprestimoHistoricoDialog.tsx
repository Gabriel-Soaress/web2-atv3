'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Emprestimo, HistoricoItem } from '../type/emprestimo.type';
import { getHistoricoEmprestimo } from '../api/emprestimo.actions';
import { Clock, ShieldCheck, User } from 'lucide-react';

interface EmprestimoHistoricoDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  emprestimo?: Emprestimo | null;
}

export function EmprestimoHistoricoDialog({
  isOpen,
  onOpenChange,
  emprestimo,
}: EmprestimoHistoricoDialogProps) {
  const [logs, setLogs] = useState<HistoricoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && emprestimo?.id) {
      setIsLoading(true);
      getHistoricoEmprestimo(emprestimo.id)
        .then((data) => setLogs(data))
        .catch(() => setLogs([]))
        .finally(() => setIsLoading(false));
    } else {
      setLogs([]);
    }
  }, [isOpen, emprestimo?.id]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <ShieldCheck className="h-5 w-5 text-indigo-600" />
            Trilha de Auditoria (Audit Log ACID)
          </DialogTitle>
          {emprestimo && (
            <p className="text-xs text-muted-foreground mt-1">
              Registro: <span className="font-semibold text-foreground">{emprestimo.tituloItem}</span> — Solicitante: {emprestimo.usuarioNome}
            </p>
          )}
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {isLoading && (
            <div className="text-center py-6 text-sm text-muted-foreground">
              Carregando histórico do banco de dados...
            </div>
          )}

          {!isLoading && logs.length === 0 && (
            <div className="text-center py-6 text-sm text-muted-foreground">
              Nenhum registro de auditoria encontrado.
            </div>
          )}

          {!isLoading && logs.length > 0 && (
            <div className="relative border-l-2 border-indigo-200 ml-4 space-y-6 pl-4 my-2">
              {logs.map((log) => (
                <div key={log.id} className="relative group">
                  {/* Ponto na timeline */}
                  <div className="absolute -left-[23px] top-1 h-3.5 w-3.5 rounded-full bg-indigo-600 border-2 border-white" />

                  <div className="bg-slate-50 border rounded-lg p-3 text-xs space-y-1.5 shadow-sm">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[11px] font-mono bg-white">
                          {log.statusAnterior}
                        </Badge>
                        <span className="text-muted-foreground font-bold">➔</span>
                        <Badge variant="default" className="text-[11px] font-mono bg-indigo-600">
                          {log.novoStatus}
                        </Badge>
                      </div>

                      <div className="flex items-center text-muted-foreground text-[11px] gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(log.timestamp).toLocaleString('pt-BR')}
                      </div>
                    </div>

                    {log.justificativa && (
                      <p className="text-slate-700 bg-white p-2 rounded border border-slate-200 text-xs">
                        {log.justificativa}
                      </p>
                    )}

                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground pt-0.5">
                      <User className="h-3 w-3 text-slate-400" />
                      Autor: <span className="font-medium text-slate-700">{log.autorAcao}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
