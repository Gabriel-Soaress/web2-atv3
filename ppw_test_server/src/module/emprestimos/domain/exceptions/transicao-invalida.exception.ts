import { HttpException, HttpStatus } from '@nestjs/common';

export class TransicaoInvalidaException extends HttpException {
  constructor(statusAtual: string, statusDestino: string, permitidos: string[]) {
    const mensagem =
      permitidos.length > 0
        ? `Transição de estado inválida: Não é permitido alterar de '${statusAtual}' para '${statusDestino}'. Estados permitidos a partir de '${statusAtual}': [${permitidos.join(', ')}].`
        : `Transição de estado inválida: O estado '${statusAtual}' é um estado final (terminal) e não permite novas transições.`;

    super(
      {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        error: 'Unprocessable Entity - Violação de FSM',
        message: mensagem,
        statusAtual,
        statusDestinoTentado: statusDestino,
        estadosPermitidos: permitidos,
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}
