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
import { CalculadoraMultaService } from '../../../domain/services/calculadora-multa.service';
import { OperacoesEmprestimoUseCase } from '../../use-case/write/operacoes-emprestimo.use-case';

/**
 * OperacoesEmprestimoService
 *
 * Serviço de aplicação que orquestra as operações transacionais do ciclo de vida dos empréstimos.
 * Carrega a entidade de domínio, invoca seus métodos de negócio da máquina de estados (FSM)
 * e persiste as alterações acompanhadas de registro imutável de histórico/auditoria.
 */
@Injectable()
export class OperacoesEmprestimoService implements OperacoesEmprestimoUseCase {
  constructor(
    @Inject(EMPRESTIMO_READ_REPOSITORY)
    private readonly readRepo: EmprestimoReadRepository,
    @Inject(EMPRESTIMO_WRITE_REPOSITORY)
    private readonly writeRepo: EmprestimoWriteRepository,
  ) {}

  /**
   * tratarErroDominio()
   *
   * Converte erros e exceções de regras de domínio em respostas HTTP compatíveis (ex: UnprocessableEntityException / 422).
   *
   * @param err - Exceção capturada na execução da entidade ou serviço de domínio.
   */
  private tratarErroDominio(err: any): never {
    if (err instanceof HttpException) {
      throw err;
    }
    throw new UnprocessableEntityException(err.message || 'Erro de validação de domínio.');
  }

  /**
   * retirar()
   *
   * Orquestra a retirada de um item reservado.
   * Processa previamente eventuais reservas expiradas (lazy evaluation), busca a entidade,
   * executa o método registrarRetirada() e persiste a atualização gerando histórico de auditoria.
   *
   * @param id - Identificador UUID do empréstimo a ser retirado.
   */
  async retirar(id: string): Promise<EmprestimoResponse> {
    await this.writeRepo.processarExpiracoesLazy();

    const emprestimo = await this.readRepo.findById(id);
    if (!emprestimo) {
      throw new NotFoundException('Empréstimo não encontrado.');
    }

    try {
      emprestimo.registrarRetirada();
    } catch (err: any) {
      this.tratarErroDominio(err);
    }

    const updated = await this.writeRepo.update(emprestimo, {
      autorAcao: emprestimo.props.usuarioNome,
      justificativa:
        'Retirada do item realizada com sucesso. Prazo de devolução definido para 7 dias.',
    });
    return EmprestimoMappers.toResponseFromEntity(updated);
  }

  /**
   * renovar()
   *
   * Orquestra a renovação do prazo de devolução por mais 7 dias.
   * Busca a entidade, invoca renovarPrazo() e grava o novo prazo com histórico de renovação.
   *
   * @param id - Identificador UUID do empréstimo a ser renovado.
   */
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

    const updated = await this.writeRepo.update(emprestimo, {
      autorAcao: emprestimo.props.usuarioNome,
      justificativa: `Renovação de prazo concedida. Total de renovações: ${emprestimo.props.renovacoesCount}.`,
    });
    return EmprestimoMappers.toResponseFromEntity(updated);
  }

  /**
   * devolver()
   *
   * Orquestra o encerramento do empréstimo com a devolução física do item.
   * Aplica o cálculo de multa progressiva em caso de atraso, inspeciona avarias,
   * atualiza o status para DEVOLVIDO ou DEVOLVIDO_COM_MULTA e persiste com registro de auditoria.
   *
   * @param id - Identificador UUID do empréstimo.
   * @param request - DTO com informações de vistoria física (avarias constatadas e descrição).
   */
  async devolver(id: string, request: RegistrarDevolucaoRequest): Promise<EmprestimoResponse> {
    const emprestimo = await this.readRepo.findById(id);
    if (!emprestimo) {
      throw new NotFoundException('Empréstimo não encontrado.');
    }

    const agora = new Date();
    const calculo = CalculadoraMultaService.calcular(emprestimo.props.dataPrevistaDevolucao, agora);

    try {
      emprestimo.registrarDevolucao(request.temAvaria, request.descricaoAvaria);
    } catch (err: any) {
      this.tratarErroDominio(err);
    }

    let justificativa = request.temAvaria
      ? `Devolução com avaria constatada: "${request.descricaoAvaria || 'Sem descrição'}"`
      : 'Devolução regular concluída sem avarias.';

    if (calculo.diasAtraso > 0) {
      justificativa += ` | Multa progressiva aplicada: R$ ${calculo.valorMulta.toFixed(2)} (${calculo.diasAtraso} dias de atraso).`;
    }

    const updated = await this.writeRepo.update(emprestimo, {
      autorAcao: emprestimo.props.usuarioNome,
      justificativa,
    });
    return EmprestimoMappers.toResponseFromEntity(updated);
  }

  /**
   * cancelar()
   *
   * Orquestra o cancelamento voluntário de uma reserva antes da retirada.
   * Invoca cancelarReserva() na entidade e persiste a mudança para status CANCELADO.
   *
   * @param id - Identificador UUID da reserva a ser cancelada.
   */
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

    const updated = await this.writeRepo.update(emprestimo, {
      autorAcao: emprestimo.props.usuarioNome,
      justificativa: 'Reserva cancelada pelo solicitante ou operador.',
    });
    return EmprestimoMappers.toResponseFromEntity(updated);
  }

  /**
   * marcarAtrasado()
   *
   * Identifica e marca o empréstimo como ATRASADO caso a data prevista de devolução tenha expirado.
   * Recalcula a multa devida e registra o log operacional no banco.
   *
   * @param id - Identificador UUID do empréstimo em atraso.
   */
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

    const updated = await this.writeRepo.update(emprestimo, {
      autorAcao: 'SISTEMA',
      justificativa: `Item marcado com status ATRASADO por superação do prazo de devolução. Multa estimada: R$ ${emprestimo.props.valorMulta.toFixed(2)}.`,
    });
    return EmprestimoMappers.toResponseFromEntity(updated);
  }
}
