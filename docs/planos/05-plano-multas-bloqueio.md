# 📋 Plano 05: Multas Progressivas e Bloqueio Preventivo

> **Etapa:** 05 do Plano Geral  
> **Branch Git:** `feature/multas-expiracao-lazy`

---

## 1. Escopo da Tarefa
- Implementar o cálculo progressivo de multas por faixas de atraso para devoluções fora do prazo.
- Bloquear sumariamente novas reservas para usuários que já possuam qualquer empréstimo em `ATRASADO`.

## 2. A Proposta Inicial do Agente
- Multiplicação linear (`dias * R$ 2,50`) e criação de coluna estática `bloqueado` na tabela de usuários.
- **Risco Identificado por Gabriel:** Ignorava a regra de escalonamento progressivo e criava dependência de sincronização manual de flags.

## 3. Correção e Passos Executados
1. Criar o serviço de domínio `CalculadoraMultaService` com 3 faixas progressivas:
   - 1º ao 3º dia: R$ 2,00 / dia
   - 4º ao 7º dia: R$ 3,50 / dia
   - 8º dia em diante: R$ 5,00 / dia (mais R$ 50 se houver avaria).
2. Adicionar o método `verificarBloqueioUsuario` no repositório com checagem dinâmica e recusa via HTTP 422.
3. Criar o script `prisma/seed.ts` populando 6 cenários representativos de teste no banco remoto.
