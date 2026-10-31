import {
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { RegistrarDevolucaoRequest } from '../../dto/emprestimo.request.dto';
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
import { OperacoesEmprestimoUseCase } from '../../use-case/write/operacoes-emprestimo.use-case';

@Injectable()
export class OperacoesEmprestimoService implements OperacoesEmprestimoUseCase {
  constructor(
    @Inject(EMPRESTIMO_READ_REPOSITORY)
    private readonly readRepo: EmprestimoReadRepository,
    @Inject(EMPRESTIMO_WRITE_REPOSITORY)
    private readonly writeRepo: EmprestimoWriteRepository,
  ) {}

  private tratarErroDominio(err: any): never {
    if (err instanceof HttpException) {
      throw err;
    }
    throw new UnprocessableEntityException(err.message || 'Erro de validação de domínio.');
  }

  async retirar(id: string): Promise<EmprestimoResponse> {
    const emprestimo = await this.readRepo.findById(id);
    if (!emprestimo) {
      throw new NotFoundException('Empréstimo não encontrado.');
    }

    try {
      emprestimo.registrarRetirada();
    } catch (err: any) {
      this.tratarErroDominio(err);
    }

    const updated = await this.writeRepo.update(emprestimo);
    return EmprestimoMappers.toResponseFromEntity(updated);
  }

  async renovar(id: string): Promise<EmprestimoResponse> {
    const emprestimo = await this.readRepo.findById(id);
    if (!emprestimo) {
      throw new NotFoundException('Empréstimo não encontrado.');
    }

    try {
      emprestimo.renovarPrazo();
    } catch (err: any) {
      this.tratarErroDominio(err);
    }

    const updated = await this.writeRepo.update(emprestimo);
    return EmprestimoMappers.toResponseFromEntity(updated);
  }

  async devolver(id: string, request: RegistrarDevolucaoRequest): Promise<EmprestimoResponse> {
    const emprestimo = await this.readRepo.findById(id);
    if (!emprestimo) {
      throw new NotFoundException('Empréstimo não encontrado.');
    }

    try {
      emprestimo.registrarDevolucao(request.temAvaria, request.descricaoAvaria);
    } catch (err: any) {
      this.tratarErroDominio(err);
    }

    const updated = await this.writeRepo.update(emprestimo);
    return EmprestimoMappers.toResponseFromEntity(updated);
  }

  async cancelar(id: string): Promise<EmprestimoResponse> {
    const emprestimo = await this.readRepo.findById(id);
    if (!emprestimo) {
      throw new NotFoundException('Empréstimo não encontrado.');
    }

    try {
      emprestimo.cancelarReserva();
    } catch (err: any) {
      this.tratarErroDominio(err);
    }

    const updated = await this.writeRepo.update(emprestimo);
    return EmprestimoMappers.toResponseFromEntity(updated);
  }

  async marcarAtrasado(id: string): Promise<EmprestimoResponse> {
    const emprestimo = await this.readRepo.findById(id);
    if (!emprestimo) {
      throw new NotFoundException('Empréstimo não encontrado.');
    }

    try {
      emprestimo.marcarAtrasado();
    } catch (err: any) {
      this.tratarErroDominio(err);
    }

    const updated = await this.writeRepo.update(emprestimo);
    return EmprestimoMappers.toResponseFromEntity(updated);
  }
}
