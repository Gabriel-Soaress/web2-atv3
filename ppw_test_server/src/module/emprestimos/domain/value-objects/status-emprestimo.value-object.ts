import { ValueObjects } from "../../../../shared/domain/value.objects/value.objects";

export enum StatusEmprestimoEnum {
  RESERVADO = 'RESERVADO',
  RETIRADO = 'RETIRADO',
  ATRASADO = 'ATRASADO',
  DEVOLVIDO = 'DEVOLVIDO',
}

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
    return this.value === StatusEmprestimoEnum.DEVOLVIDO;
  }
}
