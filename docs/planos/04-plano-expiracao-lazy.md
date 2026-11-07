# 📋 Plano 04: Concorrência e Expiração Automática por Lazy Evaluation

> **Etapa:** 04 do Plano Geral  
> **Branch Git:** `feature/multas-expiracao-lazy`

---

## 1. Escopo da Tarefa
- Automatizar a expiração de reservas cujo prazo de retirada de 48 horas (`dataLimiteRetirada`) foi ultrapassado.
- Mudar o status de `RESERVADO` para `EXPIRADO` sem depender de cron jobs ou daemons no Linux.

## 2. A Proposta Inicial do Agente
- Criar um `setInterval` no `main.ts` rodando a cada 60 segundos no processo Node.js.
- **Risco Identificado por Gabriel:** Timers morrem na reinicialização do servidor e geram concorrência desnecessária no banco em ambientes com réplicas.

## 3. Correção e Passos Executados
1. Implementar o padrão *Lazy Evaluation* no repositório de persistência.
2. Criar o método privado `expirarReservasVencidas()` com `updateMany` transacional.
3. Invocar a checagem sob demanda no momento em que qualquer leitura de lista ou tentativa de alocação de item é solicitada.
