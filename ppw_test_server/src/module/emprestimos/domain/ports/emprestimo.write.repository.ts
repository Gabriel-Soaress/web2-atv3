import { EmprestimoEntity } from '../entity/emprestimo.entity';

export const EMPRESTIMO_WRITE_REPOSITORY = 'EMPRESTIMO_WRITE_REPOSITORY';

export interface AuditOptions {
  autorAcao?: string;
  justificativa?: string;
}

export interface EmprestimoWriteRepository {
  create(emprestimo: EmprestimoEntity, options?: AuditOptions): Promise<EmprestimoEntity>;
  update(emprestimo: EmprestimoEntity, options?: AuditOptions): Promise<EmprestimoEntity>;
  delete(id: string): Promise<void>;
  processarExpiracoesLazy(): Promise<number>;
}
