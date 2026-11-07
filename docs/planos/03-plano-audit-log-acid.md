# 📋 Plano 03: Trilha de Auditoria (Audit Log) com Transações ACID

> **Etapa:** 03 do Plano Geral  
> **Branch Git:** `feature/audit-log-acid`

---

## 1. Escopo da Tarefa
- Criar a tabela imutável `web2_A3_historico_emprestimos` para persistir o histórico de eventos.
- Garantir que cada transição de estado registre: `id`, `emprestimoId`, `statusAnterior`, `statusNovo`, `alteradoPor`, `motivo`, `timestamp`.
- Garantir atomicidade com rollback total caso o log falhe.

## 2. A Proposta Inicial do Agente
- Executar `await prisma.emprestimo.update(...)` seguido de `await prisma.historico.create(...)`.

## 3. O que Gabriel Questionou
- *"Mas e se der pau na internet ou no banco bem na hora que for salvar o histórico? O empréstimo vai ter mudado de status e o histórico vai ficar faltando? Não tem como garantir que ou salva os dois juntos ou não salva nenhum? No texto falava sobre propriedades ACID, como a gente aplica isso no Prisma?"*

## 4. Decisão e Passos Executados
1. Adicionar o modelo `HistoricoEmprestimo` no `schema.prisma` com relação `1:N` e deleção em cascata.
2. Refatorar o repositório `EmprestimoPrismaWriteRepository` para envolver ambas as operações sob `this.prisma.$transaction(async (tx) => { ... })`.
3. Criar o endpoint de consulta `GET /emprestimos/:id/historico` para retornar a timeline cronológica.
