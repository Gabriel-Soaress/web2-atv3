# 📋 Plano 02: Máquina de Estados Finita (FSM) no Domínio

> **Etapa:** 02 do Plano Geral  
> **Branch Git:** `feature/fsm-maquina-estados`

---

## 1. Escopo da Tarefa
- Eliminar o endpoint `PUT /emprestimos/:id` com status arbitrário.
- Modelar o ciclo de vida restrito dos empréstimos: `RESERVADO -> RETIRADO -> DEVOLVIDO` (e variações com multa, atraso, cancelamento e expiração).
- Responder com **HTTP 422 Unprocessable Entity** em caso de tentativa de salto inválido.

## 2. A Proposta Inicial do Agente
- Manter o `PUT` e colocar blocos `if/else` dentro da Controller, lançando `BadRequestException` (HTTP 400).

## 3. O que Gabriel Questionou
- *"Mas peraí, se a gente colocar esse monte de `if` na Controller, não vai bagunçar a Controller inteira e violar o que o professor falou de deixar as regras no Domínio? E esse erro 400 aí, não tem um código HTTP mais específico pra quando a sintaxe do JSON tá certa, mas a regra de negócio não permite a ação? Como a gente faria isso direto no Domínio?"*

## 4. Decisão e Passos Executados
1. Criar o Value Object `StatusEmprestimo` com a matriz imutável `TRANSICOES_VALIDAS_FSM` na camada de Domínio.
2. Criar a exceção de domínio `TransicaoInvalidaException` mapeada para HTTP 422.
3. Adicionar métodos de negócio explícitos na entidade `Emprestimo` (`registrarRetirada()`, `registrarDevolucao()`, `cancelarReserva()`).
4. Criar rotas semânticas POST na Controller: `/retirar`, `/devolver`, `/renovar`, `/cancelar`.
