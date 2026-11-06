export interface Emprestimo {
  id: string;
  tituloItem: string;
  tipoItem: string;
  usuarioNome: string;
  dataReserva: string | Date;
  dataLimiteRetirada?: string | Date | null;
  dataRetirada?: string | Date | null;
  dataPrevistaDevolucao?: string | Date | null;
  dataDevolucao?: string | Date | null;
  status:
    | 'RESERVADO'
    | 'RETIRADO'
    | 'ATRASADO'
    | 'DEVOLVIDO'
    | 'DEVOLVIDO_COM_MULTA'
    | 'EXPIRADO'
    | 'CANCELADO'
    | string;
  renovacoesCount: number;
  temAvaria: boolean;
  descricaoAvaria?: string | null;
  diasAtraso?: number;
  valorMulta?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date | null;
}

export interface HistoricoItem {
  id: string;
  emprestimoId: string;
  statusAnterior: string;
  novoStatus: string;
  autorAcao: string;
  justificativa?: string | null;
  timestamp: string | Date;
}

export interface EmprestimoFormData {
  tituloItem: string;
  tipoItem: string;
  usuarioNome: string;
}

export interface DevolucaoFormData {
  temAvaria: boolean;
  descricaoAvaria?: string;
}

export interface ActionState<T = any> {
  success: boolean;
  message?: string;
  errors?: Record<string, string[] | string>;
  data?: T;
}

export const InitialActionState: ActionState = {
  success: false,
  message: '',
};

export interface EmprestimoFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  emprestimo?: Emprestimo | null;
}
