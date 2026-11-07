# 📋 Plano 01: Migração da ATV2 e Conexão Segura ao PostgreSQL

> **Etapa:** 01 do Plano Geral  
> **Branch Git:** `feature/database-postgres`

---

## 1. Escopo da Tarefa
- Clonar o código de `atvs avaliativas/atv2` (cliente e servidor) para `atvs avaliativas/atv3`.
- Apontar o `.env` do backend para a URL do PostgreSQL institucional:
  `postgresql://bi3041271:BI3041271@10.102.55.11:5432/postgres?schema=bi3041271`.
- Sincronizar os esquemas sem apagar tabelas de outras disciplinas do mesmo schema.

## 2. A Proposta Inicial do Agente
- Rodar `npx prisma db push --force-reset`.

## 3. O que Gabriel Questionou
- Gabriel estranhou o `--force-reset` e alertou: *"Esse schema é o meu oficial da faculdade e já tem tabelas de outros trabalhos meus (como a tabela `tickets`). Se der reset não vai apagar tudo que já entreguei? Como fazemos pra sincronizar sem apagar o que já tá lá?"*

## 4. Decisão e Passos Executados
1. Executar `npx prisma db pull --print` para inspecionar o schema compartilhado.
2. Manter a modelagem de `tickets`, `Prioridade` e `Status` no `schema.prisma`.
3. Adicionar mapeamento de namespace: `web2_A1_emprestimos` e `web2_A3_historico_emprestimos`.
4. Executar `npx prisma db push` com segurança (sem reset).
5. Validar conexão com script de teste.
