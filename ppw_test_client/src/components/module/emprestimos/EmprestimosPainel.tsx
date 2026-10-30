'use client';

import { useEffect, useState } from 'react';
import { Emprestimo } from '@/types/emprestimo';
import { ReservaForm } from './ReservaForm';
import { EmprestimoCard } from '@/components/cards/EmprestimoCard';

export function EmprestimosPainel() {
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [carregando, setCarregando] = useState(true);

  async function carregarEmprestimos() {
    try {
      const res = await fetch('http://localhost:8000/emprestimos');
      if (res.ok) {
        const dados = await res.json();
        setEmprestimos(dados);
      }
    } catch (err) {
      console.error('Erro ao buscar empréstimos:', err);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarEmprestimos();
  }, []);

  async function handleRetirar(id: string) {
    await fetch(`http://localhost:8000/emprestimos/${id}/retirar`, { method: 'PATCH' });
    carregarEmprestimos();
  }

  async function handleRenovar(id: string) {
    await fetch(`http://localhost:8000/emprestimos/${id}/renovar`, { method: 'PATCH' });
    carregarEmprestimos();
  }

  async function handleDevolver(id: string, temAvaria: boolean, descricaoAvaria?: string) {
    await fetch(`http://localhost:8000/emprestimos/${id}/devolver`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ temAvaria, descricaoAvaria }),
    });
    carregarEmprestimos();
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Controle de Empréstimos e Reservas
        </h1>
        <p className="text-sm text-slate-500">
          Gerenciamento do ciclo de vida de livros e equipamentos.
        </p>
      </div>

      <ReservaForm onSucesso={carregarEmprestimos} />

      {carregando ? (
        <p className="text-sm text-slate-500">Carregando itens...</p>
      ) : emprestimos.length === 0 ? (
        <p className="text-sm text-slate-500">Nenhum empréstimo cadastrado até o momento.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {emprestimos.map((item) => (
            <EmprestimoCard
              key={item.id}
              item={item}
              onRetirar={handleRetirar}
              onRenovar={handleRenovar}
              onDevolver={handleDevolver}
            />
          ))}
        </div>
      )}
    </div>
  );
}
