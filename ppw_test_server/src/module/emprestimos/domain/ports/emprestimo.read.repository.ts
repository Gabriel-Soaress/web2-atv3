import { EmprestimoEntity } from '../entity/emprestimo.entity';

export const EMPRESTIMO_READ_REPOSITORY = 'EMPRESTIMO_READ_REPOSITORY';

export interface HistoricoItemRecord {
  id: string;
  emprestimoId: string;
  statusAnterior: string;
  novoStatus: string;
  autorAcao: string;
  justificativa?: string | null;
  timestamp: Date;
}

export interface EmprestimoReadRepository {
  findAll(): Promise<EmprestimoEntity[]>;
  findById(id: string): Promise<EmprestimoEntity | null>;
  findHistorico(emprestimoId: string): Promise<HistoricoItemRecord[]>;
}
