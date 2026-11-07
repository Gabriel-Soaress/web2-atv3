# 📋 Plano 02: Máquina de Estados Finita (FSM) no Domínio

> **Etapa:** 02 do Plano Geral  
> **Branch Git:** `feature/fsm-maquina-estados`

---

## 1. Escopo da Tarefa
- Eliminar o endpoint `PUT /emprestimos/:id` com status arbitrário.
- Modelar o ciclo de vida restrito dos empréstimos: `RESERVADO -> RETIRADO -> DEVOLVIDO` (e variações com multa, atraso, cancelamento e expiração).
- Responder com **HTTP 422 Unprocessable Entity** em caso de tentativa de salto inválido.

## 2. A Proposta Inicial do Agente
- Manter o `PUT` e encher o método da Controller com blocos `if/else`, lançando `BadRequestException` (HTTP 400).
- **Risco Identificado por Gabriel:** Violação de Clean Architecture (regra vazando na Controller) e uso incorreto de código HTTP.

## 3. Correção e Passos Executados
1. Criar o Value Object `StatusEmprestimo` com a matriz imutável `TRANSICOES_VALIDAS_FSM` na camada de Domínio.
2. Criar a exceção de domínio `TransicaoInvalidaException` mapeada para HTTP 422.
3. Adicionar métodos de negócio explícitos na entidade `Emprestimo` (`registrarRetirada()`, `registrarDevolucao()`, `cancelarReserva()`).
4. Criar rotas semânticas POST na Controller: `/retirar`, `/devolver`, `/renovar`, `/cancelar`.
