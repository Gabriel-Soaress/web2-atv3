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
import { EmprestimoResponse } from '../application/dto/emprestimo.response.dto';
import {
  FIND_ALL_EMPRESTIMOS_USE_CASE,
  FindAllEmprestimosUseCase,
} from '../application/use-case/read/find-all-emprestimos.use-case';
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

@Controller('emprestimos')
export class EmprestimosController {
  constructor(
    @Inject(FIND_ALL_EMPRESTIMOS_USE_CASE)
    private readonly findAllUseCase: FindAllEmprestimosUseCase,
    @Inject(CRIAR_RESERVA_USE_CASE)
    private readonly criarReservaUseCase: CriarReservaUseCase,
    @Inject(ATUALIZAR_EMPRESTIMO_USE_CASE)
    private readonly atualizarUseCase: AtualizarEmprestimoUseCase,
    @Inject(EXCLUIR_EMPRESTIMO_USE_CASE)
    private readonly excluirUseCase: ExcluirEmprestimoUseCase,
    @Inject(OPERACOES_EMPRESTIMO_USE_CASE)
    private readonly operacoesUseCase: OperacoesEmprestimoUseCase,
  ) {}

  // 1. GET /emprestimos -> Listar todos
  @Get()
  async listar(): Promise<EmprestimoResponse[]> {
    return this.findAllUseCase.execute();
  }

  // 2. POST /emprestimos -> Criar reserva
  @Post('reservar')
  async reservar(@Body() dto: CriarReservaRequest): Promise<EmprestimoResponse> {
    return this.criarReservaUseCase.execute(dto);
  }

  @Post()
  async criar(@Body() dto: CriarReservaRequest): Promise<EmprestimoResponse> {
    return this.criarReservaUseCase.execute(dto);
  }

  // 3. PUT /emprestimos/:id -> Atualização cadastral estrita (apenas dados descritivos, sem tocar em status)
  @Put(':id')
  async atualizar(
    @Param('id') id: string,
    @Body() dto: AtualizarEmprestimoRequest,
  ): Promise<EmprestimoResponse> {
    return this.atualizarUseCase.execute(id, dto);
  }

  // 4. DELETE /emprestimos/:id -> Excluir empréstimo
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async excluir(@Param('id') id: string): Promise<void> {
    await this.excluirUseCase.execute(id);
  }

  // ==========================================
  // EVENTOS EXPLÍCITOS DA MÁQUINA DE ESTADOS (FSM)
  // Suporte a POST semântico e PATCH por compatibilidade
  // ==========================================

  // 5. POST|PATCH /emprestimos/:id/retirar -> Evento: Retirar item
  @Post(':id/retirar')
  async retirarPost(@Param('id') id: string): Promise<EmprestimoResponse> {
    return this.operacoesUseCase.retirar(id);
  }

  @Patch(':id/retirar')
  async retirarPatch(@Param('id') id: string): Promise<EmprestimoResponse> {
    return this.operacoesUseCase.retirar(id);
  }

  // 6. POST|PATCH /emprestimos/:id/renovar -> Evento: Renovar prazo
  @Post(':id/renovar')
  async renovarPost(@Param('id') id: string): Promise<EmprestimoResponse> {
    return this.operacoesUseCase.renovar(id);
  }

  @Patch(':id/renovar')
  async renovarPatch(@Param('id') id: string): Promise<EmprestimoResponse> {
    return this.operacoesUseCase.renovar(id);
  }

  // 7. POST|PATCH /emprestimos/:id/devolver -> Evento: Registrar devolução
  @Post(':id/devolver')
  async devolverPost(
    @Param('id') id: string,
    @Body() dto: RegistrarDevolucaoRequest,
  ): Promise<EmprestimoResponse> {
    return this.operacoesUseCase.devolver(id, dto);
  }

  @Patch(':id/devolver')
  async devolverPatch(
    @Param('id') id: string,
    @Body() dto: RegistrarDevolucaoRequest,
  ): Promise<EmprestimoResponse> {
    return this.operacoesUseCase.devolver(id, dto);
  }

  // 8. POST|PATCH /emprestimos/:id/cancelar -> Evento: Cancelar reserva
  @Post(':id/cancelar')
  async cancelarPost(@Param('id') id: string): Promise<EmprestimoResponse> {
    return this.operacoesUseCase.cancelar(id);
  }

  @Patch(':id/cancelar')
  async cancelarPatch(@Param('id') id: string): Promise<EmprestimoResponse> {
    return this.operacoesUseCase.cancelar(id);
  }

  // 9. POST|PATCH /emprestimos/:id/marcar-atrasado -> Evento: Detectar/Registrar atraso
  @Post(':id/marcar-atrasado')
  async marcarAtrasadoPost(@Param('id') id: string): Promise<EmprestimoResponse> {
    return this.operacoesUseCase.marcarAtrasado(id);
  }

  @Patch(':id/marcar-atrasado')
  async marcarAtrasadoPatch(@Param('id') id: string): Promise<EmprestimoResponse> {
    return this.operacoesUseCase.marcarAtrasado(id);
  }
}
