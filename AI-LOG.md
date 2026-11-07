# 🤖 Diário de Bordo & Registro de Uso do Agente de IA (AI-LOG)

> **Disciplina:** Programação Web II (PPW II)  
> **Tema 08:** Controle de Empréstimo de Livros / Equipamentos Internos  
> **Aluno:** Gabriel Soares Pedrosa (`bi3041271`)  
> **Repositório:** Atividade 3 (`atvs avaliativas/atv3`)  
> **Ferramenta de IA Utilizada:** Antigravity IDE (Google DeepMind Agentic Coding Framework)  
> **Banco Oficial:** PostgreSQL Institucional (`10.102.55.11:5432`, schema `bi3041271`)

---

## 📌 Como estruturei o trabalho com o Agente

Para a Atividade 3, utilizei o **Antigravity** como meu assistente de desenvolvimento (pair programmer). Como os temas de Máquina de Estados, Concorrência, Auditoria e Multas vieram de textos complementares bem densos, estruturei um fluxo onde eu lia o material, questionava o agente sobre como aplicar na prática, avaliava os prós e contras das sugestões dele e decidia o melhor caminho:

1. **Montar o "cérebro" do agente (`brain`):** Dei as instruções iniciais, criei a pasta `brain/`, subi nela os textos complementares do professor, o enunciado da atividade e os critérios de avaliação, e instruí o agente a registrar o histórico de planejamento.
2. **Delimitar o escopo e ambiente:** Deixei claro que ele só podia mexer na pasta `atvs avaliativas/atv3`, que usaríamos a nossa Atividade 2 como base e que iríamos nos conectar diretamente ao PostgreSQL da faculdade.
3. **Estudo prévio dos textos:** Pedi para ele ler os PDFs e me trazer resumos didáticos dos 4 temas centrais para eu dominar o conceito antes de mexer no código. Salvei essas pesquisas em `/atv3/docs/pesquisas/`.
4. **Geração do `/plan` geral:** Com os conceitos claros, pedi um plano macro de execução ordenado logicamente. Salvei esse planejamento em `/atv3/docs/planos/plano-geral-atv3.md`.
5. **Planos específicos e desenvolvimento interativo:** Conforme fomos avançando etapa por etapa, criei planos dedicados para cada módulo em `/atv3/docs/planos/`. Quando o agente propunha algo no plano, muitas vezes eu estranhava ou achava arriscado, questionava com base no que tinha lido nos textos, ele me explicava as alternativas e eu decidia como implementar.

Abaixo está o registro passo a passo dessa jornada.

---

## 🚀 Passo 1: Inicializando o Cérebro do Agente (`brain`) e Regras de Governança

Comecei criando o ambiente de trabalho e dizendo exatamente como o agente deveria se comportar. Não queria que ele saísse criando arquivos aleatórios ou misturando código fora do lugar.

### Meu Prompt de Inicialização:
```text
Você vai ser meu agente pair programmer no desenvolvimento da Atividade 3 de PPW II.
Antes de mexer em código, vamos alinhar as regras do nosso ambiente:
1. Crie e use a pasta 'brain' para guardar suas notas de contexto, planos de tarefa e 
   manter o histórico das minhas perguntas e das suas respostas/sugestões.
2. Seu escopo de trabalho é estritamente a pasta 'atvs avaliativas/atv3'. Não mexa na atv1 nem na atv2.
3. Vamos usar a base da nossa 'atv2' e refatorar tudo para atender os requisitos da atv3 (Clean Arch).
4. Subi na pasta brain os textos complementares do professor sobre FSM, Concorrência, 
   Auditoria e Multas, além do roteiro da atividade.
5. Sempre responda em português (BR), use TypeScript estrito e trabalhe com branches no git.
6. Sempre que eu pedir algo grande, monte um plano (/plan) antes de executar.
Confirme se entendeu o ambiente para começarmos.
```

### Resposta e Ação do Agente:
O agente confirmou as diretrizes, inicializou a pasta `brain/` de contexto da sessão e registrou as regras do projeto.
> *"Entendido, Gabriel! Ambiente configurado: escopo restrito a `atvs avaliativas/atv3`, memória de planejamento vinculada à pasta `brain`, textos do professor indexados para consulta, comunicação em português e fluxo guiado por planos (`/plan`). Pronto para o próximo passo."*

---

## 📚 Passo 2: Estudo dos Textos Complementares e Resumos Didáticos

Antes de sair escrevendo código, pedi para o agente analisar os textos do professor que estavam no `brain` e me trazer uma explicação prática de cada um, para eu entender o "porquê" de cada requisito.

### Meu Prompt:
```text
Analise os textos complementares que subi na pasta brain e me traga um resumo didático 
e direto ao ponto de cada um dos 4 temas principais da Atividade 3:
1. Máquina de Estados Finita (FSM)
2. Rastreabilidade e Auditoria (Audit Log)
3. Conflitos Assíncronos e Expiração
4. Multas e Bloqueios
Explique o que cada um significa na prática para o meu tema (Empréstimo de Livros/Equipamentos) 
e salve esses resumos didáticos em arquivos markdown na pasta /atv3/docs/pesquisas/.
```

### Resumos Didáticos Gerados e Arquivados:
O agente gerou as pesquisas didáticas completas, arquivadas nos seguintes endereços:
- 📄 [`/atv3/docs/pesquisas/01-fsm-maquina-estados.md`](/atvs%20avaliativas/atv3/docs/pesquisas/01-fsm-maquina-estados.md): O modelo da FSM, por que o `PUT` tradicional é falho e a matriz de transições.
- 📄 [`/atv3/docs/pesquisas/02-audit-log-rastreabilidade.md`](/atvs%20avaliativas/atv3/docs/pesquisas/02-audit-log-rastreabilidade.md): Por que `UPDATE` apaga a história e como estruturar tabelas append-only com consistência ACID.
- 📄 [`/atv3/docs/pesquisas/03-concorrencia-expiracao-lazy.md`](/atvs%20avaliativas/atv3/docs/pesquisas/03-concorrencia-expiracao-lazy.md): O problema de double-booking, limites de cron jobs e o padrão de *Lazy Evaluation* (Just-in-Time).
- 📄 [`/atv3/docs/pesquisas/04-multas-progressivas-bloqueio.md`](/atvs%20avaliativas/atv3/docs/pesquisas/04-multas-progressivas-bloqueio.md): Por que a multa deve ser por faixas e o bloqueio preventivo dinâmico.

---

## 📋 Passo 3: O `/plan` Geral da Atividade 3

Pedi para o agente criar um plano geral ordenado para executarmos a atividade do início ao fim sem pular etapas.

### Meu Prompt:
```text
Agora que entendemos a teoria, monte um /plan geral da Atividade 3 estruturando a implementação 
numa ordem lógica, desde o setup da base e banco até a entrega final e documentação. 
Salve esse plano geral no arquivo /atv3/docs/planos/plano-geral-atv3.md.
```

### O Plano Geral Arquivado:
- 📄 Arquivo gerado: [`/atv3/docs/planos/plano-geral-atv3.md`](/atvs%20avaliativas/atv3/docs/planos/plano-geral-atv3.md)

O plano estruturou as seguintes etapas:
- **Etapa 1:** Copiar a base da Atividade 2 para `atv3` e conectar no PostgreSQL institucional.
- **Etapa 2:** Implementar a Máquina de Estados Finita (FSM) no Domínio com bloqueio HTTP 422.
- **Etapa 3:** Implementar a Trilha de Auditoria (Audit Log) com persistência atômica ACID.
- **Etapa 4:** Implementar Concorrência e Expiração Automática de Reservas (Lazy Evaluation).
- **Etapa 5:** Implementar o Serviço de Multas Progressivas e Bloqueio Preventivo.
- **Etapa 6:** Refatorar o Frontend Next.js para refletir ações semânticas e eliminar scroll horizontal.
- **Etapa 7:** Criar seed com dados de teste e documentação final (README, AI-LOG, Guia Oral).

---

## 🗄️ Passo 4: Migração da ATV2 e Conexão ao PostgreSQL (Meu Questionamento sobre o Banco)

Começamos clonando a base da `atv2` para a pasta `atv3` e configurando a conexão com o banco oficial da faculdade.
- 📄 Plano detalhado da etapa: [`/atv3/docs/planos/01-plano-migracao-banco.md`](/atvs%20avaliativas/atv3/docs/planos/01-plano-migracao-banco.md)

### Meu Prompt:
```text
Vamos fazer a Etapa 1 do plano. Copie o client e o server da pasta 'atvs avaliativas/atv2' 
para a pasta 'atvs avaliativas/atv3'.
Depois, configure o .env do server para conectar no PostgreSQL oficial da faculdade:
DATABASE_URL="postgresql://bi3041271:BI3041271@10.102.55.11:5432/postgres?schema=bi3041271"
Analise o schema.prisma e me diga o que vai rodar no banco.
```

### O que o Agente Propôs:
O agente copiou os arquivos, ajustou o `.env` e sugeriu:
> *"Vou alterar o provider do `schema.prisma` para `postgresql` e rodar no terminal:  
> `npx prisma db push --force-reset`  
> Isso vai limpar o banco remoto e subir as tabelas da Atividade 3 novinhas sem conflito."*

### Meu Questionamento:
> *"Opa, pera lá! Esse comando `--force-reset` não vai limpar o banco inteiro não? Esse banco é o meu oficial da faculdade e já tem tabelas de outros trabalhos meus (como a tabela `tickets`). Se der reset não vai apagar tudo que já entreguei? Como a gente faz pra sincronizar sem apagar o que já tá lá?"*

### A Explicação do Agente:
> *"Bem observado, Gabriel! Se rodarmos `--force-reset` o Prisma realmente daria um DROP nas tabelas que não estão no nosso schema local, apagando a tabela `tickets`.  
> A solução segura é: primeiro rodamos `npx prisma db pull --print` para inspecionar o que já existe no banco remoto, adicionamos a declaração dessas tabelas legadas no nosso `schema.prisma` para o Prisma reconhecê-las, colocamos prefixos nas nossas tabelas novas (`web2_A1_` e `web2_A3_`), e depois rodamos o `prisma db push` normal, sem nenhum `--force-reset`."*

### Minha Decisão:
> *"Perfeito, faz exatamente assim então: faz o pull antes, preserva as minhas tabelas velhas e roda o push sem reset."*

### O que foi Executado:
- Rodou o pull, identificou a tabela `tickets` existente (com 3 registros) e os enums `Prioridade` e `Status`.
- Preservou tudo no [`/atv3/ppw_test_server/prisma/schema.prisma`](/atvs%20avaliativas/atv3/ppw_test_server/prisma/schema.prisma).
- Mapeou a tabela de empréstimos para `web2_A1_emprestimos` e a de auditoria para `web2_A3_historico_emprestimos`.
- Sincronizou com o banco com sucesso sem perder nenhum dado antigo.
- Commitou na branch `feature/database-postgres`.

---

## 🔄 Passo 5: FSM no Domínio (Meu Questionamento sobre a Controller e Erro 400)

Avançamos para a Etapa 2: transformar a troca de status em uma Máquina de Estados Finita.
- 📄 Plano detalhado da etapa: [`/atv3/docs/planos/02-plano-fsm-dominio.md`](/atvs%20avaliativas/atv3/docs/planos/02-plano-fsm-dominio.md)

### Meu Prompt:
```text
Vamos para a Etapa 2. Na atv2 a gente tinha um PUT que recebia o status e gravava direto. 
Quero remover essa alteração livre de status. O status agora só pode mudar através de ações: 
retirar, devolver, renovar e cancelar.
Se o cara tentar fazer uma transição inválida (tipo tentar devolver um livro que está só reservado), 
o sistema tem que recusar. Como vamos implementar isso no NestJS?
```

### O que o Agente Propôs:
O agente sugeriu colocar a validação direto na Controller:
> *"Podemos manter o controller e colocar uns `if/else` no método: se o status atual for `RESERVADO` e ele mandar devolver, a gente dá um `throw new BadRequestException('Transição inválida')` (HTTP 400)."*

### Meu Questionamento:
> *"Mas peraí, se a gente colocar esse monte de `if` na Controller, não vai bagunçar a Controller inteira e violar o que o professor falou de deixar as regras no Domínio? E esse erro 400 aí, não tem um código HTTP mais específico pra quando a sintaxe do JSON tá certa, mas a regra de negócio não permite a ação? Como a gente faria isso direto no Domínio?"*

### A Explicação do Agente:
> *"Você tem toda razão, Gabriel. Validar na Controller viola a Clean Architecture porque a regra de negócio fica na camada de apresentação (web).  
> Sobre o código HTTP: o 400 (Bad Request) indica sintaxe inválida (ex: JSON quebrado). Quando a requisição é válida mas viola uma regra de negócio, o padrão REST correto é o **HTTP 422 (Unprocessable Entity)**.  
> No Domínio, o padrão correto é criar um Value Object chamado `StatusEmprestimo` que guarda uma matriz imutável de transições válidas. E na Entidade `Emprestimo`, criamos métodos como `registrarRetirada()` e `registrarDevolucao()` que consultam essa matriz e disparam uma exceção própria de domínio que o NestJS entrega como 422."*

### Minha Decisão:
> *"Show, era isso que eu tinha entendido dos textos. Tira os ifs da Controller, cria o Value Object `StatusEmprestimo` no Domínio com a matriz e usa o erro 422 na exceção."*

### O que foi Executado:
- Criou o Value Object [`/atv3/ppw_test_server/src/module/emprestimos/domain/value-objects/status-emprestimo.value-object.ts`](/atvs%20avaliativas/atv3/ppw_test_server/src/module/emprestimos/domain/value-objects/status-emprestimo.value-object.ts) com a matriz `TRANSICOES_VALIDAS_FSM`.
- Criou a exceção [`/atv3/ppw_test_server/src/module/emprestimos/domain/exceptions/transicao-invalida.exception.ts`](/atvs%20avaliativas/atv3/ppw_test_server/src/module/emprestimos/domain/exceptions/transicao-invalida.exception.ts) retornando 422.
- Adicionou as rotas semânticas no [`/atv3/ppw_test_server/src/module/emprestimos/presentation/emprestimos.controller.ts`](/atvs%20avaliativas/atv3/ppw_test_server/src/module/emprestimos/presentation/emprestimos.controller.ts): `POST /emprestimos/:id/retirar`, `/devolver`, `/renovar`, `/cancelar`.
- Commitou na branch `feature/fsm-maquina-estados`.

---

## 📜 Passo 6: Audit Log (Meu Questionamento sobre Falhas no Banco e ACID)

Na Etapa 3, fomos fazer o registro imutável do histórico de cada ação.
- 📄 Plano detalhado da etapa: [`/atv3/docs/planos/03-plano-audit-log-acid.md`](/atvs%20avaliativas/atv3/docs/planos/03-plano-audit-log-acid.md)

### Meu Prompt:
```text
Agora a Etapa 3: toda vez que o status mudar (retirar, devolver, cancelar, etc.), 
precisamos gravar um registro na tabela 'web2_A3_historico_emprestimos' com:
id, emprestimoId, statusAnterior, statusNovo, alteradoPor, motivo e data.
Como você vai salvar isso no repositório do Prisma?
```

### O que o Agente Propôs:
O agente sugeriu fazer as duas chamadas seguidas:
```typescript
// Sugestão inicial do agente no repositório:
await this.prisma.web2_A1_emprestimos.update({ where: { id }, data: { status } });
await this.prisma.web2_A3_historico_emprestimos.create({ data: { ...dadosLog } });
```

### Meu Questionamento:
> *"Mas e se der pau na internet ou no banco bem na hora que for salvar o histórico? O empréstimo vai ter mudado de status e o histórico vai ficar faltando? Não tem como garantir que ou salva os dois juntos ou não salva nenhum? No texto falava sobre propriedades ACID, como a gente aplica isso no Prisma?"*

### A Explicação do Agente:
> *"Excelente ponto, Gabriel! Do jeito que eu propus, se o segundo `await` falhasse, o status já teria sido atualizado e o histórico ficaria incompleto (inconsistência de dados).  
> Para garantir atomicidade (o 'A' do ACID), o Prisma possui o método `this.prisma.$transaction(async (tx) => { ... })`. Quando colocamos o `update` e o `create` dentro dele, o banco abre uma transação única. Se qualquer uma das duas operações falhar, o banco desfaz tudo automaticamente (rollback)."*

### Minha Decisão:
> *"Era isso mesmo. Envolve as duas operações dentro do `$transaction` do Prisma pra garantir que o histórico nunca fique faltando."*

### O que foi Executado:
- Atualizou o repositório [`/atv3/ppw_test_server/src/module/emprestimos/infrastructure/adapters/emprestimo.prisma.write.repository.ts`](/atvs%20avaliativas/atv3/ppw_test_server/src/module/emprestimos/infrastructure/adapters/emprestimo.prisma.write.repository.ts) envolvendo o `tx.web2_A1_emprestimos.update` e o `tx.web2_A3_historico_emprestimos.create` sob a mesma transação atômica.
- Criou a rota `GET /emprestimos/:id/historico` para retornar a timeline de auditoria.
- Commitou na branch `feature/audit-log-acid`.

---

## ⏱️ Passo 7: Expiração de Reservas (Meu Questionamento sobre o setInterval)

Na Etapa 4, fomos resolver a expiração automática de reservas não retiradas no prazo de 48h.
- 📄 Plano detalhado da etapa: [`/atv3/docs/planos/04-plano-expiracao-lazy.md`](/atvs%20avaliativas/atv3/docs/planos/04-plano-expiracao-lazy.md)

### Meu Prompt:
```text
Vamos para a Etapa 4. Se um usuário fizer uma reserva e não for buscar o livro em 48 horas 
(dataLimiteRetirada), o status tem que virar EXPIRADO para liberar o livro para outros.
Mas tem um detalhe: não quero instalar cron job no Linux nem ferramentas externas no servidor. 
Como resolver isso puramente no código?
```

### O que o Agente Propôs:
O agente sugeriu colocar um timer no Node:
> *"Podemos colocar um `setInterval` no `main.ts` rodando a cada 60 segundos que busca todas as reservas vencidas e faz o update para `EXPIRADO`."*

### Meu Questionamento:
> *"Mas esse setInterval aí não fica rodando no servidor gastando memória e processamento direto mesmo quando ninguém tiver usando o sistema? E se o servidor reiniciar ou a gente subir outra instância da aplicação, não vai dar conflito de timers no banco? No texto o professor comentou sobre avaliar sob demanda, como seria isso?"*

### A Explicação do Agente:
> *"Você tocou no ponto central do texto sobre concorrência! O `setInterval` realmente tem esses problemas: se a aplicação reiniciar o timer para, e em cluster múltiplos timers competem travando linhas no banco.  
> A alternativa sob demanda que o texto menciona é o padrão **Lazy Evaluation (Avaliação Preguiçosa / Just-in-Time)**. Funciona assim: em vez de um timer ficar rodando no vazio, a gente faz a checagem no exato momento em que alguém acessa o sistema. Toda vez que alguém for listar os empréstimos ou tentar reservar um livro, o repositório roda uma query rápida `updateMany` atualizando tudo o que já passou do prazo (`dataLimiteRetirada < agora`)."*

### Minha Decisão:
> *"Gostei muito mais dessa ideia de Lazy Evaluation. Faz isso então: roda a expiração no repositório de forma preguiçosa nas consultas e alocações, sem nenhum timer em background."*

### O que foi Executado:
- Implementou o método `expirarReservasVencidas()` disparado de forma preguiçosa nas queries de busca e gravação do repositório.
- Testamos criando uma reserva com data passada e ao listar ela já retornou com status `EXPIRADO`.
- Commitou na branch `feature/multas-expiracao-lazy`.

---

## 💰 Passo 8: Multas Progressivas (Meu Questionamento sobre Cálculo Linear e Tabela de Usuário)

Na Etapa 5, entramos na regra de devoluções atrasadas e penalidades financeiras.
- 📄 Plano detalhado da etapa: [`/atv3/docs/planos/05-plano-multas-bloqueio.md`](/atvs%20avaliativas/atv3/docs/planos/05-plano-multas-bloqueio.md)

### Meu Prompt:
```text
Agora a Etapa 5:
1. Quando um livro for devolvido com atraso, deve calcular uma multa progressiva por dias de atraso.
2. Usuário que tiver qualquer livro atrasado fica impedido de fazer novas reservas.
Como você pensou em calcular esse valor da multa e validar o bloqueio?
```

### O que o Agente Propôs:
O agente planejou:
> *"Podemos fazer um cálculo simples: `valorMulta = diasAtraso * 2.50`. E para o bloqueio, criamos uma coluna `bloqueado` no usuário e checamos `if (usuario.bloqueado)`."*

### Meu Questionamento:
> *"Mas no texto complementar o professor falou em multa progressiva, tipo quem atrasa mais dias paga mais caro a diária pra incentivar a devolver rápido, não foi? Multiplicar direto por 2,50 não fica linear demais?  
> E pra bloquear o usuário, precisa mesmo criar uma tabela de usuário com coluna `bloqueado`? A gente não consegue só olhar no banco se aquele cara já tem algum empréstimo ativo com status atrasado?"*

### A Explicação do Agente:
> *"Você pegou bem o espírito da regra de negócio!  
> 1. Multiplicar direto por R$ 2,50 é uma taxa fixa diária. Na multa progressiva por faixas, o valor da diária sobe com o tempo. Podemos montar um serviço de domínio com 3 faixas:
>    - 1º ao 3º dia: R$ 2,00/dia
>    - 4º ao 7º dia: R$ 3,50/dia
>    - 8º dia em diante: R$ 5,00/dia (e se tiver avaria física, soma R$ 50 fixos).  
> 2. Sobre o bloqueio: criar tabela de usuário com flag estática exigiria rotinas para marcar e desmarcar a flag. É muito mais limpo e seguro fazer a checagem dinâmica: na hora que o cara tenta reservar, fazemos um `findFirst` buscando se aquele `usuarioNome` tem algum registro em `ATRASADO`. Se tiver, recusamos a reserva na hora com HTTP 422."*

### Minha Decisão:
> *"Perfeito! Faz o cálculo com essas 3 faixas progressivas isolado num service de domínio (`CalculadoraMultaService`), e faz a checagem dinâmica de bloqueio no repositório."*

### O que foi Executado:
- Criou o [`/atv3/ppw_test_server/src/module/emprestimos/domain/services/calculadora-multa.service.ts`](/atvs%20avaliativas/atv3/ppw_test_server/src/module/emprestimos/domain/services/calculadora-multa.service.ts) com o cálculo por faixas progressivas.
- Adicionou a verificação dinâmica no repositório antes de criar novas reservas.
- Criou o [`/atv3/ppw_test_server/prisma/seed.ts`](/atvs%20avaliativas/atv3/ppw_test_server/prisma/seed.ts) populando 6 casos reais no PostgreSQL da faculdade (incluindo casos com atraso e multa calculada para testar).

---

## 🎨 Passo 9: Refatorando o Frontend e o Scroll (Meu Feedback Real e Mudança de Planos)

Na Etapa 6 e 7, fomos rodar o frontend Next.js (`ppw_test_client`) para testar na tela. Ao abrir, a tabela ficou muito carregada e feia.
- 📄 Plano detalhado da etapa: [`/atv3/docs/planos/06-plano-ui-refactor-css.md`](/atvs%20avaliativas/atv3/docs/planos/06-plano-ui-refactor-css.md)

### Minha Reclamação / Prompt:
```text
Ok, o css dos itens na lista ficou ruim, muito botão sem organização.
Ta ruim ainda, ficou com scroll horizontal, se quiser pode tirar o css inline 
e criar um arquivo separado, mas analisa.
O botão de renovar pode aparecer na barra também.
```

### O que Estava Acontecendo na Tela:
A primeira versão colocava 6 botões soltos em cada linha (`Retirar`, `Cancelar`, `Renovar`, `Devolver`, `Histórico`, `Editar`, `Excluir`), além de classes gigantescas do Tailwind inline. A tabela estourava a largura da tela e criava uma barra de rolagem horizontal horrível (`overflow-x-auto`).

### O que o Agente me Explicou e Como Resolvemos:
1. **Mandei isolar o CSS:** Criamos o [`/atv3/ppw_test_client/src/features/emprestimos/components/emprestimos.module.css`](/atvs%20avaliativas/atv3/ppw_test_client/src/features/emprestimos/components/emprestimos.module.css) com `table-layout: fixed; width: 100%`, tirando o emaranhado de classes do JSX.
2. **Unifiquei colunas:** Juntamos o *Item* e o *Solicitante* na mesma coluna com hierarquia de texto, liberando espaço horizontal.
3. **Organizei os botões:**
   - Botão primário contextual na barra: se tá reservado aparece **Retirar**; se tá em uso aparece **Devolver**.
   - Pedi pro botão **Renovar** ficar visível direto na barra também para facilitar o uso no dia a dia.
   - Botão direto de **Histórico** com ícone para abrir o modal da trilha de auditoria.
   - As ações secundárias de cadastro (*Editar* e *Excluir*) foram para um menu dropdown discreto com Radix UI (`DropdownMenu`).
4. **Filtros e Métricas:** Adicionamos abas no topo (*Todos*, *Reservados*, *Em Aberto*, *Atrasados*, *Finalizados*) e cards de resumo com total de multas acumuladas.

### Detalhe que Percebi e Mandei Corrigir:
Ao revisar a página, vi que no subtítulo ainda estava escrito:  
*"Atividade 2 — Arquitetura Limpa e Formulários"*  
Mandei o prompt:
```text
n é a atv 3? ta escrito 2 lá
```
O agente atualizou para:
*"Atividade 3 — Máquina de Estados Finita (FSM), Trilha de Auditoria ACID, Multas e Lazy Evaluation"*.

- Branches commitadas: `feature/ui-layout-refactor`, `feature/ui-css-module-no-scroll`, `feature/ui-renovar-button-action-bar`, `fix/header-text-atv3`.

---

## 🎯 Síntese: Onde Eu Questionei e Onde Decidimos o Rumo Certo

| Etapa | A Proposta Inicial do Agente | O que Eu Questionei / Estranhei | A Decisão Final Implementada | Artefato de Plano Vinculado |
| :--- | :--- | :--- | :--- | :--- |
| **Banco de Dados** | Rodar `db push --force-reset` | Questionei se isso não ia limpar o banco e apagar a tabela `tickets` existente de outros trabalhos meus. | Bloqueei o reset, fizemos pull antes para mapear os dados legados e rodamos o push seguro. | [`/atv3/docs/planos/01-plano-migracao-banco.md`](/atvs%20avaliativas/atv3/docs/planos/01-plano-migracao-banco.md) |
| **FSM / Transições** | Colocar validação com `if` solto na Controller com `HTTP 400` | Questionei se encher a Controller de `if` não violava o Domínio e se erro 400 não era genérico demais. | Criamos o Value Object `StatusEmprestimo` no Domínio e a exceção semântica com `HTTP 422`. | [`/atv3/docs/planos/02-plano-fsm-dominio.md`](/atvs%20avaliativas/atv3/docs/planos/02-plano-fsm-dominio.md) |
| **Audit Log** | Fazer dois `await` soltos (update e create) | Questionei o que acontecia se desse erro na gravação do histórico e como aplicar ACID no Prisma. | Envolvemos as duas operações dentro de uma transação atômica (`$transaction`) com rollback total. | [`/atv3/docs/planos/03-plano-audit-log-acid.md`](/atvs%20avaliativas/atv3/docs/planos/03-plano-audit-log-acid.md) |
| **Expiração** | Criar um `setInterval` de 60s rodando no Node | Questionei se timer em memória não gastava CPU à toa e se não falharia caso o servidor reiniciasse. | Adotamos *Lazy Evaluation* no banco disparado sob demanda nas consultas e alocações. | [`/atv3/docs/planos/04-plano-expiracao-lazy.md`](/atvs%20avaliativas/atv3/docs/planos/04-plano-expiracao-lazy.md) |
| **Multas** | Multiplicação simples (`dias * 2.5`) e flag estática no usuário | Questionei se a multa não devia ser progressiva por faixas e se precisava mesmo criar tabela de usuário. | Criamos a `CalculadoraMultaService` com 3 faixas progressivas e checagem dinâmica de atrasos no repositório. | [`/atv3/docs/planos/05-plano-multas-bloqueio.md`](/atvs%20avaliativas/atv3/docs/planos/05-plano-multas-bloqueio.md) |
| **Interface / CSS** | Deixar 6 botões soltos por linha e scroll horizontal na tabela | Reclamei da poluição visual, da falta de organização dos botões e do scroll forçado para o lado. | Isolei o CSS num módulo separado (`.module.css`), usei `table-layout: fixed`, deixei Renovar na barra e o resto no dropdown. | [`/atv3/docs/planos/06-plano-ui-refactor-css.md`](/atvs%20avaliativas/atv3/docs/planos/06-plano-ui-refactor-css.md) |

---

## 🏁 Conclusão

Trabalhar com o Antigravity como pair programmer me deu muita agilidade para prototipar e escrever código, mas a leitura dos textos e os **meus questionamentos em cada etapa** foram fundamentais para evitar atalhos perigosos (como apagar dados do banco, colocar timers frágeis ou encher a controller de ifs).

O resultado final é um sistema completo, rodando conectado ao PostgreSQL da faculdade, com código limpo (Clean Architecture), zero erros de compilação no NestJS e no Next.js, e pronto para a arguição oral.
