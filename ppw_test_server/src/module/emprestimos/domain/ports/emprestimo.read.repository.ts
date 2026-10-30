import { EmprestimoEntity } from '../entity/emprestimo.entity';

export const EMPRESTIMO_READ_REPOSITORY = 'EMPRESTIMO_READ_REPOSITORY';

export interface EmprestimoReadRepository {
  findAll(): Promise<EmprestimoEntity[]>;
  findById(id: string): Promise<EmprestimoEntity | null>;
}
