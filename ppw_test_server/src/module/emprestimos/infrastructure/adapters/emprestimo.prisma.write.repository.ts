import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { EmprestimoEntity } from '../../domain/entity/emprestimo.entity';
import {
  AuditOptions,
  EmprestimoWriteRepository,
} from '../../domain/ports/emprestimo.write.repository';
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
   * Se o status for alterado, o histórico é registrado obrigatoriamente.
   * Se a gravação do histórico falhar, o rollback desfaz a alteração de status.
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
}
