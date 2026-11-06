import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o seeding de dados no PostgreSQL (10.102.55.11)...');

  // Limpa apenas registros de teste anteriores de empréstimos (preservando tickets)
  await prisma.historicoEmprestimo.deleteMany({});
  await prisma.emprestimo.deleteMany({});

  const agora = new Date();

  // 1. Cenário: RESERVADO dentro do prazo (Gabriel Soares)
  const limite1 = new Date(agora.getTime() + 48 * 60 * 60 * 1000);
  const emp1 = await prisma.emprestimo.create({
    data: {
      tituloItem: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      tipoItem: 'LIVRO',
      usuarioNome: 'Gabriel Soares',
      dataReserva: agora,
      dataLimiteRetirada: limite1,
      status: 'RESERVADO',
      renovacoesCount: 0,
      temAvaria: false,
      diasAtraso: 0,
      valorMulta: 0,
    },
  });
  await prisma.historicoEmprestimo.create({
    data: {
      emprestimoId: emp1.id,
      statusAnterior: 'NENHUM',
      novoStatus: 'RESERVADO',
      autorAcao: 'Gabriel Soares',
      justificativa: 'Reserva solicitada via portal acadêmico. Prazo de 48h para retirada.',
      timestamp: agora,
    },
  });

  // 2. Cenário: RESERVADO vencido para demonstrar Lazy Expiration (Lucas Rocha)
  // Data limite foi há 24h atrás
  const dataReserva2 = new Date(agora.getTime() - 72 * 60 * 60 * 1000);
  const limite2 = new Date(agora.getTime() - 24 * 60 * 60 * 1000);
  const emp2 = await prisma.emprestimo.create({
    data: {
      tituloItem: 'Projetor Portátil Epson Full HD HDMI',
      tipoItem: 'EQUIPAMENTO',
      usuarioNome: 'Lucas Rocha',
      dataReserva: dataReserva2,
      dataLimiteRetirada: limite2,
      status: 'RESERVADO',
      renovacoesCount: 0,
      temAvaria: false,
      diasAtraso: 0,
      valorMulta: 0,
    },
  });
  await prisma.historicoEmprestimo.create({
    data: {
      emprestimoId: emp2.id,
      statusAnterior: 'NENHUM',
      novoStatus: 'RESERVADO',
      autorAcao: 'Lucas Rocha',
      justificativa: 'Reserva para apresentação de seminário em laboratório.',
      timestamp: dataReserva2,
    },
  });

  // 3. Cenário: RETIRADO em dia (Maria Luiza)
  const dataReserva3 = new Date(agora.getTime() - 3 * 24 * 60 * 60 * 1000);
  const dataRetirada3 = new Date(agora.getTime() - 2 * 24 * 60 * 60 * 1000);
  const dataPrevista3 = new Date(dataRetirada3.getTime() + 7 * 24 * 60 * 60 * 1000);
  const emp3 = await prisma.emprestimo.create({
    data: {
      tituloItem: 'Domain-Driven Design: Atacando as Complexidades no Coração do Software',
      tipoItem: 'LIVRO',
      usuarioNome: 'Maria Luiza',
      dataReserva: dataReserva3,
      dataLimiteRetirada: new Date(dataReserva3.getTime() + 48 * 60 * 60 * 1000),
      dataRetirada: dataRetirada3,
      dataPrevistaDevolucao: dataPrevista3,
      status: 'RETIRADO',
      renovacoesCount: 0,
      temAvaria: false,
      diasAtraso: 0,
      valorMulta: 0,
    },
  });
  await prisma.historicoEmprestimo.createMany({
    data: [
      {
        emprestimoId: emp3.id,
        statusAnterior: 'NENHUM',
        novoStatus: 'RESERVADO',
        autorAcao: 'Maria Luiza',
        justificativa: 'Reserva do exemplar na biblioteca central.',
        timestamp: dataReserva3,
      },
      {
        emprestimoId: emp3.id,
        statusAnterior: 'RESERVADO',
        novoStatus: 'RETIRADO',
        autorAcao: 'Maria Luiza',
        justificativa: 'Retirada presencial realizada no balcão de atendimento.',
        timestamp: dataRetirada3,
      },
    ],
  });

  // 4. Cenário: ATRASADO com Multa Progressiva calculada (Pedro Duarte)
  // Retirado há 14 dias, previsto há 7 dias -> 7 dias de atraso
  // Multa: 3 dias a R$ 2,00 + 4 dias a R$ 3,50 = 6 + 14 = R$ 20,00
  const dataReserva4 = new Date(agora.getTime() - 15 * 24 * 60 * 60 * 1000);
  const dataRetirada4 = new Date(agora.getTime() - 14 * 24 * 60 * 60 * 1000);
  const dataPrevista4 = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
  const emp4 = await prisma.emprestimo.create({
    data: {
      tituloItem: 'Kit Arduino Avançado com Sensores e Módulos IoT',
      tipoItem: 'EQUIPAMENTO',
      usuarioNome: 'Pedro Duarte',
      dataReserva: dataReserva4,
      dataLimiteRetirada: new Date(dataReserva4.getTime() + 48 * 60 * 60 * 1000),
      dataRetirada: dataRetirada4,
      dataPrevistaDevolucao: dataPrevista4,
      status: 'ATRASADO',
      renovacoesCount: 0,
      temAvaria: false,
      diasAtraso: 7,
      valorMulta: 20.0,
    },
  });
  await prisma.historicoEmprestimo.createMany({
    data: [
      {
        emprestimoId: emp4.id,
        statusAnterior: 'NENHUM',
        novoStatus: 'RESERVADO',
        autorAcao: 'Pedro Duarte',
        justificativa: 'Reserva de bancada para disciplina de microcontroladores.',
        timestamp: dataReserva4,
      },
      {
        emprestimoId: emp4.id,
        statusAnterior: 'RESERVADO',
        novoStatus: 'RETIRADO',
        autorAcao: 'Pedro Duarte',
        justificativa: 'Retirada autorizada pelo técnico de laboratório.',
        timestamp: dataRetirada4,
      },
      {
        emprestimoId: emp4.id,
        statusAnterior: 'RETIRADO',
        novoStatus: 'ATRASADO',
        autorAcao: 'SISTEMA',
        justificativa: 'Transição automática: prazo de devolução expirado em 7 dias.',
        timestamp: dataPrevista4,
      },
    ],
  });

  // 5. Cenário: DEVOLVIDO no prazo (Leonardo Chico)
  const dataReserva5 = new Date(agora.getTime() - 10 * 24 * 60 * 60 * 1000);
  const dataRetirada5 = new Date(agora.getTime() - 9 * 24 * 60 * 60 * 1000);
  const dataDevolucao5 = new Date(agora.getTime() - 3 * 24 * 60 * 60 * 1000);
  const emp5 = await prisma.emprestimo.create({
    data: {
      tituloItem: 'Arquitetura Limpa: O Guia do Artesão para Estrutura e Design de Software',
      tipoItem: 'LIVRO',
      usuarioNome: 'Leonardo Chico',
      dataReserva: dataReserva5,
      dataLimiteRetirada: new Date(dataReserva5.getTime() + 48 * 60 * 60 * 1000),
      dataRetirada: dataRetirada5,
      dataPrevistaDevolucao: new Date(dataRetirada5.getTime() + 7 * 24 * 60 * 60 * 1000),
      dataDevolucao: dataDevolucao5,
      status: 'DEVOLVIDO',
      renovacoesCount: 0,
      temAvaria: false,
      diasAtraso: 0,
      valorMulta: 0,
    },
  });
  await prisma.historicoEmprestimo.createMany({
    data: [
      {
        emprestimoId: emp5.id,
        statusAnterior: 'NENHUM',
        novoStatus: 'RESERVADO',
        autorAcao: 'Leonardo Chico',
        justificativa: 'Reserva efetuada pelo catálogo online.',
        timestamp: dataReserva5,
      },
      {
        emprestimoId: emp5.id,
        statusAnterior: 'RESERVADO',
        novoStatus: 'RETIRADO',
        autorAcao: 'Leonardo Chico',
        justificativa: 'Retirada confirmada com leitura biométrica/carteirinha.',
        timestamp: dataRetirada5,
      },
      {
        emprestimoId: emp5.id,
        statusAnterior: 'RETIRADO',
        novoStatus: 'DEVOLVIDO',
        autorAcao: 'Leonardo Chico',
        justificativa: 'Devolução regular concluída sem avarias dentro do prazo regulamentar.',
        timestamp: dataDevolucao5,
      },
    ],
  });

  // 6. Cenário: DEVOLVIDO COM MULTA e com Avaria constatada (Aaron Kenzo)
  const dataReserva6 = new Date(agora.getTime() - 12 * 24 * 60 * 60 * 1000);
  const dataRetirada6 = new Date(agora.getTime() - 11 * 24 * 60 * 60 * 1000);
  const dataDevolucao6 = new Date(agora.getTime() - 1 * 24 * 60 * 60 * 1000);
  const emp6 = await prisma.emprestimo.create({
    data: {
      tituloItem: 'Osciloscópio Digital USB 2 Canais 20MHz',
      tipoItem: 'EQUIPAMENTO',
      usuarioNome: 'Aaron Kenzo',
      dataReserva: dataReserva6,
      dataLimiteRetirada: new Date(dataReserva6.getTime() + 48 * 60 * 60 * 1000),
      dataRetirada: dataRetirada6,
      dataPrevistaDevolucao: new Date(dataRetirada6.getTime() + 7 * 24 * 60 * 60 * 1000),
      dataDevolucao: dataDevolucao6,
      status: 'DEVOLVIDO_COM_MULTA',
      renovacoesCount: 0,
      temAvaria: true,
      descricaoAvaria: 'Ponta de prova do canal 2 com conector quebrado.',
      diasAtraso: 3,
      valorMulta: 6.0,
    },
  });
  await prisma.historicoEmprestimo.createMany({
    data: [
      {
        emprestimoId: emp6.id,
        statusAnterior: 'NENHUM',
        novoStatus: 'RESERVADO',
        autorAcao: 'Aaron Kenzo',
        justificativa: 'Empréstimo para ensaios em bancada de eletrônica.',
        timestamp: dataReserva6,
      },
      {
        emprestimoId: emp6.id,
        statusAnterior: 'RESERVADO',
        novoStatus: 'RETIRADO',
        autorAcao: 'Aaron Kenzo',
        justificativa: 'Equipamento entregue em estojo lacrado.',
        timestamp: dataRetirada6,
      },
      {
        emprestimoId: emp6.id,
        statusAnterior: 'RETIRADO',
        novoStatus: 'DEVOLVIDO_COM_MULTA',
        autorAcao: 'Aaron Kenzo',
        justificativa:
          'Devolução com avaria constatada: "Ponta de prova do canal 2 com conector quebrado." | Multa progressiva aplicada: R$ 6.00 (3 dias de atraso).',
        timestamp: dataDevolucao6,
      },
    ],
  });

  console.log('Seeding concluído com sucesso!');
  console.log(`Total de registros criados: 6 empréstimos com trilhas de auditoria vinculadas.`);
}

main()
  .catch((e) => {
    console.error('Erro no seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
