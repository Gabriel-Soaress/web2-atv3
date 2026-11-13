import { Inject, Injectable } from '@nestjs/common';
import { EmprestimoResponse } from '../../dto/emprestimo.response.dto';
import { EMPRESTIMO_READ_REPOSITORY, EmprestimoReadRepository } from '../../../domain/ports/emprestimo.read.repository';
import {
  EMPRESTIMO_WRITE_REPOSITORY,
  EmprestimoWriteRepository,
} from '../../../domain/ports/emprestimo.write.repository';
import { EmprestimoMappers } from '../../../infrastructure/mappers/emprestimo.mappers';
import { FindAllEmprestimosUseCase } from '../../use-case/read/find-all-emprestimos.use-case';

@Injectable()
export class FindAllEmprestimosService implements FindAllEmprestimosUseCase {
  constructor(
    @Inject(EMPRESTIMO_READ_REPOSITORY)
    private readonly repository: EmprestimoReadRepository,
    @Inject(EMPRESTIMO_WRITE_REPOSITORY)
    private readonly writeRepo: EmprestimoWriteRepository,
  ) {}

  async execute(): Promise<EmprestimoResponse[]> {
    // Avaliação preguiçosa: expira reservas vencidas antes de listar
    await this.writeRepo.processarExpiracoesLazy();

    const list = await this.repository.findAll();
    return list.map((item) => EmprestimoMappers.toResponseFromEntity(item));
  }
}
