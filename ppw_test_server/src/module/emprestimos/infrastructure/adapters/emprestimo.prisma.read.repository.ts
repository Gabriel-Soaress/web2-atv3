import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { EmprestimoEntity } from '../../domain/entity/emprestimo.entity';
import {
  EmprestimoReadRepository,
  HistoricoItemRecord,
} from '../../domain/ports/emprestimo.read.repository';
import { EmprestimoMappers } from '../mappers/emprestimo.mappers';

@Injectable()
export class EmprestimoPrismaReadRepository implements EmprestimoReadRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<EmprestimoEntity[]> {
    const rawList = await this.prisma.emprestimo.findMany({
      orderBy: { dataReserva: 'desc' },
    });
    return rawList.map((raw) => EmprestimoMappers.toEntityFromPrisma(raw));
  }

  async findById(id: string): Promise<EmprestimoEntity | null> {
    const raw = await this.prisma.emprestimo.findUnique({
      where: { id },
    });
    if (!raw) return null;
    return EmprestimoMappers.toEntityFromPrisma(raw);
  }

  async findHistorico(emprestimoId: string): Promise<HistoricoItemRecord[]> {
    const logs = await this.prisma.historicoEmprestimo.findMany({
      where: { emprestimoId },
      orderBy: { timestamp: 'desc' },
    });

    return logs.map((log) => ({
      id: log.id,
      emprestimoId: log.emprestimoId,
      statusAnterior: log.statusAnterior,
      novoStatus: log.novoStatus,
      autorAcao: log.autorAcao,
      justificativa: log.justificativa,
      timestamp: log.timestamp,
    }));
  }
}
