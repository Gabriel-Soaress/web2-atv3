'use server';

import { revalidatePath } from 'next/cache';
import {
  ActionState,
  DevolucaoFormData,
  Emprestimo,
  EmprestimoFormData,
  HistoricoItem,
} from '../type/emprestimo.type';

const API_URL = 'http://localhost:8000/emprestimos';

/**
 * getAllEmprestimos()
 *
 * Server Action que busca a lista completa de empréstimos diretamente na API REST do NestJS.
 * Executada no servidor com cache desabilitado (`no-store`) para garantir dados sempre frescos.
 */
export async function getAllEmprestimos(): Promise<Emprestimo[]> {
  try {
    const response = await fetch(API_URL, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : data.data ?? [];
  } catch (error) {
    console.error('Erro ao buscar empréstimos:', error);
    return [];
  }
}

/**
 * createEmprestimo()
 *
 * Server Action para submissão do formulário de criação de reserva.
 * Envia os dados para `POST /emprestimos/reservar` e aciona a revalidação de rotas (`revalidatePath`) do Next.js.
 *
 * @param prevState - Estado anterior da action para integração com hooks de formulário (ex: useActionState).
 * @param formData - Dados preenchidos no formulário (título, categoria, solicitante).
 */
export async function createEmprestimo(
  prevState: ActionState<Emprestimo>,
  formData: EmprestimoFormData,
): Promise<ActionState<Emprestimo>> {
  try {
    const response = await fetch(`${API_URL}/reservar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: Array.isArray(data.message) ? data.message.join(', ') : data.message || 'Erro ao criar empréstimo/reserva',
        errors: data.errors,
      };
    }

    revalidatePath('/emprestimos');
    revalidatePath('/');

    return {
      success: true,
      message: 'Reserva/empréstimo cadastrado com sucesso!',
      data: data.data ?? data,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao conectar ao servidor';
    return {
      success: false,
      message: errorMessage,
    };
  }
}

/**
 * updateEmprestimo()
 *
 * Server Action para atualizar dados cadastrais do empréstimo via `PUT /emprestimos/:id`.
 * Revalida o cache da página de empréstimos após o salvamento.
 *
 * @param prevState - Estado anterior da action.
 * @param payload - Objeto com o ID do empréstimo e os campos cadastrais editados.
 */
export async function updateEmprestimo(
  prevState: ActionState<Emprestimo>,
  payload: { id: string; data: Partial<EmprestimoFormData> },
): Promise<ActionState<Emprestimo>> {
  try {
    const response = await fetch(`${API_URL}/${payload.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload.data),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: Array.isArray(data.message) ? data.message.join(', ') : data.message || 'Erro ao atualizar empréstimo',
        errors: data.errors,
      };
    }

    revalidatePath('/emprestimos');
    revalidatePath('/');

    return {
      success: true,
      message: 'Empréstimo atualizado com sucesso!',
      data: data.data ?? data,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao conectar ao servidor';
    return {
      success: false,
      message: errorMessage,
    };
  }
}

/**
 * deleteEmprestimo()
 *
 * Server Action para exclusão de um registro via `DELETE /emprestimos/:id`.
 * Revalida o cache da rota para remover o item instantaneamente da tabela visual.
 *
 * @param prevState - Estado anterior da action.
 * @param payload - Objeto contendo o UUID do empréstimo a ser excluído.
 */
export async function deleteEmprestimo(
  prevState: ActionState<Emprestimo>,
  payload: { id: string },
): Promise<ActionState<Emprestimo>> {
  try {
    const response = await fetch(`${API_URL}/${payload.id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return {
        success: false,
        message: Array.isArray(data.message) ? data.message.join(', ') : data.message || 'Erro ao excluir empréstimo',
      };
    }

    revalidatePath('/emprestimos');
    revalidatePath('/');

    return {
      success: true,
      message: 'Empréstimo excluído com sucesso!',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao conectar ao servidor';
    return {
      success: false,
      message: errorMessage,
    };
  }
}

/**
 * retirarEmprestimo()
 *
 * Server Action que dispara o evento de retirada do item via `PATCH /emprestimos/:id/retirar`.
 * Atualiza o estado da tabela com o novo status RETIRADO e prazo de devolução de 7 dias.
 *
 * @param id - Identificador UUID do empréstimo a retirar.
 */
export async function retirarEmprestimo(id: string): Promise<ActionState<Emprestimo>> {
  try {
    const response = await fetch(`${API_URL}/${id}/retirar`, {
      method: 'PATCH',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Erro ao registrar retirada.',
      };
    }

    revalidatePath('/emprestimos');
    return {
      success: true,
      message: 'Retirada registrada com sucesso! Prazo de 7 dias adicionado.',
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao conectar ao servidor.',
    };
  }
}

/**
 * renovarEmprestimo()
 *
 * Server Action para extensão de prazo via `PATCH /emprestimos/:id/renovar`.
 * Concede 7 dias a mais no prazo previsto e revalida a listagem.
 *
 * @param id - Identificador UUID do empréstimo a renovar.
 */
export async function renovarEmprestimo(id: string): Promise<ActionState<Emprestimo>> {
  try {
    const response = await fetch(`${API_URL}/${id}/renovar`, {
      method: 'PATCH',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Erro ao renovar prazo.',
      };
    }

    revalidatePath('/emprestimos');
    return {
      success: true,
      message: 'Prazo renovado por mais 7 dias!',
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao conectar ao servidor.',
    };
  }
}

/**
 * devolverEmprestimo()
 *
 * Server Action para envio dos dados de vistoria e encerramento do empréstimo via `PATCH /emprestimos/:id/devolver`.
 * Informa avarias e processa qualquer multa aplicada pelo backend.
 *
 * @param id - Identificador UUID do empréstimo.
 * @param payload - Dados da vistoria (presença e descrição de avarias).
 */
export async function devolverEmprestimo(
  id: string,
  payload: DevolucaoFormData,
): Promise<ActionState<Emprestimo>> {
  try {
    const response = await fetch(`${API_URL}/${id}/devolver`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Erro ao registrar devolução.',
      };
    }

    revalidatePath('/emprestimos');
    return {
      success: true,
      message: 'Devolução registrada com sucesso!',
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao conectar ao servidor.',
    };
  }
}

/**
 * cancelarEmprestimo()
 *
 * Server Action para cancelar voluntariamente uma reserva via `POST /emprestimos/:id/cancelar`.
 *
 * @param id - Identificador UUID da reserva pendente.
 */
export async function cancelarEmprestimo(id: string): Promise<ActionState<Emprestimo>> {
  try {
    const response = await fetch(`${API_URL}/${id}/cancelar`, {
      method: 'POST',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Erro ao cancelar reserva.',
      };
    }

    revalidatePath('/emprestimos');
    return {
      success: true,
      message: 'Reserva cancelada com sucesso!',
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao conectar ao servidor.',
    };
  }
}

/**
 * getHistoricoEmprestimo()
 *
 * Server Action de leitura para recuperar toda a trilha de auditoria (Audit Log) de um empréstimo via `GET /emprestimos/:id/historico`.
 *
 * @param id - Identificador UUID do empréstimo.
 */
export async function getHistoricoEmprestimo(id: string): Promise<HistoricoItem[]> {
  try {
    const response = await fetch(`${API_URL}/${id}/historico`, {
      cache: 'no-store',
    });
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return [];
  }
}
