# 🎓 Guia Definitivo de Estudos para Arguição Oral (PPW II)

> **Projeto:** 08 - Controle de Empréstimo de Livros / Equipamentos Internos  
> **Aluno:** Gabriel Soares Pedrosa (`bi3041271`)  
> **Banco Oficial:** PostgreSQL (`10.102.55.11:5432`, schema `bi3041271`)  
> **Objetivo deste documento:** Seu roteiro prático e mental para sentar no laboratório com o professor, defender o código com segurança, responder perguntas conceituais e fazer alterações ao vivo.

---

## 🎙️ 1. O Pitch Inicial de 60 Segundos (Como Iniciar a Apresentação)

Se o professor disser: *"Gabriel, me explica o que você fez aqui na Atividade 3"*, use este roteiro:

> *"Professor, o objetivo da Atividade 3 foi transformar o CRUD básico da Atividade 2 em um sistema corporativo real e resiliente conectado ao PostgreSQL da faculdade. Para isso, atuei em 4 pilares principais:*
> 1. *Substituí a edição solta de status por uma **Máquina de Estados Finita (FSM)** no Domínio, onde o status só muda por eventos de negócio (`retirar()`, `devolver()`, `cancelar()`), bloqueando qualquer salto inválido com **HTTP 422**.*
> 2. *Implementei **Rastreabilidade e Trilha de Auditoria (Audit Log)** com persistência atômica via **transações ACID** do Prisma.*
> 3. *Resolvi o problema de concorrência e expiração automática de reservas usando o padrão de **Lazy Evaluation (Avaliação Preguiçosa)** dentro de transações de banco, sem depender de cron jobs externos instáveis.*
> 4. *Implementei o **cálculo progressivo de multas e bloqueio automático** de usuários para devoluções fora do prazo.*
> *Tudo foi documentado no `AI-LOG.md` mostrando onde a IA deu respostas simplistas e como refatorei para a arquitetura limpa."*

---

## 🗺️ 2. O Mapa de Onde as Coisas Estão no Código

Quando você abrir o VS Code no laboratório, tenha esses arquivos na ponta da língua:

| O que você quer mostrar | Onde está o arquivo (Caminho) | O que tem dentro |
| :--- | :--- | :--- |
| **A Máquina de Estados (FSM)** | `src/module/emprestimos/domain/value-objects/status-emprestimo.value-object.ts` | A matriz `TRANSICOES_VALIDAS_FSM` e a guarda de transição |
| **As Regras de Domínio / Eventos** | `src/module/emprestimos/domain/entity/emprestimo.entity.ts` | Os métodos `registrarRetirada()`, `registrarDevolucao()`, `cancelarReserva()` |
| **A Calculadora de Multa Progressiva** | `src/module/emprestimos/domain/services/calculadora-multa.service.ts` | Faixas de cobrança por dia de atraso |
| **A Exceção Semântica (422)** | `src/module/emprestimos/domain/exceptions/transicao-invalida.exception.ts` | A classe que gera o erro HTTP 422 com os estados válidos |
| **Os Endpoints Semânticos** | `src/module/emprestimos/presentation/emprestimos.controller.ts` | Rotas REST orientadas a ações (`POST :id/retirar`, `POST :id/devolver`) |
| **As Transações ACID e Audit Log** | `src/module/emprestimos/infrastructure/adapters/emprestimo.prisma.write.repository.ts` | O bloco `this.prisma.$transaction` com update e insert do log |
| **O Schema do PostgreSQL** | `prisma/schema.prisma` | Tabelas `web2_A1_emprestimos` e `web2_A3_historico_emprestimos` |
| **O Seeding de Dados de Demonstração** | `prisma/seed.ts` | 6 cenários realistas populados com histórico |

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
  *"HTTP 400 indica erro de sintaxe (como JSON malformado ou tipo de dado errado). Já o HTTP 422 indica que a sintaxe estava perfeita, mas a requisição não pôde ser processada devido a uma violação de regra semântica de negócio do domínio."*

### Pergunta 4: *"O que é a Transação ACID no Audit Log?"*
* **Sua Resposta:**  
  *"ACID garante Atomicidade, Consistência, Isolamento e Durabilidade. Usamos o `$transaction` do Prisma para atualizar o status do empréstimo e inserir o registro na tabela de auditoria no mesmo commit. Se a gravação do log falhar, o status do empréstimo sofre rollback automático. Não existe a possibilidade de alterar status sem log."*

### Pergunta 5: *"Como você resolveu a expiração de reserva sem cron job externo?"* (O Desafio do Tema 08)
* **Sua Resposta:**  
  *"Usei o padrão de **Lazy Evaluation (Avaliação Preguiçosa ou Just-In-Time)**. Timers como `setInterval` no Node.js são frágeis porque morrem quando o servidor reinicia e conflitam se houver múltiplas instâncias. No padrão Lazy, sempre que alguém tenta fazer uma nova reserva, consultar ou listar itens, o backend roda uma query atômica no banco expirando reservas cujo prazo limite venceu (`dataReserva + TTL < agora`), liberando o recurso no exato momento da necessidade."*

### Pergunta 6: *"Como funciona a regra da multa progressiva e o bloqueio de usuário?"*
* **Sua Resposta:**  
  *"A progressividade está isolada no `CalculadoraMultaService`: até 3 dias de atraso cobramos R$ 2,00/dia; de 4 a 7 dias, R$ 3,50/dia; e acima do 8º dia, R$ 5,00/dia. Além disso, antes de criar qualquer nova reserva, o serviço de domínio `verificarBloqueioUsuario` consulta se o usuário possui empréstimos pendentes em status ATRASADO. Se possuir, a reserva é rejeitada com HTTP 422 até que ele devolva e regularize as pendências."*

---

## ⚡ 4. Guia de Alteração ao Vivo (Se o professor mandar mudar algo na hora)

### Desafio ao vivo 1: *"Adicione um novo estado 'EM_MANUTENCAO' que pode ser acionado a partir de RETIRADO"*
1. Abra: `src/module/emprestimos/domain/value-objects/status-emprestimo.value-object.ts`
2. No enum `StatusEmprestimoEnum`, adicione: `EM_MANUTENCAO = 'EM_MANUTENCAO',`
3. Na constante `TRANSICOES_VALIDAS_FSM`, procure a chave `[StatusEmprestimoEnum.RETIRADO]` e adicione `StatusEmprestimoEnum.EM_MANUTENCAO` dentro do array.
4. Salve e mostre para ele. Demora menos de 15 segundos!

### Desafio ao vivo 2: *"Permita que uma reserva seja cancelada também se estiver ATRASADA"*
1. Abra: `src/module/emprestimos/domain/value-objects/status-emprestimo.value-object.ts`
2. Procure `[StatusEmprestimoEnum.ATRASADO]` na matriz e adicione `StatusEmprestimoEnum.CANCELADO` no array.
3. Pronto!

### Desafio ao vivo 3: *"Altere a taxa da multa para R$ 10,00 por dia após o 8º dia"*
1. Abra: `src/module/emprestimos/domain/services/calculadora-multa.service.ts`
2. Na Faixa 3 (linha ~45), altere `valorFaixa3 = diasFaixa3 * 5.0` para `* 10.0`.
3. Salve e execute a devolução de um item atrasado na interface!

---

## 📋 5. Status da Documentação e Entrega

- [x] **README.md**: DER completo em Mermaid, diagrama da FSM em Mermaid e instruções de execução.
- [x] **AI-LOG.md / docs/ai-decisions.md**: 5 registros técnicos nos 4 blocos da rubrica oficial.
- [x] **docs/guia_estudo_oral.md**: Este guia completo para sua arguição.
- [x] **Multi-Branches no GitHub**: 5 branches com histórico de commits atômicos e merges progressivos.
- [x] **PostgreSQL Conectado**: Banco oficial `10.102.55.11:5432` populado e validado.
