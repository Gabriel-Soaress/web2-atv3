import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { EmprestimoEntity } from '../../domain/entity/emprestimo.entity';
import {
  AuditOptions,
  EmprestimoWriteRepository,
} from '../../domain/ports/emprestimo.write.repository';
import { StatusEmprestimoEnum } from '../../domain/value-objects/status-emprestimo.value-object';
import { EmprestimoMappers } from '../mappers/emprestimo.mappers';

@Injectable()
export class EmprestimoPrismaWriteRepository implements EmprestimoWriteRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Criação de empréstimo/reserva com Audit Log atômico via Transação ACID ($transaction).
   */
  async create(
    emprestimo: EmprestimoEntity,
    options?: AuditOptions,
  ): Promise<EmprestimoEntity> {
    const data = EmprestimoMappers.toPrismaFromEntity(emprestimo);

    return await this.prisma.$transaction(async (tx) => {
      const created = await tx.emprestimo.create({ data });

      // Gravação atômica da trilha de auditoria inicial
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
   * Atualização com Audit Log atômico via Transação ACID ($transaction).
   */
  async update(
    emprestimo: EmprestimoEntity,
    options?: AuditOptions,
  ): Promise<EmprestimoEntity> {
    const data = EmprestimoMappers.toPrismaFromEntity(emprestimo);

    return await this.prisma.$transaction(async (tx) => {
      const registroAtual = await tx.emprestimo.findUnique({
        where: { id: emprestimo.props.id },
      });

      const updated = await tx.emprestimo.update({
        where: { id: emprestimo.props.id },
        data,
      });

      // Se houve alteração de status, registra o evento na trilha de auditoria
      if (registroAtual && (registroAtual.status !== updated.status || options?.justificativa)) {
        await tx.historicoEmprestimo.create({
          data: {
            emprestimoId: updated.id,
            statusAnterior: registroAtual.status,
            novoStatus: updated.status,
            autorAcao: options?.autorAcao || updated.usuarioNome || 'SISTEMA',
            justificativa:
              options?.justificativa ||
              `Transição de estado de ${registroAtual.status} para ${updated.status}`,
          },
        });
      }

      return EmprestimoMappers.toEntityFromPrisma(updated);
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.emprestimo.delete({
      where: { id },
    });
  }

  /**
   * Padrão Lazy Expiration (Just-In-Time Evaluation):
   * Avalia atômica e preguiçosamente todas as reservas cujo prazo limite venceu,
   * transicionando-as para EXPIRADO e gerando os respectivos logs de auditoria
   * sem depender de nenhum cron job externo ou daemon em background.
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
