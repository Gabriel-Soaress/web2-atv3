# Registro de Decisões de IA (AI Decisions)

Este arquivo é um espelho de [`AI-LOG.md`](file:///C:/Users/soares/Documents/Faculdade/4º%20semestre/web2/ppw-cocao/atvs%20avaliativas/atv3/AI-LOG.md) na raiz do projeto, mantido nesta pasta para atender a ambas as convenções de caminho citadas na especificação da Atividade 3 (`docs/ai-decisions.md` e `AI-LOG.md`).

Para consultar o registro detalhado dos 5 desafios conceituais, prompts, respostas brutas e refatorações críticas, veja:
👉 [`AI-LOG.md`](file:///C:/Users/soares/Documents/Faculdade/4º%20semestre/web2/ppw-cocao/atvs%20avaliativas/atv3/AI-LOG.md)


---

## 📑 Registro 06: Poluição visual de botões de ação e eliminação de scroll horizontal com CSS Modules

### 1. O Desafio
Ao implementar múltiplas ações de ciclo de vida (Retirar, Cancelar, Devolver, Renovar, Histórico, Editar, Excluir), a tabela inicial gerada amontoava 6 botões por linha com classes inline do Tailwind, forçando um scroll horizontal indesejado (`overflow-x-auto`) e uma experiência confusa para o usuário.

### 2. O Prompt Utilizado
```text
Como resolver problemas de scroll horizontal indesejado em tabelas de dashboards com Next.js 
e como organizar uma coluna com muitas ações semânticas sem poluir visualmente a interface?
```

### 3. A Resposta Bruta da IA
```text
Basta colocar `overflow-x: scroll` na div da tabela e diminuir a fonte de todos os botões 
ou colocar todos dentro de um dropdown genérico.
```

### 4. A Crítica e Refatoração do Aluno
* **Onde a IA falhou/foi ingênua:**
  - A IA considerou que aceitar o scroll horizontal (`overflow-x: scroll`) era a solução ideal para tabelas densas, além de sugerir esconder todas as ações dentro de um menu, o que atrasa a usabilidade das ações mais frequentes do fluxo (como "Retirar" e "Devolver").
* **Refatoração para o nosso projeto:**
  * Criamos um módulo CSS dedicado [`emprestimos.module.css`](file:///c:/Users/soares/Documents/Faculdade/4º%20semestre/web2/ppw-cocao/atvs%20avaliativas/atv3/ppw_test_client/src/features/emprestimos/components/emprestimos.module.css) com `table-layout: fixed; width: 100%;` e larguras percentuais precisas (36%, 20%, 24%, 20%), eliminando completamente o scroll horizontal.
  * Agrupamos **Item e Solicitante** na mesma coluna de forma hierárquica, otimizando o espaço da tela.
  * Hierarquizamos as ações: a ação principal da FSM fica em destaque imediato (ex: *Retirar* ou *Devolver*), o Histórico de Auditoria fica a um clique de distância, e as ações secundárias ficam organizadas em um menu suspenso Radix UI (`DropdownMenu`).
