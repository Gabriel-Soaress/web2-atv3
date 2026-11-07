import { BaseEntity, DefaulTimeStampsProps } from '../../../../shared/domain/entity/base.entity';
import { StatusEmprestimo, StatusEmprestimoEnum } from '../value-objects/status-emprestimo.value-object';
import { CalculadoraMultaService } from '../services/calculadora-multa.service';

export type EmprestimoProps = {
  id?: string;
  tituloItem: string;
  tipoItem: string;
  usuarioNome: string;
  dataReserva: Date;
  dataLimiteRetirada?: Date | null;
  dataRetirada?: Date | null;
  dataPrevistaDevolucao?: Date | null;
  dataDevolucao?: Date | null;
  status: StatusEmprestimo;
  renovacoesCount: number;
  temAvaria: boolean;
  descricaoAvaria?: string | null;
  diasAtraso: number;
  valorMulta: number;
} & DefaulTimeStampsProps;

/**
 * EmprestimoEntity
 *
 * Entidade central do domínio (DDD) que representa um Empréstimo.
 * Concentra todas as regras de negócio, invariantes e máquina de estados (FSM)
 * do ciclo de vida de empréstimos e reservas de livros e equipamentos,
 * isolada de frameworks ou banco de dados.
 */
export class EmprestimoEntity extends BaseEntity<EmprestimoProps> {
  constructor(props: EmprestimoProps) {
    super(props);
  }

  /**
   * createReserva()
   *
   * Cria uma nova reserva de item colocando a entidade no estado inicial RESERVADO.
   * Define automaticamente a data da reserva e o prazo limite de 48 horas para a retirada.
   *
   * @param tituloItem - Nome ou identificação do livro/equipamento reservado.
   * @param tipoItem - Categoria do item (ex: LIVRO, NOTEBOOK, PROJETOR).
   * @param usuarioNome - Nome completo da pessoa solicitante.
   * @param id - Identificador UUID opcional (se omitido, será gerado pela base).
   * @param ttlHorasRetirada - Janela de tempo em horas até o cancelamento por expiração (padrão: 48h).
   */
  static createReserva(
    tituloItem: string,
    tipoItem: string,
    usuarioNome: string,
    id?: string,
    ttlHorasRetirada: number = 48,
  ): EmprestimoEntity {
    if (!tituloItem?.trim() || !tipoItem?.trim() || !usuarioNome?.trim()) {
      throw new Error('Todos os campos da reserva são obrigatórios.');
    }

    const agora = new Date();
    const dataLimite = new Date(agora.getTime() + ttlHorasRetirada * 60 * 60 * 1000);

    return new EmprestimoEntity({
      id,
      tituloItem: tituloItem.trim(),
      tipoItem: tipoItem.trim().toUpperCase(),
      usuarioNome: usuarioNome.trim(),
      dataReserva: agora,
      dataLimiteRetirada: dataLimite,
      status: StatusEmprestimo.reservado(),
      renovacoesCount: 0,
      temAvaria: false,
      descricaoAvaria: null,
      diasAtraso: 0,
      valorMulta: 0,
      createdAt: agora,
    });
  }

  /**
   * restore()
   *
   * Reconstrói uma entidade com dados já existentes vindos do banco de dados (usado pelo Mapper).
   * Não dispara validações de nova criação nem reseta prazos ou contadores.
   *
   * @param props - Objeto com todos os atributos já persistidos da entidade.
   */
  static restore(props: EmprestimoProps): EmprestimoEntity {
    return new EmprestimoEntity(props);
  }

  /**
   * registrarRetirada()
   *
   * Registra a retirada física do item pelo usuário, transitando de RESERVADO para RETIRADO.
   * Valida se a retirada está ocorrendo dentro do prazo limite (48h) e agenda
   * o prazo de devolução para 7 dias após o momento da retirada.
   */
  registrarRetirada(): void {
    this.props.status.validarTransicaoPara(StatusEmprestimoEnum.RETIRADO);

    const agora = new Date();
    if (this.props.dataLimiteRetirada && agora > new Date(this.props.dataLimiteRetirada)) {
      throw new Error(
        `Prazo limite de retirada expirado em ${new Date(this.props.dataLimiteRetirada).toLocaleString('pt-BR')}. A reserva não pode mais ser retirada.`,
      );
    }

    const dataPrevista = new Date();
    dataPrevista.setDate(agora.getDate() + 7);

    (this.props as any).dataRetirada = agora;
    (this.props as any).dataPrevistaDevolucao = dataPrevista;
    (this.props as any).status = StatusEmprestimo.retirado();
    (this.props as any).updateAt = agora;
  }

  /**
   * renovarPrazo()
   *
   * Estende o prazo de devolução do empréstimo em mais 7 dias a partir da data de vencimento atual.
   * Permitido apenas para itens RETIRADOS ou ATRASADOS. Incrementa o contador de renovações
   * e zera temporariamente valores de multa calculados antes da extensão.
   */
  renovarPrazo(): void {
    if (!this.props.status.isRetirado() && !this.props.status.isAtrasado()) {
      throw new Error(
        `Apenas empréstimos RETIRADOS ou ATRASADOS podem ser renovados. Status atual: ${this.props.status.getValue()}`,
      );
    }

    const agora = new Date();
    const baseData =
      this.props.dataPrevistaDevolucao && new Date(this.props.dataPrevistaDevolucao) > agora
        ? new Date(this.props.dataPrevistaDevolucao)
        : agora;

    const novaDataPrevista = new Date(baseData);
    novaDataPrevista.setDate(novaDataPrevista.getDate() + 7);

    (this.props as any).dataPrevistaDevolucao = novaDataPrevista;
    (this.props as any).renovacoesCount = this.props.renovacoesCount + 1;
    (this.props as any).status = StatusEmprestimo.retirado();
    (this.props as any).diasAtraso = 0;
    (this.props as any).valorMulta = 0;
    (this.props as any).updateAt = agora;
  }

  /**
   * registrarDevolucao()
   *
   * Processa a devolução do item e finaliza o empréstimo.
   * Utiliza a CalculadoraMultaService para checar se houve atraso. Se houver atraso,
   * transita para DEVOLVIDO_COM_MULTA; se devolvido no prazo, transita para DEVOLVIDO.
   * Também registra se o item sofreu alguma avaria física durante o uso.
   *
   * @param temAvaria - Indica se o item devolvido possui avarias ou danos físicos.
   * @param descricaoAvaria - Detalhes textuais da avaria constatada na inspeção física.
   */
  registrarDevolucao(temAvaria: boolean, descricaoAvaria?: string | null): void {
    const agora = new Date();
    const calculo = CalculadoraMultaService.calcular(this.props.dataPrevistaDevolucao, agora);

    const proximoStatus =
      calculo.diasAtraso > 0 || this.props.status.isAtrasado()
        ? StatusEmprestimoEnum.DEVOLVIDO_COM_MULTA
        : StatusEmprestimoEnum.DEVOLVIDO;

    this.props.status.validarTransicaoPara(proximoStatus);

    (this.props as any).dataDevolucao = agora;
    (this.props as any).diasAtraso = calculo.diasAtraso;
    (this.props as any).valorMulta = calculo.valorMulta;
    (this.props as any).status =
      proximoStatus === StatusEmprestimoEnum.DEVOLVIDO_COM_MULTA
        ? StatusEmprestimo.devolvidoComMulta()
        : StatusEmprestimo.devolvido();
    (this.props as any).temAvaria = temAvaria;
    (this.props as any).descricaoAvaria = temAvaria ? descricaoAvaria : null;
    (this.props as any).updateAt = agora;
  }

  /**
   * cancelarReserva()
   *
   * Cancela voluntariamente uma reserva que ainda não teve o item retirado.
   * Transita de RESERVADO para CANCELADO.
   */
  cancelarReserva(): void {
    this.props.status.validarTransicaoPara(StatusEmprestimoEnum.CANCELADO);

    const agora = new Date();
    (this.props as any).status = StatusEmprestimo.cancelado();
    (this.props as any).updateAt = agora;
  }

  /**
   * expirarReserva()
   *
   * Marca a reserva como EXPIRADA quando o prazo limite de 48 horas para retirada é ultrapassado.
   * Acionado de forma preguiçosa (Lazy Evaluation) pelo repositório ao consultar ou persistir dados.
   */
  expirarReserva(): void {
    this.props.status.validarTransicaoPara(StatusEmprestimoEnum.EXPIRADO);

    const agora = new Date();
    (this.props as any).status = StatusEmprestimo.expirado();
    (this.props as any).updateAt = agora;
  }

  /**
   * marcarAtrasado()
   *
   * Altera o status de um item que estava RETIRADO para ATRASADO quando o prazo previsto vence.
   * Calcula os dias de atraso decorridos e o valor proporcional da multa até o momento presente.
   */
  marcarAtrasado(): void {
    this.props.status.validarTransicaoPara(StatusEmprestimoEnum.ATRASADO);

    const agora = new Date();
    const calculo = CalculadoraMultaService.calcular(this.props.dataPrevistaDevolucao, agora);

    (this.props as any).status = StatusEmprestimo.atrasado();
    (this.props as any).diasAtraso = calculo.diasAtraso;
    (this.props as any).valorMulta = calculo.valorMulta;
    (this.props as any).updateAt = agora;
  }

  /**
   * atualizarDados()
   *
   * Permite editar as informações cadastrais do empréstimo (título, categoria e usuário).
   * Impede a edição caso o empréstimo já esteja em um estado terminal (DEVOLVIDO, CANCELADO, EXPIRADO).
   *
   * @param tituloItem - Novo título ou identificação do item.
   * @param tipoItem - Nova categoria ou tipo do item.
   * @param usuarioNome - Novo nome do usuário solicitante.
   */
  atualizarDados(tituloItem: string, tipoItem: string, usuarioNome: string): void {
    if (this.props.status.isTerminal()) {
      throw new Error(
        `Não é permitido editar dados cadastrais de um empréstimo em estado final (${this.props.status.getValue()}).`,
      );
    }

    if (!tituloItem?.trim() || !tipoItem?.trim() || !usuarioNome?.trim()) {
      throw new Error('Todos os campos são obrigatórios.');
    }

    (this.props as any).tituloItem = tituloItem.trim();
    (this.props as any).tipoItem = tipoItem.trim().toUpperCase();
    (this.props as any).usuarioNome = usuarioNome.trim();
    (this.props as any).updateAt = new Date();
  }
}
