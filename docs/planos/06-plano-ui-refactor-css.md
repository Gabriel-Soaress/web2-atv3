# 📋 Plano 06: Refatoração Front-End (Next.js 16), CSS Modules & Zero Scroll

> **Módulo:** Interface de Usuário & Experiência (UI/UX)  
> **Líder Técnico:** Gabriel Soares Pedrosa (`bi3041271`)  
> **Branch Git:** `feature/ui-css-modules-refactor`  
> **Status:** Concluído e Homologado  
> **Dependência:** Etapa 05 (`feature/multas-bloqueio`)

---

## 🎯 1. Contexto & Diagnóstico da Base Herdada

Na interface desenvolvida na Atividade 2:
- A tela principal era poluída por uma tabela crua com mais de 10 colunas abertas simultaneamente (ID longo, Título, Tipo, Usuário, Data Reserva, Data Limite, Data Retirada, Data Prevista, Status, Multa, Ações).
- Essa sobrecarga de colunas causava um **estouro de largura na viewport**, forçando o usuário a rolar a barra horizontal (*horizontal scrollbar*) para conseguir ver os botões de ação na extrema direita da tela.
- Não existiam modais para ações de negócio: tudo era feito por botões soltos que chamavam rotas genéricas sem possibilidade de conferir laudos de avaria ou inspecionar o histórico de auditoria.

### O Mandato da Atividade 3:
1. **Design Ergonômico de Alta Usabilidade**: Tabela moderna, responsiva, sem barra de rolagem horizontal em telas convencionais (*Zero Horizontal Scroll*).
2. **Arquitetura Next.js 16 com Server Actions**: Eliminar clientes HTTP soltos no navegador; as chamadas ao backend ocorrem via Server Actions tipadas com revalidação instantânea de cache (`revalidatePath`).
3. **Modais Contextuais Especializados**: Modais dedicados para *Vistoria de Devolução*, *Linha do Tempo de Auditoria*, *Cadastro de Reserva* e *Confirmação de Exclusão*.

---

## 🎨 2. Engenharia Visual & Estratégia CSS Modules (Zero Horizontal Scroll)

Para eliminar a barra de rolagem horizontal sem perder nenhuma informação essencial, adotamos duas técnicas de engenharia visual:

### 1. Consolidação Semântica de Dados em 4 Super-Colunas:
Em vez de 10 colunas espaçadas, agrupamos as informações em 4 colunas coesas:
- **Coluna 1 (31%): Item & Solicitante**: Título do livro/equipamento, badge de categoria (LIVRO/EQUIPAMENTO) e nome completo do solicitante com ícone de usuário.
- **Coluna 2 (18%): Estado do Empréstimo**: Badge estilizado indicando o status atual na FSM com cores semânticas (Azul: Reservado, Verde: Retirado, Laranja: Atrasado, Cinza: Devolvido, Roxo: Devolvido c/ Multa).
- **Coluna 3 (23%): Prazos & Multas**: Linha do tempo dos prazos (retirada, devolução prevista, data efetiva), tag de renovações acumuladas e valor da multa se houver atraso.
- **Coluna 4 (28%): Ações Operacionais**: Botões primários de contexto direto na barra (ex: "Retirar", "Devolver", "Renovar") + Menu flutuante "..." (Dropdown Menu) para ações secundárias (*Ver Histórico*, *Editar Dados*, *Excluir*).

### 2. Estilização Rígida com CSS Modules (`emprestimos.module.css`):
Para blindar o layout contra flutuações de tamanho de texto e eliminar classes utilitárias repetitivas inline:
```css
.tableContainer {
  width: 100%;
  overflow-x: hidden; /* Elimina scroll horizontal indesejado */
  background: hsl(var(--card));
  border-radius: var(--radius);
  border: 1px solid hsl(var(--border));
}

.tableFixed {
  width: 100%;
  table-layout: fixed; /* Força largura determinística de colunas */
  border-collapse: collapse;
}

.colItem { width: 31%; }
.colStatus { width: 18%; }
.colPrazos { width: 23%; }
.colAcoes { width: 28%; text-align: right; }
```

---

## 💬 3. Diálogo de Alinhamento Técnico & Decisão de Arquitetura

> **Proposta Inicial da IA:**  
> *"Podemos colocar `overflow-x: auto` na div da tabela para permitir que o usuário arraste pro lado caso a tela do computador seja pequena e colocar mais de 100 classes do Tailwind inline direto nas tags `<td>`."*

> **Intervenção Técnica de Gabriel Soares:**  
> *"Não fica bom deixar scroll horizontal na tabela, parece que o sistema foi mal planejado e quebrou na tela. Em tela de notebook ou monitor normal tem que caber tudo certinho dentro da página sem precisar rolar pro lado. E encher de classe inline do Tailwind no meio do HTML deixa o código ilegível pro professor avaliar. Vamos criar um CSS Module separado com porcentagens fixas nas colunas pra travar a largura e agrupar as informações!"*

> **Análise & Ajuste:**  
> 1. Criação do arquivo de estilos dedicado `emprestimos.module.css`.
> 2. Utilização de `table-layout: fixed; width: 100%` com distribuição de larguras exatas somando 100% (31% + 18% + 23% + 28%).
> 3. Agrupamento visual das células para evitar colunas extras.
> 4. Resultado: Zero rolagem horizontal em qualquer resolução desktop convencional (1366x768, 1920x1080, etc.).

---

## ⚡ 4. Camada de Comunicação: Next.js Server Actions

As operações de dados são centralizadas no arquivo `src/features/emprestimos/api/emprestimo.actions.ts` com a diretiva `'use server'`:
- **Isolamento de Segurança:** O navegador nunca expõe chamadas diretas ou credenciais da API do NestJS; todas as chamadas `fetch` ocorrem no servidor Node.js do Next.js.
- **Revalidação Automática de Cache:** Ao concluir qualquer mutação (`createEmprestimo`, `retirarEmprestimo`, `devolverEmprestimo`, etc.), o método `revalidatePath('/emprestimos')` é acionado, forçando a re-renderização imediata dos Server Components com dados atualizados do banco.
- **Tratamento de Erros Semânticos (422):** Se o backend retornar status 422 por violação de regra de negócio, a Server Action extrai o payload e entrega um objeto padronizado `{ success: false, message: '...' }`, renderizado em um banner de alerta no topo da tela.

---

## 📋 5. Componentes e Modais Reativos Implementados

1. **`EmprestimosTable.tsx`**: Componente mestre com busca com debounce, abas de filtro rápido (*Todos*, *Reservados*, *Retirados*, *Atrasados*, *Finalizados*) e métricas no topo.
2. **`EmprestimoHistoricoDialog.tsx`**: Modal de Trilha de Auditoria. Renderiza uma linha do tempo vertical com cada evento gravado pelo PostgreSQL, indicando autor, data/hora e justificativa.
3. **`emprestimoDevolverDialog.tsx`**: Modal com formulário de vistoria de avarias físicas, permitindo descrever danos antes de finalizar o empréstimo.
4. **`emprestimoFormDialog.tsx`**: Modal com formulário reativo (`react-hook-form` + `zod`) para abertura de novas reservas e edição cadastral.
5. **`emprestimoDeleteDialog.tsx`**: Modal de confirmação segura antes de disparar exclusão física no banco.

---

## 🧪 6. Plano de Testes & Validação de Interface

| Caso de Teste | Ação Executada | Resultado Esperado | Validação |
| :--- | :--- | :--- | :---: |
| **CT-01: Layout e Scroll Horizontal** | Abrir página em 1366x768 e 1920x1080 | A tabela ocupa 100% da viewport sem nenhuma barra de rolagem horizontal. | Aprovado |
| **CT-02: Modal de Devolução com Avaria** | Clicar em "Devolver", marcar caixa de avaria e salvar | Ação executada com sucesso; tabela revalida instantaneamente mostrando novo status. | Aprovado |
| **CT-03: Visualização da Trilha de Auditoria** | Abrir menu "..." e clicar em "Ver Histórico" | Modal abre com a timeline completa de eventos daquele empréstimo. | Aprovado |
| **CT-04: Exibição de Erro Semântico (HTTP 422)** | Tentar realizar ação ilegal ou usuário bloqueado | Banner de alerta vermelho surge na tela com a explicação exata vinda da exceção do backend. | Aprovado |

---

## ⚠️ 7. Riscos & Mitigações
- **Risco:** Re-renderizações excessivas ao digitar no campo de busca.  
  *Mitigação:* Implementado debounce de 300ms no input de busca para evitar filtragem a cada tecla digitada.
