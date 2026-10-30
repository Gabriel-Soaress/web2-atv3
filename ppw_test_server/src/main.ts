import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,PUT,POST,DELETE,PATCH',
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
    credentials: false,
  });

  await app.listen(8000);
  console.log('Servidor NestJS Pratica rodando na porta 8000: http://localhost:8000');
}
bootstrap();
