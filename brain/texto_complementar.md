# Texto complementar

## Máquina de Estados Finita e Transições Restritas
Em sistemas web reais, um registro raramente aceita qualquer valor em seu campo de status a qualquer momento. Uma Máquina de Estados Finita (FSM) define exatamente quais estados um processo pode assumir e quais caminhos são válidos entre eles.

Isso impede que o sistema seja manipulado por alterações arbitrárias de status via formulário ou requisição direta de API. Toda mudança de estado ocorre por meio de uma ação específica (um evento), acompanhada de guardas de transição (validações obrigatórias) e controle de permissões (quem pode executar a ação).

**Exemplo (CRUD incorreto):** O usuário envia um `PUT /pedidos/123` com o corpo `{ "status": "entregue" }`, e o sistema simplesmente aceita a alteração, mesmo que o pedido estivesse marcado como "aguardando pagamento". A ação `aprovar()` só é permitida se o status atual for exatamente Em Análise e se o usuário autenticado tiver perfil de gestor. Tentar executar `aprovar()` a partir de Rascunho resulta em erro imediato de domínio (ex: HTTP 422 - Unprocessable Entity).

## Regras de Negócio e Conflitos Assíncronos
Um sistema web atende múltiplos usuários simultaneamente. Regras de negócio com conflitos assíncronos surgem quando duas ou mais requisições tentam alterar o mesmo recurso compartilhado ao mesmo tempo, ou quando regras dependem de limites temporais e condições dinâmicas de concorrência. O backend precisa garantir consistência e atomicidade, impedindo que requisições paralelas gerem dados corrompidos ou violem restrições lógicas.

**Exemplo (Sem tratamento de concorrência):** Dois clientes consultam uma sala de coworking que possui apenas 1 vaga disponível às 14h. Ambos veem a vaga livre, clicam em "Confirmar" no mesmo segundo, e o sistema grava os dois cadastros, gerando sobreposição indevida. A primeira transação obtém o recurso e conclui a reserva; A segunda transação detecta que a vaga acabou de ser ocupada, aborta a escrita via rollback e retorna uma mensagem clara informando que o horário não está mais disponível.

## Rastreabilidade e Auditoria (Audit Log)
Em sistemas corporativos, fiscais ou de gestão, dados históricos nunca são simplesmente sobrescritos ou apagados. A rastreabilidade garante que qualquer pessoa autorizada consiga reconstruir com precisão a linha do tempo de um registro: quem fez a alteração, quando ela ocorreu, qual era o valor anterior, qual é o novo valor e qual foi a justificativa.

**Exemplo (Sobrescrita):** Um chamado com status "Aberto" é alterado para "Cancelado". O registro na tabela é atualizado diretamente via UPDATE, perdendo para sempre a informação de quem cancelou, que horas isso aconteceu e por qual motivo.
