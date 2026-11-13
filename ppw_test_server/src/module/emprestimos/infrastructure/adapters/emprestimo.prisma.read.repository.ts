import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { EmprestimoEntity } from '../../domain/entity/emprestimo.entity';
import {
  EmprestimoReadRepository,
  HistoricoItemRecord,
  StatusBloqueioUsuario,
} from '../../domain/ports/emprestimo.read.repository';
import { StatusEmprestimoEnum } from '../../domain/value-objects/status-emprestimo.value-object';
import { EmprestimoMappers } from '../mappers/emprestimo.mappers';

/**
 * EmprestimoPrismaReadRepository
 *
 * Repositório de leitura (Read Model no padrão CQRS) integrado com Prisma ORM.
 * Focado exclusivamente em consultas eficientes e rápidas (Queries), sem transações de escrita.
 * Contém também métodos de consulta para verificação de regras de negócio (bloqueios e concorrência).
 */
@Injectable()
export class EmprestimoPrismaReadRepository implements EmprestimoReadRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * findAll()
   *
   * Busca todos os empréstimos no banco ordenados pela data de reserva mais recente.
   * Converte os modelos planos do Prisma em entidades de domínio.
   */
  async findAll(): Promise<EmprestimoEntity[]> {
    const rawList = await this.prisma.emprestimo.findMany({
      orderBy: { dataReserva: 'desc' },
    });
    return rawList.map((raw) => EmprestimoMappers.toEntityFromPrisma(raw));
  }

  /**
   * findById()
   *
   * Localiza um empréstimo específico pela sua chave primária UUID.
   * Retorna a entidade de domínio reconstruída ou null se não for encontrado.
   *
   * @param id - Identificador UUID do empréstimo.
   */
  async findById(id: string): Promise<EmprestimoEntity | null> {
    const raw = await this.prisma.emprestimo.findUnique({
      where: { id },
    });
    if (!raw) return null;
    return EmprestimoMappers.toEntityFromPrisma(raw);
  }

  /**
   * findHistorico()
   *
   * Consulta a trilha de auditoria completa (Audit Log) de um determinado empréstimo,
   * retornando os registros ordenados do evento mais recente para o mais antigo.
   *
   * @param emprestimoId - Identificador UUID do empréstimo cujos eventos serão consultados.
   */
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

  /**
   * verificarBloqueioUsuario()
   *
   * Verifica se o usuário possui pendências de devolução ativas (empréstimos ATRASADOS
   * ou RETIRADOS com data prevista vencida). Se houver pendências, retorna o motivo e os itens bloqueantes.
   *
   * @param usuarioNome - Nome do solicitante a ser verificado.
   */
  async verificarBloqueioUsuario(usuarioNome: string): Promise<StatusBloqueioUsuario> {
    const agora = new Date();
    const pendencias = await this.prisma.emprestimo.findMany({
      where: {
        usuarioNome: {
          equals: usuarioNome.trim(),
        },
        OR: [
          { status: StatusEmprestimoEnum.ATRASADO },
          {
            status: StatusEmprestimoEnum.RETIRADO,
            dataPrevistaDevolucao: {
              lt: agora,
            },
          },
        ],
      },
      select: {
        id: true,
        tituloItem: true,
        dataPrevistaDevolucao: true,
      },
    });

    if (pendencias.length > 0) {
      const itens = pendencias.map((p) => p.tituloItem).join(', ');
      return {
        bloqueado: true,
        motivo: `Usuário '${usuarioNome}' possui ${pendencias.length} item(ns) em atraso pendente(s): [${itens}]. Novas reservas bloqueadas até a devolução e regularização.`,
        emprestimosPendentes: pendencias.map((p) => p.id),
      };
    }

    return { bloqueado: false };
  }

  /**
   * verificarDisponibilidadeItem()
   *
   * Previne conflito assíncrono e concorrência (double-booking) de um mesmo exemplar.
   * Verifica se o item já possui empréstimo ou reserva ativa no momento (RESERVADO, RETIRADO ou ATRASADO).
   *
   * @param tituloItem - Título ou identificador do item a ser consultado.
   */
  async verificarDisponibilidadeItem(tituloItem: string): Promise<boolean> {
    const ativo = await this.prisma.emprestimo.findFirst({
      where: {
        tituloItem: {
          equals: tituloItem.trim(),
        },
        status: {
          in: [StatusEmprestimoEnum.RESERVADO, StatusEmprestimoEnum.RETIRADO, StatusEmprestimoEnum.ATRASADO],
        },
      },
    });

    return !ativo;
  }
}
