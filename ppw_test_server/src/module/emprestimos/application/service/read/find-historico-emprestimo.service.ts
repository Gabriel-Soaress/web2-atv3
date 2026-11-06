import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { HistoricoResponse } from '../../dto/emprestimo.response.dto';
import {
  EMPRESTIMO_READ_REPOSITORY,
  EmprestimoReadRepository,
} from '../../../domain/ports/emprestimo.read.repository';
import { FindHistoricoEmprestimoUseCase } from '../../use-case/read/find-historico-emprestimo.use-case';

@Injectable()
export class FindHistoricoEmprestimoService implements FindHistoricoEmprestimoUseCase {
  constructor(
    @Inject(EMPRESTIMO_READ_REPOSITORY)
    private readonly repository: EmprestimoReadRepository,
  ) {}

  async execute(emprestimoId: string): Promise<HistoricoResponse[]> {
    const emprestimo = await this.repository.findById(emprestimoId);
    if (!emprestimo) {
      throw new NotFoundException('Empréstimo não encontrado.');
    }

    const records = await this.repository.findHistorico(emprestimoId);
    return records.map(
      (r) =>
        new HistoricoResponse({
          id: r.id,
          emprestimoId: r.emprestimoId,
          statusAnterior: r.statusAnterior,
          novoStatus: r.novoStatus,
          autorAcao: r.autorAcao,
          justificativa: r.justificativa,
          timestamp: r.timestamp,
        }),
    );
  }
}
