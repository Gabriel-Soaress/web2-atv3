# 📋 Plano 01: Migração da ATV2 e Conexão Segura ao PostgreSQL Institucional

> **Módulo:** Infraestrutura & Camada de Persistência  
> **Líder Técnico:** Gabriel Soares Pedrosa (`bi3041271`)  
> **Branch Git:** `feature/database-postgres`  
> **Status:** Concluído e Homologado  
> **Dependência:** Base de código da Atividade 2 (`atvs avaliativas/atv2`)

---

## 🎯 1. Contexto & Diagnóstico da Base Herdada

Na Atividade 2, a aplicação rodava sobre uma estrutura de protótipo:
- O banco de dados configurado no NestJS utilizava SQLite local (`dev.db`), o que não suportava concorrência real, transações distribuídas e persistência remota exigida para avaliação pelo professor.
- A estrutura de pastas era mista e o cliente e servidor estavam acoplados aos scripts de desenvolvimento inicial.
- O estudante possui um schema individual no servidor PostgreSQL oficial do IFSP (`10.102.55.11`), com a credencial `bi3041271`, que **já abriga tabelas de outros projetos acadêmicos** (por exemplo, a tabela de chamados `tickets`).

### O Desafio Crítico:
Migrar a base da Atividade 2 para a pasta da Atividade 3 e apontar a conexão para o PostgreSQL da faculdade **sem sobrescrever nem apagar** as tabelas preexistentes de outras disciplinas.

---

## 🛠️ 2. Especificação Técnica & Contrato de Conexão

### Parâmetros de Conexão PostgreSQL (Ambiente Institucional)
```properties
DATABASE_URL="postgresql://bi3041271:BI3041271@10.102.55.11:5432/postgres?schema=bi3041271"
```

### Estrutura de Modelagem no Prisma (`schema.prisma`)
Para evitar conflito de nomenclatura no schema compartilhado, definimos o padrão de prefixos explícitos:
- `web2_A1_emprestimos`: Tabela que armazena os registros principais de empréstimos e reservas de livros/equipamentos.
- `web2_A3_historico_emprestimos`: Tabela que armazena os eventos cronológicos de auditoria.
- `tickets`: Tabela pré-existente no mesmo schema PostgreSQL, que deve ser preservada intacta.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Emprestimo {
  id                    String    @id @default(uuid())
  tituloItem            String
  tipoItem              String
  usuarioNome           String
  dataReserva           DateTime  @default(now())
  dataLimiteRetirada    DateTime?
  dataRetirada          DateTime?
  dataPrevistaDevolucao DateTime?
  dataDevolucao         DateTime?
  status                String    @default("RESERVADO")
  renovacoesCount       Int       @default(0)
  temAvaria             Boolean   @default(false)
  descricaoAvaria       String?
  diasAtraso            Int       @default(0)
  valorMulta            Float     @default(0.0)
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  historicos            HistoricoEmprestimo[]

  @@map("web2_A1_emprestimos")
}

model HistoricoEmprestimo {
  id             String      @id @default(uuid())
  emprestimoId   String
  statusAnterior String
  novoStatus     String
  autorAcao      String
  justificativa  String
  timestamp      DateTime    @default(now())

  emprestimo     Emprestimo  @relation(fields: [emprestimoId], references: [id], onDelete: Cascade)

  @@map("web2_A3_historico_emprestimos")
}

// Modelo preservado de disciplina anterior
model Ticket {
  id          String   @id @default(uuid())
  titulo      String
  descricao   String?
  status      String
  createdAt   DateTime @default(now())

  @@map("tickets")
}
```

---

## 💬 3. Diálogo de Alinhamento Técnico & Decisão de Engenharia

> **Proposta Inicial da IA:**  
> *"Podemos limpar o banco de dados rodando `npx prisma db push --force-reset` para garantir que o esquema comece do zero e sem nenhum conflito de tabela."*

> **Intervenção Técnica de Gabriel Soares:**  
> *"Nem pensar. Esse schema PostgreSQL é o meu oficial da faculdade e já tem tabelas de outros trabalhos meus que estão sendo avaliados, como a tabela `tickets`. Se der `--force-reset`, vai apagar tudo que já entreguei em outras matérias! Como a gente faz pra sincronizar as tabelas novas do Tema 08 preservando o que já tá lá?"*

> **Análise & Ajuste:**  
> 1. Descartar sumariamente a flag destrutiva `--force-reset`.  
> 2. Executar uma introspecção segura via `npx prisma db pull --print` para mapear os modelos já existentes no banco institucional.  
> 3. Integrar manualmente as definições dos modelos existentes no `schema.prisma`.  
> 4. Executar `npx prisma db push` de forma incremental, garantindo que o Prisma crie apenas as tabelas faltantes (`web2_A1_emprestimos` e `web2_A3_historico_emprestimos`) sem derrubar dados de terceiros.

---

## 📋 4. Passo a Passo de Execução

1. **Cópia e Isolamento de Estrutura:**
   - Criada a pasta `atvs avaliativas/atv3/` a partir do estado estável da `atv2`.
   - Limpeza das pastas `node_modules` e `.next` para evitar artefatos de compilação cacheados.

2. **Configuração de Variáveis de Ambiente:**
   - Criação do `.env` no backend com a URL de conexão do PostgreSQL do IFSP.
   - Configuração do `PrismaService` com logs ativados (`query`, `info`, `warn`, `error`) durante a inicialização para auditoria de conexão.

3. **Validação da Conectividade de Rede:**
   - Executado teste de conexão TCP na porta 5432 do IP `10.102.55.11`.
   - Executado `npx prisma db push` incremental.

4. **Script de Seed e Teste de Carga de Cenários:**
   - Criação de `prisma/seed.ts` para inserir 6 registros de demonstração no banco remoto com dados realistas (empréstimos no prazo, reservas pendentes, itens atrasados e devoluções com avaria).
   - Execução bem-sucedida via `npm run seed`.

---

## 🧪 5. Plano de Testes & Critérios de Aceite

| Caso de Teste | Ação Executada | Resultado Esperado | Validação |
| :--- | :--- | :--- | :---: |
| **CT-01: Conexão PostgreSQL** | Iniciar servidor NestJS | `PrismaClient` conecta com sucesso em `10.102.55.11` sem timeouts. | Aprovado |
| **CT-02: Preservação de Tabelas** | Inspecionar banco via DBeaver / Prisma Studio | A tabela `tickets` mantém todos os seus dados intactos. | Aprovado |
| **CT-03: Criação de Tabelas do Tema 08** | Checar catálogo do PostgreSQL | Tabelas `web2_A1_emprestimos` e `web2_A3_historico_emprestimos` criadas com suas chaves estrangeiras. | Aprovado |
| **CT-04: Carga de Demonstração (Seed)** | Executar `npm run seed` | 6 cenários populados no banco remoto com timestamps válidos. | Aprovado |

---

## ⚠️ 6. Riscos & Mitigações
- **Risco:** Latência ou indisponibilidade momentânea da VPN / rede interna da faculdade.  
  *Mitigação:* `PrismaService` implementa reconexão suave no hook de lifecycle `onModuleInit` e tratamento de erros amigável para a camada de apresentação.
