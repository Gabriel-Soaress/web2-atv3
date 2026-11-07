# 📋 Plano 05: Multas Progressivas e Bloqueio Preventivo

> **Etapa:** 05 do Plano Geral  
> **Branch Git:** `feature/multas-expiracao-lazy`

---

## 1. Escopo da Tarefa
- Implementar o cálculo progressivo de multas por faixas de atraso para devoluções fora do prazo.
- Bloquear sumariamente novas reservas para usuários que já possuam qualquer empréstimo em `ATRASADO`.

## 2. A Proposta Inicial do Agente
- Multiplicação linear (`dias * R$ 2,50`) e criação de coluna estática `bloqueado` na tabela de usuários.

## 3. O que Gabriel Questionou
- *"Mas no texto complementar o professor falou em multa progressiva, tipo quem atrasa mais dias paga mais caro a diária pra incentivar a devolver rápido, não foi? Multiplicar direto por 2,50 não fica linear demais? E pra bloquear o usuário, precisa mesmo criar uma tabela de usuário com coluna `bloqueado`? A gente não consegue só olhar no banco se aquele cara já tem algum empréstimo ativo com status atrasado?"*

## 4. Decisão e Passos Executados
1. Criar o serviço de domínio `CalculadoraMultaService` com 3 faixas progressivas:
   - 1º ao 3º dia: R$ 2,00 / dia
   - 4º ao 7º dia: R$ 3,50 / dia
   - 8º dia em diante: R$ 5,00 / dia (mais R$ 50 se houver avaria).
2. Adicionar o método `verificarBloqueioUsuario` no repositório com checagem dinâmica e recusa via HTTP 422.
3. Criar o script `prisma/seed.ts` populando 6 cenários representativos de teste no banco remoto.
