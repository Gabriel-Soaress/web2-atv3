# 🧠 Resumo Didático: Máquina de Estados Finita (FSM) e Transições Restritas

> **Tema da Atividade 3:** Controle de Empréstimo de Livros / Equipamentos Internos  
> **Autor da Consulta:** Gabriel Soares Pedrosa (`bi3041271`)  
> **Artefato Gerado pelo Agente:** Pesquisa Teórica e Aplicação Prática

---

## 1. O que é uma Máquina de Estados Finita (FSM)?

Na ciência da computação, uma **Máquina de Estados Finita (Finite State Machine - FSM)** é um modelo matemático de computação que descreve o comportamento de um sistema através de um número fixo (finito) de estados possíveis.

O sistema:
1. Encontra-se em **apenas um único estado por vez** (chamado de *estado atual*).
2. Só pode mudar de estado através de **eventos ou ações bem definidas** (chamadas de *transições*).
3. Não permite "saltar" diretamente para qualquer estado sem passar pelo caminho pré-estabelecido.

---

## 2. O Problema do CRUD Tradicional (`PUT`) na Web

No modelo CRUD básico (Create, Read, Update, Delete):
- O status de uma entidade é frequentemente exposto como uma coluna qualquer no banco (`status: string`).
- O endpoint tradicional costuma ser: `PUT /emprestimos/:id` recebendo `{ status: 'DEVOLVIDO' }`.

### Por que isso é uma falha grave na prática?
1. **Quebra do Fluxo de Negócio:** Qualquer pessoa que intercepte a requisição ou envie uma chamada direta via Postman consegue alterar um livro de `RESERVADO` direto para `DEVOLVIDO`, sem que o livro jamais tenha saído da prateleira.
2. **Perda de Regras e Efeitos Colaterais:** Em um sistema corporativo real, a transição de estado desencadeia regras acessórias (calcular prazo, gerar multa, descontar estoque, enviar notificação). Se o status é simplesmente alterado via `PUT`, essas regras são ignoradas.

---

## 3. Aplicação no nosso Sistema de Empréstimos (Tema 08)

Definimos formalmente os estados e as transições do ciclo de vida:

| Estado Atual | Transições Válidas Permitidas | Ação que Dispara |
| :--- | :--- | :--- |
| `RESERVADO` | `RETIRADO`, `CANCELADO`, `EXPIRADO` | `retirar()`, `cancelar()`, *Lazy Expiration* |
| `RETIRADO` | `DEVOLVIDO`, `DEVOLVIDO_COM_MULTA`, `ATRASADO` | `devolver()`, detecção de prazo |
| `ATRASADO` | `DEVOLVIDO`, `DEVOLVIDO_COM_MULTA` | `devolver()` com quitação de multa |
| `DEVOLVIDO` | *(Nenhuma - Estado Terminal)* | — |
| `DEVOLVIDO_COM_MULTA` | *(Nenhuma - Estado Terminal)* | — |
| `EXPIRADO` | *(Nenhuma - Estado Terminal)* | — |
| `CANCELADO` | *(Nenhuma - Estado Terminal)* | — |

---

## 4. Como Implementar com Clean Architecture

1. **Domínio Puro:** Criar uma classe Value Object (`StatusEmprestimo`) com a matriz imutável de transições no coração da aplicação, sem dependências de framework web ou ORM.
2. **Métodos Semânticos na Entidade:** Em vez de `setStatus()`, a entidade possui `registrarRetirada()`, `registrarDevolucao()`, `cancelarReserva()`.
3. **Exceção de Domínio Semântica:** Caso ocorra uma tentativa inválida, o sistema deve responder com **HTTP 422 Unprocessable Entity** (e não HTTP 400), informando claramente quais eram os únicos estados válidos permitidos para aquele momento.
