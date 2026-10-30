import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { EmprestimoEntity } from '../../domain/entity/emprestimo.entity';
import { EmprestimoWriteRepository } from '../../domain/ports/emprestimo.write.repository';
import { EmprestimoMappers } from '../mappers/emprestimo.mappers';

@Injectable()
export class EmprestimoPrismaWriteRepository implements EmprestimoWriteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(emprestimo: EmprestimoEntity): Promise<EmprestimoEntity> {
    const data = EmprestimoMappers.toPrismaFromEntity(emprestimo);
    const created = await this.prisma.emprestimo.create({ data });
    return EmprestimoMappers.toEntityFromPrisma(created);
  }

  async update(emprestimo: EmprestimoEntity): Promise<EmprestimoEntity> {
    const data = EmprestimoMappers.toPrismaFromEntity(emprestimo);
    const updated = await this.prisma.emprestimo.update({
      where: { id: emprestimo.props.id },
      data,
    });
    return EmprestimoMappers.toEntityFromPrisma(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.emprestimo.delete({
      where: { id },
    });
  }
}
