# 🧠 Resumo Didático: Multas Progressivas e Bloqueio Preventivo Dinâmico

> **Tema da Atividade 3:** Controle de Empréstimo de Livros / Equipamentos Internos  
> **Autor da Consulta:** Gabriel Soares Pedrosa (`bi3041271`)  
> **Artefato Gerado pelo Agente:** Pesquisa Teórica e Aplicação Prática

---

## 1. O Conceito de Penalidade Progressiva

Em serviços de empréstimo (bibliotecas públicas, centros universitários e locadoras de equipamentos), a multa por atraso tem dois objetivos fundamentais:
1. **Compensar o prejuízo** causado pelo impedimento de uso de outros interessados.
2. **Desincentivar ativamente o atraso prolongado**.

### Por que a multa NÃO deve ser linear simples (`dias * valor`)?
Se a multa fosse um valor fixo por dia (ex: R$ 2,00/dia constante):
- Ficar com o livro 1 dia a mais custa R$ 2,00.
- Ficar com o livro 30 dias a mais custa R$ 60,00 (um valor que o usuário pode achar cômodo pagar para "comprar" o uso do livro por um mês inteiro).

Na **multa progressiva por faixas**, o custo diário aumenta exponencialmente ou por degraus à medida que o tempo passa:
- **Faixa 1 (1º ao 3º dia de atraso):** R$ 2,00 / dia (tolerância inicial).
- **Faixa 2 (4º ao 7º dia de atraso):** R$ 3,50 / dia (penalidade moderada).
- **Faixa 3 (8º dia em diante):** R$ 5,00 / dia (penalidade severa para devolução urgente).
- **Avaria física:** Taxa fixa indenizatória de R$ 50,00 adicionada ao total.

---

## 2. Bloqueio Preventivo Dinâmico vs. Flag Estática

Ao devolver um livro com atraso, o usuário é penalizado financeiramente. Porém, enquanto o livro ainda **está em posse do usuário e com prazo vencido**, ele é considerado um usuário inadimplente com pendência ativa.

### O Risco da Flag Estática (`usuario.bloqueado = true`):
- Exigiria tabelas extras e rotinas de sincronização complexas. Se a flag falhar na desmarcação, o usuário fica bloqueado indevidamente mesmo após devolver.

### A Solução Dinâmica no Repositório (Domain Rule):
- Na tentativa de criar uma nova reserva ou retirada, o repositório consulta atomicamente:
  *"Existe algum empréstimo ativo no sistema com `status = 'ATRASADO'` vinculado a este usuário?"*
- Se a resposta for sim:
  - A operação é **bloqueada imediatamente**.
  - O sistema responde com **HTTP 422 Unprocessable Entity**, informando que novas reservas estão impedidas até a quitação da pendência pendente.
