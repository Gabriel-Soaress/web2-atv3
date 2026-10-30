import { CriarReservaRequest } from '../../dto/emprestimo.request.dto';
import { EmprestimoResponse } from '../../dto/emprestimo.response.dto';

export const CRIAR_RESERVA_USE_CASE = 'CRIAR_RESERVA_USE_CASE';

export interface CriarReservaUseCase {
  execute(request: CriarReservaRequest): Promise<EmprestimoResponse>;
}
