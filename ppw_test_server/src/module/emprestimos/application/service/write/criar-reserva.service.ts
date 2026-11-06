import {
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CriarReservaRequest } from '../../dto/emprestimo.request.dto';
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
import { CriarReservaUseCase } from '../../use-case/write/criar-reserva.use-case';

@Injectable()
export class CriarReservaService implements CriarReservaUseCase {
  constructor(
    @Inject(EMPRESTIMO_READ_REPOSITORY)
    private readonly readRepo: EmprestimoReadRepository,
    @Inject(EMPRESTIMO_WRITE_REPOSITORY)
    private readonly writeRepo: EmprestimoWriteRepository,
  ) {}

  async execute(request: CriarReservaRequest): Promise<EmprestimoResponse> {
    // 1. Padrão Lazy Expiration: processa expirações pendentes no banco antes de alocar
    await this.writeRepo.processarExpiracoesLazy();

    // 2. Regra de Negócio de Alta Complexidade: Verificação de bloqueio por atrasos anteriores
    const statusBloqueio = await this.readRepo.verificarBloqueioUsuario(request.usuarioNome);
    if (statusBloqueio.bloqueado) {
      throw new UnprocessableEntityException(statusBloqueio.motivo);
    }

    // 3. Conflito Assíncrono / Concorrência: Prevenção de double-booking do mesmo exemplar
    const disponivel = await this.readRepo.verificarDisponibilidadeItem(request.tituloItem);
    if (!disponivel) {
      throw new UnprocessableEntityException(
        `O item '${request.tituloItem}' já possui uma reserva ou empréstimo ativo no momento.`,
      );
    }

    const entity = EmprestimoMappers.toEntityFromRequest(request);
    const created = await this.writeRepo.create(entity, {
      autorAcao: request.usuarioNome,
      justificativa: `Reserva inicial realizada com sucesso para o usuário ${request.usuarioNome}. Prazo limite para retirada de 48 horas.`,
    });

    return EmprestimoMappers.toResponseFromEntity(created);
  }
}
