import { RegistrarDevolucaoRequest } from '../../dto/emprestimo.request.dto';
import { EmprestimoResponse } from '../../dto/emprestimo.response.dto';

export const OPERACOES_EMPRESTIMO_USE_CASE = 'OPERACOES_EMPRESTIMO_USE_CASE';

export interface OperacoesEmprestimoUseCase {
  retirar(id: string): Promise<EmprestimoResponse>;
  renovar(id: string): Promise<EmprestimoResponse>;
  devolver(id: string, request: RegistrarDevolucaoRequest): Promise<EmprestimoResponse>;
}
