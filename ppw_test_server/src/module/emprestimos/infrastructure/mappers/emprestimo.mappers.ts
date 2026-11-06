import { Emprestimo as PrismaEmprestimo } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { CriarReservaRequest } from '../../application/dto/emprestimo.request.dto';
import { EmprestimoResponse } from '../../application/dto/emprestimo.response.dto';
import { EmprestimoEntity } from '../../domain/entity/emprestimo.entity';
import { StatusEmprestimo, StatusEmprestimoEnum } from '../../domain/value-objects/status-emprestimo.value-object';
import { CalculadoraMultaService } from '../../domain/services/calculadora-multa.service';

export class EmprestimoMappers {
  static toEntityFromRequest(request: CriarReservaRequest): EmprestimoEntity {
    return EmprestimoEntity.createReserva(
      request.tituloItem,
      request.tipoItem,
      request.usuarioNome,
      request.id?.trim() || randomUUID(),
    );
  }

  static toEntityFromPrisma(raw: PrismaEmprestimo): EmprestimoEntity {
    return EmprestimoEntity.restore({
      id: raw.id,
      tituloItem: raw.tituloItem,
      tipoItem: raw.tipoItem,
      usuarioNome: raw.usuarioNome,
      dataReserva: raw.dataReserva,
      dataLimiteRetirada: raw.dataLimiteRetirada,
      dataRetirada: raw.dataRetirada,
      dataPrevistaDevolucao: raw.dataPrevistaDevolucao,
      dataDevolucao: raw.dataDevolucao,
      status: StatusEmprestimo.create(raw.status),
      renovacoesCount: raw.renovacoesCount,
      temAvaria: raw.temAvaria,
      descricaoAvaria: raw.descricaoAvaria,
      diasAtraso: raw.diasAtraso ?? 0,
      valorMulta: raw.valorMulta ?? 0,
      createdAt: raw.createdAt,
      updateAt: raw.updatedAt,
    });
  }

  static toPrismaFromEntity(entity: EmprestimoEntity) {
    return {
      id: entity.props.id || randomUUID(),
      tituloItem: entity.props.tituloItem,
      tipoItem: entity.props.tipoItem,
      usuarioNome: entity.props.usuarioNome,
      dataReserva: entity.props.dataReserva,
      dataLimiteRetirada: entity.props.dataLimiteRetirada ?? null,
      dataRetirada: entity.props.dataRetirada ?? null,
      dataPrevistaDevolucao: entity.props.dataPrevistaDevolucao ?? null,
      dataDevolucao: entity.props.dataDevolucao ?? null,
      status: entity.props.status.getValue(),
      renovacoesCount: entity.props.renovacoesCount,
      temAvaria: entity.props.temAvaria,
      descricaoAvaria: entity.props.descricaoAvaria ?? null,
      diasAtraso: entity.props.diasAtraso ?? 0,
      valorMulta: entity.props.valorMulta ?? 0,
    };
  }

  static toResponseFromEntity(entity: EmprestimoEntity): EmprestimoResponse {
    const agora = new Date();
    let statusCalculado: string = entity.props.status.getValue();
    let diasAtraso = entity.props.diasAtraso ?? 0;
    let valorMulta = entity.props.valorMulta ?? 0;

    // Se está RETIRADO e a data prevista venceu, recalcula atraso e multa dinamicamente
    if (
      statusCalculado === StatusEmprestimoEnum.RETIRADO &&
      entity.props.dataPrevistaDevolucao &&
      new Date(entity.props.dataPrevistaDevolucao) < agora
    ) {
      statusCalculado = StatusEmprestimoEnum.ATRASADO;
      const calculo = CalculadoraMultaService.calcular(entity.props.dataPrevistaDevolucao, agora);
      diasAtraso = calculo.diasAtraso;
      valorMulta = calculo.valorMulta;
    }

    return new EmprestimoResponse({
      id: entity.props.id,
      tituloItem: entity.props.tituloItem,
      tipoItem: entity.props.tipoItem,
      usuarioNome: entity.props.usuarioNome,
      dataReserva: entity.props.dataReserva,
      dataLimiteRetirada: entity.props.dataLimiteRetirada,
      dataRetirada: entity.props.dataRetirada,
      dataPrevistaDevolucao: entity.props.dataPrevistaDevolucao,
      dataDevolucao: entity.props.dataDevolucao,
      status: statusCalculado,
      renovacoesCount: entity.props.renovacoesCount,
      temAvaria: entity.props.temAvaria,
      descricaoAvaria: entity.props.descricaoAvaria,
      diasAtraso,
      valorMulta,
      createdAt: entity.props.createdAt,
      updatedAt: entity.props.updateAt,
    });
  }
}
