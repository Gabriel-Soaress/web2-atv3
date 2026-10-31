# 🤖 Registro de Uso Pedagógico e Crítico de IA (AI-LOG)

> **Disciplina:** Programação Web II (PPW II)  
> **Tema 08:** Controle de Empréstimo de Livros / Equipamentos Internos  
> **Estudante:** Gabriel Soares Pedrosa (`bi3041271`)  
> **Repositório:** Atividade 3 (`atv3`)

Este documento atende às exigências metodológicas da Atividade Avaliativa 3, registrando os desafios de engenharia de software consultados, os prompts exatos submetidos à Inteligência Artificial, as respostas brutas obtidas e a análise crítica/refatoração realizada para adequação à arquitetura real do projeto.

---

## 📑 Registro 01: Máquina de Estados Finita (FSM) & Transições Restritas

### 1. O Desafio
O texto complementar da disciplina enfatiza que sistemas web corporativos não devem operar sob modelos CRUD ingênuos, onde qualquer usuário pode enviar um `PUT /pedidos/:id` com `{ "status": "entregue" }`. No nosso sistema de empréstimos, o status de um item não pode ser alterado de maneira arbitrária. Precisávamos modelar uma Máquina de Estados Finita (FSM) com transições orientadas a eventos (`retirar()`, `devolver()`, `cancelar()`, etc.) e guardas de transição que impeçam inconsistências lógicas (ex: tentar devolver um item que ainda está apenas como `RESERVADO`).

### 2. O Prompt Utilizado
```text
Como implementar o controle de status de empréstimos em uma API NestJS com Prisma, 
garantindo que o status não seja alterado livremente por formulário ou requisição PUT genérica, 
e que apenas transições válidas (como RESERVADO -> RETIRADO -> DEVOLVIDO) sejam aceitas?
```

### 3. A Resposta Bruta da IA
```typescript
// Sugestão inicial da IA (Controller & Service)
@Put(':id/status')
async updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
  const emprestimo = await this.prisma.emprestimo.findUnique({ where: { id } });
  
  if (body.status === 'DEVOLVIDO' && emprestimo.status !== 'RETIRADO') {
    throw new BadRequestException('Só pode devolver se estiver retirado');
  }
  
  return this.prisma.emprestimo.update({
    where: { id },
    data: { status: body.status }
  });
}
```

### 4. A Crítica e Refatoração do Aluno
* **Onde a IA falhou/foi ingênua:**
  1. **Violação do Encapsulamento de Domínio:** A IA manteve um endpoint genérico `PUT :id/status` que recebe qualquer string e depende de uma cadeia frágil de `if/else` solta dentro do Controller/Service.
  2. **Ausência de Máquina de Estados Real:** Não há uma matriz formal de transições; estados novos exigem adicionar múltiplos `ifs` manuais espalhados no código.
  3. **Código de Status HTTP Inadequado:** A IA retornou `400 Bad Request` (erro de sintaxe na requisição), quando o correto segundo as boas práticas de REST e o texto complementar é `422 Unprocessable Entity` (erro semântico de domínio).
* **Como refatoramos na arquitetura:**
  * Criamos o Value Object [`StatusEmprestimo`](file:///C:/Users/soares/Documents/Faculdade/4º%20semestre/web2/ppw-cocao/atvs%20avaliativas/atv3/ppw_test_server/src/module/emprestimos/domain/value-objects/status-emprestimo.value-object.ts) encapsulando a matriz estrita de transições válidas:
    * `RESERVADO ➔ RETIRADO | CANCELADO | EXPIRADO`
    * `RETIRADO ➔ DEVOLVIDO | ATRASADO`
    * `ATRASADO ➔ DEVOLVIDO_COM_MULTA`
  * Eliminamos totalmente rotas de mutação direta de status. No lugar, criamos endpoints semânticos orientados a ações: `POST :id/retirar`, `POST :id/devolver`, `POST :id/cancelar`.
  * As validações de guarda são executadas no método da Entidade de Domínio antes de tocar no banco. Se a transição for inválida, disparamos uma exceção de domínio tratada como `HTTP 422`.

---

## 📑 Registro 02: Regras de Negócio e Conflitos Assíncronos (Concorrência & Expiração Lazy)

### 1. O Desafio
Conforme detalhado no texto complementar sobre conflitos assíncronos e na tabela de alta complexidade do Tema 08, o sistema precisa:
1. Impedir que dois usuários reservem o mesmo exemplar no mesmo milissegundo (double-booking).
2. Processar a expiração automática de reservas não retiradas no prazo estipulado.
3. **Provocação obrigatória da Matriz da Atividade 3:** *"Qual o padrão para processar expiração de reserva sem depender exclusivamente de cron job externo?"*

### 2. O Prompt Utilizado
```text
Em um sistema web em NestJS e Prisma (SQLite/PostgreSQL) para empréstimo de livros e equipamentos:
1. Como evitar concorrência e reservas duplicadas simultâneas do mesmo exemplar?
2. Qual o padrão arquitetural para processar expiração de reserva sem depender exclusivamente de cron job externo?
```

### 3. A Resposta Bruta da IA
```typescript
// Sugestão inicial da IA para concorrência:
async reservar(itemId: string, usuarioId: string) {
  const existente = await this.prisma.emprestimo.findFirst({
    where: { itemId, status: 'RESERVADO' }
  });
  if (existente) throw new Error('Item já reservado');
  return this.prisma.emprestimo.create({ data: { itemId, usuarioId, status: 'RESERVADO' } });
}

// Sugestão da IA para expiração sem cron:
// "Use um setInterval no arquivo main.ts do NestJS para rodar a cada 1 minuto"
setInterval(async () => {
  const agora = new Date();
  await prisma.emprestimo.updateMany({
    where: { status: 'RESERVADO', dataPrevistaRetirada: { lt: agora } },
    data: { status: 'EXPIRADO' }
  });
}, 60000);
```

### 4. A Crítica e Refatoração do Aluno
* **Onde a IA falhou/foi ingênua:**
  1. **Race Condition Crítica (TOCTOU):** No método de reserva, a IA fez um `findFirst` seguido de um `create`. Se duas requisições chegarem ao mesmo tempo, ambas executarão o `findFirst` com sucesso (encontrando o item livre) e ambas gravarão a reserva, gerando sobreposição indevida (double-booking).
  2. **Antipadrão do `setInterval` em Memória:** Propor `setInterval` no Node.js é extremamente amador:
     - Se o servidor for reiniciado ou escalado horizontalmente (múltiplas instâncias/PM2/Docker), cada instância roda seu timer gerando conflitos.
     - Não há garantias de integridade ou tolerância a falhas.
* **Como refatoramos na arquitetura:**
  * **Tratamento de Concorrência com Atomicidade ACID:** Envolvemos a consulta e inserção da reserva dentro de uma transação exclusiva (`prisma.$transaction`).
  * **Padrão Lazy Expiration (Just-In-Time Evaluation):** Em vez de timers cegos em background, implementamos a avaliação preguiçosa:
    - Sempre que o recurso é acessado (ao consultar disponibilidade, listar itens ou tentar alocar uma nova reserva), o repositório executa na mesma transação atômica a expiração de reservas vencidas (`dataReserva + TTL < agora`) antes de responder ao cliente.
    - Isso garante consistência imediata sem custos ociosos de infraestrutura ou polling constante no banco.

---

## 📑 Registro 03: Rastreabilidade e Trilha de Auditoria (Audit Log com ACID)

### 1. O Desafio
O texto complementar estabelece que dados históricos corporativos nunca devem ser simplesmente sobrescritos via `UPDATE`. Para o projeto de empréstimos, qualquer alteração no ciclo de vida (reserva, cancelamento, retirada, atraso, devolução) deve registrar uma trilha de auditoria completa contendo: identificador do registro, estado anterior, novo estado, autor da ação, justificativa/motivo e timestamp, persistida obrigatoriamente através de transações de banco de dados ACID.

### 2. O Prompt Utilizado
```text
Como projetar e implementar um mecanismo de Audit Log (trilha de auditoria) em NestJS com Prisma, 
garantindo que qualquer transição de estado de um empréstimo grave o histórico imutável 
(estado anterior, novo estado, autor, motivo, data/hora) sem risco de inconsistência caso uma das operações falhe?
```

### 3. A Resposta Bruta da IA
```typescript
// Sugestão da IA (Execução assíncrona não atômica)
async transicionarStatus(id: string, novoStatus: string, autorId: string, motivo: string) {
  const antigo = await this.prisma.emprestimo.findUnique({ where: { id } });
  
  const atualizado = await this.prisma.emprestimo.update({
    where: { id },
    data: { status: novoStatus }
  });
  
  // Salva log depois
  await this.prisma.auditLog.create({
    data: {
      emprestimoId: id,
      statusAnterior: antigo.status,
      novoStatus: novoStatus,
      autorId: autorId,
      motivo: motivo
    }
  });
  
  return atualizado;
}
```

### 4. A Crítica e Refatoração do Aluno
* **Onde a IA falhou/foi ingênua:**
  1. **Falta de Transação Atômica (Risco de Perda de Auditoria):** As operações de `update` e `auditLog.create` foram executadas de forma desacoplada e independente. Se a conexão com o banco falhar, o servidor cair ou houver erro de constraint logo após o primeiro comando, o status do empréstimo terá mudado, mas o log de auditoria nunca será gerado.
  2. **Ausência de Integridade Referencial Estrita:** A IA não definiu relações formais ou constraints entre a tabela principal e a tabela de histórico.
* **Como refatoramos na arquitetura:**
  * Modelamos no `schema.prisma` a entidade `HistoricoEmprestimo` vinculada a `Emprestimo` por chave estrangeira `onDelete: Cascade`.
  * No repositório de escrita (`emprestimo.prisma.write.repository.ts`), toda mutação é encapsulada em um bloco `this.prisma.$transaction(async (tx) => { ... })`.
  * Se o registro do histórico falhar por qualquer motivo, o `$transaction` faz rollback total e o status do empréstimo permanece intacto no estado original, garantindo conformidade rigorosa com o princípio ACID.
