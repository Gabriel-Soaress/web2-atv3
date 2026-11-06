import { HistoricoResponse } from '../../dto/emprestimo.response.dto';

export const FIND_HISTORICO_EMPRESTIMO_USE_CASE = 'FIND_HISTORICO_EMPRESTIMO_USE_CASE';

export interface FindHistoricoEmprestimoUseCase {
  execute(emprestimoId: string): Promise<HistoricoResponse[]>;
}
