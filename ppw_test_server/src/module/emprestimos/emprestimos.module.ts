import { Module } from '@nestjs/common';
import { EmprestimosController } from './presentation/emprestimos.controller';
import { EMPRESTIMO_READ_REPOSITORY } from './domain/ports/emprestimo.read.repository';
import { EMPRESTIMO_WRITE_REPOSITORY } from './domain/ports/emprestimo.write.repository';
import { EmprestimoPrismaReadRepository } from './infrastructure/adapters/emprestimo.prisma.read.repository';
import { EmprestimoPrismaWriteRepository } from './infrastructure/adapters/emprestimo.prisma.write.repository';
import { FIND_ALL_EMPRESTIMOS_USE_CASE } from './application/use-case/read/find-all-emprestimos.use-case';
import { CRIAR_RESERVA_USE_CASE } from './application/use-case/write/criar-reserva.use-case';
import { ATUALIZAR_EMPRESTIMO_USE_CASE } from './application/use-case/write/atualizar-emprestimo.use-case';
import { EXCLUIR_EMPRESTIMO_USE_CASE } from './application/use-case/write/excluir-emprestimo.use-case';
import { OPERACOES_EMPRESTIMO_USE_CASE } from './application/use-case/write/operacoes-emprestimo.use-case';
import { FindAllEmprestimosService } from './application/service/read/find-all-emprestimos.service';
import { CriarReservaService } from './application/service/write/criar-reserva.service';
import { AtualizarEmprestimoService } from './application/service/write/atualizar-emprestimo.service';
import { ExcluirEmprestimoService } from './application/service/write/excluir-emprestimo.service';
import { OperacoesEmprestimoService } from './application/service/write/operacoes-emprestimo.service';

const repositoriesProviders = [
  {
    provide: EMPRESTIMO_READ_REPOSITORY,
    useClass: EmprestimoPrismaReadRepository,
  },
  {
    provide: EMPRESTIMO_WRITE_REPOSITORY,
    useClass: EmprestimoPrismaWriteRepository,
  },
];

const useCasesProviders = [
  {
    provide: FIND_ALL_EMPRESTIMOS_USE_CASE,
    useClass: FindAllEmprestimosService,
  },
  {
    provide: CRIAR_RESERVA_USE_CASE,
    useClass: CriarReservaService,
  },
  {
    provide: ATUALIZAR_EMPRESTIMO_USE_CASE,
    useClass: AtualizarEmprestimoService,
  },
  {
    provide: EXCLUIR_EMPRESTIMO_USE_CASE,
    useClass: ExcluirEmprestimoService,
  },
  {
    provide: OPERACOES_EMPRESTIMO_USE_CASE,
    useClass: OperacoesEmprestimoService,
  },
];

@Module({
  controllers: [EmprestimosController],
  providers: [...repositoriesProviders, ...useCasesProviders],
  exports: [
    FIND_ALL_EMPRESTIMOS_USE_CASE,
    CRIAR_RESERVA_USE_CASE,
    ATUALIZAR_EMPRESTIMO_USE_CASE,
    EXCLUIR_EMPRESTIMO_USE_CASE,
    OPERACOES_EMPRESTIMO_USE_CASE,
  ],
})
export class EmprestimosModule {}
