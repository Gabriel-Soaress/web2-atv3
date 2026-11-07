import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import {
  AtualizarEmprestimoRequest,
  CriarReservaRequest,
  RegistrarDevolucaoRequest,
} from '../application/dto/emprestimo.request.dto';
import {
  EmprestimoResponse,
  HistoricoResponse,
} from '../application/dto/emprestimo.response.dto';
import {
  FIND_ALL_EMPRESTIMOS_USE_CASE,
  FindAllEmprestimosUseCase,
} from '../application/use-case/read/find-all-emprestimos.use-case';
import {
  FIND_HISTORICO_EMPRESTIMO_USE_CASE,
  FindHistoricoEmprestimoUseCase,
} from '../application/use-case/read/find-historico-emprestimo.use-case';
import {
  CRIAR_RESERVA_USE_CASE,
  CriarReservaUseCase,
} from '../application/use-case/write/criar-reserva.use-case';
import {
  ATUALIZAR_EMPRESTIMO_USE_CASE,
  AtualizarEmprestimoUseCase,
} from '../application/use-case/write/atualizar-emprestimo.use-case';
import {
  EXCLUIR_EMPRESTIMO_USE_CASE,
  ExcluirEmprestimoUseCase,
} from '../application/use-case/write/excluir-emprestimo.use-case';
import {
  OPERACOES_EMPRESTIMO_USE_CASE,
  OperacoesEmprestimoUseCase,
} from '../application/use-case/write/operacoes-emprestimo.use-case';

/**
 * EmprestimosController
 *
 * Controlador HTTP REST (Camada de Apresentação).
 * Expõe endpoints semânticos para operações CRUD e transições de estado da FSM,
 * delegando toda a execução para os respectivos casos de uso da aplicação.
 */
@Controller('emprestimos')
export class EmprestimosController {
  constructor(
    @Inject(FIND_ALL_EMPRESTIMOS_USE_CASE)
    private readonly findAllUseCase: FindAllEmprestimosUseCase,
    @Inject(FIND_HISTORICO_EMPRESTIMO_USE_CASE)
    private readonly findHistoricoUseCase: FindHistoricoEmprestimoUseCase,
    @Inject(CRIAR_RESERVA_USE_CASE)
    private readonly criarReservaUseCase: CriarReservaUseCase,
    @Inject(ATUALIZAR_EMPRESTIMO_USE_CASE)
    private readonly atualizarUseCase: AtualizarEmprestimoUseCase,
    @Inject(EXCLUIR_EMPRESTIMO_USE_CASE)
    private readonly excluirUseCase: ExcluirEmprestimoUseCase,
    @Inject(OPERACOES_EMPRESTIMO_USE_CASE)
    private readonly operacoesUseCase: OperacoesEmprestimoUseCase,
  ) {}

  /**
   * listar() [GET /emprestimos]
   *
   * Retorna a lista completa de empréstimos e reservas cadastradas no sistema.
   */
  @Get()
  async listar(): Promise<EmprestimoResponse[]> {
    return this.findAllUseCase.execute();
  }

  /**
   * obterHistorico() [GET /emprestimos/:id/historico]
   *
   * Retorna a trilha de auditoria completa (Audit Log) de um empréstimo específico,
   * exibindo transições de status, datas, autores e justificativas operacionais.
   *
   * @param id - Identificador UUID do empréstimo consultado.
   */
  @Get(':id/historico')
  async obterHistorico(@Param('id') id: string): Promise<HistoricoResponse[]> {
    return this.findHistoricoUseCase.execute(id);
  }

  /**
   * reservar() [POST /emprestimos/reservar]
   *
   * Cria uma nova reserva de livro ou equipamento.
   *
   * @param dto - Dados da reserva contendo título, categoria e solicitante.
   */
  @Post('reservar')
  async reservar(@Body() dto: CriarReservaRequest): Promise<EmprestimoResponse> {
    return this.criarReservaUseCase.execute(dto);
  }

  /**
   * criar() [POST /emprestimos]
   *
   * Rota padrão REST para criação de nova reserva/empréstimo.
   *
   * @param dto - Dados da reserva contendo título, categoria e solicitante.
   */
  @Post()
  async criar(@Body() dto: CriarReservaRequest): Promise<EmprestimoResponse> {
    return this.criarReservaUseCase.execute(dto);
  }

  /**
   * atualizar() [PUT /emprestimos/:id]
   *
   * Permite atualização estritamente cadastral (título, categoria, solicitante)
   * sem interferir no ciclo de vida da máquina de estados.
   *
   * @param id - Identificador UUID do empréstimo a ser editado.
   * @param dto - Dados cadastrais atualizados.
   */
  @Put(':id')
  async atualizar(
    @Param('id') id: string,
    @Body() dto: AtualizarEmprestimoRequest,
  ): Promise<EmprestimoResponse> {
    return this.atualizarUseCase.execute(id, dto);
  }

  /**
   * excluir() [DELETE /emprestimos/:id]
   *
   * Remove o empréstimo do banco de dados (retorna HTTP 204 No Content).
   *
   * @param id - Identificador UUID do empréstimo a ser excluído.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async excluir(@Param('id') id: string): Promise<void> {
    await this.excluirUseCase.execute(id);
  }

  /**
   * retirarPost() [POST /emprestimos/:id/retirar]
   *
   * Dispara o evento de retirada física do item pelo usuário (RESERVADO -> RETIRADO).
   *
   * @param id - Identificador UUID do empréstimo a ser retirado.
   */
  @Post(':id/retirar')
  async retirarPost(@Param('id') id: string): Promise<EmprestimoResponse> {
    return this.operacoesUseCase.retirar(id);
  }

  /**
   * retirarPatch() [PATCH /emprestimos/:id/retirar]
   *
   * Rota compatível para disparo do evento de retirada do item.
   *
   * @param id - Identificador UUID do empréstimo a ser retirado.
   */
  @Patch(':id/retirar')
  async retirarPatch(@Param('id') id: string): Promise<EmprestimoResponse> {
    return this.operacoesUseCase.retirar(id);
  }

  /**
   * renovarPost() [POST /emprestimos/:id/renovar]
   *
   * Dispara a extensão do prazo de devolução por 7 dias adicionais.
   *
   * @param id - Identificador UUID do empréstimo a ser renovado.
   */
  @Post(':id/renovar')
  async renovarPost(@Param('id') id: string): Promise<EmprestimoResponse> {
    return this.operacoesUseCase.renovar(id);
  }

  /**
   * renovarPatch() [PATCH /emprestimos/:id/renovar]
   *
   * Rota compatível para extensão do prazo de devolução.
   *
   * @param id - Identificador UUID do empréstimo a ser renovado.
   */
  @Patch(':id/renovar')
  async renovarPatch(@Param('id') id: string): Promise<EmprestimoResponse> {
    return this.operacoesUseCase.renovar(id);
  }

  /**
   * devolverPost() [POST /emprestimos/:id/devolver]
   *
   * Dispara o evento de encerramento e devolução do item com vistoria de avarias e cálculo de multa.
   *
   * @param id - Identificador UUID do empréstimo a ser devolvido.
   * @param dto - Relatório da vistoria física (avarias e descrição).
   */
  @Post(':id/devolver')
  async devolverPost(
    @Param('id') id: string,
    @Body() dto: RegistrarDevolucaoRequest,
  ): Promise<EmprestimoResponse> {
    return this.operacoesUseCase.devolver(id, dto);
  }

  /**
   * devolverPatch() [PATCH /emprestimos/:id/devolver]
   *
   * Rota compatível para devolução do item.
   *
   * @param id - Identificador UUID do empréstimo a ser devolvido.
   * @param dto - Relatório da vistoria física.
   */
  @Patch(':id/devolver')
  async devolverPatch(
    @Param('id') id: string,
    @Body() dto: RegistrarDevolucaoRequest,
  ): Promise<EmprestimoResponse> {
    return this.operacoesUseCase.devolver(id, dto);
  }

  /**
   * cancelarPost() [POST /emprestimos/:id/cancelar]
   *
   * Dispara o cancelamento voluntário de uma reserva pendente.
   *
   * @param id - Identificador UUID da reserva a ser cancelada.
   */
  @Post(':id/cancelar')
  async cancelarPost(@Param('id') id: string): Promise<EmprestimoResponse> {
    return this.operacoesUseCase.cancelar(id);
  }

  /**
   * cancelarPatch() [PATCH /emprestimos/:id/cancelar]
   *
   * Rota compatível para cancelamento voluntário de reserva pendente.
   *
   * @param id - Identificador UUID da reserva a ser cancelada.
   */
  @Patch(':id/cancelar')
  async cancelarPatch(@Param('id') id: string): Promise<EmprestimoResponse> {
    return this.operacoesUseCase.cancelar(id);
  }

  /**
   * marcarAtrasadoPost() [POST /emprestimos/:id/marcar-atrasado]
   *
   * Registra a marcação de atraso do item quando a data prevista é superada.
   *
   * @param id - Identificador UUID do empréstimo em atraso.
   */
  @Post(':id/marcar-atrasado')
  async marcarAtrasadoPost(@Param('id') id: string): Promise<EmprestimoResponse> {
    return this.operacoesUseCase.marcarAtrasado(id);
  }

  /**
   * marcarAtrasadoPatch() [PATCH /emprestimos/:id/marcar-atrasado]
   *
   * Rota compatível para marcação de atraso do empréstimo.
   *
   * @param id - Identificador UUID do empréstimo em atraso.
   */
  @Patch(':id/marcar-atrasado')
  async marcarAtrasadoPatch(@Param('id') id: string): Promise<EmprestimoResponse> {
    return this.operacoesUseCase.marcarAtrasado(id);
  }
}
