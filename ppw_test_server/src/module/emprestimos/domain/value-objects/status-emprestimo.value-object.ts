import { ValueObjects } from '../../../../shared/domain/value.objects/value.objects';
import { TransicaoInvalidaException } from '../exceptions/transicao-invalida.exception';

export enum StatusEmprestimoEnum {
  RESERVADO = 'RESERVADO',
  RETIRADO = 'RETIRADO',
  ATRASADO = 'ATRASADO',
  DEVOLVIDO = 'DEVOLVIDO',
  DEVOLVIDO_COM_MULTA = 'DEVOLVIDO_COM_MULTA',
  EXPIRADO = 'EXPIRADO',
  CANCELADO = 'CANCELADO',
}

/**
 * TRANSICOES_VALIDAS_FSM
 *
 * Matriz de adjacência da Máquina de Estados Finita (FSM).
 * Mapeia rigorosamente quais estados de destino são aceitos a partir do estado atual,
 * definindo os estados terminais (sem saída) e os caminhos permitidos no domínio.
 */
export const TRANSICOES_VALIDAS_FSM: Record<StatusEmprestimoEnum, StatusEmprestimoEnum[]> = {
  [StatusEmprestimoEnum.RESERVADO]: [
    StatusEmprestimoEnum.RETIRADO,
    StatusEmprestimoEnum.EXPIRADO,
    StatusEmprestimoEnum.CANCELADO,
  ],
  [StatusEmprestimoEnum.RETIRADO]: [StatusEmprestimoEnum.DEVOLVIDO, StatusEmprestimoEnum.ATRASADO],
  [StatusEmprestimoEnum.ATRASADO]: [
    StatusEmprestimoEnum.DEVOLVIDO_COM_MULTA,
    StatusEmprestimoEnum.DEVOLVIDO,
    StatusEmprestimoEnum.RETIRADO,
  ],
  [StatusEmprestimoEnum.DEVOLVIDO]: [],
  [StatusEmprestimoEnum.DEVOLVIDO_COM_MULTA]: [],
  [StatusEmprestimoEnum.EXPIRADO]: [],
  [StatusEmprestimoEnum.CANCELADO]: [],
};

/**
 * StatusEmprestimo
 *
 * Value Object (Objeto de Valor) que encapsula o estado do empréstimo e a máquina de estados (FSM).
 * É imutável e responsável por impedir transições ilegais na regra de negócio.
 */
export class StatusEmprestimo extends ValueObjects<StatusEmprestimoEnum> {
  private constructor(value: StatusEmprestimoEnum) {
    super(value);
  }

  /**
   * getValue()
   *
   * Retorna o valor primitivo do enum de status contido no Value Object.
   */
  getValue(): StatusEmprestimoEnum {
    return this.value;
  }

  /**
   * create()
   *
   * Cria uma instância de StatusEmprestimo a partir de uma string ou valor desconhecido,
   * validando se pertence aos enums aceitos no sistema.
   *
   * @param value - Valor bruto a ser validado e convertido em enum de status.
   */
  static create(value: unknown = StatusEmprestimoEnum.RESERVADO): StatusEmprestimo {
    if (typeof value !== 'string' || !value.trim()) {
      throw new Error('O status do empréstimo deve ser preenchido.');
    }

    const normalized = value.trim().toUpperCase() as StatusEmprestimoEnum;

    if (!Object.values(StatusEmprestimoEnum).includes(normalized)) {
      const permitidos = Object.values(StatusEmprestimoEnum).join(', ');
      throw new Error(`Status inválido. Permitidos: ${permitidos}, Recebido: ${value}`);
    }

    return new StatusEmprestimo(normalized);
  }

  /**
   * reservado()
   *
   * Factory method para criar um StatusEmprestimo no estado inicial RESERVADO.
   */
  static reservado(): StatusEmprestimo {
    return new StatusEmprestimo(StatusEmprestimoEnum.RESERVADO);
  }

  /**
   * retirado()
   *
   * Factory method para criar um StatusEmprestimo no estado ativo RETIRADO.
   */
  static retirado(): StatusEmprestimo {
    return new StatusEmprestimo(StatusEmprestimoEnum.RETIRADO);
  }

  /**
   * atrasado()
   *
   * Factory method para criar um StatusEmprestimo no estado ATRASADO.
   */
  static atrasado(): StatusEmprestimo {
    return new StatusEmprestimo(StatusEmprestimoEnum.ATRASADO);
  }

  /**
   * devolvido()
   *
   * Factory method para criar um StatusEmprestimo no estado final DEVOLVIDO (sem multa).
   */
  static devolvido(): StatusEmprestimo {
    return new StatusEmprestimo(StatusEmprestimoEnum.DEVOLVIDO);
  }

  /**
   * devolvidoComMulta()
   *
   * Factory method para criar um StatusEmprestimo no estado final DEVOLVIDO_COM_MULTA.
   */
  static devolvidoComMulta(): StatusEmprestimo {
    return new StatusEmprestimo(StatusEmprestimoEnum.DEVOLVIDO_COM_MULTA);
  }

  /**
   * expirado()
   *
   * Factory method para criar um StatusEmprestimo no estado terminal EXPIRADO.
   */
  static expirado(): StatusEmprestimo {
    return new StatusEmprestimo(StatusEmprestimoEnum.EXPIRADO);
  }

  /**
   * cancelado()
   *
   * Factory method para criar um StatusEmprestimo no estado terminal CANCELADO.
   */
  static cancelado(): StatusEmprestimo {
    return new StatusEmprestimo(StatusEmprestimoEnum.CANCELADO);
  }

  /**
   * validarTransicaoPara()
   *
   * Guarda de transição da FSM: verifica se a transição para o novo status é permitida.
   * Lança a exceção de domínio TransicaoInvalidaException caso a transição seja proibida.
   *
   * @param proximoStatus - Estado de destino que a entidade está tentando assumir.
   */
  validarTransicaoPara(proximoStatus: StatusEmprestimoEnum): void {
    const permitidos = TRANSICOES_VALIDAS_FSM[this.value] || [];
    if (!permitidos.includes(proximoStatus)) {
      throw new TransicaoInvalidaException(this.value, proximoStatus, permitidos);
    }
  }

  /**
   * podeTransicionarPara()
   *
   * Verifica de forma segura (sem lançar erro) se a transição para o status informado é válida.
   *
   * @param proximoStatus - Estado alvo para teste de transição.
   */
  podeTransicionarPara(proximoStatus: StatusEmprestimoEnum): boolean {
    const permitidos = TRANSICOES_VALIDAS_FSM[this.value] || [];
    return permitidos.includes(proximoStatus);
  }

  /**
   * obterProximosEstadosValidos()
   *
   * Retorna o array de status para os quais o estado atual pode transicionar.
   */
  obterProximosEstadosValidos(): StatusEmprestimoEnum[] {
    return TRANSICOES_VALIDAS_FSM[this.value] || [];
  }

  /**
   * isReservado()
   *
   * Indica se o empréstimo está no status RESERVADO.
   */
  isReservado(): boolean {
    return this.value === StatusEmprestimoEnum.RESERVADO;
  }

  /**
   * isRetirado()
   *
   * Indica se o empréstimo está no status RETIRADO.
   */
  isRetirado(): boolean {
    return this.value === StatusEmprestimoEnum.RETIRADO;
  }

  /**
   * isAtrasado()
   *
   * Indica se o empréstimo está no status ATRASADO.
   */
  isAtrasado(): boolean {
    return this.value === StatusEmprestimoEnum.ATRASADO;
  }

  /**
   * isDevolvido()
   *
   * Indica se o empréstimo foi devolvido (com ou sem multa).
   */
  isDevolvido(): boolean {
    return this.value === StatusEmprestimoEnum.DEVOLVIDO || this.value === StatusEmprestimoEnum.DEVOLVIDO_COM_MULTA;
  }

  /**
   * isExpirado()
   *
   * Indica se a reserva expirou por ultrapassar as 48 horas sem retirada física.
   */
  isExpirado(): boolean {
    return this.value === StatusEmprestimoEnum.EXPIRADO;
  }

  /**
   * isCancelado()
   *
   * Indica se a reserva foi voluntariamente cancelada.
   */
  isCancelado(): boolean {
    return this.value === StatusEmprestimoEnum.CANCELADO;
  }

  /**
   * isTerminal()
   *
   * Indica se o status atual é um estado terminal da FSM (não permite novas alterações de ciclo).
   */
  isTerminal(): boolean {
    return (TRANSICOES_VALIDAS_FSM[this.value] || []).length === 0;
  }
}
