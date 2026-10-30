import { EmprestimoResponse } from '../../dto/emprestimo.response.dto';

export const FIND_ALL_EMPRESTIMOS_USE_CASE = 'FIND_ALL_EMPRESTIMOS_USE_CASE';

export interface FindAllEmprestimosUseCase {
  execute(): Promise<EmprestimoResponse[]>;
}
