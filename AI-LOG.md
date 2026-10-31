# 🤖 Registro de Uso Pedagógico e Crítico de IA (AI-LOG)

> **Disciplina:** Programação Web II (PPW II)  
> **Tema 08:** Controle de Empréstimo de Livros / Equipamentos Internos  
> **Estudante:** Gabriel Soares Pedrosa (`bi3041271`)  
> **Repositório:** Atividade 3 (`atv3`)

Este documento registra a evolução real do aprendizado durante a disciplina. Como os temas de Máquina de Estados, Concorrência e Auditoria vieram a partir de textos complementares (e não foram ensinados passo a passo na aula), utilizei a Inteligência Artificial como ferramenta de pesquisa conceitual e de arquitetura, documentando os prompts iniciais, as respostas recebidas e a minha reflexão crítica para aplicação no projeto.

---

## 📑 Registro 01: O que é Máquina de Estados Finita e por que não usar CRUD tradicional?

### 1. O Desafio (Pesquisa Inicial)
Ao ler o texto complementar sobre *Máquina de Estados Finita e Transições Restritas*, me deparei com um conceito novo para a matéria: a ideia de que um registro não deve simplesmente aceitar qualquer status a qualquer momento via formulário. Eu precisava entender o conceito básico: **o que é de fato uma Máquina de Estados Finita (FSM) na web e qual o problema real de fazer um CRUD normal com `PUT`?**

### 2. O Prompt Utilizado
```text
O que é Máquina de Estados Finita e Transições Restritas em sistemas web? 
Por que um CRUD comum que permite atualizar o status de um registro diretamente 
via formulário ou requisição PUT é considerado incorreto na prática?
```

### 3. A Resposta Bruta da IA
```text
Uma Máquina de Estados Finita (FSM) é um modelo onde um objeto só pode estar em um 
único estado por vez (ex: "Pendente", "Aprovado", "Cancelado") e só pode transicionar 
entre eles seguindo caminhos pré-definidos.

O problema do CRUD tradicional é que ele trata o campo 'status' como um dado qualquer, 
como se fosse o nome ou e-mail de alguém. Se o seu endpoint aceita:
PUT /pedidos/123 com { "status": "entregue" }

Qualquer usuário com Postman ou inspecionando o formulário pode pular etapas obrigatórias, 
marcando um pedido como entregue antes mesmo de ser pago ou aprovado.

Exemplo de como fazer:
if (novoStatus === 'entregue' && statusAtual !== 'em_transporte') {
  throw new Error('Não pode entregar direto');
}
```

### 4. A Crítica e Refatoração do Aluno
* **O que a resposta ajudou a entender:** A explicação deixou muito claro o perigo de expor o campo de status em formulários e requisições genéricas de CRUD. Ficou evidente que o status de um empréstimo não é um dado que se edita, mas sim a consequência de uma ação (evento de negócio).
* **Onde a IA foi ingênua/simplista:**
  1. No exemplo prático de código, a IA sugeriu apenas colocar blocos de `if/else` soltos verificando o status dentro do endpoint ou da rota. Isso é insustentável em um sistema com 6 ou 7 status diferentes.
  2. A IA não demonstrou como encapsular essa máquina de estados na camada de Domínio nem como mapear as transições de forma desacoplada do banco.
* **Refatoração para o nosso projeto:**
  * Em vez de manter um `PUT` com validação solta por `if/else`, eliminamos o `PUT /emprestimos/:id` do projeto.
  * Criamos uma classe Value Object (`StatusEmprestimo`) com uma matriz explícita de transições válidas no domínio e criamos endpoints de ação: `POST /emprestimos/:id/retirar`, `POST /emprestimos/:id/devolver`, etc. Se alguém tentar executar uma ação inválida para o estado atual, o sistema rejeita imediatamente com erro semântico `HTTP 422 - Unprocessable Entity`.

---

## 📑 Registro 02: O que são conflitos assíncronos e como funciona expiração sem cron?

### 1. O Desafio (Pesquisa Inicial)
O segundo texto complementar abordava *Regras de Negócio e Conflitos Assíncronos*, citando exemplos de reservas simultâneas de uma mesma vaga. Eu queria compreender: **o que realmente acontece por baixo dos panos na web quando dois usuários clicam em reservar no mesmo milissegundo? E qual o padrão para expirar reservas vencidas sem ter que instalar um cron job externo no servidor?**

### 2. O Prompt Utilizado
```text
O que são regras de negócio com conflitos assíncronos em sistemas web? 
O que acontece na prática se dois usuários tentarem reservar o mesmo item ao mesmo 
tempo no banco de dados? E qual o padrão para processar a expiração de uma reserva 
sem depender exclusivamente de um cron job externo rodando no servidor?
```

### 3. A Resposta Bruta da IA
```text
Conflitos assíncronos acontecem porque a web é multiusuário. Quando a Requisição A e a 
Requisição B chegam juntas:
1. Ambas consultam o banco: "O item está livre?" -> O banco responde "Sim" para as duas.
2. Ambas gravam: "Reservado para A" e depois "Reservado para B".
Isso gera concorrência (Race Condition) e o mesmo item fica reservado duas vezes (double-booking).

Para resolver a expiração sem cron externo, você pode colocar um timer no Node.js:
setInterval(async () => {
  // busca reservas vencidas a cada 1 minuto e marca como expirada
}, 60000);
```

### 4. A Crítica e Refatoração do Aluno
* **O que a resposta ajudou a entender:** Ficou muito visual a explicação da condição de corrida (*Race Condition / TOCTOU*): o problema acontece na janela de tempo entre *consultar* se está livre e *gravar* a reserva.
* **Onde a IA foi ingênua/simplista:**
  1. A solução para expiração sugerida pela IA foi usar um `setInterval` rodando no código do servidor. Esse é um antipadrão clássico: se o servidor reiniciar, os timers se perdem; se subir mais de uma réplica do backend, dois timers competem no banco.
  2. Para a concorrência, ela apenas explicou o problema, mas não detalhou como o Prisma/banco relacional resolve isso via transações atômicas com rollback.
* **Refatoração para o nosso projeto:**
  * **Concorrência:** Envolvemos a consulta e a criação da reserva em uma transação ACID (`prisma.$transaction`), garantindo atomicidade.
  * **Expiração Automática sem Cron:** Adotamos o padrão de **Lazy Evaluation (Avaliação Preguiçosa / Just-In-Time)**: sempre que qualquer usuário lista as reservas ou tenta alocar um recurso, o sistema roda uma consulta dentro da transação que expira automaticamente os registros cujo prazo de retirada venceu (`dataReserva + TTL < agora`), liberando o recurso de forma consistente sem nenhum timer em background.

---

## 📑 Registro 03: O que é Audit Log e por que um simples UPDATE no banco é um erro?

### 1. O Desafio (Pesquisa Inicial)
O terceiro texto complementar trata de *Rastreabilidade e Auditoria (Audit Log)*, afirmando que em sistemas profissionais dados nunca devem ser sobrescritos. Eu precisava entender: **por que fazer um UPDATE comum em tabelas de status é considerado uma falha grave em sistemas corporativos e como deve ser estruturada uma trilha de auditoria no banco?**

### 2. O Prompt Utilizado
```text
O que é Rastreabilidade e Auditoria (Audit Log) em sistemas web? 
Por que não devemos simplesmente atualizar o status de um registro com UPDATE no banco? 
Como devemos estruturar essa tabela de histórico e como garantir que ela seja gravada 
com segurança junto com a alteração?
```

### 3. A Resposta Bruta da IA
```text
Em sistemas reais (bancos, órgãos fiscais, bibliotecas), sobrescrever dados é perder histórico. 
Se você fizer UPDATE pedidos SET status = 'Cancelado', você apagou quem cancelou, 
que horas cancelou, qual era o status antes e qual foi a justificativa.

Para resolver, cria-se uma tabela separada de logs:
Tabela Historico (id, registroId, statusAnterior, novoStatus, usuario, data, motivo).

No código, depois que você atualizar o pedido, você salva o log:
await prisma.pedido.update({ ... });
await prisma.historico.create({ ... });
```

### 4. A Crítica e Refatoração do Aluno
* **O que a resposta ajudou a entender:** Entendi perfeitamente o conceito de imutabilidade e rastreabilidade: um status atual é apenas a "fotografia do momento", enquanto o histórico é o "filme completo" que permite auditar qualquer ação.
* **Onde a IA foi ingênua/simplista:**
  1. A IA sugeriu executar primeiro o `update` do pedido e, em seguida, o `create` do log em chamadas assíncronas separadas.
  2. Isso quebra o princípio de integridade transacional: se a conexão com o banco cair ou ocorrer um erro de constraint no momento de salvar o log, o pedido teve seu status alterado, mas o histórico foi perdido para sempre (gerando dados órfãos e auditoria corrompida).
* **Refatoração para o nosso projeto:**
  * Criamos a entidade `HistoricoEmprestimo` vinculada via chave estrangeira ao `Emprestimo`.
  * No repositório, amarramos a transição de status e a criação do registro de auditoria dentro de uma única transação ACID (`$transaction` do Prisma). Se a gravação do log falhar por qualquer motivo, o status do empréstimo sofre rollback automático, garantindo que nenhuma mudança ocorra sem sua respectiva evidência de auditoria.
