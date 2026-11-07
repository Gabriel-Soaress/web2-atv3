# 🧠 Resumo Didático: Conflitos Assíncronos e Expiração Automática por Lazy Evaluation

> **Tema da Atividade 3:** Controle de Empréstimo de Livros / Equipamentos Internos  
> **Autor da Consulta:** Gabriel Soares Pedrosa (`bi3041271`)  
> **Artefato Gerado pelo Agente:** Pesquisa Teórica e Aplicação Prática

---

## 1. O Problema da Concorrência Assíncrona na Web

A web opera em um ambiente altamente distribuído e concorrente. Várias requisições chegam ao servidor de forma paralela e assíncrona.

### Exemplo de Conflito de Reserva (Race Condition / TOCTOU):
1. **Instante T0:** Existem apenas 1 exemplar de um livro de cálculo disponível.
2. **Instante T1:** O Usuário A envia uma requisição para reservar o livro. O sistema consulta o banco e vê que está disponível.
3. **Instante T2 (milissegundos depois):** O Usuário B envia uma requisição para reservar o mesmo livro. O sistema também consulta e vê disponível (pois A ainda não terminou de gravar).
4. **Instante T3:** O sistema grava a reserva de A.
5. **Instante T4:** O sistema grava a reserva de B.
- **Resultado:** Double-booking (reserva duplicada do mesmo recurso físico).

---

## 2. A Expiração de Reservas (TTL - Time to Live)

Para evitar que usuários reservem livros e nunca compareçam para retirá-los (travando o acervo), estabelece-se uma janela de tolerância de **48 horas** (`dataLimiteRetirada`). Após esse período, a reserva deve mudar para `EXPIRADO`.

### A Solução Frágil (Cron Job ou setInterval no Node.js):
- Rodar um cron no servidor ou um `setInterval(() => { ... }, 60000)` no código.
- **Por que é ruim?**
  1. Se o servidor for reiniciado, o timer morre.
  2. Em ambientes de nuvem ou instâncias escaladas (cluster), vários timers concorrem no banco de dados gerando deadlocks.
  3. Desperdiça CPU e conexões de banco em momentos em que ninguém está usando o sistema.

---

## 3. O Padrão de Lazy Evaluation (Avaliação Preguiçosa / Just-in-Time)

Em vez de monitorar ativamente a cada segundo com um timer em background, o sistema utiliza o conceito de **Lazy Evaluation**:
- A expiração é calculada **sob demanda (Just-in-Time)**, exatamente quando algum usuário acessa o sistema.
- Toda vez que a listagem de empréstimos é consultada ou alguém tenta reservar um novo item, o repositório dispara uma query atômica:
  ```sql
  UPDATE web2_A1_emprestimos 
  SET status = 'EXPIRADO' 
  WHERE status = 'RESERVADO' AND data_limite_retirada < NOW();
  ```
- **Vantagens:**
  - Zero dependência de cron jobs ou daemons externos no sistema operacional.
  - Zero consumo de CPU quando o sistema está ocioso.
  - Dados garantidamente 100% atualizados no instante exato em que são lidos.
