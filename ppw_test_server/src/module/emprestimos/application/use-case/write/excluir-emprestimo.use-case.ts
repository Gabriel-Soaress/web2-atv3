export const EXCLUIR_EMPRESTIMO_USE_CASE = 'EXCLUIR_EMPRESTIMO_USE_CASE';

export interface ExcluirEmprestimoUseCase {
  execute(id: string): Promise<void>;
}
