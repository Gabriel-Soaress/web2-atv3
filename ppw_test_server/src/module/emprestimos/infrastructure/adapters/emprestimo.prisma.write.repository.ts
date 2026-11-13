import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { EmprestimoEntity } from '../../domain/entity/emprestimo.entity';
import { AuditOptions, EmprestimoWriteRepository } from '../../domain/ports/emprestimo.write.repository';
import { StatusEmprestimoEnum } from '../../domain/value-objects/status-emprestimo.value-object';
import { EmprestimoMappers } from '../mappers/emprestimo.mappers';

/**
 * EmprestimoPrismaWriteRepository
 *
 * Repositório de escrita (Write Model no padrão CQRS) integrado com Prisma ORM e PostgreSQL.
 * Executa mutações de dados envolvidas em transações ACID (`$transaction`) garantindo que
 * alterações de estado sempre criem atomicamente uma trilha de auditoria imutável (HistoricoEmprestimo).
 */
@Injectable()
export class EmprestimoPrismaWriteRepository implements EmprestimoWriteRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * create()
   *
   * Persiste uma nova reserva no banco de dados e registra atomicamente o primeiro registro de auditoria.
   * Ambas as operações ocorrem na mesma transação ACID para evitar inconsistências em caso de falha.
   *
   * @param emprestimo - Entidade de domínio a ser inserida.
   * @param options - Metadados de auditoria (autor da ação e justificativa descritiva).
   */
  async create(emprestimo: EmprestimoEntity, options?: AuditOptions): Promise<EmprestimoEntity> {
    const data = EmprestimoMappers.toPrismaFromEntity(emprestimo);

    return await this.prisma.$transaction(async (tx) => {
      const created = await tx.emprestimo.create({ data });

      await tx.historicoEmprestimo.create({
        data: {
          emprestimoId: created.id,
          statusAnterior: 'NENHUM',
          novoStatus: created.status,
          autorAcao: options?.autorAcao || created.usuarioNome || 'SISTEMA',
          justificativa: options?.justificativa || 'Criação inicial da reserva',
        },
      });

      return EmprestimoMappers.toEntityFromPrisma(created);
    });
  }

  /**
   * update()
   *
   * Atualiza os dados de um empréstimo existente no banco de dados.
   * Se houver transição de status ou justificativa informada, insere um novo evento na tabela de histórico de auditoria.
   *
   * @param emprestimo - Entidade de domínio contendo os dados e status atualizados.
   * @param options - Metadados de auditoria (autor da ação e justificativa do evento).
   */
  async update(emprestimo: EmprestimoEntity, options?: AuditOptions): Promise<EmprestimoEntity> {
    const data = EmprestimoMappers.toPrismaFromEntity(emprestimo);

    return await this.prisma.$transaction(async (tx) => {
      const registroAtual = await tx.emprestimo.findUnique({
        where: { id: emprestimo.props.id },
      });

      const updated = await tx.emprestimo.update({
        where: { id: emprestimo.props.id },
        data,
      });

      if (registroAtual && (registroAtual.status !== updated.status || options?.justificativa)) {
        await tx.historicoEmprestimo.create({
          data: {
            emprestimoId: updated.id,
            statusAnterior: registroAtual.status,
            novoStatus: updated.status,
            autorAcao: options?.autorAcao || updated.usuarioNome || 'SISTEMA',
            justificativa:
              options?.justificativa || `Transição de estado de ${registroAtual.status} para ${updated.status}`,
          },
        });
      }

      return EmprestimoMappers.toEntityFromPrisma(updated);
    });
  }

  /**
   * delete()
   *
   * Remove o registro de empréstimo do banco de dados pelo seu identificador primário.
   *
   * @param id - Identificador UUID do empréstimo a ser removido.
   */
  async delete(id: string): Promise<void> {
    await this.prisma.emprestimo.delete({
      where: { id },
    });
  }

  /**
   * processarExpiracoesLazy()
   *
   * Implementação do padrão arquitetural Lazy Evaluation (Just-In-Time).
   * Varre no banco reservas cujo prazo limite de 48 horas foi ultrapassado, transicionando-as
   * para EXPIRADO e gerando os logs de auditoria correspondentes de forma atômica,
   * dispensando processos em segundo plano (daemons ou cron jobs).
   */
  async processarExpiracoesLazy(): Promise<number> {
    const agora = new Date();

    return await this.prisma.$transaction(async (tx) => {
      const reservasVencidas = await tx.emprestimo.findMany({
        where: {
          status: StatusEmprestimoEnum.RESERVADO,
          dataLimiteRetirada: {
            lt: agora,
            not: null,
          },
        },
      });

      if (reservasVencidas.length === 0) {
        return 0;
      }

      for (const item of reservasVencidas) {
        await tx.emprestimo.update({
          where: { id: item.id },
          data: { status: StatusEmprestimoEnum.EXPIRADO },
        });

        await tx.historicoEmprestimo.create({
          data: {
            emprestimoId: item.id,
            statusAnterior: StatusEmprestimoEnum.RESERVADO,
            novoStatus: StatusEmprestimoEnum.EXPIRADO,
            autorAcao: 'SISTEMA_LAZY_EVALUATION',
            justificativa: `Reserva expirada automaticamente por atingir o prazo limite de retirada (${new Date(
              item.dataLimiteRetirada!,
            ).toLocaleString('pt-BR')}) - Padrão Lazy Evaluation.`,
          },
        });
      }

      return reservasVencidas.length;
    });
  }
}
