import { Inject, Injectable } from '@nestjs/common';
import { CriarReservaRequest } from '../../dto/emprestimo.request.dto';
import { EmprestimoResponse } from '../../dto/emprestimo.response.dto';
import {
  EMPRESTIMO_WRITE_REPOSITORY,
  EmprestimoWriteRepository,
} from '../../../domain/ports/emprestimo.write.repository';
import { EmprestimoMappers } from '../../../infrastructure/mappers/emprestimo.mappers';
import { CriarReservaUseCase } from '../../use-case/write/criar-reserva.use-case';

@Injectable()
export class CriarReservaService implements CriarReservaUseCase {
  constructor(
    @Inject(EMPRESTIMO_WRITE_REPOSITORY)
    private readonly repository: EmprestimoWriteRepository,
  ) {}

  async execute(request: CriarReservaRequest): Promise<EmprestimoResponse> {
    const entity = EmprestimoMappers.toEntityFromRequest(request);
    const created = await this.repository.create(entity);
    return EmprestimoMappers.toResponseFromEntity(created);
  }
}
