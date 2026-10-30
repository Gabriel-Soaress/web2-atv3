import { EmprestimoEntity } from '../entity/emprestimo.entity';

export const EMPRESTIMO_WRITE_REPOSITORY = 'EMPRESTIMO_WRITE_REPOSITORY';

export interface EmprestimoWriteRepository {
  create(emprestimo: EmprestimoEntity): Promise<EmprestimoEntity>;
  update(emprestimo: EmprestimoEntity): Promise<EmprestimoEntity>;
  delete(id: string): Promise<void>;
}
