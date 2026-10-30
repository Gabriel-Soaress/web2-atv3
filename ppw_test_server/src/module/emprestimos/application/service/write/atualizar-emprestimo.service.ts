import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AtualizarEmprestimoRequest } from '../../dto/emprestimo.request.dto';
import { EmprestimoResponse } from '../../dto/emprestimo.response.dto';
import {
  EMPRESTIMO_READ_REPOSITORY,
  EmprestimoReadRepository,
} from '../../../domain/ports/emprestimo.read.repository';
import {
  EMPRESTIMO_WRITE_REPOSITORY,
  EmprestimoWriteRepository,
} from '../../../domain/ports/emprestimo.write.repository';
import { EmprestimoMappers } from '../../../infrastructure/mappers/emprestimo.mappers';
import { AtualizarEmprestimoUseCase } from '../../use-case/write/atualizar-emprestimo.use-case';

@Injectable()
export class AtualizarEmprestimoService implements AtualizarEmprestimoUseCase {
  constructor(
    @Inject(EMPRESTIMO_READ_REPOSITORY)
    private readonly readRepo: EmprestimoReadRepository,
    @Inject(EMPRESTIMO_WRITE_REPOSITORY)
    private readonly writeRepo: EmprestimoWriteRepository,
  ) {}

  async execute(id: string, request: AtualizarEmprestimoRequest): Promise<EmprestimoResponse> {
    const emprestimo = await this.readRepo.findById(id);
    if (!emprestimo) {
      throw new NotFoundException('Empréstimo não encontrado.');
    }

    try {
      emprestimo.atualizarDados(request.tituloItem, request.tipoItem, request.usuarioNome);
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }

    const updated = await this.writeRepo.update(emprestimo);
    return EmprestimoMappers.toResponseFromEntity(updated);
  }
}
