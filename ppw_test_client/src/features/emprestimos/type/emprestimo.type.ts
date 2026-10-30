export interface Emprestimo {
  id: string;
  tituloItem: string;
  tipoItem: string;
  usuarioNome: string;
  dataReserva: string | Date;
  dataRetirada?: string | Date | null;
  dataPrevistaDevolucao?: string | Date | null;
  dataDevolucao?: string | Date | null;
  status: 'RESERVADO' | 'RETIRADO' | 'ATRASADO' | 'DEVOLVIDO' | string;
  renovacoesCount: number;
  temAvaria: boolean;
  descricaoAvaria?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date | null;
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
