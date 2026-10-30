export interface Emprestimo {
  id: string;
  tituloItem: string;
  tipoItem: 'LIVRO' | 'EQUIPAMENTO';
  usuarioNome: string;
  dataReserva: string;
  dataRetirada?: string | null;
  dataPrevistaDevolucao?: string | null;
  dataDevolucao?: string | null;
  status: 'RESERVADO' | 'RETIRADO' | 'ATRASADO' | 'DEVOLVIDO';
  renovacoesCount: number;
  temAvaria: boolean;
  descricaoAvaria?: string | null;
}