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

export class EmprestimoEntity extends BaseEntity<EmprestimoProps> {
  constructor(props: EmprestimoProps) {
    super(props);
  }

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
    // Prazo limite para retirada: 48 horas a partir da reserva
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

  static restore(props: EmprestimoProps): EmprestimoEntity {
    return new EmprestimoEntity(props);
  }

  // ==========================================
  // AÇÕES ORIENTADAS A EVENTOS DA FSM
  // ==========================================

  /**
   * Evento: registrarRetirada()
   * Transição: RESERVADO -> RETIRADO
   * Valida se o prazo limite de retirada não expirou.
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
   * Evento: renovarPrazo()
   * Transição: Válido para RETIRADO ou ATRASADO
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
    // Se estava atrasado e renovou, zera atraso provisoriamente
    (this.props as any).diasAtraso = 0;
    (this.props as any).valorMulta = 0;
    (this.props as any).updateAt = agora;
  }

  /**
   * Evento: registrarDevolucao()
   * Transições:
   *  - Se devolvido no prazo: RETIRADO -> DEVOLVIDO
   *  - Se devolvido com atraso: RETIRADO/ATRASADO -> DEVOLVIDO_COM_MULTA
   * Aplica a Calculadora de Multa Progressiva.
   */
  registrarDevolucao(temAvaria: boolean, descricaoAvaria?: string | null): void {
    const agora = new Date();
    const calculo = CalculadoraMultaService.calcular(this.props.dataPrevistaDevolucao, agora);

    const proximoStatus =
      calculo.diasAtraso > 0 || this.props.status.isAtrasado()
        ? StatusEmprestimoEnum.DEVOLVIDO_COM_MULTA
        : StatusEmprestimoEnum.DEVOLVIDO;

    // Guarda de transição da FSM
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
   * Evento: cancelarReserva()
   * Transição: RESERVADO -> CANCELADO
   */
  cancelarReserva(): void {
    this.props.status.validarTransicaoPara(StatusEmprestimoEnum.CANCELADO);

    const agora = new Date();
    (this.props as any).status = StatusEmprestimo.cancelado();
    (this.props as any).updateAt = agora;
  }

  /**
   * Evento: expirarReserva()
   * Transição: RESERVADO -> EXPIRADO (Lazy Evaluation ou timeout)
   */
  expirarReserva(): void {
    this.props.status.validarTransicaoPara(StatusEmprestimoEnum.EXPIRADO);

    const agora = new Date();
    (this.props as any).status = StatusEmprestimo.expirado();
    (this.props as any).updateAt = agora;
  }

  /**
   * Evento: marcarAtrasado()
   * Transição: RETIRADO -> ATRASADO
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
