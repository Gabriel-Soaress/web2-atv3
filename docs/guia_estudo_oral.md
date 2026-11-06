# 🎓 Guia Definitivo de Estudos para Arguição Oral (PPW II)

> **Projeto:** 08 - Controle de Empréstimo de Livros / Equipamentos Internos  
> **Aluno:** Gabriel Soares Pedrosa (`bi3041271`)  
> **Banco Oficial:** PostgreSQL (`10.102.55.11:5432`, schema `bi3041271`)  
> **Objetivo deste documento:** Seu roteiro prático e mental para sentar no laboratório com o professor, defender o código com segurança, responder perguntas conceituais e demonstrar liderança arquitetural.

---

## 🎙️ 1. O Pitch Inicial de 60 Segundos (Como Iniciar a Apresentação)

Se o professor disser: *"Gabriel, me explica o que você fez aqui na Atividade 3"*, use este roteiro:

> *"Professor, o objetivo da Atividade 3 foi evoluir o CRUD básico da Atividade 2 para um sistema corporativo resiliente e auditável conectado ao PostgreSQL institucional da faculdade. Para conduzir esse desenvolvimento, assumi o papel de líder técnico e arquiteto de software em pair programming com um agente de IA (Antigravity), estabelecendo governança estrita e memória de contexto na pasta `brain`.*
> 
> *Tecnicamente, atuei em 5 frentes principais:*
> 1. *Migrei a base da Atividade 2 preservando com segurança as tabelas legadas do meu schema (`tickets`), sem rodar comandos destrutivos.*
> 2. *Substituí a edição solta de status por uma **Máquina de Estados Finita (FSM)** no Domínio, onde o status só muda por eventos semânticos (`retirar()`, `devolver()`, `renovar()`, `cancelar()`), bloqueando qualquer salto ilógico com **HTTP 422 Unprocessable Entity**.*
> 3. *Implementei uma **Trilha de Auditoria (Audit Log)** com persistência atômica via **transações ACID** do Prisma.*
> 4. *Resolvi a concorrência e a expiração automática de reservas usando **Lazy Evaluation (Avaliação Preguiçosa / Just-in-Time)** no banco, sem depender de timers ou cron jobs externos instáveis.*
> 5. *Modelei o **cálculo progressivo de multas por faixas de atraso** com bloqueio dinâmico para novos empréstimos de usuários inadimplentes.*
> 
> *Toda essa governança técnica e as refatorações que fiz sobre as propostas iniciais da IA estão registradas em 7 casos no `AI-LOG.md`."*

---

## 🗺️ 2. O Mapa de Onde as Coisas Estão no Código

Quando você abrir o VS Code no laboratório, tenha esses arquivos na ponta da língua:

| O que você quer mostrar | Onde está o arquivo (Caminho) | O que tem dentro |
| :--- | :--- | :--- |
| **A Máquina de Estados (FSM)** | `src/module/emprestimos/domain/value-objects/status-emprestimo.value-object.ts` | A matriz `TRANSICOES_VALIDAS_FSM` e a guarda de transição |
| **As Regras de Domínio / Eventos** | `src/module/emprestimos/domain/entity/emprestimo.entity.ts` | Os métodos `registrarRetirada()`, `registrarDevolucao()`, `renovarEmprestimo()`, `cancelarReserva()` |
| **A Calculadora de Multa Progressiva** | `src/module/emprestimos/domain/services/calculadora-multa.service.ts` | Faixas de cobrança escalonadas por dia de atraso |
| **A Exceção Semântica (422)** | `src/module/emprestimos/domain/exceptions/transicao-invalida.exception.ts` | A classe que gera o erro HTTP 422 listando os estados válidos |
| **Os Endpoints Semânticos** | `src/module/emprestimos/presentation/emprestimos.controller.ts` | Rotas REST orientadas a ações (`POST :id/retirar`, `POST :id/devolver`, etc.) |
| **As Transações ACID e Audit Log** | `src/module/emprestimos/infrastructure/adapters/emprestimo.prisma.write.repository.ts` | O bloco `this.prisma.$transaction` com update e insert atômico do log |
| **O Schema do PostgreSQL** | `prisma/schema.prisma` | Tabelas `web2_A1_emprestimos` e `web2_A3_historico_emprestimos` + entidades legadas |
| **O Seeding de Demonstração** | `prisma/seed.ts` | 6 cenários realistas cobrindo todos os estados da FSM |
| **O Relatório Crítico de IA** | `AI-LOG.md` | 7 registros documentando governança, setup do PostgreSQL, FSM, ACID, multas e UI |

---

## 🎯 3. Simulador de Perguntas da Bancada (Q&A)

### Pergunta 1: *"Por que você removeu a alteração de status do PUT?"*
* **Sua Resposta:**  
  *"Porque em um sistema corporativo, status não é um atributo editável qualquer como nome ou título; ele representa uma fase de um processo de negócio. Se deixássemos o `PUT` alterar o status livremente, qualquer usuário com Postman ou inspecionando o formulário poderia mandar `{ status: 'DEVOLVIDO' }` em um livro que ainda estava como `RESERVADO`. A alteração de status só pode ocorrer através de eventos auditados."*

### Pergunta 2: *"O que acontece tecnicamente se eu tentar devolver um item que está apenas RESERVADO?"*
* **Sua Resposta:**  
  *"O sistema barra a operação antes mesmo de chamar o banco de dados. O método `registrarDevolucao()` na Entidade de Domínio invoca a guarda `this.props.status.validarTransicaoPara(...)`. A matriz da FSM detecta que `RESERVADO` não pode ir para `DEVOLVIDO` e dispara nossa `TransicaoInvalidaException`, que o NestJS entrega ao cliente como **HTTP 422 Unprocessable Entity**, listando inclusive quais eram os únicos estados válidos."*

### Pergunta 3: *"Por que HTTP 422 e não 400 Bad Request?"*
* **Sua Resposta:**  
  *"O HTTP 400 (Bad Request) indica que a sintaxe da requisição está corrompida (um JSON malformado, campo faltando). Já o HTTP 422 (Unprocessable Entity) indica que a sintaxe está perfeita e foi compreendida, mas as instruções contidas nela violam regras semânticas de negócio pré-estabelecidas no Domínio."*

### Pergunta 4: *"Como você garantiu que o log de auditoria nunca fica dessincronizado do status?"*
* **Sua Resposta:**  
  *"Através de transações atômicas no banco com `this.prisma.$transaction`. O `update` do empréstimo e o `create` na tabela `web2_A3_historico_emprestimos` rodam sob o mesmo contexto transacional ACID. Se qualquer uma das duas operações falhar, o banco executa um rollback completo e nenhuma alteração persiste pela metade."*

### Pergunta 5: *"Como funciona a expiração de reservas sem cron job?"*
* **Sua Resposta:**  
  *"Usamos o padrão de Lazy Evaluation (Avaliação Preguiçosa). Em vez de manter um timer gastando memória ou um cron job externo que pode falhar silenciosamente, toda vez que o repositório realiza uma busca ou tentativa de alocação, ele executa um `updateMany` atômico transacional que expira reservas cujo `dataLimiteRetirada < agora`. Isso garante consistência Just-in-Time com zero overhead ocioso."*

### Pergunta 6: *"Como você conectou ao PostgreSQL sem apagar dados de outros trabalhos?"*
* **Sua Resposta:**  
  *"Primeiro executei `prisma db pull --print` para inspecionar o schema compartilhado `bi3041271`. Mapeei as tabelas pré-existentes (`tickets`, etc.) dentro do `schema.prisma` e usei prefixos institucionais (`web2_A1_emprestimos` e `web2_A3_historico_emprestimos`). Em seguida rodei o `prisma db push` normal, sem `--force-reset`, preservando tudo o que já estava lá."*

---

## 🛠️ 4. Cheat Sheet para Alterações ao Vivo

Se o professor pedir: *"Gabriel, adicione uma regra ou mude um valor agora para testar"*:

### Cenário A: Adicionar um novo status ou permitir uma nova transição
1. Abra `src/module/emprestimos/domain/value-objects/status-emprestimo.value-object.ts`.
2. Vá na matriz `TRANSICOES_VALIDAS_FSM`.
3. Adicione o status desejado no array de transições permitidas.
4. Salve e teste pelo Postman/Swagger ou pela UI.

### Cenário B: Alterar o valor da multa por dia
1. Abra `src/module/emprestimos/domain/services/calculadora-multa.service.ts`.
2. Altere os valores de retorno das faixas (ex: de R$ 2.00 para R$ 3.00).
3. Salve. O NestJS com hot-reload já reflete o cálculo imediatamente.

### Cenário C: Alterar o tempo de tolerância para retirada da reserva
1. Abra `src/module/emprestimos/domain/entity/emprestimo.entity.ts`.
2. No método `criarReserva()`, mude `const HORAS_TOLERANCIA = 48` para o valor que ele pedir (ex: `24` ou `72`).
