import { Inject, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CriarReservaRequest } from '../../dto/emprestimo.request.dto';
import { EmprestimoResponse } from '../../dto/emprestimo.response.dto';
import { EMPRESTIMO_READ_REPOSITORY, EmprestimoReadRepository } from '../../../domain/ports/emprestimo.read.repository';
import {
  EMPRESTIMO_WRITE_REPOSITORY,
  EmprestimoWriteRepository,
} from '../../../domain/ports/emprestimo.write.repository';
import { EmprestimoMappers } from '../../../infrastructure/mappers/emprestimo.mappers';
import { CriarReservaUseCase } from '../../use-case/write/criar-reserva.use-case';

/**
 * CriarReservaService
 *
 * Caso de uso e serviço de aplicação responsável pela criação de uma nova reserva.
 * Garante três validações críticas de concorrência e integridade antes de salvar:
 * 1. Processa expirações lazy pendentes.
 * 2. Bloqueia usuários que possuam multas ou pendências anteriores.
 * 3. Impede double-booking (reserva concorrente do mesmo exemplar).
 */
@Injectable()
export class CriarReservaService implements CriarReservaUseCase {
  constructor(
    @Inject(EMPRESTIMO_READ_REPOSITORY)
    private readonly readRepo: EmprestimoReadRepository,
    @Inject(EMPRESTIMO_WRITE_REPOSITORY)
    private readonly writeRepo: EmprestimoWriteRepository,
  ) {}

  /**
   * execute()
   *
   * Executa o fluxo de criação da reserva: checa bloqueios e disponibilidade,
   * converte a requisição em entidade de domínio e grava atomicamente com justificativa inicial.
   *
   * @param request - DTO contendo título do item, tipo e nome do solicitante.
   */
  async execute(request: CriarReservaRequest): Promise<EmprestimoResponse> {
    await this.writeRepo.processarExpiracoesLazy();

    const statusBloqueio = await this.readRepo.verificarBloqueioUsuario(request.usuarioNome);
    if (statusBloqueio.bloqueado) {
      throw new UnprocessableEntityException(statusBloqueio.motivo);
    }

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
