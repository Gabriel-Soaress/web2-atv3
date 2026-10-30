import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  EMPRESTIMO_READ_REPOSITORY,
  EmprestimoReadRepository,
} from '../../../domain/ports/emprestimo.read.repository';
import {
  EMPRESTIMO_WRITE_REPOSITORY,
  EmprestimoWriteRepository,
} from '../../../domain/ports/emprestimo.write.repository';
import { ExcluirEmprestimoUseCase } from '../../use-case/write/excluir-emprestimo.use-case';

@Injectable()
export class ExcluirEmprestimoService implements ExcluirEmprestimoUseCase {
  constructor(
    @Inject(EMPRESTIMO_READ_REPOSITORY)
    private readonly readRepo: EmprestimoReadRepository,
    @Inject(EMPRESTIMO_WRITE_REPOSITORY)
    private readonly writeRepo: EmprestimoWriteRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const emprestimo = await this.readRepo.findById(id);
    if (!emprestimo) {
      throw new NotFoundException('Empréstimo não encontrado.');
    }

    await this.writeRepo.delete(id);
  }
}
