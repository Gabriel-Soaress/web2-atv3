# 🤖 Diário de Bordo do Agente & Engenharia Supervisionada (AI-LOG)

> **Disciplina:** Programação Web II (PPW II)  
> **Tema 08:** Controle de Empréstimo de Livros / Equipamentos Internos  
> **Aluno / Líder Técnico:** Gabriel Soares Pedrosa (`bi3041271`)  
> **Ambiente do Agente:** Antigravity (Google DeepMind Agentic Coding Framework)  
> **Repositório Oficial:** Atividade 3 (`atvs avaliativas/atv3`)  
> **Banco Oficial:** PostgreSQL Institucional (`10.102.55.11:5432`, schema `bi3041271`)

---

## 🧭 Metodologia: Engenharia Guiada por Agente (Human-in-the-Loop)

Nesta atividade, o desenvolvimento foi conduzido através de um fluxo formal de **Agentic Pair Programming**:
1. **Tech Lead (Gabriel):** Formula prompts técnicos robustos com restrições arquiteturais explícitas, define o escopo, audita os planos gerados e intervém rejeitando atalhos que violem o Domínio ou ponham em risco a integridade dos dados.
2. **Agente (Antigravity):** Opera com autonomia de ferramentas (leitura e edição de código, terminal, inspeção de banco e compilação), gerando planos executivos estruturados antes de qualquer alteração destrutiva.
3. **Memória Persistente (`brain/`):** Todos os planos de ação, logs de raciocínio, transcrições e checkpoints de tarefas são armazenados no diretório `brain/`, garantindo rastreabilidade do raciocínio e continuidade do projeto.

Abaixo estão narrados os 7 ciclos completos de interação, demonstrando a formulação dos prompts técnicos, os planos propostos pelo agente, as correções arquiteturais do aluno e as evidências de código implementadas.

---

## 📑 Ciclo 01: Governança do Agente, Contexto de Memória (`brain`) e Diretrizes de Engenharia

### 1. Contexto e Motivação
Para evitar que o agente tome iniciativas desordenadas (como misturar regras de negócio na interface, gerar código monolítico ou alterar arquivos fora do escopo da Atividade 3), foi necessário estabelecer a constituição de regras do agente e a criação do diretório de memória persistente `brain/`.

### 2. Prompt Técnico do Líder (Gabriel)
```text
Atue como meu agente pair programmer no desenvolvimento da Atividade 3 de PPW II. 
Antes de inspecionar ou alterar qualquer linha de código, configure seu ambiente de governança 
seguindo rigorosamente estas restrições:
1. Escopo de Trabalho: trabalhe estritamente dentro de 'atvs avaliativas/atv3'. Não toque na atv1 ou atv2.
2. Arquitetura: respeite a Clean Architecture já iniciada. O Domínio deve ser puro (sem Prisma, sem decorators web).
3. Memória Persistente: inicialize o diretório de memória 'brain/' onde você deverá armazenar seus artefatos, 
   planos executivos e transcrições das tarefas.
4. Padrão de Engenharia: trabalhe com TypeScript estrito, commits semânticos em branches dedicadas para cada feature 
   e responda sempre em português (BR).
5. Modo de Operação: antes de qualquer mudança complexa, apresente o plano de execução (arquivos que serão criados/alterados 
   e riscos) e aguarde minha autorização técnica antes de proceder.
Confirme a inicialização da governança e apresente o plano de trabalho geral da Atividade 3.
```

### 3. Plano Proposto pelo Agente (`plan_execucao_atv3.md` no `brain/`)
```markdown
# Plano Geral de Execução - Atividade 3
- [ ] Etapa 1: Setup do Workspace e migração da base da Atividade 2 para a pasta atv3.
- [ ] Etapa 2: Conexão com o PostgreSQL institucional da faculdade.
- [ ] Etapa 3: Implementação da Máquina de Estados Finita (FSM) no módulo de Empréstimos.
- [ ] Etapa 4: Implementação da Trilha de Auditoria com transações ACID.
- [ ] Etapa 5: Implementação de Concorrência e Expiração Automática de Reservas.
- [ ] Etapa 6: Cálculo Progressivo de Multas e Bloqueio Preventivo.
- [ ] Etapa 7: Refinamento de Interface e Feedback de Erros (HTTP 422).
- [ ] Etapa 8: Documentação final (README com Mermaid, AI-LOG e Guia de Estudos).

Diretrizes assimiladas:
- Memória de contexto persistida em <appDataDir>/brain/<conversation-id>/
- Commits por branches de feature.
- Aguardo autorização para iniciar a Etapa 1.
```

### 4. Intervenção e Comando do Gabriel
> *"Plano e governança aprovados. Vamos iniciar pela Etapa 1 e 2: preparar o workspace e conectar ao banco oficial da faculdade."*

### 5. Resultado / Evidência Técnica
- Diretório `brain/` ativo com artefato estruturado de planejamento.
- Repositório inicializado em `atvs avaliativas/atv3`.

---

## 📑 Ciclo 02: Migração Guiada da Atividade 2 e Conexão Segura ao PostgreSQL Institucional

### 1. Contexto e Motivação
A Atividade 3 evolui a base de código da Atividade 2. O objetivo era copiar o cliente (`ppw_test_client`) e o servidor (`ppw_test_server`) para a pasta `atv3` e configurar a conexão com o PostgreSQL compartilhado da faculdade.

### 2. Prompt Técnico do Líder (Gabriel)
```text
Vamos executar a migração inicial. Copie a base funcional de 'atvs avaliativas/atv2' para 'atvs avaliativas/atv3'.
Em seguida, configure as variáveis de ambiente (.env) do servidor para apontar para o banco oficial da faculdade:
DATABASE_URL="postgresql://bi3041271:BI3041271@10.102.55.11:5432/postgres?schema=bi3041271"

Atenção crítica: esse schema é compartilhado com outros trabalhos avaliativos meus no semestre. 
Não podemos perder dados existentes. Como você planeja sincronizar o schema.prisma com o banco remoto? 
Apresente o plano antes de rodar comandos de banco.
```

### 3. Plano Inicial Proposto pelo Agente
```markdown
### Plano de Sincronização do Banco
1. Clonar arquivos de atv2 para atv3.
2. Atualizar o ppw_test_server/.env com a nova DATABASE_URL.
3. No schema.prisma, mudar datasource db: provider = "postgresql".
4. Rodar no terminal:
   npx prisma db push --force-reset
Isso garantirá que o banco remoto fique limpo e sincronizado com os modelos novos sem conflitos de tipo.
```

### 4. Intervenção Crítica e Correção do Gabriel
> *"Pare! Jamais execute `--force-reset` em um banco compartilhado. O schema `bi3041271` já contém a tabela `tickets` de outra disciplina e o `--force-reset` vai apagar meus dados avaliados.  
> Altere o plano: primeiro rode `npx prisma db pull --print` para inspecionar o que já existe lá. Depois, inclua essas tabelas legadas no `schema.prisma` para o Prisma reconhecê-las, adicione o prefixo `web2_A1_emprestimos` e `web2_A3_historico_emprestimos` para isolar nosso escopo, e só então rode o `prisma db push` seguro sem nenhum flag de reset. Prossiga com essa correção."*

### 5. Execução do Agente e Evidência no Código
- O agente executou `prisma db pull --print` e detectou:
  - Tabela `tickets` (com 3 registros legados preservados).
  - Enums `Prioridade` e `Status`.
- O arquivo [`schema.prisma`](file:///c:/Users/soares/Documents/Faculdade/4º%20semestre/web2/ppw-cocao/atvs%20avaliativas/atv3/ppw_test_server/prisma/schema.prisma) foi estruturado com segurança com mapeamento `@map("web2_A1_emprestimos")`.
- Executado `npx prisma db push`: **0 dados perdidos, tabelas criadas no PostgreSQL oficial**.
- Branch criada e commitada: `feature/database-postgres`.

---

## 📑 Ciclo 03: Arquitetura da Máquina de Estados Finita (FSM) no Domínio vs. Validações Soltas na Controller

### 1. Contexto e Motivação
A atividade exige substituir o CRUD genérico por uma Máquina de Estados Finita (FSM), garantindo que um empréstimo só transicione por eventos válidos (ex: `RESERVADO -> RETIRADO -> DEVOLVIDO`).

### 2. Prompt Técnico do Líder (Gabriel)
```text
Com base no texto complementar sobre Máquinas de Estados Finitas, precisamos eliminar o endpoint 
PUT /emprestimos/:id que permitia edição arbitrária de status. 
Status de empréstimo é consequência de evento de negócio, não atributo editável de formulário.
Quero uma arquitetura onde:
1. As transições válidas sejam imutáveis e fiquem encapsuladas no Domínio.
2. Qualquer tentativa de salto ilógico seja barrada com código HTTP 422 (Unprocessable Entity).
3. A API deve expor endpoints semânticos orientados a ações: /retirar, /devolver, /renovar, /cancelar.
Apresente a proposta de classes e onde ficará cada responsabilidade.
```

### 3. Plano Inicial Proposto pelo Agente
```markdown
### Proposta de Arquitetura FSM
1. Manter o PUT no EmprestimosController, mas adicionar uma validação interna:
   ```typescript
   if (novoStatus === 'DEVOLVIDO' && statusAtual !== 'RETIRADO' && statusAtual !== 'ATRASADO') {
     throw new BadRequestException('Não é possível devolver um item que não foi retirado');
   }
   ```
2. Adicionar métodos POST /retirar e POST /devolver que apenas chamam o service passando o status hardcoded.
```

### 4. Intervenção Crítica e Correção do Gabriel
> *"Seu plano viola a Clean Architecture e as convenções REST.  
> 1. Validação por `if` solto na Controller polui a camada de apresentação com regras de negócio. Se amanhã criarmos uma CLI ou fila, essa validação se perde.  
> 2. `HTTP 400 Bad Request` está errado: o payload é sintaticamente válido, o que falhou foi uma regra semântica de negócio; o padrão da indústria para isso é **HTTP 422 Unprocessable Entity**.  
> 3. Remova completamente o `PUT` de status. Crie um Value Object de Domínio `StatusEmprestimo` contendo a matriz de transições válidas. Na entidade `Emprestimo`, crie métodos explícitos (`registrarRetirada()`, `registrarDevolucao()`, `cancelarReserva()`) que invocam a guarda do Value Object e lançam uma exceção de domínio personalizada `TransicaoInvalidaException` (422). Ajuste o plano e execute."*

### 5. Execução do Agente e Evidência no Código
- Criado o Value Object [`status-emprestimo.value-object.ts`](file:///c:/Users/soares/Documents/Faculdade/4º%20semestre/web2/ppw-cocao/atvs%20avaliativas/atv3/ppw_test_server/src/module/emprestimos/domain/value-objects/status-emprestimo.value-object.ts):
  ```typescript
  export const TRANSICOES_VALIDAS_FSM: Record<StatusEmprestimoEnum, StatusEmprestimoEnum[]> = {
    RESERVADO: [StatusEmprestimoEnum.RETIRADO, StatusEmprestimoEnum.CANCELADO, StatusEmprestimoEnum.EXPIRADO],
    RETIRADO: [StatusEmprestimoEnum.DEVOLVIDO, StatusEmprestimoEnum.DEVOLVIDO_COM_MULTA, StatusEmprestimoEnum.ATRASADO],
    ATRASADO: [StatusEmprestimoEnum.DEVOLVIDO, StatusEmprestimoEnum.DEVOLVIDO_COM_MULTA],
    DEVOLVIDO: [],
    DEVOLVIDO_COM_MULTA: [],
    EXPIRADO: [],
    CANCELADO: [],
  };
  ```
- Criada a exceção [`transicao-invalida.exception.ts`](file:///c:/Users/soares/Documents/Faculdade/4º%20semestre/web2/ppw-cocao/atvs%20avaliativas/atv3/ppw_test_server/src/module/emprestimos/domain/exceptions/transicao-invalida.exception.ts) mapeada com `HttpStatus.UNPROCESSABLE_ENTITY` (422).
- Endpoints semânticos criados no [`emprestimos.controller.ts`](file:///c:/Users/soares/Documents/Faculdade/4º%20semestre/web2/ppw-cocao/atvs%20avaliativas/atv3/ppw_test_server/src/module/emprestimos/presentation/emprestimos.controller.ts).
- Branch commitada: `feature/fsm-maquina-estados`.

---

## 📑 Ciclo 04: Trilha de Auditoria (Audit Log) com Transações Atômicas ACID

### 1. Contexto e Motivação
A atividade exige que cada transição de estado seja gravada em uma tabela append-only imutável (`web2_A3_historico_emprestimos`), registrando o estado anterior, o novo estado, o autor da ação, a data/hora e justificativa.

### 2. Prompt Técnico do Líder (Gabriel)
```text
Precisamos implementar a Trilha de Auditoria (Audit Log). 
A regra é imutabilidade: transições nunca sobrescrevem dados passados, sempre criam um registro histórico.
Requisito obrigatório de engenharia: consistência atômica. O status do empréstimo NÃO pode mudar no banco 
se a criação do log falhar por qualquer motivo (queda de conexão, violação de constraint, etc.).
Como você planeja estruturar a persistência no repositório Prisma?
```

### 3. Plano Inicial Proposto pelo Agente
```markdown
### Proposta de Persistência do Log
No repositório EmprestimoPrismaWriteRepository:
```typescript
async atualizarStatus(id: string, novoStatus: string, anterior: string) {
  await this.prisma.emprestimo.update({
    where: { id },
    data: { status: novoStatus }
  });
  await this.prisma.historico.create({
    data: { emprestimoId: id, statusAnterior: anterior, statusNovo: novoStatus }
  });
}
```
```

### 4. Intervenção Crítica e Correção do Gabriel
> *"Esse plano comete um erro primário de sistemas distribuídos: duas chamadas assíncronas soltas (`await update` seguido de `await create`) NÃO formam uma transação atômica. Se o servidor for interrompido ou o banco recusar o insert do histórico, o empréstimo já terá mudado de status e a auditoria ficará permanentemente corrompida.  
> Refatore o repositório para encapsular as duas operações obrigatoriamente dentro de `this.prisma.$transaction(async (tx) => { ... })`. Garanta rollback automático total caso qualquer uma das duas operações falhe. Mostre a implementação corrigida."*

### 5. Execução do Agente e Evidência no Código
- O agente implementou a transação atômica em [`emprestimo.prisma.write.repository.ts`](file:///c:/Users/soares/Documents/Faculdade/4º%20semestre/web2/ppw-cocao/atvs%20avaliativas/atv3/ppw_test_server/src/module/emprestimos/infrastructure/adapters/emprestimo.prisma.write.repository.ts):
  ```typescript
  return this.prisma.$transaction(async (tx) => {
    const updated = await tx.web2_A1_emprestimos.update({ ... });
    await tx.web2_A3_historico_emprestimos.create({
      data: {
        id: randomUUID(),
        emprestimoId: entity.id,
        statusAnterior,
        statusNovo,
        motivo,
        alteradoPor,
        criadoEm: new Date(),
      },
    });
    return EmprestimoPrismaMapper.toDomain(updated);
  });
  ```
- Endpoint `GET /emprestimos/:id/historico` implementado para consulta da linha do tempo.
- Branch commitada: `feature/audit-log-acid`.

---

## 📑 Ciclo 05: Concorrência Assíncrona e Expiração Automática por Lazy Evaluation

### 1. Contexto e Motivação
O texto complementar sobre conflitos assíncronos discute a expiração de reservas não retiradas após o prazo de tolerância (48 horas). O objetivo era desocupar os recursos automaticamente sem recorrer a ferramentas externas no servidor.

### 2. Prompt Técnico do Líder (Gabriel)
```text
Como tratar a expiração de reservas vencidas (quando dataLimiteRetirada < agora)?
Não quero depender de um cron job no Linux ou daemon externo rodando em background, 
pois isso cria dependência de infraestrutura externa e pode falhar silenciosamente no ambiente da faculdade.
Apresente uma estratégia puramente no código da aplicação/banco de dados.
```

### 3. Plano Inicial Proposto pelo Agente
```markdown
### Proposta de Expiração sem Cron
Podemos inicializar um setInterval no main.ts do NestJS rodando a cada 60 segundos:
```typescript
setInterval(async () => {
  const expired = await prisma.web2_A1_emprestimos.findMany({
    where: { status: 'RESERVADO', dataLimiteRetirada: { lt: new Date() } }
  });
  // percorre e atualiza para EXPIRADO
}, 60000);
```
```

### 4. Intervenção Crítica e Correção do Gabriel
> *"Rejeito a ideia do `setInterval`. Timer em processo Node.js é um antipadrão clássico: se o processo reiniciar os timers se perdem; se escalarmos a API para duas réplicas (cluster/PM2), dois timers competirão gravando no banco gerando lock de linhas desnecessário.  
> A solução correta é o padrão **Lazy Evaluation (Avaliação Preguiçosa / Just-in-Time)**: sempre que qualquer usuário listar as reservas ou solicitar um novo empréstimo, executamos uma consulta atômica com `updateMany` dentro da transação que expira na hora as reservas vencidas. Zero overhead de CPU ociosa e 100% de consistência. Altere o repositório para essa abordagem."*

### 5. Execução do Agente e Evidência no Código
- O agente implementou o método privado `expirarReservasVencidas()` no repositório de leitura e escrita:
  ```typescript
  private async expirarReservasVencidas(): Promise<void> {
    const agora = new Date();
    await this.prisma.web2_A1_emprestimos.updateMany({
      where: {
        status: 'RESERVADO',
        dataLimiteRetirada: { lt: agora },
      },
      data: { status: 'EXPIRADO' },
    });
  }
  ```
- O método é invocado automaticamente antes de listagens e alocações de itens, garantindo estado sempre atualizado.
- Branch commitada: `feature/multas-expiracao-lazy`.

---

## 📑 Ciclo 06: Serviço de Domínio de Multas Progressivas e Bloqueio Preventivo Dinâmico

### 1. Contexto e Motivação
A devolução com atraso deve calcular multas progressivas conforme o número de dias de inadimplência, além de bloquear sumariamente novas reservas para usuários em situação irregular.

### 2. Prompt Técnico do Líder (Gabriel)
```text
Precisamos implementar a lógica de multas e bloqueio preventivo:
1. A multa deve ser progressiva por faixas: atrasos curtos pagam menos por dia, atrasos longos pagam mais por dia.
2. Usuários que já possuam qualquer empréstimo em atraso não podem reservar nada novo no sistema.
Modele a regra de negócio como um Serviço de Domínio (Domain Service) puro e defina como será a validação de bloqueio.
```

### 3. Plano Inicial Proposto pelo Agente
```markdown
### Proposta de Multas e Bloqueio
1. Na Controller de Devolução:
   ```typescript
   const valorMulta = diasAtraso * 2.50; // multiplicação simples
   ```
2. Adicionar uma coluna booleana 'bloqueado' na tabela de Usuário e checar if (usuario.bloqueado).
```

### 4. Intervenção Crítica e Correção do Gabriel
> *"Seu plano simplificou demais a regra de negócio.  
> 1. Multiplicação linear (`dias * 2.5`) ignora o conceito de progressividade escalonada. Crie a classe de domínio `CalculadoraMultaService` com 3 faixas reais:
>    - 1º ao 3º dia: R$ 2,00 / dia
>    - 4º ao 7º dia: R$ 3,50 / dia
>    - 8º dia em diante: R$ 5,00 / dia
> 2. Não use flag estática `bloqueado` no usuário: isso exigiria rotinas manuais de sincronização. Faça uma checagem dinâmica no repositório: ao tentar criar uma reserva, faça um `findFirst` buscando se aquele `usuarioNome` possui registros com `status = 'ATRASADO'`. Se possuir, rejeite com HTTP 422 imediatamente. Execute a refatoração."*

### 5. Execução do Agente e Evidência no Código
- Criado o serviço de domínio [`calculadora-multa.service.ts`](file:///c:/Users/soares/Documents/Faculdade/4º%20semestre/web2/ppw-cocao/atvs%20avaliativas/atv3/ppw_test_server/src/module/emprestimos/domain/services/calculadora-multa.service.ts):
  ```typescript
  export class CalculadoraMultaService {
    static calcular(diasAtraso: number, temAvaria: boolean = false): number {
      if (diasAtraso <= 0) return temAvaria ? 50 : 0;
      let total = 0;
      for (let dia = 1; dia <= diasAtraso; dia++) {
        if (dia <= 3) total += 2.0;
        else if (dia <= 7) total += 3.5;
        else total += 5.0;
      }
      if (temAvaria) total += 50;
      return total;
    }
  }
  ```
- Implementado o método `verificarBloqueioUsuario` no repositório com rejeição via HTTP 422.
- Criado o script de seed [`prisma/seed.ts`](file:///c:/Users/soares/Documents/Faculdade/4º%20semestre/web2/ppw-cocao/atvs%20avaliativas/atv3/ppw_test_server/prisma/seed.ts) populando 6 cenários representativos de teste no banco remoto.

---

## 📑 Ciclo 07: Refatoração Ergonômica de Front-End, Resolução de Scroll Horizontal e Modularização CSS

### 1. Contexto e Motivação
A primeira tela gerada no Next.js concentrava dezenas de botões de ação soltos por linha (`Retirar`, `Cancelar`, `Devolver`, `Renovar`, `Histórico`, `Editar`, `Excluir`) e classes inline extensas do Tailwind, resultando em uma tabela que quebrava o layout e gerava barra de rolagem horizontal forçada (`overflow-x-auto`).

### 2. Prompt Técnico do Líder (Gabriel)
```text
A tabela de empréstimos no cliente Next.js ficou ruim:
1. Tem muito botão solto competindo por espaço, quebrando em 2 linhas de forma desordenada.
2. A tela está com barra de scroll horizontal horrível, forçando rolar para ver as ações.
3. As classes inline do Tailwind estão poluindo os arquivos JSX.
Analise a causa raiz. Se necessário, remova o CSS inline da tabela e isole em um arquivo separado. 
O botão de Renovar e os botões principais de ciclo de vida devem ser rápidos de acessar, sem estourar a tela. 
Apresente uma solução ergonômica.
```

### 3. Plano Inicial Proposto pelo Agente
```markdown
### Proposta de Ajuste na Tabela
1. Manter a div com overflow-x: scroll para garantir que a tela não quebre.
2. Reduzir a fonte dos botões de ação para text-[10px] para caberem todos lado a lado.
3. Se ainda faltar espaço, mover todas as ações para dentro de um único dropdown 'Ações'.
```

### 4. Intervenção Crítica e Correção do Gabriel
> *"Não aprovei o plano.  
> 1. Aceitar scroll horizontal em uma tabela de dashboard é má prática de UX.  
> 2. Esconder todas as ações dentro de um dropdown genérico prejudica o fluxo diário do operador da biblioteca, que precisa clicar rapidamente em 'Retirar', 'Devolver' ou 'Renovar'.  
> 3. Crie um arquivo CSS Module dedicado (`emprestimos.module.css`) com `table-layout: fixed; width: 100%`.  
> 4. Unifique as informações: coloque Item e Solicitante na mesma coluna com hierarquia tipográfica, liberando espaço horizontal.  
> 5. Defina larguras percentuais precisas (31%, 18%, 23%, 28%) para totalizar exatamente 100% da tela sem NENHUM scroll.  
> 6. Mantenha os botões principais de fluxo visíveis na barra: 'Retirar' para reservas, 'Devolver' e 'Renovar' para empréstimos em uso, o botão de auditoria com tooltip e apenas as ações secundárias de gestão no dropdown Radix UI. Execute a refatoração completa."*

### 5. Execução do Agente e Evidência no Código
- Criado o componente de menu acessível [`dropdown-menu.tsx`](file:///c:/Users/soares/Documents/Faculdade/4º%20semestre/web2/ppw-cocao/atvs%20avaliativas/atv3/ppw_test_client/src/components/ui/dropdown-menu.tsx) com `radix-ui`.
- Criado o arquivo CSS dedicado [`emprestimos.module.css`](file:///c:/Users/soares/Documents/Faculdade/4º%20semestre/web2/ppw-cocao/atvs%20avaliativas/atv3/ppw_test_client/src/features/emprestimos/components/emprestimos.module.css) aplicando larguras percentuais e removendo classes inline caóticas.
- Reestruturado [`emprestimos-columns.tsx`](file:///c:/Users/soares/Documents/Faculdade/4º%20semestre/web2/ppw-cocao/atvs%20avaliativas/atv3/ppw_test_client/src/features/emprestimos/components/emprestimos-columns.tsx) com botão de **Renovar** e **Devolver** imediatos na barra.
- Adicionadas abas de filtros rápidos e cards de métricas em [`EmprestimosTable.tsx`](file:///c:/Users/soares/Documents/Faculdade/4º%20semestre/web2/ppw-cocao/atvs%20avaliativas/atv3/ppw_test_client/src/features/emprestimos/components/EmprestimosTable.tsx).
- Compilação do Next.js validada: **0 erros, layout 100% responsivo e ZERO barra de rolagem horizontal**.
- Branches commitadas e mescladas: `feature/ui-layout-refactor`, `feature/ui-css-module-no-scroll`, `feature/ui-renovar-button-action-bar`.

---

## 📊 Matriz Comparativa: Agente Autônomo vs. Engenharia Supervisionada

| Desafio Arquitetural | O que o Agente propôs inicialmente (Atalho / Vício de IA) | Intervenção & Refatoração do Tech Lead (Gabriel) | Benefício de Engenharia de Software |
| :--- | :--- | :--- | :--- |
| **Sincronização de Banco** | `prisma db push --force-reset` | Bloqueio imediato, inspeção com `db pull` e mapeamento de dados legados | Proteção de dados reais pré-existentes no PostgreSQL compartilhado |
| **Ciclo de Vida / FSM** | Validação por `if/else` solto na Controller com `HTTP 400` | Matriz de estados no Value Object `StatusEmprestimo` e exceção de Domínio com `HTTP 422` | Regra de negócio puramente desacoplada da camada web (Clean Architecture) |
| **Audit Log** | Chamadas assíncronas soltas (`await update` e `await create`) | Envolvimento obrigatório sob `prisma.$transaction` atômico | Garantia de consistência ACID (sem logs órfãos nem status corrompido) |
| **Expiração de Reserva** | `setInterval` em memória a cada 60 segundos | Padrão *Lazy Evaluation* (Just-in-Time) executado atômica sob demanda | Eliminação de cron jobs externos, zero overhead ocioso e resiliência a reinicializações |
| **Cálculo de Multas** | Multiplicação linear (`dias * 2.50`) e flag booleana estática | `CalculadoraMultaService` com 3 faixas progressivas e checagem dinâmica | Desincentivo escalonado a atrasos longos e sincronização automática de bloqueios |
| **Layout & Ergonomia** | Aceitar `overflow-x: scroll` ou esconder tudo em menu dropdown | CSS Modules com `table-layout: fixed`, larguras percentuais (100%) e botões de fluxo visíveis | Zero scroll horizontal, interface limpa e máxima velocidade operacional |
