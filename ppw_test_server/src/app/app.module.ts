import { Module } from '@nestjs/common';
import { PrismaModule } from '../database/prisma.module';
import { EmprestimosModule } from 'src/module/emprestimos/emprestimos.module';

@Module({
  imports: [PrismaModule, EmprestimosModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
