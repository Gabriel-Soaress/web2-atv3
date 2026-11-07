# 🧠 Resumo Didático: Rastreabilidade e Trilha de Auditoria (Audit Log)

> **Tema da Atividade 3:** Controle de Empréstimo de Livros / Equipamentos Internos  
> **Autor da Consulta:** Gabriel Soares Pedrosa (`bi3041271`)  
> **Artefato Gerado pelo Agente:** Pesquisa Teórica e Aplicação Prática

---

## 1. O que é uma Trilha de Auditoria (Audit Log)?

Uma **Trilha de Auditoria (Audit Log)** é um registro cronológico, sequencial e **imutável** (somente inserção / append-only) de todas as operações e mudanças de estado ocorridas sobre dados críticos de um sistema.

Diferente de logs de aplicação comuns (que registram erros em arquivos `.log`), o Audit Log é parte integrante do modelo de dados do negócio e responde a 5 perguntas fundamentais:
1. **O quê?** (Qual atributo mudou: status anterior ➔ novo status)
2. **Quem?** (Qual usuário, atendente ou serviço disparou a transição)
3. **Quando?** (Timestamp exato com data, hora e milissegundos)
4. **Por quê?** (Justificativa, motivo do cancelamento, laudo de avaria ou registro de pagamento)
5. **Sobre qual recurso?** (ID do empréstimo referenciado)

---

## 2. Por que um `UPDATE` no Banco é Inadequado para Auditoria?

Em um banco relacional, o comando:
```sql
UPDATE web2_A1_emprestimos SET status = 'DEVOLVIDO' WHERE id = '...';
```
apaga fisicamente o valor anterior da coluna.

### Consequências:
- Perde-se a memória temporal: não se sabe há quantos dias o livro estava atrasado antes de ser devolvido.
- Impossibilita prestação de contas (compliance): se um usuário alegar que nunca cancelou uma reserva, não há como provar qual atendente realizou a operação.
- Fraudes e disputas: o histórico anterior simplesmente deixa de existir.

---

## 3. Aplicação com Atomicidade e Consistência ACID

Para que a auditoria seja confiável, ela precisa respeitar as propriedades **ACID** (Atomicidade, Consistência, Isolamento e Durabilidade):
- Se o empréstimo mudar de status, o log **precisa obrigatoriamente ser gravado**.
- Se a gravação do log falhar por qualquer motivo (queda de conexão, violação de chave, etc.), o status do empréstimo **deve sofrer rollback imediato**.

### Solução Técnica no Prisma:
Usar `prisma.$transaction(async (tx) => { ... })`:
```typescript
return this.prisma.$transaction(async (tx) => {
  // 1. Atualiza o status do empréstimo
  const updated = await tx.web2_A1_emprestimos.update({ ... });

  // 2. Insere a entrada histórica imutável
  await tx.web2_A3_historico_emprestimos.create({ ... });

  return updated;
});
```
Se qualquer uma das duas operações falhar, o banco desfaz ambas.
