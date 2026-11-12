# 📋 Plano 05: Multas Progressivas, Inspeção de Avarias & Bloqueio Preventivo

> **Módulo:** Serviços de Domínio & Regras de Negócio de Alta Complexidade  
> **Líder Técnico:** Gabriel Soares Pedrosa (`bi3041271`)  
> **Branch Git:** `feature/multas-bloqueio`  
> **Status:** Concluído e Validado  
> **Dependência:** Etapa 04 (`feature/concorrencia-lazy-evaluation`)

---

## 🎯 1. Contexto & Diagnóstico da Base Herdada

Na Atividade 2:
- A devolução era apenas uma mudança de flag booleana ou texto sem qualquer verificação financeira ou física.
- Se o usuário atrasava dias ou semanas para devolver o livro/equipamento, nada acontecia.
- Se o item voltava quebrado (avaria física), não havia campo nem regra para registrar o laudo técnico da avaria.
- Um usuário inadimplente com múltiplos livros atrasados podia continuar criando infinitas reservas normalmente.

### O Mandato da Atividade 3 (Tema 08):
1. **Cálculo Progressivo de Multa por Faixas de Dias de Atraso**: quanto maior a demora para devolver, maior a tarifa diária aplicada.
2. **Registro de Inspeção Física de Avaria**: laudo de vistoria no ato da devolução.
3. **Bloqueio Preventivo de Usuários Inadimplentes**: impedir novas reservas caso o solicitante possua pendências de atraso ativas no acervo.

---

## 💰 2. Especificação da Regra de Multa Progressiva

A regra de cobrança foi implementada no Serviço de Domínio Puro (`CalculadoraMultaService`), seguindo a tabela progressiva oficial estipulada para o Tema 08:

| Faixa de Atraso | Período de Dias | Valor da Multa por Dia | Exemplo de Aplicação |
| :---: | :---: | :---: | :--- |
| **Faixa 1** | Do 1º ao 3º dia | **R$ 2,00** / dia | 2 dias de atraso = 2 × R$ 2,00 = **R$ 4,00** |
| **Faixa 2** | Do 4º ao 7º dia | **R$ 3,50** / dia | 5 dias de atraso = (3 × 2,00) + (2 × 3,50) = 6,00 + 7,00 = **R$ 13,00** |
| **Faixa 3** | A partir do 8º dia | **R$ 5,00** / dia | 10 dias de atraso = (3 × 2,00) + (4 × 3,50) + (3 × 5,00) = 6 + 14 + 15 = **R$ 35,00** |

### Algoritmo Matemático de Cálculo:
```typescript
let valorTotal = 0;
// Faixa 1 (1 a 3 dias)
const diasFaixa1 = Math.min(diasAtraso, 3);
valorTotal += diasFaixa1 * 2.0;

// Faixa 2 (4 a 7 dias)
if (diasAtraso > 3) {
  const diasFaixa2 = Math.min(diasAtraso - 3, 4);
  valorTotal += diasFaixa2 * 3.5;
}

// Faixa 3 (8 dias em diante)
if (diasAtraso > 7) {
  const diasFaixa3 = diasAtraso - 7;
  valorTotal += diasFaixa3 * 5.0;
}
```

---

## 🛑 3. Bloqueio Preventivo de Usuários (Anti-Inadimplência)

Antes de autorizar qualquer nova reserva no sistema (`CriarReservaService`), o repositório de leitura consulta se o usuário possui empréstimos irregulares via `verificarBloqueioUsuario(usuarioNome)`:
- Critérios de Bloqueio:
  1. Qualquer empréstimo que já esteja marcado formalmente com status `ATRASADO`.
  2. Qualquer empréstimo que esteja com status `RETIRADO`, mas cuja `dataPrevistaDevolucao` seja menor que a data/hora atual.
- Se houver pendências, o caso de uso interrompe o fluxo imediatamente disparando **HTTP 422 Unprocessable Entity**:
  > *"Usuário 'Gabriel Soares' possui 1 item(ns) em atraso pendente(s): [Clean Architecture]. Novas reservas bloqueadas até a devolução e regularização."*

---

## 💬 4. Diálogo de Alinhamento Técnico & Decisão de Arquitetura

> **Proposta Inicial da IA:**  
> *"Podemos colocar o cálculo da multa direto no método `registrarDevolucao` do Controller ou criar uma trigger no PostgreSQL para calcular o valor da multa quando a coluna `dataDevolucao` for preenchida."*

> **Intervenção Técnica de Gabriel Soares:**  
> *"Trigger em banco de dados esconde a lógica e fica difícil de testar e explicar pro professor. E na Controller vai ferir a arquitetura limpa. Por que a gente não cria um Domain Service puro, tipo `CalculadoraMultaService`, que recebe as datas e devolve os dias de atraso e o valor da multa calculadinho? Assim a gente pode chamar ele tanto na devolução quanto na hora de consultar na tela sem acoplar com banco!"*

> **Análise & Ajuste:**  
> 1. Adotar a recomendação de criar o Domain Service puro `CalculadoraMultaService` na pasta `domain/services/`.
> 2. O serviço não conhece banco de dados, Prisma ou HTTP; apenas realiza operações puras com tipos nativos `Date` e `number`.
> 3. Permite reutilização tanto no Use Case de devolução quanto em endpoints de simulação ou consultas de auditoria.

---

## 📋 5. Passo a Passo de Execução

1. **Construção do Domain Service (`CalculadoraMultaService`):**
   - Arquivo: `src/module/emprestimos/domain/services/calculadora-multa.service.ts`.
   - Retorna a interface `ResultadoCalculoMulta`:
     ```typescript
     export interface ResultadoCalculoMulta {
       diasAtraso: number;
       valorMulta: number;
       descricaoCalculo: string;
     }
     ```

2. **Integração na Entidade de Domínio (`EmprestimoEntity`):**
   - Método `registrarDevolucao(temAvaria: boolean, descricaoAvaria?: string | null)`.
   - Se `diasAtraso > 0`, transiciona a FSM para `DEVOLVIDO_COM_MULTA`; caso contrário, para `DEVOLVIDO`.

3. **Criação do Método de Checagem no Repositório de Leitura:**
   - Arquivo: `src/module/emprestimos/infrastructure/adapters/emprestimo.prisma.read.repository.ts`.
   - Método `verificarBloqueioUsuario(usuarioNome: string)`.

4. **Acoplamento no Caso de Uso de Criação de Reserva:**
   - Arquivo: `src/module/emprestimos/application/service/write/criar-reserva.service.ts`.
   - Valida o bloqueio preventivo antes de persistir o novo registro.

---

## 🧪 6. Plano de Testes & Validação de Regras

| Caso de Teste | Ação Executada | Resultado Esperado | Validação |
| :--- | :--- | :--- | :---: |
| **CT-01: Devolução no Prazo** | Devolver item antes da data prevista | Multa R$ 0,00, atraso 0 dias, status `DEVOLVIDO`. | Aprovado |
| **CT-02: Devolução com 2 dias de atraso** | Devolver item com 2 dias vencidos | Multa R$ 4,00 (Faixa 1), status `DEVOLVIDO_COM_MULTA`. | Aprovado |
| **CT-03: Devolução com 5 dias de atraso** | Devolver item com 5 dias vencidos | Multa R$ 13,00 (Faixas 1 e 2 progressivas somadas). | Aprovado |
| **CT-04: Devolução com Avaria Física** | Marcar avaria e descrever "Capa rasgada e tela riscada" | Laudo de avaria salvo no registro e transcrito na justificativa do histórico. | Aprovado |
| **CT-05: Tentativa de Reserva por Inadimplente** | Usuário com empréstimo atrasado tenta reservar novo livro | **HTTP 422 Unprocessable Entity** com mensagem de bloqueio preventivo. | Aprovado |

---

## ⚠️ 7. Riscos & Mitigações
- **Risco:** Diferenças de timezone entre a máquina do cliente e o servidor PostgreSQL gerando cálculo de horas divergente.  
  *Mitigação:* As datas são tratadas usando timestamps universais UTC e o cálculo de dias de atraso utiliza `Math.ceil()` sobre a diferença líquida de milissegundos dividida por 86.400.000 ms.
