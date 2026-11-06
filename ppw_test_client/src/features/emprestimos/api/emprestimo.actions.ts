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
