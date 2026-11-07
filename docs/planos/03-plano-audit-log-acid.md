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
- **Risco Identificado por Gabriel:** Chamadas assíncronas soltas não formam transação atômica; falha na segunda chamada deixa o banco corrompido sem histórico.

## 3. Correção e Passos Executados
1. Adicionar o modelo `HistoricoEmprestimo` no `schema.prisma` com relação `1:N` e deleção em cascata.
2. Refatorar o repositório `EmprestimoPrismaWriteRepository` para envolver ambas as operações sob `this.prisma.$transaction(async (tx) => { ... })`.
3. Criar o endpoint de consulta `GET /emprestimos/:id/historico` para retornar a timeline cronológica.
