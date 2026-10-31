# 🎓 Guia Definitivo de Estudos para Arguição Oral (PPW II)

> **Projeto:** 08 - Controle de Empréstimo de Livros / Equipamentos Internos  
> **Aluno:** Gabriel Soares Pedrosa (`bi3041271`)  
> **Objetivo deste documento:** Seu roteiro prático e mental para sentar no laboratório com o professor, defender o código com segurança, responder perguntas conceituais e fazer alterações ao vivo.

---

## 🎙️ 1. O Pitch Inicial de 60 Segundos (Como Iniciar a Apresentação)

Se o professor disser: *"Gabriel, me explica o que você fez aqui na Atividade 3"*, use este roteiro:

> *"Professor, o objetivo da Atividade 3 foi transformar o CRUD básico da Atividade 2 em um sistema corporativo real e resiliente. Para isso, atuei em 4 pilares principais:*
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
| **A Exceção Semântica (422)** | `src/module/emprestimos/domain/exceptions/transicao-invalida.exception.ts` | A classe que gera o erro HTTP 422 com os estados válidos |
| **Os Endpoints Semânticos** | `src/module/emprestimos/presentation/emprestimos.controller.ts` | Rotas REST orientadas a ações (`POST :id/retirar`, `POST :id/devolver`) |
| **A Orquestração e Repositório** | `src/module/emprestimos/application/service/write/operacoes-emprestimo.service.ts` | Onde os métodos da entidade são chamados e salvos no banco |
| **O Schema do Banco** | `prisma/schema.prisma` | Tabelas `Emprestimo` e `HistoricoEmprestimo` (Audit Log) |

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

### Pergunta 4: *"O que é a Transação ACID no Audit Log?"* (Fase 2)
* **Sua Resposta:**  
  *"ACID garante Atomicidade, Consistência, Isolamento e Durabilidade. Usamos o `$transaction` do Prisma para atualizar o status do empréstimo e inserir o registro na tabela de auditoria no mesmo commit. Se a gravação do log falhar, o status do empréstimo sofre rollback automático. Não existe a possibilidade de alterar status sem log."*

### Pergunta 5: *"Como você resolveu a expiração de reserva sem cron job externo?"* (Fase 3 - O Desafio do Tema 08)
* **Sua Resposta:**  
  *"Usei o padrão de **Lazy Evaluation (Avaliação Preguiçosa ou Just-In-Time)**. Timers como `setInterval` no Node.js são frágeis porque morrem quando o servidor reinicia e conflitam se houver múltiplas instâncias. No padrão Lazy, sempre que alguém tenta fazer uma nova reserva, consultar ou listar itens, o backend roda uma query atômica no banco expirando reservas cujo prazo limite venceu (`dataReserva + TTL < agora`), liberando o recurso no exato momento da necessidade."*

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

---

## 📋 5. Status Atual da Documentação

- [x] **AI-LOG.md / docs/ai-decisions.md**: Contém os 3 desafios conceituais iniciais com prompt, resposta e crítica/refatoração.
- [x] **docs/guia_estudo_oral.md**: Este guia completo para sua arguição.
- [ ] **docs/relatorio-ai-final.md / README.md**: Diagrama DER e diagrama Mermaid (será gerado na Fase 5).
