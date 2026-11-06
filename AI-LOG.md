# 🤖 Registro de Governança e Uso Crítico de IA (AI-LOG)

> **Disciplina:** Programação Web II (PPW II)  
> **Tema 08:** Controle de Empréstimo de Livros / Equipamentos Internos  
> **Estudante:** Gabriel Soares Pedrosa (`bi3041271`)  
> **Repositório Oficial:** Atividade 3 (`atv3`)  
> **Banco Oficial:** PostgreSQL Institucional (`10.102.55.11:5432`, schema `bi3041271`)

---

## 🧭 Metodologia: O Aluno como Arquiteto e Líder Técnico

Na Atividade 3, a Inteligência Artificial não foi utilizada como um gerador automático cego de código, mas sim em um modelo de **Pair Programming Supervisionado (Liderança Técnica pelo Estudante)**. 

Como os tópicos avançados da disciplina (Máquinas de Estados Finitas, Trilha de Auditoria ACID, Concorrência Assíncrona e Lazy Evaluation) derivaram de textos complementares de aprofundamento, o estudante estruturou um fluxo formal de engenharia:
1. **Governança & Restrições Iniciais:** Definição prévia das fronteiras do agente, memória persistente e diretrizes arquiteturais.
2. **Setup Guiado:** Migração controlada da base da Atividade 2 e link com o banco PostgreSQL institucional sem perda de dados legados.
3. **Questionamento Conceitual:** Investigação dos padrões arquiteturais recomendados pela literatura.
4. **Auditoria & Crítica das Respostas:** Identificação de soluções ingênuas ou perigosas propostas pela IA (como `prisma db push --force-reset`, timers com `setInterval`, validações soltas com `if/else` na Controller ou tabelas quebradas com scroll horizontal).
5. **Refatoração & Implementação pelo Aluno:** Escrita da solução robusta alinhada aos princípios de Arquitetura Limpa, DDD (Domain-Driven Design) e TypeScript estrito.

Abaixo estão registrados os 7 episódios centrais que documentam essa trajetória.

---

## 📑 Registro 01: Governança do Agente, Contexto de Memória (`brain`) e Diretrizes de Engenharia

### 1. O Desafio
Para que um agente de IA atue de forma produtiva em um ecossistema complexo (Next.js 16 + NestJS + Prisma + PostgreSQL) sem corromper as camadas arquiteturais da Atividade 2, é indispensável estabelecer regras de governança, restrições operacionais e memória de contexto antes de escrever qualquer código.

### 2. O Prompt de Inicialização e Governança
```text
Você atuará como meu pair programmer assistente no desenvolvimento da Atividade 3 de PPW II. 
Antes de começarmos qualquer linha de código, você deve seguir estas diretrizes obrigatórias:
1. Trabalhe exclusivamente dentro do escopo de 'atvs avaliativas/atv3'.
2. Respeite rigorosamente a separação em camadas da Clean Architecture já iniciada.
3. Crie e mantenha seus planos, artefatos e acompanhamento de tarefas na pasta 'brain'.
4. Sempre responda em português (BR) com rigor técnico e utilize commits semânticos em branches dedicadas.
5. Nunca adote atalhos que violem o domínio ou quebrem convenções do NestJS e Next.js.
Confirme o entendimento destas diretrizes para darmos o primeiro passo técnico.
```

### 3. A Resposta Inicial do Agente
```text
Entendido perfeitamente. Diretrizes assimiladas:
- Escopo restrito a 'atvs avaliativas/atv3'.
- Arquitetura Limpa e isolamento de Domínio respeitados.
- Persistência de planejamento e artefatos estruturados na pasta 'brain'.
- Comunicação em português (BR) e fluxo Git multi-branch.
Pronto para receber o direcionamento da migração e da base de código.
```

### 4. A Crítica e Aplicação pelo Aluno
* **O que essa etapa garantiu:** Evitou o maior vício de modelos de linguagem: a tendência de propor soluções monolíticas, misturar regras de negócio em componentes React ou esquecer o contexto ao longo de sessões prolongadas.
* **Governança aplicada:** Toda a árvore de raciocínio, checklist de entrega e planos executivos foram ancorados no diretório `brain/`, permitindo que o aluno pudesse auditar passo a passo cada sugestão antes de permitir modificações no código-fonte.

---

## 📑 Registro 02: Migração Guiada da Atividade 2 e Conexão Segura ao PostgreSQL Institucional

### 1. O Desafio
O ponto de partida do backend e frontend era a base construída na Atividade 2. O objetivo era clonar essa estrutura para a pasta da Atividade 3 e vincular ao PostgreSQL da faculdade (`postgresql://bi3041271:BI3041271@10.102.55.11:5432/postgres?schema=bi3041271`). O desafio crítico era conectar sem apagar nem corromper tabelas de outras disciplinas que já residiam no mesmo schema do estudante.

### 2. O Prompt Utilizado
```text
Temos a base funcional da Atividade 2 na pasta 'atvs avaliativas/atv2'. 
Preciso clonar essa base de forma limpa para 'atvs avaliativas/atv3' (mantendo cliente e servidor).
Em seguida, precisamos configurar as variáveis de ambiente (.env) do servidor para apontar para o 
PostgreSQL institucional da faculdade:
DATABASE_URL="postgresql://bi3041271:BI3041271@10.102.55.11:5432/postgres?schema=bi3041271"

Atenção: analise o banco antes de aplicar migrations, pois podem existir tabelas de outros trabalhos 
no schema bi3041271 que não podem ser perdidas. Como proceder com segurança no Prisma?
```

### 3. A Resposta Bruta da IA
```text
Para migrar o projeto:
1. Copie as pastas ppw_test_client e ppw_test_server de atv2 para atv3.
2. No ppw_test_server/.env, defina a DATABASE_URL do PostgreSQL.
3. No schema.prisma, mude o provider de 'sqlite' para 'postgresql'.
4. Execute:
   npx prisma db push --force-reset
Isso vai limpar o banco remoto e criar a tabela de empréstimos do zero sem erros de conflito.
```

### 4. A Crítica e Refatoração do Aluno
* **Onde a IA foi perigosa e ingênua:**
  - A sugestão de rodar `prisma db push --force-reset` em um banco compartilhado é inaceitável. O comando `--force-reset` teria executado um `DROP SCHEMA` ou dropado tabelas existentes como a tabela `tickets` (com 3 registros de outra atividade já avaliada no semestre), causando perda irreversível de dados.
* **Refatoração implementada pelo aluno:**
  1. O aluno instruiu o isolamento com `npx prisma db pull --print` para inspecionar o schema remoto antes de qualquer escrita.
  2. Foram preservadas as entidades pré-existentes (`tickets`, `Prioridade`, `Status`) no [`schema.prisma`](file:///c:/Users/soares/Documents/Faculdade/4º%20semestre/web2/ppw-cocao/atvs%20avaliativas/atv3/ppw_test_server/prisma/schema.prisma).
  3. Foi adotado o prefixo semântico de namespace institucional: `web2_A1_emprestimos` para os empréstimos e `web2_A3_historico_emprestimos` para a trilha de auditoria.
  4. O schema foi sincronizado com segurança via `prisma db push` (sem reset), mantendo 100% dos dados legados intactos.

---

## 📑 Registro 03: Máquina de Estados Finita (FSM) no Domínio vs. Validações Soltas por IF/ELSE

### 1. O Desafio
O texto complementar exigia transformar o ciclo de vida dos empréstimos em uma Máquina de Estados Finita (FSM), impedindo transições ilógicas (ex: tentar "devolver" um item que só estava "reservado", ou "cancelar" algo já retirado).

### 2. O Prompt Utilizado
```text
O que é Máquina de Estados Finita e Transições Restritas em sistemas web corporativos? 
Por que um CRUD comum que permite atualizar o status de um registro diretamente via 
requisição PUT é considerado um antipadrão? Como implementar isso em NestJS com DDD?
```

### 3. A Resposta Bruta da IA
```text
Uma FSM define quais estados podem levar a outros. No CRUD tradicional, o PUT permite 
que qualquer um envie { "status": "DEVOLVIDO" } burlando etapas.

Para resolver no NestJS, basta colocar ifs no Controller:
@Put(':id')
async update(@Param('id') id: string, @Body() body: any) {
  const item = await this.repo.findById(id);
  if (body.status === 'DEVOLVIDO' && item.status !== 'RETIRADO') {
    throw new BadRequestException('Transição inválida');
  }
  return this.repo.update(id, body);
}
```

### 4. A Crítica e Refatoração do Aluno
* **Onde a IA foi ingênua/simplista:**
  - Colocar validações de transição soltas em blocos de `if/else` dentro do Controller viola a Arquitetura Limpa: a regra de negócio vaza para a camada de apresentação, torna os testes unitários complexos e fica impossível de manter conforme novos estados surgem.
  - O uso de `HTTP 400 Bad Request` é incorreto semanticamente: o formato da requisição é válido, o que falhou foi uma regra semântica de domínio. O código correto para regras de negócio não atendidas é **HTTP 422 Unprocessable Entity**.
* **Refatoração implementada pelo aluno:**
  - O aluno eliminou o endpoint genérico `PUT /emprestimos/:id` para alteração de status.
  - Criou o Value Object [`StatusEmprestimo`](file:///c:/Users/soares/Documents/Faculdade/4º%20semestre/web2/ppw-cocao/atvs%20avaliativas/atv3/ppw_test_server/src/module/emprestimos/domain/value-objects/status-emprestimo.value-object.ts) contendo a matriz imutável `TRANSICOES_VALIDAS_FSM`.
  - Criou a exceção semântica [`TransicaoInvalidaException`](file:///c:/Users/soares/Documents/Faculdade/4º%20semestre/web2/ppw-cocao/atvs%20avaliativas/atv3/ppw_test_server/src/module/emprestimos/domain/exceptions/transicao-invalida.exception.ts) retornando `HttpStatus.UNPROCESSABLE_ENTITY` (422) e listando quais eram os únicos estados válidos para a situação.
  - Implementou endpoints semânticos orientados a ações: `/retirar`, `/devolver`, `/renovar`, `/cancelar`.

---

## 📑 Registro 04: Trilha de Auditoria (Audit Log) Imutável com Transações ACID

### 1. O Desafio
O texto complementar destacava que sistemas corporativos auditáveis não realizam `UPDATE` destrutivo sobre dados de auditoria; cada transição de estado precisa ser gravada em uma tabela append-only (somente inserção) contendo o status anterior, o novo status, data, autor e justificativa.

### 2. O Prompt Utilizado
```text
Como modelar uma Trilha de Auditoria (Audit Log) em NestJS com Prisma? 
Como garantir atomicidade absoluta entre a alteração do registro e a criação do log no PostgreSQL?
```

### 3. A Resposta Bruta da IA
```typescript
// Sugestão da IA: chamadas sequenciais soltas
await this.prisma.emprestimo.update({
  where: { id },
  data: { status: novoStatus }
});

await this.prisma.auditLog.create({
  data: { emprestimoId: id, statusAnterior, novoStatus, data: new Date() }
});
```

### 4. A Crítica e Refatoração do Aluno
* **Onde a IA falhou:**
  - A sugestão da IA executa duas operações independentes no banco. Se o servidor cair, a conexão oscilar ou houver falha de rede exatamente entre o `update` e o `create`, o empréstimo muda de status mas o log nunca é gravado — corrompendo a integridade da auditoria.
* **Refatoração implementada pelo aluno:**
  - Criou a tabela dedicada [`web2_A3_historico_emprestimos`](file:///c:/Users/soares/Documents/Faculdade/4º%20semestre/web2/ppw-cocao/atvs%20avaliativas/atv3/ppw_test_server/prisma/schema.prisma) com foreign key em cascata e índices por empréstimo.
  - Implementou no repositório [`EmprestimoPrismaWriteRepository`](file:///c:/Users/soares/Documents/Faculdade/4º%20semestre/web2/ppw-cocao/atvs%20avaliativas/atv3/ppw_test_server/src/module/emprestimos/infrastructure/adapters/emprestimo.prisma.write.repository.ts) o encapsulamento dentro de `this.prisma.$transaction(async (tx) => { ... })`. Se o log falhar, o status do empréstimo sofre rollback imediato, assegurando as propriedades ACID.

---

## 📑 Registro 05: Conflitos Assíncronos e Expiração Automática por Lazy Evaluation

### 1. O Desafio
Como processar a expiração automática de reservas não retiradas no prazo estipulado (48h) sem depender de cron jobs ou daemons externos no sistema operacional do servidor?

### 2. O Prompt Utilizado
```text
Qual o padrão de arquitetura para expirar reservas vencidas no banco de dados 
sem precisar configurar um cron job externo ou daemon no servidor Node.js?
```

### 3. A Resposta Bruta da IA
```javascript
// Sugestão da IA: setInterval em memória
setInterval(async () => {
  const vencidos = await prisma.emprestimo.findMany({
    where: { status: 'RESERVADO', dataLimiteRetirada: { lt: new Date() } }
  });
  for (const item of vencidos) {
    await prisma.emprestimo.update({ where: { id: item.id }, data: { status: 'EXPIRADO' } });
  }
}, 60000);
```

### 4. A Crítica e Refatoração do Aluno
* **Onde a IA foi ingênua:**
  - O uso de `setInterval` dentro do processo da aplicação é um clássico antipadrão: se o servidor reiniciar os intervalos morrem; se houver múltiplas instâncias da API (cluster/load balancer), os timers competem no banco gerando deadlocks e overhead desnecessário de I/O em momentos ociosos.
* **Refatoração implementada pelo aluno:**
  - O aluno adotou o padrão de **Lazy Evaluation (Avaliação Preguiçosa / Just-in-Time)**: a expiração é avaliada sob demanda no momento em que qualquer leitura ou tentativa de alocação de recurso é requisitada.
  - Criou o método `expirarReservasVencidas()` executado atomicamente com `updateMany` dentro das transações de busca, garantindo que o usuário e o sistema sempre vejam o estado real do recurso sem consumir CPU em background.

---

## 📑 Registro 06: Multa Progressiva por Faixas e Bloqueio Preventivo Dinâmico

### 1. O Desafio
Modelar regras progressivas para devoluções em atraso (valor por dia aumenta conforme o tempo de inadimplência) e impedir automaticamente que usuários com itens em atraso realizem novas reservas.

### 2. O Prompt Utilizado
```text
Como implementar uma regra de multa com valor progressivo por dias de atraso e bloquear 
automaticamente novas reservas para usuários em atraso em uma aplicação NestJS?
```

### 3. A Resposta Bruta da IA
```typescript
// Sugestão da IA: cálculo linear e flag estática
const valorMulta = diasAtraso * 2.50;

const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
if (usuario.isBloqueado) {
  throw new Error('Usuário bloqueado');
}
```

### 4. A Crítica e Refatoração do Aluno
* **Onde a IA falhou:**
  - A IA sugeriu um cálculo linear ingênuo (`dias * 2.5`), ignorando o conceito de taxa progressiva por faixas de atraso (muito comum em bibliotecas e locadoras para desincentivar atrasos longos).
  - Presumiu uma flag estática `isBloqueado` em tabela separada, obrigando rotinas manuais de sincronização de status de usuário.
* **Refatoração implementada pelo aluno:**
  - Criou o serviço de domínio [`CalculadoraMultaService`](file:///c:/Users/soares/Documents/Faculdade/4º%20semestre/web2/ppw-cocao/atvs%20avaliativas/atv3/ppw_test_server/src/module/emprestimos/domain/services/calculadora-multa.service.ts) com faixas progressivas:
    - 1º ao 3º dia: R\$ 2,00 / dia
    - 4º ao 7º dia: R\$ 3,50 / dia
    - 8º dia em diante: R\$ 5,00 / dia
  - Implementou a checagem dinâmica `verificarBloqueioUsuario` no repositório: o sistema afere atômica e diretamente se o solicitante possui qualquer registro em `ATRASADO`. Se sim, a reserva é sumariamente recusada com HTTP 422.

---

## 📑 Registro 07: Engenharia de Frontend, Ações Semânticas e Resolução de Scroll com CSS Modules

### 1. O Desafio
Ao renderizar a listagem de empréstimos com 7 estados da FSM, datas, multas e ações (Retirar, Cancelar, Renovar, Devolver, Histórico, Editar, Excluir), a primeira versão da tabela amontoava dezenas de classes do Tailwind e botões soltos por linha, estourando a tela e forçando uma barra de rolagem horizontal (`overflow-x-auto`) de péssima usabilidade.

### 2. O Prompt Utilizado
```text
Minha tabela no Next.js com Tailwind ficou com muitas colunas, os botões de ação estão quebrando 
em várias linhas e gerando barra de scroll horizontal indesejada. Como resolver?
```

### 3. A Resposta Bruta da IA
```html
Basta colocar 'overflow-x: scroll' no container da tabela e usar 'text-xs' nos botões, 
ou esconder todas as ações em um único menu dropdown.
```

### 4. A Crítica e Refatoração do Aluno
* **Onde a IA falhou:**
  - Aceitar a barra de scroll horizontal (`overflow-x: scroll`) como solução é um atalho que prejudica a experiência em laptops e telas menores.
  - Esconder todos os botões em um dropdown atrasa as duas ações mais frequentes do dia a dia da biblioteca: *Retirar* e *Devolver*.
* **Refatoração implementada pelo aluno:**
  1. **Separação de estilos:** Criou o arquivo dedicado [`emprestimos.module.css`](file:///c:/Users/soares/Documents/Faculdade/4º%20semestre/web2/ppw-cocao/atvs%20avaliativas/atv3/ppw_test_client/src/features/emprestimos/components/emprestimos.module.css), limpando o excesso de Tailwind inline e aplicando `table-layout: fixed; width: 100%`.
  2. **Eliminação do Scroll:** Otimizou as colunas para proporções exatas (31% Item & Usuário, 18% Status, 23% Prazos/Multas, 28% Ações), unificando *Item* e *Solicitante* na mesma célula hierárquica.
  3. **Hierarquia Semântica nas Ações:**
     - Botão primário contextual (*Retirar* em azul para reservas; *Devolver* em verde para empréstimos em uso).
     - Botão **Renovar** visível na barra de ações para dar agilidade operacional.
     - Botão direto de **Histórico (Audit Log)** abrindo modal com timeline.
     - Menu Radix UI (`DropdownMenu`) compacto para ações administrativas (*Editar* e *Excluir*).

---

## 📊 Síntese dos Resultados Obtidos

| Aspecto | Proposta Inicial / Típica de IA | Implementação Final (Refatorada pelo Aluno) |
| :--- | :--- | :--- |
| **Arquitetura Geral** | CRUD com `PUT` e validações soltas | FSM formal no Domínio com Value Object e rotas semânticas |
| **Tratamento de Erros** | `HTTP 400 Bad Request` genérico | `HTTP 422 Unprocessable Entity` com estados válidos |
| **Persistência de Auditoria** | `UPDATE` destrutivo ou chamadas assíncronas soltas | Tabela de Histórico imutável com `$transaction` ACID |
| **Expiração de Reservas** | `setInterval` em memória | *Lazy Evaluation* atômico disparado sob demanda no banco |
| **Cálculo de Penalidades** | Multiplicação linear simples | Faixas progressivas de multa + bloqueio dinâmico |
| **Banco de Dados** | SQLite local ou `--force-reset` destrutivo | PostgreSQL oficial compartilhado preservando dados legados |
| **Interface de Usuário** | Tabela transbordando com scroll horizontal | Layout proporcional 100% ajustado com CSS Modules e Radix UI |
