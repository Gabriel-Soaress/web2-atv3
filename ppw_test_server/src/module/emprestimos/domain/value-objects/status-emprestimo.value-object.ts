import { ValueObjects } from "../../../../shared/domain/value.objects/value.objects";
import { TransicaoInvalidaException } from "../exceptions/transicao-invalida.exception";

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
 * Matriz de Transições da Máquina de Estados Finita (FSM).
 * Define explicitamente quais caminhos são válidos a partir de cada estado.
 */
export const TRANSICOES_VALIDAS_FSM: Record<StatusEmprestimoEnum, StatusEmprestimoEnum[]> = {
  [StatusEmprestimoEnum.RESERVADO]: [
    StatusEmprestimoEnum.RETIRADO,
    StatusEmprestimoEnum.EXPIRADO,
    StatusEmprestimoEnum.CANCELADO,
  ],
  [StatusEmprestimoEnum.RETIRADO]: [
    StatusEmprestimoEnum.DEVOLVIDO,
    StatusEmprestimoEnum.ATRASADO,
    // Observação: renovar mantém o status RETIRADO se não estiver atrasado
  ],
  [StatusEmprestimoEnum.ATRASADO]: [
    StatusEmprestimoEnum.DEVOLVIDO_COM_MULTA,
    StatusEmprestimoEnum.DEVOLVIDO,
    StatusEmprestimoEnum.RETIRADO, // no caso de anistia ou regularização
  ],
  [StatusEmprestimoEnum.DEVOLVIDO]: [], // Estado terminal
  [StatusEmprestimoEnum.DEVOLVIDO_COM_MULTA]: [], // Estado terminal
  [StatusEmprestimoEnum.EXPIRADO]: [], // Estado terminal
  [StatusEmprestimoEnum.CANCELADO]: [], // Estado terminal
};

export class StatusEmprestimo extends ValueObjects<StatusEmprestimoEnum> {
  private constructor(value: StatusEmprestimoEnum) {
    super(value);
  }

  getValue(): StatusEmprestimoEnum {
    return this.value;
  }

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

  // Factory methods estáticos para criação semântica
  static reservado(): StatusEmprestimo {
    return new StatusEmprestimo(StatusEmprestimoEnum.RESERVADO);
  }

  static retirado(): StatusEmprestimo {
    return new StatusEmprestimo(StatusEmprestimoEnum.RETIRADO);
  }

  static atrasado(): StatusEmprestimo {
    return new StatusEmprestimo(StatusEmprestimoEnum.ATRASADO);
  }

  static devolvido(): StatusEmprestimo {
    return new StatusEmprestimo(StatusEmprestimoEnum.DEVOLVIDO);
  }

  static devolvidoComMulta(): StatusEmprestimo {
    return new StatusEmprestimo(StatusEmprestimoEnum.DEVOLVIDO_COM_MULTA);
  }

  static expirado(): StatusEmprestimo {
    return new StatusEmprestimo(StatusEmprestimoEnum.EXPIRADO);
  }

  static cancelado(): StatusEmprestimo {
    return new StatusEmprestimo(StatusEmprestimoEnum.CANCELADO);
  }

  /**
   * Guarda de transição: valida se a transição para o novo status é permitida pela FSM.
   * Dispara TransicaoInvalidaException (HTTP 422) se a transição for proibida.
   */
  validarTransicaoPara(proximoStatus: StatusEmprestimoEnum): void {
    const permitidos = TRANSICOES_VALIDAS_FSM[this.value] || [];
    if (!permitidos.includes(proximoStatus)) {
      throw new TransicaoInvalidaException(this.value, proximoStatus, permitidos);
    }
  }

  podeTransicionarPara(proximoStatus: StatusEmprestimoEnum): boolean {
    const permitidos = TRANSICOES_VALIDAS_FSM[this.value] || [];
    return permitidos.includes(proximoStatus);
  }

  obterProximosEstadosValidos(): StatusEmprestimoEnum[] {
    return TRANSICOES_VALIDAS_FSM[this.value] || [];
  }

  // Consultas de estado
  isReservado(): boolean {
    return this.value === StatusEmprestimoEnum.RESERVADO;
  }

  isRetirado(): boolean {
    return this.value === StatusEmprestimoEnum.RETIRADO;
  }

  isAtrasado(): boolean {
    return this.value === StatusEmprestimoEnum.ATRASADO;
  }

  isDevolvido(): boolean {
    return (
      this.value === StatusEmprestimoEnum.DEVOLVIDO ||
      this.value === StatusEmprestimoEnum.DEVOLVIDO_COM_MULTA
    );
  }

  isExpirado(): boolean {
    return this.value === StatusEmprestimoEnum.EXPIRADO;
  }

  isCancelado(): boolean {
    return this.value === StatusEmprestimoEnum.CANCELADO;
  }

  isTerminal(): boolean {
    return (TRANSICOES_VALIDAS_FSM[this.value] || []).length === 0;
  }
}
