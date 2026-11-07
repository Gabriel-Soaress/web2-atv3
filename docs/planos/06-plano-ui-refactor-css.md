# 📋 Plano 06: Refatoração de Front-End, CSS Modules e Resolução de Scroll

> **Etapa:** 06 do Plano Geral  
> **Branches Git:** `feature/ui-layout-refactor`, `feature/ui-css-module-no-scroll`, `feature/ui-renovar-button-action-bar`, `fix/header-text-atv3`

---

## 1. Escopo da Tarefa
- Eliminar o excesso de botões soltos empilhados por linha na tabela de empréstimos.
- Resolver o problema de scroll horizontal indesejado (`overflow-x-auto`).
- Modularizar o CSS removendo a poluição de classes inline no Tailwind.
- Manter botões de ação críticos (*Retirar*, *Devolver* e *Renovar*) diretamente acessíveis na barra.

## 2. A Proposta Inicial do Agente
- Manter `overflow-x: scroll` ou colocar todas as ações dentro de um único dropdown genérico.
- **Risco Identificado por Gabriel:** Péssima ergonomia de interface e lentidão no fluxo diário do operador de empréstimos.

## 3. Correção e Passos Executados
1. Criar o arquivo de estilos dedicados `emprestimos.module.css` com `table-layout: fixed; width: 100%`.
2. Unificar *Item* e *Solicitante* na mesma coluna, otimizando o espaço da tela.
3. Definir larguras percentuais precisas: 31% Item & Usuário, 18% Status, 23% Prazos/Multas, 28% Ações (totalizando exatamente 100% sem scroll).
4. Exibir o botão **Renovar** e o botão primário contextual diretamente na barra de ações.
5. Criar o componente acessível `DropdownMenu` com Radix UI para as ações secundárias (*Editar Dados* e *Excluir*).
6. Corrigir o texto do subtítulo da página para "Atividade 3".
