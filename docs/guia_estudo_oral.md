# 🎓 Guia Definitivo de Estudos para Arguição Oral (PPW II)

> **Projeto:** Tema 08 — Controle de Empréstimo de Livros e Equipamentos Internos  
> **Aluno:** Gabriel Soares Pedrosa (`bi3041271`)  
> **Banco Oficial:** PostgreSQL Institucional (`10.102.55.11:5432`, schema `bi3041271`)  
> **Objetivo:** Seu mapa prático e completo para sentar no laboratório com o professor, abrir qualquer pasta sem hesitar, explicar o papel exato de cada arquivo, localizar qualquer conceito pelo termo técnico e defender suas decisões arquiteturais com segurança.  
> 📖 **Referência Complementar:** Para detalhes extras de cada arquivo individual, consulte também [`docs/mapa_arquitetura_e_arquivos.md`](mapa_arquitetura_e_arquivos.md).

---

## 🎙️ 1. O Pitch Inicial de 60 Segundos (Como Começar a Apresentação)

Se o professor disser: *"Gabriel, me explica o que você construiu na Atividade 3 e como organizou o projeto"*, use este roteiro:

> *"Professor, na Atividade 3 eu evoluí o CRUD simples da Atividade 2 para um sistema completo de controle de empréstimos em **Clean Architecture, DDD e separação CQRS**, conectado diretamente ao PostgreSQL da faculdade.*
>
> *No desenvolvimento com o agente de IA, eu atuei guiando as decisões pra evitar atalhos perigosos:
> 1. **Banco Seguro:** Fizemos a leitura do schema compartilhado antes pra não apagar minha tabela `tickets` de outras matérias, e criamos as tabelas novas com prefixos (`web2_A1_emprestimos` e `web2_A3_historico_emprestimos`).
> 2. **Máquina de Estados Finita (FSM):** Tirei a alteração livre de status do `PUT`. Agora o status só muda por eventos de negócio no Domínio (`registrarRetirada()`, `renovarPrazo()`, `registrarDevolucao()`, `cancelarReserva()`). Se alguém tentar um salto inválido, o sistema barra com **HTTP 422 Unprocessable Entity**.
> 3. **Auditoria ACID:** Toda criação ou mudança de estado grava um histórico imutável junto na mesma transação (`prisma.$transaction`), garantindo que nunca fique status alterado sem log.
> 4. **Expiração & Concorrência (Lazy Evaluation):** Para reservas que passam de 48h sem retirada, em vez de deixar um timer ou cron rodando à toa no servidor, fizemos a expiração sob demanda na hora da consulta ou reserva, além de checar disponibilidade para impedir double-booking.
> 5. **Multas Progressivas & Bloqueio:** Modelei um serviço de domínio puro que calcula multa por faixas de dias e barra automaticamente novas reservas de quem tem pendência atrasada.*
>
> *E no front-end em Next.js 16, refatorei a tabela usando CSS Modules com colunas fixas pra caber tudo na tela sem scroll horizontal."*

---

## 📁 2. Mapa Completo das Pastas e Suas Funções no Sistema

Quando o professor apontar para uma pasta no VS Code e perguntar *"Pra que serve essa pasta aqui?"*, use este mapa:

### 2.1. Backend (`ppw_test_server/`) — NestJS + Prisma

```text
ppw_test_server/
├── prisma/
│   ├── schema.prisma       ➔ Contrato do banco PostgreSQL (modelos e tabelas)
│   └── seed.ts             ➔ Script para popular 6 cenários de teste no banco
└── src/
    ├── app/                ➔ Módulo raiz (AppModule) que junta os módulos da API
    ├── database/           ➔ PrismaService (gerencia conexão e desconexão com o PostgreSQL)
    ├── shared/domain/      ➔ Classes base reutilizáveis (BaseEntity, ValueObjects)
    └── module/emprestimos/ ➔ Todo o módulo de negócio do Tema 08
        ├── domain/         ➔ [Coração] Regras puras, sem depender de NestJS ou Prisma
        │   ├── entity/         ➔ Entidade rica EmprestimoEntity (métodos de ciclo de vida)
        │   ├── value-objects/  ➔ StatusEmprestimo e matriz da FSM
        │   ├── services/       ➔ CalculadoraMultaService (cálculo progressivo)
        │   ├── exceptions/     ➔ TransicaoInvalidaException (dispara HTTP 422)
        │   └── ports/          ➔ Interfaces dos repositórios (contratos de leitura/escrita)
        ├── application/    ➔ [Orquestração] Casos de uso do sistema
        │   ├── dto/            ➔ Objetos de entrada (Request) e saída (Response)
        │   ├── use-case/       ➔ Contratos (interfaces) separados em read/ e write/
        │   └── service/        ➔ Implementação real dos casos de uso (read/ e write/)
        ├── infrastructure/ ➔ [Mundo Externo] Banco de dados e tradução de dados
        │   ├── adapters/       ➔ Implementação Prisma dos repositórios (CQRS Read e Write)
        │   └── mappers/        ➔ Converte objeto do Prisma ⇄ Entidade de Domínio ⇄ DTO
        └── presentation/   ➔ [Porta HTTP] Controllers REST que recebem e respondem JSON
```

| Pasta no Backend | Responsabilidade Real no Sistema |
| :--- | :--- |
| `domain/entity/` | Guarda `EmprestimoEntity`, que protege os dados e concentra as ações do ciclo de vida (`registrarRetirada`, `registrarDevolucao`, `renovarPrazo`, `cancelarReserva`). |
| `domain/value-objects/` | Guarda `StatusEmprestimo` e a matriz `TRANSICOES_VALIDAS_FSM`, impedindo qualquer mudança de estado ilegal. |
| `domain/services/` | Guarda regras de negócio puras que não pertencem a um único atributo, como a `CalculadoraMultaService`. |
| `domain/exceptions/` | Define erros de negócio com significado HTTP, como `TransicaoInvalidaException` (HTTP 422). |
| `domain/ports/` | Define as interfaces (`EmprestimoReadRepository`, `EmprestimoWriteRepository`) para a aplicação não depender direto do Prisma (Inversão de Dependência). |
| `application/use-case/` | Contém as interfaces dos casos de uso separados por escrita (`write/`) e leitura (`read/`), seguindo CQRS. |
| `application/service/` | Implementa a orquestração: busca a entidade no Read Repo, executa o método de negócio no Domínio, e salva pelo Write Repo. |
| `application/dto/` | Define e valida os formatos de JSON que entram (`CriarReservaRequest`, `RegistrarDevolucaoRequest`) e saem (`EmprestimoResponse`). |
| `infrastructure/adapters/` | Implementa as interfaces do domínio usando `PrismaService`: `emprestimo.prisma.write.repository.ts` (com `$transaction` ACID) e `emprestimo.prisma.read.repository.ts` (consultas). |
| `infrastructure/mappers/` | `emprestimo.mappers.ts`: traduz registros brutos do banco (Prisma) para `EmprestimoEntity` e de `EmprestimoEntity` para `EmprestimoResponse`. |
| `presentation/` | `emprestimos.controller.ts`: expõe os endpoints REST (`GET /emprestimos`, `POST /emprestimos/:id/retirar`, etc.). Não tem regra de negócio, só delega aos Use Cases. |

---

### 2.2. Frontend (`ppw_test_client/src/`) — Next.js 16 (App Router)

```text
ppw_test_client/src/
├── app/
│   ├── layout.tsx          ➔ Estrutura HTML base, fontes e estilos globais
│   ├── page.tsx            ➔ Página inicial de entrada
│   └── emprestimos/
│       ├── page.tsx        ➔ Página principal (Server Component que busca dados iniciais)
│       └── emprestimos.module.css ➔ CSS Module travando colunas (Zero Scroll Horizontal)
├── features/emprestimos/   ➔ Tudo que é específico da tela e fluxo de empréstimos
│   ├── api/                ➔ emprestimo.actions.ts (Server Actions com 'use server')
│   ├── components/         ➔ Tabela TanStack, Colunas e os 4 Modais (Dialogs)
│   ├── schema/             ➔ Validação de formulários com Zod
│   └── type/               ➔ Tipagens TypeScript (Emprestimo, HistoricoItem, ActionState)
└── components/ui/          ➔ Componentes base reutilizáveis (Radix UI: Button, Dialog, Badge, Dropdown)
```

| Pasta no Frontend | Responsabilidade Real no Sistema |
| :--- | :--- |
| `app/emprestimos/` | Contém a rota `/emprestimos` (`page.tsx`), que roda no servidor Next.js buscando os dados frescos e entregando para a tabela, além do `emprestimos.module.css` que trava o layout sem scroll lateral. |
| `features/emprestimos/api/` | Guarda `emprestimo.actions.ts` (`'use server'`). Toda comunicação com o backend NestJS passa por aqui, garantindo segurança e revalidação de cache (`revalidatePath`). |
| `features/emprestimos/components/` | Contém `EmprestimosTable.tsx` (filtros, busca, métricas), `emprestimos-columns.tsx` (as 4 colunas consolidadas) e os modais (`emprestimoDevolverDialog`, `EmprestimoHistoricoDialog`, `emprestimoFormDialog`, `emprestimoDeleteDialog`). |
| `features/emprestimos/schema/` | Regras de validação client-side com Zod para o formulário de reserva/edição. |
| `components/ui/` | Primitivos de interface acessíveis baseados em Radix UI e Tailwind (`button.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, `badge.tsx`, `alert.tsx`). |

---

### 2.3. Documentação & Governança (`docs/`, `brain/`, Raiz)

| Caminho | Para que serve |
| :--- | :--- |
| `AI-LOG.md` | Registro cronológico dos prompts, propostas do agente, seus questionamentos reais e decisões técnicas tomadas. |
| `docs/pesquisas/` | Resumos didáticos dos 4 temas teóricos passados pelo professor (FSM, Audit Log, Concorrência/Lazy, Multas). |
| `docs/planos/` | Plano geral (`plano-geral-atv3.md`) e os 6 planos técnicos detalhados que guiaram cada entrega. |
| `docs/mapa_arquitetura_e_arquivos.md` | Mapeamento detalhado arquivo por arquivo de todo o sistema. |
| `brain/` | Contexto persistido com o enunciado original e regras do ambiente de desenvolvimento. |

---

## 🔍 3. Onde Encontrar Pelo Termo Técnico (Guia Rápido de Busca)

Se o professor perguntar: *"Onde você implementou [termo técnico] e o que isso faz?"*, consulte esta tabela imediatamente:

| Termo Técnico | Onde Está no Código (Arquivo Exato) | O que Faz na Prática |
| :--- | :--- | :--- |
| **Máquina de Estados Finita (FSM)** | `ppw_test_server/src/module/emprestimos/domain/value-objects/status-emprestimo.value-object.ts` | Define o enum de estados e a matriz `TRANSICOES_VALIDAS_FSM`. O método `validarTransicaoPara()` bloqueia transições proibidas antes de tocar no banco. |
| **Entidade Rica (Rich Domain Model)** | `ppw_test_server/src/module/emprestimos/domain/entity/emprestimo.entity.ts` | Concentra as ações do ciclo de vida (`createReserva`, `registrarRetirada`, `renovarPrazo`, `registrarDevolucao`, `cancelarReserva`, `expirarReserva`, `marcarAtrasado`, `atualizarDados`). |
| **HTTP 422 Unprocessable Entity** | `ppw_test_server/src/module/emprestimos/domain/exceptions/transicao-invalida.exception.ts` | Exceção lançada quando a sintaxe JSON está certa, mas a regra de negócio da FSM proíbe a transição. Retorna o status atual, o destino tentado e os estados válidos. |
| **Transação ACID / Atomicidade** | `ppw_test_server/src/module/emprestimos/infrastructure/adapters/emprestimo.prisma.write.repository.ts` | Usa `this.prisma.$transaction(async (tx) => { ... })` nos métodos `create()` e `update()` para atualizar o empréstimo e gravar o histórico na mesma operação indivisível. |
| **Audit Log (Trilha de Auditoria)** | `prisma/schema.prisma` (`HistoricoEmprestimo`) + `emprestimo.prisma.write.repository.ts` + `emprestimo.prisma.read.repository.ts` | Tabela `web2_A3_historico_emprestimos` que registra `statusAnterior`, `novoStatus`, `autorAcao`, `justificativa` e `timestamp` de forma imutável. |
| **Lazy Evaluation (Just-In-Time)** | `emprestimo.prisma.write.repository.ts` (`processarExpiracoesLazy()`) | Chamado antes de criar reservas (`CriarReservaService.execute`) e antes de retirar (`OperacoesEmprestimoService.retirar`). Varre reservas vencidas (> 48h) e muda para `EXPIRADO` com log, dispensando cron jobs. |
| **Anti Double-Booking / Concorrência** | `emprestimo.prisma.read.repository.ts` (`verificarDisponibilidadeItem()`) + `criar-reserva.service.ts` | Impede que dois usuários reservem o mesmo exemplar simultaneamente verificando se já existe registro em `RESERVADO`, `RETIRADO` ou `ATRASADO`. |
| **Multa Progressiva por Faixas** | `ppw_test_server/src/module/emprestimos/domain/services/calculadora-multa.service.ts` | Domain Service puro (`CalculadoraMultaService.calcular()`): cobra R$ 2,00/dia (dias 1–3), R$ 3,50/dia (dias 4–7) e R$ 5,00/dia (dia 8+). |
| **Bloqueio Preventivo Dinâmico** | `emprestimo.prisma.read.repository.ts` (`verificarBloqueioUsuario()`) | Checa dinamicamente na hora da reserva se o usuário tem itens `ATRASADO` ou `RETIRADO` com prazo vencido. Se tiver, bloqueia com HTTP 422. |
| **CQRS (Separação Read/Write)** | `domain/ports/emprestimo.read.repository.ts` vs `emprestimo.write.repository.ts` e `application/use-case/read` vs `write` | Separa fluxos e repositórios de leitura (consultas otimizadas sem transação) dos fluxos de escrita (mutações com transação ACID e auditoria). |
| **Inversão de Dependência (Ports & Adapters)** | `domain/ports/` (interfaces) + `infrastructure/adapters/` (Prisma) + `emprestimos.module.ts` | Os casos de uso dependem de tokens/interfaces (`@Inject(EMPRESTIMO_WRITE_REPOSITORY)`), não da classe concreta do Prisma. |
| **Rotas Semânticas REST** | `ppw_test_server/src/module/emprestimos/presentation/emprestimos.controller.ts` | Em vez de `PUT` alterando status, expõe ações explícitas: `POST/PATCH :id/retirar`, `:id/renovar`, `:id/devolver`, `:id/cancelar`, `:id/marcar-atrasado`. |
| **Server Actions & Revalidação** | `ppw_test_client/src/features/emprestimos/api/emprestimo.actions.ts` | Funções `'use server'` (`createEmprestimo`, `devolverEmprestimo`, etc.) que rodam no servidor Next.js, tratam erros 422 e chamam `revalidatePath('/emprestimos')`. |
| **Zero Horizontal Scroll (CSS Modules)** | `ppw_test_client/src/app/emprestimos/emprestimos.module.css` | Define `table-layout: fixed; width: 100%` e larguras percentuais exatas (`31% + 18% + 23% + 28% = 100%`), evitando barra lateral horizontal. |

---

## 🔄 4. O Fluxo Completo na Prática (Exemplo: Clicar em "Devolver")

Se o professor pedir *"Me mostra o caminho completo do código quando eu clico em Devolver na tela"*, acompanhe esta sequência:

1. **Clique na UI (`EmprestimosTable.tsx` / `emprestimoDevolverDialog.tsx`):**
   O operador marca se houve avaria física, preenche a descrição (opcional) e confirma.
2. **Server Action (`emprestimo.actions.ts`):**
   A função `devolverEmprestimo(id, payload)` roda no servidor Next.js e envia um `PATCH http://localhost:8000/emprestimos/:id/devolver`.
3. **Presentation (`emprestimos.controller.ts`):**
   O método `devolverPatch()` recebe o `id` e o DTO `RegistrarDevolucaoRequest` validado, e chama `operacoesUseCase.devolver(id, dto)`.
4. **Application (`operacoes-emprestimo.service.ts`):**
   O método `devolver()` busca o empréstimo via `readRepo.findById(id)` (que usa o Mapper para devolver uma `EmprestimoEntity`).
5. **Domain (`emprestimo.entity.ts` + `calculadora-multa.service.ts` + `status-emprestimo.value-object.ts`):**
   `emprestimo.registrarDevolucao(temAvaria, descricaoAvaria)` chama `CalculadoraMultaService.calcular()`, decide entre `DEVOLVIDO` ou `DEVOLVIDO_COM_MULTA`, valida na FSM via `validarTransicaoPara()`, e atualiza os atributos internos da entidade.
6. **Infrastructure (`emprestimo.prisma.write.repository.ts`):**
   `writeRepo.update(emprestimo, { autorAcao, justificativa })` abre `prisma.$transaction`, atualiza `web2_A1_emprestimos` e cria o log em `web2_A3_historico_emprestimos` atomicamente.
7. **Retorno e Revalidação:**
   O backend devolve HTTP 200 com o JSON atualizado; a Server Action executa `revalidatePath('/emprestimos')` e o Next.js atualiza a tabela na tela instantaneamente.

---

## 🎯 5. Simulador Completo de Perguntas da Bancada (Q&A)

### Pergunta 1: *"Por que você removeu a alteração de status do `PUT /emprestimos/:id`?"*
* **Resposta:**  
  *"Porque em um sistema de empréstimos, o status não é um campo cadastral simples como corrigir o nome do livro; ele representa etapas de um processo de negócio com efeitos colaterais (prazos, multas, auditoria). Se o `PUT` mudasse o status livremente, alguém poderia mandar `{ status: 'DEVOLVIDO' }` para um item que ainda estava só `RESERVADO`. Agora o `PUT` só atualiza dados cadastrais (e ainda bloqueia se o empréstimo já estiver em estado terminal), enquanto mudanças de status só acontecem pelas rotas semânticas de evento."*

### Pergunta 2: *"O que acontece tecnicamente se eu tentar devolver um item que está apenas `RESERVADO`?"*
* **Resposta:**  
  *"O domínio barra antes de qualquer gravação no banco. O `OperacoesEmprestimoService.devolver()` chama `emprestimo.registrarDevolucao()`, que aciona `this.props.status.validarTransicaoPara(proximoStatus)`. A matriz `TRANSICOES_VALIDAS_FSM` vê que `RESERVADO` não pode ir para `DEVOLVIDO` e lança `TransicaoInvalidaException`, retornando HTTP 422 com a lista dos estados permitidos a partir de `RESERVADO` (`RETIRADO`, `EXPIRADO`, `CANCELADO`)."*

### Pergunta 3: *"Por que retornar HTTP 422 e não 400 Bad Request?"*
* **Resposta:**  
  *"HTTP 400 significa que a requisição veio malformada na sintaxe ou nos tipos (ex: JSON inválido ou campo obrigatório ausente). Já quando o JSON está perfeito e validado pelo DTO, mas a operação viola uma regra semântica de negócio (como tentar renovar um item já devolvido), o padrão REST correto é **HTTP 422 Unprocessable Entity**."*

### Pergunta 4: *"Como você garantiu que o histórico de auditoria nunca fica dessincronizado do empréstimo?"*
* **Resposta:**  
  *"Usando transações ACID com `this.prisma.$transaction` no `EmprestimoPrismaWriteRepository`. Tanto o `update` na tabela `web2_A1_emprestimos` quanto o `create` na tabela `web2_A3_historico_emprestimos` usam o mesmo objeto transacional `tx`. Se o banco falhar ao gravar o histórico, ele faz rollback automático da mudança de status."*

### Pergunta 5: *"Por que você usou Lazy Evaluation em vez de um cron job ou `setInterval` para expirar reservas?"*
* **Resposta:**  
  *"Um `setInterval` em memória ou cron externo morre se o servidor reiniciar, consome conexões o tempo todo mesmo sem uso e pode gerar corrida de concorrência se houver mais de uma instância. Com `processarExpiracoesLazy()` rodando dentro de uma transação ACID antes das operações críticas (como `criarReserva` e `retirar`), a expiração das 48h acontece sob demanda de forma exata e atômica."*

### Pergunta 6: *"Como você evitou que dois usuários reservassem o mesmo item ao mesmo tempo?"*
* **Resposta:**  
  *"No `CriarReservaService.execute()`, logo após limpar reservas vencidas com `processarExpiracoesLazy()`, eu chamo `readRepo.verificarDisponibilidadeItem(request.tituloItem)`. Ele busca se existe algum registro com aquele título nos estados ativos (`RESERVADO`, `RETIRADO` ou `ATRASADO`). Se existir, bloqueia a criação com HTTP 422."*

### Pergunta 7: *"Como funciona o bloqueio de usuários com atraso e por que não criou uma tabela de Usuários?"*
* **Resposta:**  
  *"Uma flag estática `bloqueado = true/false` numa tabela de usuários exigiria sincronização constante e correria risco de ficar desatualizada quando um prazo vencesse. Eu preferi uma checagem dinâmica em tempo real (`verificarBloqueioUsuario`): na hora de reservar, o repositório verifica se aquele nome tem algum empréstimo `ATRASADO` ou `RETIRADO` com `dataPrevistaDevolucao < agora`. Se tiver, barra na hora."*

### Pergunta 8: *"Como você conectou ao PostgreSQL da faculdade sem apagar os trabalhos de outras disciplinas?"*
* **Resposta:**  
  *"Antes de rodar qualquer push, fiz `npx prisma db pull --print` para inspecionar o schema compartilhado `bi3041271`. Mantive os modelos já existentes (`Ticket` mapeado para `tickets`, além dos enums `Prioridade` e `Status`) no `schema.prisma`, adicionei prefixos nas tabelas deste projeto (`web2_A1_emprestimos` e `web2_A3_historico_emprestimos`) e executei `prisma db push` sem `--force-reset`."*

### Pergunta 9: *"Por que separar `use-case/` e `service/`, e `read` e `write` na camada de aplicação?"*
* **Resposta:**  
  *"Isso aplica dois princípios: **Inversão de Dependência** (o controller injeta a interface do `use-case/` por token, não a implementação concreta do `service/`) e **CQRS** (separar operações que apenas leem dados das operações que alteram estado e geram auditoria ACID)."*

### Pergunta 10: *"Por que usar Server Actions e CSS Modules no Next.js em vez de `fetch` direto no browser e Tailwind inline?"*
* **Resposta:**  
  *"Com Server Actions (`'use server'` em `emprestimo.actions.ts`), a chamada à API do NestJS acontece no servidor Next.js, evitando expor rotas internas e permitindo revalidar o cache da página automaticamente via `revalidatePath`. Já o `emprestimos.module.css` resolveu a poluição visual e garantiu `table-layout: fixed` com larguras percentuais somando 100%, zerando o scroll horizontal."*

---

## 🛠️ 6. Cheat Sheet para Alterações ao Vivo

Se o professor pedir: *"Gabriel, altera tal regra ou valor agora para eu ver funcionando"*:

### Cenário A: Mudar ou liberar uma transição na Máquina de Estados
1. Abra `ppw_test_server/src/module/emprestimos/domain/value-objects/status-emprestimo.value-object.ts`.
2. Localize a constante `TRANSICOES_VALIDAS_FSM` (linhas 18–38).
3. Adicione ou remova o estado desejado no array correspondente e salve.

### Cenário B: Alterar os valores ou faixas da multa progressiva
1. Abra `ppw_test_server/src/module/emprestimos/domain/services/calculadora-multa.service.ts`.
2. No método `calcular()`, ajuste os multiplicadores (`2.0`, `3.5`, `5.0`) ou os limites de dias (`3`, `4`, `7`).

### Cenário C: Alterar o prazo de expiração da reserva (atualmente 48h)
1. Abra `ppw_test_server/src/module/emprestimos/domain/entity/emprestimo.entity.ts`.
2. No método `createReserva()`, altere o parâmetro padrão `ttlHorasRetirada: number = 48` para o novo valor em horas (ex: `24` ou `72`).

### Cenário D: Alterar o prazo de devolução após a retirada (atualmente 7 dias)
1. Abra `ppw_test_server/src/module/emprestimos/domain/entity/emprestimo.entity.ts`.
2. No método `registrarRetirada()` (e em `renovarPrazo()` se aplicável), altere `+ 7` na linha `dataPrevista.setDate(agora.getDate() + 7)`.
