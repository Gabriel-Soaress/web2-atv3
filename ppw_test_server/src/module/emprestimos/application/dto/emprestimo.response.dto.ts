export class EmprestimoResponse {
  id!: string;
  tituloItem!: string;
  tipoItem!: string;
  usuarioNome!: string;
  dataReserva!: Date;
  dataRetirada?: Date | null;
  dataPrevistaDevolucao?: Date | null;
  dataDevolucao?: Date | null;
  status!: string;
  renovacoesCount!: number;
  temAvaria!: boolean;
  descricaoAvaria?: string | null;
  createdAt?: Date;
  updatedAt?: Date | null;

  constructor(props: Partial<EmprestimoResponse>) {
    Object.assign(this, props);
  }
}
