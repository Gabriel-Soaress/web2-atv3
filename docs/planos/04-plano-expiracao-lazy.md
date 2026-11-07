# 📋 Plano 04: Concorrência e Expiração Automática por Lazy Evaluation

> **Etapa:** 04 do Plano Geral  
> **Branch Git:** `feature/multas-expiracao-lazy`

---

## 1. Escopo da Tarefa
- Automatizar a expiração de reservas cujo prazo de retirada de 48 horas (`dataLimiteRetirada`) foi ultrapassado.
- Mudar o status de `RESERVADO` para `EXPIRADO` sem depender de cron jobs ou daemons no Linux.

## 2. A Proposta Inicial do Agente
- Criar um `setInterval` no `main.ts` rodando a cada 60 segundos no processo Node.js.

## 3. O que Gabriel Questionou
- *"Mas esse setInterval aí não fica rodando no servidor gastando memória e processamento direto mesmo quando ninguém tiver usando o sistema? E se o servidor reiniciar ou a gente subir outra instância da aplicação, não vai dar conflito de timers no banco? No texto o professor comentou sobre avaliar sob demanda, como seria isso?"*

## 4. Decisão e Passos Executados
1. Implementar o padrão *Lazy Evaluation* no repositório de persistência.
2. Criar o método privado `expirarReservasVencidas()` com `updateMany` transacional.
3. Invocar a checagem sob demanda no momento em que qualquer leitura de lista ou tentativa de alocação de item é solicitada.
