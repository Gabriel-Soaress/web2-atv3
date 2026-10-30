export class CriarReservaRequest {
  id?: string;
  tituloItem!: string;
  tipoItem!: string;
  usuarioNome!: string;
}

export class AtualizarEmprestimoRequest {
  tituloItem!: string;
  tipoItem!: string;
  usuarioNome!: string;
}

export class RegistrarDevolucaoRequest {
  temAvaria!: boolean;
  descricaoAvaria?: string;
}
