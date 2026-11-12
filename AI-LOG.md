# 🤖 Diário de Bordo & Registro de Uso do Agente de IA (AI-LOG)

> **Disciplina:** Programação Web II (PPW II)  
> **Tema 08:** Controle de Empréstimo de Livros / Equipamentos Internos  
> **Aluno:** Gabriel Soares Pedrosa (`bi3041271`)  
> **Repositório:** Atividade 3 (`atvs avaliativas/atv3`)  
> **Ferramenta de IA Utilizada:** Antigravity IDE (Google DeepMind Agentic Coding Framework)  
> **Banco Oficial:** PostgreSQL Institucional Remoto (`10.102.55.11:5432`, schema `bi3041271`)

---

## 📌 Como estruturei o trabalho com o Agente

Para desenvolver a Atividade 3, utilizei o **Antigravity** como meu assistente de programação em par (*pair programmer*). Como os requisitos de Máquina de Estados, Auditoria ACID, Concorrência e Multas vieram de artigos e textos complementares bem conceituais passados pelo professor, estruturei uma dinâmica de trabalho dividida em etapas bem claras:

1. **Montagem do Cérebro do Agente (`brain/`):** Comecei criando a pasta `brain/`, subi nela os textos complementares, o roteiro da atividade e as regras de avaliação, instruindo o agente a salvar o contexto das decisões e a planejar antes de codificar.
2. **Definição de Escopo e Limites:** Deixei travado que ele só podia alterar arquivos dentro de `atvs avaliativas/atv3`, que usaríamos nossa Atividade 2 como ponto de partida e que a conexão final seria no banco PostgreSQL oficial do IFSP.
3. **Resumos Didáticos e Teoria:** Pedi para o agente ler os textos e me explicar cada conceito em linguagem acessível para eu entender o que estava por trás de cada exigência. Arquivei essas pesquisas em `/atv3/docs/pesquisas/`.
4. **Plano Geral de Ação (`/plan`):** Pedi para ele desenhar um plano macro de desenvolvimento em ordem lógica para atacarmos um problema de cada vez. Arquivei em `/atv3/docs/planos/plano-geral-atv3.md`.
5. **Desenvolvimento Iterativo e Meus Ajustes:** Conforme íamos passando de fase em fase, gerávamos planos específicos em `/atv3/docs/planos/`. Em vários momentos, as soluções iniciais que o agente sugeria usavam atalhos arriscados ou soluções frágeis. Eu intervia apontando o problema na prática com base no que tinha lido, o agente me explicava os termos técnicos e as opções, e eu batia o martelo na melhor decisão.

Abaixo está o registro realista de como foi essa construção conjunta.

---

## 🚀 Passo 1: Inicializando o Cérebro do Agente (`brain/`) e Regras de Trabalho

Comecei configurando o ambiente para garantir que o assistente respeitasse o escopo do projeto e não saísse modificando arquivos de entregas passadas.

### Meu Prompt de Inicialização:
```text
Você vai ser meu assistente de programação (pair programmer) no desenvolvimento da Atividade 3 de PPW II.
Antes de escrever código, vamos alinhar o nosso fluxo de trabalho:
1. Crie e use a pasta 'brain' para guardar suas notas de contexto, planos de tarefa e 
   manter o histórico das minhas perguntas e das suas respostas/sugestões.
2. Seu escopo de trabalho é estritamente a pasta 'atvs avaliativas/atv3'. Não mexa na atv1 nem na atv2.
3. Vamos usar a base da nossa 'atv2' e refatorar tudo para atender os requisitos da atv3 (Clean Arch).
4. Subi na pasta brain os textos complementares do professor sobre FSM, Concorrência, 
   Auditoria e Multas, além do roteiro da atividade.
5. Sempre responda em português (BR), use TypeScript estrito e trabalhe com branches no git.
6. Sempre que eu pedir algo grande, monte um plano (/plan) antes de executar.
Confirme se entendeu o ambiente para começarmos.
```

### Resposta do Agente:
O agente confirmou as regras, registrou as instruções na pasta `brain/` e se colocou à disposição:
> *"Entendido, Gabriel! Ambiente configurado: escopo restrito a `atvs avaliativas/atv3`, histórico e planos mantidos na pasta `brain`, textos do professor lidos para consulta de regras, comunicação em português e desenvolvimento sempre guiado por planos (`/plan`). Pronto para começar o estudo dos temas."*

---

## 📚 Passo 2: Estudo dos Textos Complementares e Resumos Didáticos

Antes de mexer em qualquer linha de código, precisei clarear os conceitos técnicos que o professor passou nos artigos para saber exatamente o que precisávamos construir.

### Meu Prompt:
```text
Dá uma lida nos textos complementares que coloquei na pasta brain e me traz um resumo 
bem didático e direto ao ponto sobre os 4 temas principais da Atividade 3:
1. Máquina de Estados Finita (FSM)
2. Rastreabilidade e Auditoria (Audit Log)
3. Conflitos Assíncronos e Expiração
4. Multas e Bloqueios
Me explica o que cada um significa na prática pro meu tema (Empréstimo de Livros e Equipamentos) 
e salva esses resumos em arquivos markdown dentro da pasta /atv3/docs/pesquisas/.
```

### O que o Agente Explicou e Onde Foi Salvo:
O agente analisou os materiais teóricos e salvou pesquisas didáticas explicando os conceitos por trás de cada exigência:
- 📄 [`/atv3/docs/pesquisas/01-fsm-maquina-estados.md`](/atvs%20avaliativas/atv3/docs/pesquisas/01-fsm-maquina-estados.md): Explicou por que um CRUD genérico que aceita qualquer alteração de status quebra o mundo real, e como a FSM atua como uma catraca eletrônica permitindo apenas transições com sentido físico.
- 📄 [`/atv3/docs/pesquisas/02-audit-log-rastreabilidade.md`](/atvs%20avaliativas/atv3/docs/pesquisas/02-audit-log-rastreabilidade.md): Explicou por que usar apenas `UPDATE` apaga a história do que aconteceu no sistema e como estruturar uma tabela de eventos imutáveis com garantias transacionais ACID.
- 📄 [`/atv3/docs/pesquisas/03-concorrencia-expiracao-lazy.md`](/atvs%20avaliativas/atv3/docs/pesquisas/03-concorrencia-expiracao-lazy.md): Explicou os perigos de duas pessoas reservarem o mesmo item ao mesmo tempo (double-booking) e as limitações de usar timers em segundo plano vs. o padrão de avaliação sob demanda (*Lazy Evaluation*).
- 📄 [`/atv3/docs/pesquisas/04-multas-progressivas-bloqueio.md`](/atvs%20avaliativas/atv3/docs/pesquisas/04-multas-progressivas-bloqueio.md): Explicou a lógica de tarifas progressivas por faixas de atraso para desestimular retenção de acervo e a importância de barrar usuários com pendências antes de autorizar novas saídas.

---

## 📋 Passo 3: O `/plan` Geral da Atividade 3

Com a teoria bem entendida, pedi para o assistente organizar o roadmap completo do projeto antes de começarmos a mexer no código.

### Meu Prompt:
```text
Agora que a gente já entendeu o que cada tema pede, monta um /plan geral da Atividade 3 
estruturando o desenvolvimento numa ordem lógica, desde preparar o ambiente e conectar no banco 
até a entrega final e os testes.
Salva esse plano geral no arquivo /atv3/docs/planos/plano-geral-atv3.md.
```

### O Plano Geral Arquivado:
- 📄 Arquivo gerado: [`/atv3/docs/planos/plano-geral-atv3.md`](/atvs%20avaliativas/atv3/docs/planos/plano-geral-atv3.md)

O plano dividiu a refatoração em etapas sequenciais:
1. **Etapa 1:** Copiar a base da Atividade 2 para `atv3` e ligar com segurança no PostgreSQL do IFSP.
2. **Etapa 2:** Implementar a Máquina de Estados (FSM) no Domínio com bloqueio semântico HTTP 422.
3. **Etapa 3:** Criar a Trilha de Auditoria (Audit Log) com garantia de atomicidade ACID via transações.
4. **Etapa 4:** Tratar concorrência e expiração de reservas de 48h com Lazy Evaluation.
5. **Etapa 5:** Desenvolver a Calculadora de Multa Progressiva e a checagem de bloqueio preventivo.
6. **Etapa 6:** Refatorar a interface Next.js 16 para suportar as novas ações e eliminar o scroll horizontal com CSS Modules.
7. **Etapa 7:** Gerar dados de teste realistas (`seed.ts`), documentação técnica e guia oral.

---

## 🗄️ Passo 4: Migração da ATV2 e Conexão ao PostgreSQL (Meu Ajuste sobre o Banco)

Iniciamos a Etapa 1 copiando os fontes da Atividade 2 e apontando o backend para a infraestrutura do IFSP.
- 📄 Plano detalhado da etapa: [`/atv3/docs/planos/01-plano-migracao-banco.md`](/atvs%20avaliativas/atv3/docs/planos/01-plano-migracao-banco.md)

### Meu Prompt Inicial:
```text
Vamos fazer a Etapa 1 do plano. Copia o client e o server da pasta 'atvs avaliativas/atv2' 
para a pasta 'atvs avaliativas/atv3'.
Depois, configura o .env do servidor para conectar no PostgreSQL oficial da faculdade:
DATABASE_URL="postgresql://bi3041271:BI3041271@10.102.55.11:5432/postgres?schema=bi3041271"
Analisa o schema.prisma e me diz como você pretende sincronizar o banco.
```

### A Proposta Técnica do Agente:
O assistente clonou os diretórios, ajustou a string de conexão no `.env` e sugeriu:
> *"Para garantir que o banco remoto fique exatamente alinhado com o Prisma sem nenhum resíduo da base antiga, podemos mudar o provider para `postgresql` e rodar:  
> `npx prisma db push --force-reset`  
> O comando `--force-reset` vai zerar o schema no PostgreSQL e recriar as tabelas do zero de forma limpa."*

### Meu Questionamento:
> *"Opa, espera aí, esse comando com esse reset aí me parece meio perigoso... esse schema do PostgreSQL é o meu individual da faculdade e já tem coisas salvas lá de outros trabalhos que os professores ainda vão avaliar, tipo uma tabela de chamados (`tickets`). Se você der esse reset aí, não vai apagar tudo que eu já fiz lá para trás? Não tem como a gente só criar o que falta pra esse trabalho de empréstimo sem mexer no que já existe lá dentro?"*

### A Explicação do Agente:
> *"Excelente reflexão, Gabriel! Você tem toda razão em barrar. O `--force-reset` daria um `DROP` em qualquer tabela remota que não estivesse declarada no nosso arquivo local, apagando a tabela `tickets` e prejudicando suas outras matérias.  
> O caminho seguro de engenharia é o seguinte:
> 1. Primeiro rodamos `npx prisma db pull --print` para ler o que já existe no banco remoto da faculdade sem alterar nada.
> 2. Mantemos a declaração da tabela `tickets` no nosso `schema.prisma` para o Prisma saber que ela existe e pertence ao schema.
> 3. Colocamos prefixos explícitos nas nossas novas tabelas (`web2_A1_emprestimos` e `web2_A3_historico_emprestimos`).
> 4. Rodamos o `npx prisma db push` normal, de forma incremental. Ele só vai criar o que falta e não vai tocar em nenhum dado das suas outras disciplinas."*

### Minha Decisão:
> *"Perfeito, faz exatamente desse jeito seguro então: puxa a estrutura das tabelas velhas primeiro, deixa elas declaradas no schema e roda a atualização sem nenhum reset."*

### O que foi Executado:
- O agente fez a inspeção do schema remoto, identificou a tabela `tickets` existente (com 3 registros de outra matéria) e os enums associados.
- Preservou a modelagem de terceiros no [`prisma/schema.prisma`](file:///c:/Users/soares/Documents/Faculdade/4º%20semestre/web2/ppw-cocao/atvs%20avaliativas/atv3/ppw_test_server/prisma/schema.prisma).
- Criou as tabelas `web2_A1_emprestimos` e `web2_A3_historico_emprestimos` de forma incremental.
- Validou a integridade dos dados e commitou na branch `feature/database-postgres`.

---

## 🔄 Passo 5: FSM no Domínio (Meu Ajuste sobre Regras na Controller e Erro 400)

Passamos para a Etapa 2: transformar a manipulação solta de status em uma Máquina de Estados Finita.
- 📄 Plano detalhado da etapa: [`/atv3/docs/planos/02-plano-fsm-dominio.md`](/atvs%20avaliativas/atv3/docs/planos/02-plano-fsm-dominio.md)

### Meu Prompt Inicial:
```text
Vamos para a Etapa 2. Na atv2 a gente tinha aquele PUT genérico que recebia qualquer status 
no corpo do JSON e salvava direto no banco. 
Quero acabar com essa bagunça. O status agora só pode mudar quando acontecerem ações de verdade: 
retirar, devolver, renovar ou cancelar.
Se alguém tentar fazer uma coisa sem sentido, tipo devolver um livro que ainda tá só reservado, 
o sistema tem que recusar. Como você pensou em montar isso no NestJS?
```

### A Proposta Técnica do Agente:
O assistente propôs:
> *"Podemos manter o método do controller recebendo o status desejado e colocar uma série de validações condicionais (`if/else`): se o status atual for `RESERVADO` e o novo for `DEVOLVIDO`, a gente lança um `throw new BadRequestException('Transição inválida')` (HTTP 400)."*

### Meu Questionamento:
> *"Olha, esse modelo com um monte de if na Controller me parece que vai deixar as coisas meio bagunçadas conforme o sistema for crescendo... O professor bateu bastante na tecla na aula de que a regra do negócio tem que ficar guardada lá no Domínio, isolada de web. E outra coisa: esse erro 400 que você sugeriu... o cara não mandou um JSON quebrado, a sintaxe tá certa, ele só tentou fazer uma ação que não faz sentido no momento. Não tem um código HTTP mais certinho pra quando a regra barra a ação? Como a gente jogaria essa validação direto pro Domínio?"*

### A Explicação do Agente:
> *"Ótima observação arquitetural, Gabriel! De fato, encher o controller de condicionais de negócio viola a separação de camadas da Clean Architecture, porque a regra acaba ficando na camada de apresentação (web).  
> Sobre o status HTTP: o erro **400 (Bad Request)** indica sintaxe malformada (ex: JSON corrompido, tipo de dado errado). Já quando o JSON é sintaticamente perfeito, mas o estado atual do sistema impede a operação por uma regra de negócio, a convenção REST correta é o **HTTP 422 (Unprocessable Entity)**.  
> No Domínio, o padrão do Domain-Driven Design (DDD) é isolar isso em um **Value Object** (vamos chamar de `StatusEmprestimo`) contendo uma matriz de transições permitidas. Na entidade rica `EmprestimoEntity`, criamos métodos semânticos como `registrarRetirada()` e `registrarDevolucao()`. Se a ação for proibida, o domínio dispara uma exceção semântica (`TransicaoInvalidaException`) que o NestJS entrega ao cliente com status 422."*

### Minha Decisão:
> *"Ficou bem mais claro agora. Então tira esses ifs do Controller, cria esse Value Object com a matriz de transições dentro do Domínio e usa o erro 422 pra avisar que a regra barrou."*

### O que foi Executado:
- Criou o Value Object [`status-emprestimo.value-object.ts`](file:///c:/Users/soares/Documents/Faculdade/4º%20semestre/web2/ppw-cocao/atvs%20avaliativas/atv3/ppw_test_server/src/module/emprestimos/domain/value-objects/status-emprestimo.value-object.ts) com a matriz `TRANSICOES_VALIDAS_FSM`.
- Criou a exceção semântica [`transicao-invalida.exception.ts`](file:///c:/Users/soares/Documents/Faculdade/4º%20semestre/web2/ppw-cocao/atvs%20avaliativas/atv3/ppw_test_server/src/module/emprestimos/domain/exceptions/transicao-invalida.exception.ts) retornando status 422 com payload explicativo dos estados permitidos.
- Refatorou a Controller para rotas expressivas: `POST /emprestimos/:id/retirar`, `/devolver`, `/renovar` e `/cancelar`.
- Commitou na branch `feature/fsm-maquina-estados`.

---

## 📜 Passo 6: Audit Log Transacional (Meu Ajuste sobre Falhas e Atomicidade ACID)

Avançamos para a Etapa 3: criar a trilha de auditoria para registrar tudo o que acontece com os empréstimos.
- 📄 Plano detalhado da etapa: [`/atv3/docs/planos/03-plano-audit-log-acid.md`](/atvs%20avaliativas/atv3/docs/planos/03-plano-audit-log-acid.md)

### Meu Prompt Inicial:
```text
Agora a Etapa 3 do plano: toda vez que um empréstimo mudar de status (seja quando alguém pega, 
renova, devolve ou cancela), a gente precisa gravar um registro na tabela 'web2_A3_historico_emprestimos' com: 
o id do empréstimo, status de antes, novo status, quem fez a ação, justificativa e a data.
Como você pensou em salvar isso no Prisma?
```

### A Proposta Técnica do Agente:
O assistente sugeriu fazer duas instruções normais no repositório:
```typescript
// Proposta inicial do assistente:
await this.prisma.emprestimo.update({ where: { id }, data: { status: novoStatus } });
await this.prisma.historicoEmprestimo.create({ data: { ...dadosAuditoria } });
```

### Meu Questionamento:
> *"Olha, essa forma que você sugeriu de salvar uma coisa e depois salvar a outra separada me parece arriscada... imagina que o sistema atualiza o status do empréstimo no banco, mas bem na hora de salvar o histórico dá uma queda de rede ou o banco rejeita por algum motivo. O livro vai ter mudado de status e a gente não vai ter o registro de quem fez aquilo! O professor cobrou bastante essa garantia de consistência (as tais propriedades ACID). Não tem como amarrar isso no banco pra só salvar se os dois derem certo juntos?"*

### A Explicação do Agente:
> *"Você tocou no coração da engenharia de bancos de dados relacionais, Gabriel! Se executarmos dois comandos soltos, violamos a propriedade de **Atomicidade** (o 'A' do ACID). Em caso de falha no meio do caminho, o banco fica em estado inconsistente: o empréstimo muda de status, mas o histórico fica em branco.  
> Para garantir atomicidade de verdade, o Prisma oferece o método `this.prisma.$transaction(async (tx) => { ... })`. Quando colocamos o `update` do empréstimo e o `create` do histórico dentro dele, o PostgreSQL abre uma transação única. Se o log falhar, o PostgreSQL faz um **rollback** automático desfazendo a mudança de status. Ou seja: ou grava tudo com sucesso, ou nada é alterado no banco."*

### Minha Decisão:
> *"Era exatamente essa segurança que eu queria. Junta os dois comandos dentro do `$transaction` do Prisma pra garantir que o histórico nunca fique faltando se algo der errado."*

### O que foi Executado:
- Refatorou [`emprestimo.prisma.write.repository.ts`](file:///c:/Users/soares/Documents/Faculdade/4º%20semestre/web2/ppw-cocao/atvs%20avaliativas/atv3/ppw_test_server/src/module/emprestimos/infrastructure/adapters/emprestimo.prisma.write.repository.ts) envolvendo todas as mutações no `$transaction` atômico.
- Criou o endpoint `GET /emprestimos/:id/historico` para retornar a timeline dos eventos.
- Commitou na branch `feature/audit-log-acid`.

---

## ⏱️ Passo 7: Expiração de Reservas (Meu Ajuste sobre Timers em Background)

Na Etapa 4, o desafio foi implementar a expiração automática de reservas que não fossem retiradas dentro do prazo de 48 horas.
- 📄 Plano detalhado da etapa: [`/atv3/docs/planos/04-plano-expiracao-lazy.md`](/atvs%20avaliativas/atv3/docs/planos/04-plano-expiracao-lazy.md)

### Meu Prompt Inicial:
```text
Vamos para a Etapa 4. Se uma pessoa fizer a reserva e não for buscar o livro em até 48 horas 
(dataLimiteRetirada), o status tem que virar EXPIRADO pra liberar o exemplar pra outra pessoa.
Mas tem um detalhe: não quero instalar cron job no servidor nem ferramentas pesadas por fora. 
Como a gente resolve isso no próprio código?
```

### A Proposta Técnica do Agente:
O assistente sugeriu:
> *"Podemos colocar um timer no Node.js usando `setInterval` dentro do `main.ts`, rodando de minuto em minuto (`60000ms`). Ele consulta o banco procurando reservas onde `dataLimiteRetirada < agora` e atualiza para `EXPIRADO`."*

### Meu Questionamento:
> *"Olha, esse modelo de deixar um processo ou timer rodando direto em segundo plano no servidor de minuto em minuto me parece meio frágil... se a aplicação cair, reiniciar ou se a gente subir isso num ambiente que congela o processo ocioso, essas reservas vão ficar travadas e ninguém vai perceber. Sem falar que fica fazendo query no banco da faculdade sem ninguém tá usando o sistema. Não daria pra gente fazer essa verificação de prazo vencido só na hora em que alguém realmente for consultar ou tentar pegar o item? Tipo uma checagem sob demanda?"*

### A Explicação do Agente:
> *"Sua intuição técnica foi perfeita! Usar `setInterval` ou daemons em background em ambientes compartilhados ou serverless é uma das causas mais comuns de falha silenciosa. Se a instância reiniciar, o timer morre. E rodar queries periódicas no banco ocioso gera tráfego desnecessário.  
> A solução elegante sob demanda é exatamente o que a literatura chama de **Lazy Evaluation (Avaliação Preguiçosa / Just-in-Time)**. Funciona assim:  
> Em vez de um processo ficar rodando em loop no vazio, nós colocamos a rotina de expiração (`processarExpiracoesLazy()`) para rodar exatamente no instante em que o sistema é acionado: quando alguém abre a listagem, quando alguém tenta retirar um item ou quando alguém tenta criar uma nova reserva. O sistema avalia o relógio naquele momento, atualiza tudo o que venceu e já devolve o estado limpo e atualizado de forma instantânea."*

### Minha Decisão:
> *"Faz muito mais sentido e é bem mais seguro. Implementa essa checagem sob demanda (Lazy) direto no repositório antes das operações, sem precisar de nenhum timer em memória."*

### O que foi Executado:
- Criou o método `processarExpiracoesLazy()` no repositório de escrita rodando sob transação ACID.
- Acoplou a checagem no início de `retirar()` e no início de `execute()` da criação de reserva.
- Testamos criando uma reserva com data vencida: na hora da consulta, o sistema já marcou como `EXPIRADO` e registrou o log no histórico.
- Commitou na branch `feature/concorrencia-lazy-evaluation`.

---

## 💰 Passo 8: Multas Progressivas e Bloqueio (Meu Ajuste sobre o Cálculo e Tabela de Usuário)

Na Etapa 5, trabalhamos as regras financeiras de atraso e o bloqueio de usuários com pendências.
- 📄 Plano detalhado da etapa: [`/atv3/docs/planos/05-plano-multas-bloqueio.md`](/atvs%20avaliativas/atv3/docs/planos/05-plano-multas-bloqueio.md)

### Meu Prompt Inicial:
```text
Agora a Etapa 5:
1. Quando um item for devolvido com atraso, tem que calcular uma multa por dia de atraso.
2. O usuário que estiver com algum livro atrasado não pode conseguir fazer novas reservas.
Como você pensou em calcular o valor dessa multa e validar o bloqueio do cara?
```

### A Proposta Técnica do Agente:
O assistente sugeriu:
> *"Podemos fazer uma conta direta: `valorMulta = diasAtraso * 2.50`. E para o bloqueio, podemos criar uma tabela de usuários no PostgreSQL com uma coluna booleana `bloqueado`, e antes de reservar fazemos `if (usuario.bloqueado)`."*

### Meu Questionamento:
> *"Olha, fazer a multa multiplicando direto por um valor fixo de R$ 2,50 me parece meio simples demais perto do que o professor pediu... no texto ele fala de multa progressiva, que é pra doer mais no bolso conforme os dias vão passando pra forçar o aluno a devolver logo. E sobre o bloqueio: precisa mesmo criar uma tabela inteira de usuário só com essa coluna de bloqueado? A gente não consegue só olhar no banco na hora se aquele nome já tem algum livro que tá atrasado e barrar ele direto?"*

### A Explicação do Agente:
> *"Você captou com precisão a essência da regra de negócio!  
> 1. Multiplicar por uma taxa fixa é linear e não progressivo. O texto de apoio propõe faixas escalonadas justamente para penalizar mais quem retém o item por semanas. Podemos modelar uma tabela progressiva por faixas no Domínio:
>    - Faixa 1 (1 a 3 dias): R$ 2,00 por dia
>    - Faixa 2 (4 a 7 dias): R$ 3,50 por dia
>    - Faixa 3 (8 dias em diante): R$ 5,00 por dia  
> 2. Sobre o bloqueio do usuário: você tem toda razão. Criar uma tabela separada com uma flag booleana estática cria um problema de sincronização: quem atualizaria essa flag quando o prazo vencesse? O modelo dinâmico que você propôs é muito superior: na hora de criar uma reserva, o repositório faz uma consulta (`verificarBloqueioUsuario`) verificando se o solicitante possui itens com status `ATRASADO` ou com data de devolução ultrapassada. Se tiver, recusa na hora com HTTP 422."*

### Minha Decisão:
> *"Perfeito! Cria um serviço de domínio puro (`CalculadoraMultaService`) com essas faixas progressivas e faz a checagem dinâmica de bloqueio no repositório antes de autorizar a reserva."*

### O que foi Executado:
- Criou o Domain Service puro [`calculadora-multa.service.ts`](file:///c:/Users/soares/Documents/Faculdade/4º%20semestre/web2/ppw-cocao/atvs%20avaliativas/atv3/ppw_test_server/src/module/emprestimos/domain/services/calculadora-multa.service.ts).
- Implementou o método de bloqueio preventivo dinâmico no `EmprestimoPrismaReadRepository`.
- Criou o [`seed.ts`](file:///c:/Users/soares/Documents/Faculdade/4º%20semestre/web2/ppw-cocao/atvs%20avaliativas/atv3/ppw_test_server/prisma/seed.ts) gerando 6 cenários realistas de teste no PostgreSQL institucional.
- Commitou na branch `feature/multas-bloqueio`.

---

## 🎨 Passo 9: Refatoração Front-End e o Scroll (Minha Reclamação Real e Mudança Visual)

Nas Etapas 6 e 7, fomos rodar o cliente Next.js 16 (`ppw_test_client`) para testar os fluxos na tela. Quando a tabela carregou, o resultado visual estava péssimo.
- 📄 Plano detalhado da etapa: [`/atv3/docs/planos/06-plano-ui-refactor-css.md`](/atvs%20avaliativas/atv3/docs/planos/06-plano-ui-refactor-css.md)

### Minha Reclamação / Prompt:
```text
Ok, o css dos itens na lista ficou ruim, muito botão sem organização.
Ta ruim ainda, ficou com scroll horizontal, se quiser pode tirar o css inline 
e criar um arquivo separado, mas analisa.
O botão de renovar pode aparecer na barra também.
```

### O Problema que Vi na Tela:
A primeira tela gerada colocava mais de 10 colunas abertas com classes gigantescas do Tailwind inline no meio do código. A tabela não cabia na viewport do meu monitor e gerava uma barra de rolagem horizontal desconfortável (`overflow-x: auto`), forçando a arrastar a tela para o lado só para conseguir achar os botões de ação.

### Meu Alinhamento com o Agente:
> *"Olha, a tela ficou muito poluída com esse tanto de botão solto e essa barra de rolagem horizontal ficou horrível, parece sistema mal acabado que quebrou na tela. Em monitor normal ou notebook tem que caber tudo de primeira sem ter que ficar arrastando pro lado. E esse monte de classe inline do Tailwind no meio do HTML tá virando um monstro pra ler. Não dá pra juntar o que faz sentido ficar junto, mandar essas ações secundárias prum menu e travar a largura das colunas num CSS separado pra caber 100% na tela?"*

### Como Solucionamos:
1. **Criação do CSS Module:** Criamos o arquivo [`emprestimos.module.css`](file:///c:/Users/soares/Documents/Faculdade/4º%20semestre/web2/ppw-cocao/atvs%20avaliativas/atv3/ppw_test_client/src/app/emprestimos/emprestimos.module.css) com `table-layout: fixed; width: 100%`, limpando as classes poluídas do JSX.
2. **Consolidação de Colunas (4 Super-Colunas):** Juntamos *Item* e *Solicitante* na primeira coluna (31%), colocamos o *Status* na segunda (18%), agrupamos os *Prazos e Multas* na terceira (23%) e deixamos as *Ações* na quarta (28%). A soma fecha exatamente 100%, eliminando qualquer barra de rolagem horizontal (*Zero Horizontal Scroll*).
3. **Distribuição dos Botões:**
   - Botão principal direto na barra: se estiver reservado, exibe **Retirar**; se estiver com o usuário, exibe **Devolver**.
   - Conforme pedi, deixamos o botão **Renovar** visível direto na barra também.
   - Ícone dedicado de **Histórico** para abrir a modal da trilha de auditoria.
   - Ações cadastrais secundárias (*Editar* e *Excluir*) foram abrigadas em um menu dropdown flutuante (`...`).

### Detalhe que Percebi na Revisão:
Olhando o cabeçalho da página pronta, percebi que o texto ainda dizia:  
*"Atividade 2 — Arquitetura Limpa e Formulários"*  
Mandei o prompt:
```text
n é a atv 3? ta escrito 2 lá
```
O assistente imediatamente corrigiu para:  
*"Atividade 3 — Máquina de Estados Finita (FSM), Trilha de Auditoria ACID, Multas e Lazy Evaluation"*.

- Branches commitadas: `feature/ui-layout-refactor`, `feature/ui-css-module-no-scroll`, `fix/header-text-atv3`.

---

## 🎯 Síntese dos Meus Questionamentos e Direcionamentos

| Etapa | A Proposta Inicial do Agente | O que Eu Questionei / Estranhei | A Decisão Final Implementada | Plano Vinculado |
| :--- | :--- | :--- | :--- | :--- |
| **Banco de Dados** | Executar `db push --force-reset` | Questionei o risco de apagar a tabela `tickets` existente de outros trabalhos meus no schema institucional. | Bloqueei o reset, fizemos a leitura prévia das tabelas antigas e rodamos a atualização incremental segura. | [`01-plano-migracao-banco.md`](/atvs%20avaliativas/atv3/docs/planos/01-plano-migracao-banco.md) |
| **FSM / Regras** | Colocar validação com `if` solto na Controller e retornar `HTTP 400` | Questionei a bagunça na Controller violando o Domínio e perguntei se não existia um status HTTP mais correto (422). | Criamos o Value Object `StatusEmprestimo` no Domínio e a exceção semântica com `HTTP 422`. | [`02-plano-fsm-dominio.md`](/atvs%20avaliativas/atv3/docs/planos/02-plano-fsm-dominio.md) |
| **Audit Log** | Fazer dois comandos `await` soltos no banco | Questionei o que acontecia se o banco falhasse no meio e perguntei como amarrar a garantia ACID de verdade. | Envolvemos o update e a criação do histórico em uma transação atômica (`$transaction`) com rollback total. | [`03-plano-audit-log-acid.md`](/atvs%20avaliativas/atv3/docs/planos/03-plano-audit-log-acid.md) |
| **Expiração** | Criar um timer com `setInterval` rodando em segundo plano no Node | Questionei o gasto de CPU no servidor ocioso e o risco do timer travar se a aplicação reiniciasse. | Adotamos a checagem sob demanda (*Lazy Evaluation*) no repositório no momento em que o sistema é acessado. | [`04-plano-expiracao-lazy.md`](/atvs%20avaliativas/atv3/docs/planos/04-plano-expiracao-lazy.md) |
| **Multas & Bloqueio** | Cálculo linear (`dias * 2.5`) e tabela estática de usuário com flag | Questionei se a multa não devia ser progressiva por faixas e se não era melhor olhar os atrasos dinamicamente. | Criamos a `CalculadoraMultaService` com 3 faixas progressivas e a checagem dinâmica de bloqueio no repositório. | [`05-plano-multas-bloqueio.md`](/atvs%20avaliativas/atv3/docs/planos/05-plano-multas-bloqueio.md) |
| **Interface / CSS** | Deixar 10 colunas abertas com classes inline e scroll horizontal | Reclamei da poluição visual, da falta de ergonomia do scroll horizontal e mandei separar o CSS. | Criamos o CSS Module com larguras percentuais (31%, 18%, 23%, 28%), zerando o scroll horizontal. | [`06-plano-ui-refactor-css.md`](/atvs%20avaliativas/atv3/docs/planos/06-plano-ui-refactor-css.md) |

---

## 🏁 Conclusão

Ter utilizado o Antigravity como assistente de programação me deu agilidade para implementar os padrões de código, mas **o meu acompanhamento crítico e as minhas intervenções a cada etapa** foram decisivos para evitar atalhos que prejudicariam o sistema (como perder dados de outras matérias no banco, deixar timers frágeis em memória ou colocar regras de negócio no lugar errado).

O resultado final é uma aplicação robusta, conectada ao PostgreSQL do IFSP, desenvolvida em Clean Architecture, sem erros de compilação no NestJS ou no Next.js, e 100% pronta para a defesa na arguição oral.
