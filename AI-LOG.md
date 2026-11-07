# 🤖 Diário de Bordo & Registro de Uso do Agente de IA (AI-LOG)

> **Disciplina:** Programação Web II (PPW II)  
> **Tema 08:** Controle de Empréstimo de Livros / Equipamentos Internos  
> **Aluno:** Gabriel Soares Pedrosa (`bi3041271`)  
> **Repositório:** Atividade 3 (`atvs avaliativas/atv3`)  
> **Ferramenta de IA Utilizada:** Antigravity IDE (Google DeepMind Agentic Coding Framework)  
> **Banco Oficial:** PostgreSQL Institucional (`10.102.55.11:5432`, schema `bi3041271`)

---

## 📌 Como estruturei o trabalho com o Agente

Para a Atividade 3, resolvi utilizar o **Antigravity** como meu assistente de desenvolvimento (pair programmer). Como os temas de Máquina de Estados, Concorrência, Auditoria e Multas vieram de textos complementares bem densos, eu precisava de uma forma ágil de entender a teoria, planejar a arquitetura e implementar tudo sem me perder.

O fluxo que adotei foi:
1. **Montar o "cérebro" do agente (`brain`):** Dei as instruções iniciais de comportamento, criei a pasta `brain/`, subi nela os textos complementares do professor, o enunciado da atividade e os critérios de avaliação, e instruí o agente a registrar o histórico de planejamento.
2. **Delimitar o escopo e ambiente:** Deixei claro que ele só podia mexer na pasta `atvs avaliativas/atv3`, que usaríamos a nossa Atividade 2 como base e que iríamos nos conectar diretamente ao PostgreSQL da faculdade.
3. **Estudo prévio dos textos:** Pedi para ele ler os PDFs e me trazer resumos didáticos dos 4 temas centrais para eu dominar o conceito antes de mexer no código.
4. **Geração do `/plan` geral:** Com os conceitos claros, pedi um plano macro de execução ordenado logicamente.
5. **Planos específicos e desenvolvimento interativo:** Conforme fomos avançando etapa por etapa, fui mandando prompts técnicos, o agente montava o plano de ação, eu analisava, corrigia o que achava que estava errado ou simplista demais, e mandava ele executar.

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

## 📚 Passo 2: Estudo dos Textos Complementares e Resumo Didático

Antes de sair escrevendo código, pedi para o agente analisar os textos do professor que estavam no `brain` e me trazer uma explicação prática de cada um, para eu entender o "porquê" de cada requisito.

### Meu Prompt:
```text
Analise os textos complementares que subi na pasta brain e me traga um resumo didático 
e direto ao ponto de cada um dos 4 temas principais da Atividade 3:
1. Máquina de Estados Finita (FSM)
2. Rastreabilidade e Auditoria (Audit Log)
3. Conflitos Assíncronos e Expiração
4. Multas e Bloqueios
Explique o que cada um significa na prática para o meu tema (Empréstimo de Livros/Equipamentos).
```

### Resumo que o Agente me trouxe:
O agente gerou uma síntese que me ajudou a clarear os requisitos:
- **FSM:** Um livro não pode simplesmente "mudar para qualquer status". Ele começa como `RESERVADO`, só pode ir para `RETIRADO` se for retirado, e só pode ir para `DEVOLVIDO` se antes estava retirado. O CRUD com `PUT` tradicional permite burlar isso se o status for um campo livre.
- **Audit Log:** Em sistemas sérios você nunca dá apenas `UPDATE` de status apagando o anterior. Cada mudança gera uma linha histórica imutável dizendo quem mudou, que horas, qual era o status velho e qual o novo.
- **Conflitos Assíncronos & Expiração:** Se alguém reserva um livro e não busca em 48h, a reserva tem que expirar para liberar o livro para outros. O desafio é fazer isso sem depender de um cron job no servidor que possa parar do nada.
- **Multas & Bloqueio:** Se devolver com atraso, a multa deve ser progressiva (quanto mais dias atrasado, mais cara a diária), e o usuário inadimplente não pode fazer novas reservas enquanto não regularizar.

Com esses conceitos fixados na minha cabeça, estávamos prontos para o plano prático.

---

## 📋 Passo 3: O `/plan` Geral da Atividade 3

Pedi para o agente criar um plano geral ordenado para executarmos a atividade do início ao fim sem pular etapas.

### Meu Prompt:
```text
Agora que entendemos a teoria, monte um /plan geral da Atividade 3 estruturando a implementação 
numa ordem lógica, desde o setup da base e banco até a entrega final e documentação.
```

### O Plano Geral que ele estruturou no `brain/`:
```markdown
# /plan Geral - Atividade 3: Sistema de Empréstimos (Tema 08)
- [x] Etapa 1: Copiar a base da Atividade 2 para atv3 e conectar no PostgreSQL institucional.
- [x] Etapa 2: Implementar a Máquina de Estados Finita (FSM) no Domínio com bloqueio HTTP 422.
- [x] Etapa 3: Implementar a Trilha de Auditoria (Audit Log) com persistência atômica ACID.
- [x] Etapa 4: Implementar Concorrência e Expiração Automática de Reservas (Lazy Evaluation).
- [x] Etapa 5: Implementar o Serviço de Multas Progressivas e Bloqueio Preventivo.
- [x] Etapa 6: Ajustar o Frontend Next.js para refletir ações semânticas e feedbacks da FSM.
- [x] Etapa 7: Refinar UI, layout e eliminar scrolls indesejados.
- [x] Etapa 8: Criar seed com dados de teste e documentação final (README, AI-LOG, Guia Oral).
```

Aprovado o plano geral, fomos atacando etapa por etapa.

---

## 🗄️ Passo 4: Migração da ATV2 e Conexão ao PostgreSQL (A Primeira Correção)

Começamos clonando a base da `atv2` para a pasta `atv3` e configurando a conexão com o banco oficial da faculdade.

### Meu Prompt:
```text
Vamos fazer a Etapa 1 do plano. Copie o client e o server da pasta 'atvs avaliativas/atv2' 
para a pasta 'atvs avaliativas/atv3'.
Depois, configure o .env do server para conectar no PostgreSQL oficial da faculdade:
DATABASE_URL="postgresql://bi3041271:BI3041271@10.102.55.11:5432/postgres?schema=bi3041271"
Analise o schema.prisma e me diga o que vai rodar no banco.
```

### O Plano Proposto pelo Agente:
O agente copiou os arquivos, ajustou o `.env` e sugeriu:
> *"Vou alterar o provider do `schema.prisma` para `postgresql` e rodar no terminal:  
> `npx prisma db push --force-reset`  
> Isso vai limpar o banco remoto e subir as tabelas da Atividade 3 novinhas sem conflito."*

### Minha Intervenção / Correção:
> *"Opa, para aí! Jamais rode `--force-reset` nesse banco. Esse schema `bi3041271` é o meu schema oficial da faculdade e já tem tabelas de outros trabalhos meus (como a tabela `tickets`). Se você der force-reset vai apagar o que eu já entreguei em outras matérias!  
> Primeiro rode `npx prisma db pull --print` pra gente ver o que tem lá dentro. Depois mantenha essas tabelas existentes no `schema.prisma` e crie as nossas com o prefixo `web2_A1_` e `web2_A3_`. Aí sim você roda o `prisma db push` normal, sem reset."*

### O que o Agente Executou:
- Rodou o pull, identificou a tabela `tickets` existente (com 3 registros) e os enums `Prioridade` e `Status`.
- Preservou tudo no [`schema.prisma`](file:///c:/Users/soares/Documents/Faculdade/4º%20semestre/web2/ppw-cocao/atvs%20avaliativas/atv3/ppw_test_server/prisma/schema.prisma).
- Mapeou a tabela de empréstimos para `web2_A1_emprestimos` e a de auditoria para `web2_A3_historico_emprestimos`.
- Sincronizou com o banco com sucesso sem perder um único dado antigo.
- Commitou na branch `feature/database-postgres`.

---

## 🔄 Passo 5: Implementando a FSM no Domínio (Segunda Correção)

Avançamos para a Etapa 2: transformar a troca de status em uma Máquina de Estados Finita.

### Meu Prompt:
```text
Vamos para a Etapa 2. Na atv2 a gente tinha um PUT que recebia o status e gravava direto. 
Quero remover essa alteração livre de status. O status agora só pode mudar através de ações: 
retirar, devolver, renovar e cancelar.
Se o cara tentar fazer uma transição inválida (tipo tentar devolver um livro que está só reservado), 
o sistema tem que recusar. Como vamos implementar isso no NestJS?
```

### O Plano Proposto pelo Agente:
O agente sugeriu colocar a validação direto na Controller:
> *"Podemos manter o controller e colocar uns `if/else` no método: se o status atual for `RESERVADO` e ele mandar devolver, a gente dá um `throw new BadRequestException('Transição inválida')` (HTTP 400)."*

### Minha Intervenção / Correção:
> *"Não gostei dessa ideia de encher a Controller de `if`. Se a gente fizer isso, a regra de negócio vaza para fora do Domínio e viola a Clean Architecture que o professor cobra. E HTTP 400 é erro de sintaxe ruim; aqui a sintaxe tá certa, o que tá errado é a regra de negócio, então o código correto é **HTTP 422 (Unprocessable Entity)**.  
> Vamos fazer direito: crie um Value Object de Domínio chamado `StatusEmprestimo` com a matriz de transições válidas dentro dele. Na entidade `Emprestimo`, crie os métodos de negócio (`registrarRetirada`, `registrarDevolucao`, etc.) que chamam a validação do Value Object. Se for inválido, lance uma exceção customizada `TransicaoInvalidaException` que retorne 422."*

### O que o Agente Executou:
- Criou o Value Object [`status-emprestimo.value-object.ts`](file:///c:/Users/soares/Documents/Faculdade/4º%20semestre/web2/ppw-cocao/atvs%20avaliativas/atv3/ppw_test_server/src/module/emprestimos/domain/value-objects/status-emprestimo.value-object.ts) com a matriz `TRANSICOES_VALIDAS_FSM`.
- Criou a exceção [`transicao-invalida.exception.ts`](file:///c:/Users/soares/Documents/Faculdade/4º%20semestre/web2/ppw-cocao/atvs%20avaliativas/atv3/ppw_test_server/src/module/emprestimos/domain/exceptions/transicao-invalida.exception.ts) retornando 422.
- Adicionou as rotas semânticas no [`emprestimos.controller.ts`](file:///c:/Users/soares/Documents/Faculdade/4º%20semestre/web2/ppw-cocao/atvs%20avaliativas/atv3/ppw_test_server/src/module/emprestimos/presentation/emprestimos.controller.ts): `POST /emprestimos/:id/retirar`, `/devolver`, `/renovar`, `/cancelar`.
- Commitou na branch `feature/fsm-maquina-estados`.

---

## 📜 Passo 6: Trilha de Auditoria (Audit Log) com Transação ACID (Terceira Correção)

Na Etapa 3, fomos fazer o registro imutável do histórico de cada ação.

### Meu Prompt:
```text
Agora a Etapa 3: toda vez que o status mudar (retirar, devolver, cancelar, etc.), 
precisamos gravar um registro na tabela 'web2_A3_historico_emprestimos' com:
id, emprestimoId, statusAnterior, statusNovo, alteradoPor, motivo e data.
Como você vai salvar isso no repositório do Prisma?
```

### O Plano Proposto pelo Agente:
O agente propôs:
```typescript
// Sugestão inicial do agente no repositório:
await this.prisma.web2_A1_emprestimos.update({ where: { id }, data: { status } });
await this.prisma.web2_A3_historico_emprestimos.create({ data: { ...dadosLog } });
```

### Minha Intervenção / Correção:
> *"Se você fizer dois `await` soltos assim, se a conexão oscilar ou der erro no insert do histórico, o empréstimo vai ter mudado de status mas o histórico não vai ter sido gravado. Isso quebra a consistência que o texto de auditoria exige.  
> Coloque os dois comandos dentro de um `this.prisma.$transaction(async (tx) => { ... })`. Se o histórico der erro, o update do empréstimo tem que sofrer rollback imediato. É isso que significa transação ACID."*

### O que o Agente Executou:
- Atualizou o método no repositório [`emprestimo.prisma.write.repository.ts`](file:///c:/Users/soares/Documents/Faculdade/4º%20semestre/web2/ppw-cocao/atvs%20avaliativas/atv3/ppw_test_server/src/module/emprestimos/infrastructure/adapters/emprestimo.prisma.write.repository.ts) envolvendo o `tx.web2_A1_emprestimos.update` e o `tx.web2_A3_historico_emprestimos.create` sob a mesma transação atômica.
- Criou a rota `GET /emprestimos/:id/historico` para retornar a timeline de auditoria.
- Commitou na branch `feature/audit-log-acid`.

---

## ⏱️ Passo 7: Expiração de Reservas sem Cron Job - Lazy Evaluation (Quarta Correção)

Na Etapa 4, fomos resolver a expiração automática de reservas não retiradas no prazo de 48h.

### Meu Prompt:
```text
Vamos para a Etapa 4. Se um usuário fizer uma reserva e não for buscar o livro em 48 horas 
(dataLimiteRetirada), o status tem que virar EXPIRADO para liberar o livro para outros.
Mas tem um detalhe: não quero instalar cron job no Linux nem ferramentas externas no servidor. 
Como resolver isso puramente no código?
```

### O Plano Proposto pelo Agente:
O agente sugeriu colocar um timer no Node:
> *"Podemos colocar um `setInterval` no `main.ts` rodando a cada 60 segundos que busca todas as reservas vencidas e faz o update para `EXPIRADO`."*

### Minha Intervenção / Correção:
> *"Usar `setInterval` no Node é furada: se o servidor reiniciar ou cair, o timer morre. E se amanhã rodar em duas instâncias (cluster), vão ficar dois timers brigando no banco.  
> O texto fala sobre avaliação sob demanda. Vamos usar o padrão **Lazy Evaluation (Avaliação Preguiçosa / Just-in-Time)**: sempre que alguém for listar os empréstimos ou tentar reservar/alocar um recurso, o repositório roda na hora um `updateMany` no banco marcando como `EXPIRADO` tudo que venceu (`dataLimiteRetirada < agora`). Assim a gente não gasta CPU à toa e os dados estão sempre 100% atualizados no exato momento da consulta."*

### O que o Agente Executou:
- Implementou o método `expirarReservasVencidas()` disparado de forma preguiçosa nas queries de busca e gravação do repositório.
- Testamos criando uma reserva com data passada e ao listar ela já retornou com status `EXPIRADO`.
- Commitou na branch `feature/multas-expiracao-lazy`.

---

## 💰 Passo 8: Multas Progressivas e Bloqueio Preventivo (Quinta Correção)

Na Etapa 5, entramos na regra de devoluções atrasadas e penalidades financeiras.

### Meu Prompt:
```text
Agora a Etapa 5:
1. Quando um livro for devolvido com atraso, deve calcular uma multa progressiva por dias de atraso.
2. Usuário que tiver qualquer livro atrasado fica impedido de fazer novas reservas.
Como você pensou em calcular esse valor da multa e validar o bloqueio?
```

### O Plano Proposto pelo Agente:
O agente planejou:
> *"Podemos fazer um cálculo simples: `valorMulta = diasAtraso * 2.50`. E para o bloqueio, criamos uma coluna `bloqueado` no usuário e checamos `if (usuario.bloqueado)`."*

### Minha Intervenção / Correção:
> *"Não, o cálculo não pode ser linear simples. O objetivo pedagógico do texto é mostrar regra de negócio progressiva. Crie um serviço de domínio `CalculadoraMultaService` com faixas de cobrança:  
> - 1º ao 3º dia: R$ 2,00 por dia  
> - 4º ao 7º dia: R$ 3,50 por dia  
> - 8º dia em diante: R$ 5,00 por dia (além de R$ 50 se tiver avaria).  
> E sobre o bloqueio, não precisa criar tabela nem coluna de usuário: faça a checagem dinâmica no próprio repositório: se o usuário tiver algum empréstimo ativo com status `ATRASADO`, barra a reserva imediatamente com HTTP 422."*

### O que o Agente Executou:
- Criou o [`calculadora-multa.service.ts`](file:///c:/Users/soares/Documents/Faculdade/4º%20semestre/web2/ppw-cocao/atvs%20avaliativas/atv3/ppw_test_server/src/module/emprestimos/domain/services/calculadora-multa.service.ts) com o cálculo por faixas progressivas.
- Adicionou a verificação dinâmica no repositório antes de criar novas reservas.
- Criou o [`seed.ts`](file:///c:/Users/soares/Documents/Faculdade/4º%20semestre/web2/ppw-cocao/atvs%20avaliativas/atv3/ppw_test_server/prisma/seed.ts) populando 6 casos reais no PostgreSQL da faculdade (incluindo casos com atraso e multa calculada para testar).

---

## 🎨 Passo 9: Refatorando o Frontend, Excesso de Botões e Resolução de Scroll (Mudança de Planos)

Na Etapa 6 e 7, fomos rodar o frontend Next.js (`ppw_test_client`) para testar na tela. Ao abrir, notei que a tabela tinha ficado muito carregada.

### Meu Feedback / Prompt:
```text
Ok, o css dos itens na lista ficou ruim, muito botão sem organização.
Ta ruim ainda, ficou com scroll horizontal, se quiser pode tirar o css inline 
e criar um arquivo separado, mas analisa.
O botão de renovar pode aparecer na barra também.
```

### O que Estava Acontecendo na Tela:
A primeira versão colocava 6 botões soltos em cada linha (`Retirar`, `Cancelar`, `Renovar`, `Devolver`, `Histórico`, `Editar`, `Excluir`), além de classes gigantescas do Tailwind inline. A tabela estourava a largura da tela e criava uma barra de rolagem horizontal horrível (`overflow-x-auto`).

### Como Conduzi a Solução:
1. **Mandei isolar o CSS:** Criamos o [`emprestimos.module.css`](file:///c:/Users/soares/Documents/Faculdade/4º%20semestre/web2/ppw-cocao/atvs%20avaliativas/atv3/ppw_test_client/src/features/emprestimos/components/emprestimos.module.css) com `table-layout: fixed; width: 100%`, tirando a bagunça de classes do JSX.
2. **Unifiquei colunas:** Juntei o *Item* e o *Solicitante* na mesma coluna com hierarquia de texto, liberando espaço horizontal.
3. **Organizei os botões:**
   - Botão primário contextual na barra: se tá reservado aparece **Retirar**; se tá em uso aparece **Devolver**.
   - Pedi pro botão **Renovar** ficar visível direto na barra também para facilitar o uso no dia a dia.
   - Botão direto de **Histórico** com ícone para abrir o modal da trilha de auditoria.
   - As ações secundárias de cadastro (*Editar* e *Excluir*) foram para um menu dropdown discreto com Radix UI (`DropdownMenu`).
4. **Filtros e Métricas:** Adicionei abas no topo (*Todos*, *Reservados*, *Em Aberto*, *Atrasados*, *Finalizados*) e cards de resumo com total de multas acumuladas.

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

## 🎯 Síntese: Onde o Agente Tentou Simplificar e Onde Eu Corrigi

| Etapa | O que o Agente propôs de início | Minha Correção de Rumos |
| :--- | :--- | :--- |
| **Banco de Dados** | Rodar `prisma db push --force-reset` | Bloqueei o reset para não apagar a tabela `tickets` existente no meu schema institucional; fiz pull e preservei os dados legados. |
| **FSM / Transições** | Colocar validação com `if` solto na Controller com `HTTP 400` | Exigi Value Object puro no Domínio (`StatusEmprestimo`) e exceção semântica com `HTTP 422`. |
| **Audit Log** | Fazer dois `await` soltos (update e create) | Exigi que as duas operações rodassem sob a mesma transação atômica (`$transaction`) para garantir consistência ACID. |
| **Expiração** | Criar um `setInterval` de 60s rodando no Node | Rejeitei o timer em memória e adotei *Lazy Evaluation* no banco disparado sob demanda. |
| **Multas** | Multiplicação simples (`dias * 2.5`) e flag estática no usuário | Criei a `CalculadoraMultaService` com 3 faixas progressivas e checagem dinâmica de atrasos no repositório. |
| **Interface / CSS** | Deixar 6 botões soltos por linha e scroll horizontal na tabela | Mandei tirar o CSS inline para um arquivo separado (`.module.css`), usei `table-layout: fixed`, deixei o botão Renovar na barra e guardei o restante no dropdown. |

---

## 🏁 Conclusão

Trabalhar com o Antigravity como pair programmer me deu muita velocidade para prototipar e escrever código repetitivo, mas o papel crítico de **arquitetura, regras de negócio e proteção do banco** foi 100% meu. 

O resultado final é um sistema completo, rodando conectado ao PostgreSQL da faculdade, com código limpo (Clean Architecture), zero erros de compilação no NestJS e no Next.js, e pronto para a arguição oral.
