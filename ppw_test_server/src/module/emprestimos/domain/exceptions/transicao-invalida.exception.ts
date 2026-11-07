import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * TransicaoInvalidaException
 *
 * Exceção semântica de domínio disparada quando uma tentativa de alteração de status
 * viola a matriz de transições da Máquina de Estados Finita (FSM).
 * Estende HttpException retornando o status HTTP 422 (Unprocessable Entity) com payload
 * detalhado sobre o estado atual, destino tentado e estados permitidos.
 */
export class TransicaoInvalidaException extends HttpException {
  /**
   * constructor()
   *
   * Constrói a mensagem e o payload semântico de erro HTTP 422 informando as restrições da FSM.
   *
   * @param statusAtual - Status em que a entidade se encontra no momento da tentativa.
   * @param statusDestino - Status para o qual a requisição tentou mudar a entidade.
   * @param permitidos - Lista de status legalmente permitidos a partir do status atual.
   */
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
