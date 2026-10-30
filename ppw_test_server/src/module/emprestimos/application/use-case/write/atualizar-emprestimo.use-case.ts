import { AtualizarEmprestimoRequest } from '../../dto/emprestimo.request.dto';
import { EmprestimoResponse } from '../../dto/emprestimo.response.dto';

export const ATUALIZAR_EMPRESTIMO_USE_CASE = 'ATUALIZAR_EMPRESTIMO_USE_CASE';

export interface AtualizarEmprestimoUseCase {
  execute(id: string, request: AtualizarEmprestimoRequest): Promise<EmprestimoResponse>;
}
