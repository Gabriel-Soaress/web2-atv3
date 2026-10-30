'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ReservaFormProps {
  onSucesso: () => void;
}

export function ReservaForm({ onSucesso }: ReservaFormProps) {
  const [tituloItem, setTituloItem] = useState('');
  const [tipoItem, setTipoItem] = useState<'LIVRO' | 'EQUIPAMENTO'>('LIVRO');
  const [usuarioNome, setUsuarioNome] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tituloItem.trim() || !usuarioNome.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/emprestimos/reservar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tituloItem, tipoItem, usuarioNome }),
      });

      if (res.ok) {
        setTituloItem('');
        setUsuarioNome('');
        onSucesso();
      } else {
        alert('Erro ao criar reserva.');
      }
    } catch (error) {
      alert('Falha ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Nova Reserva de Item</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="text-sm font-medium text-slate-700">Título do Item</label>
            <Input
              value={tituloItem}
              onChange={(e) => setTituloItem(e.target.value)}
              placeholder="Ex: Livro Clean Code ou Projetor Epson"
              required
            />
          </div>

          <div className="w-full md:w-48">
            <label className="text-sm font-medium text-slate-700">Tipo do Item</label>
            <select
              value={tipoItem}
              onChange={(e) => setTipoItem(e.target.value as 'LIVRO' | 'EQUIPAMENTO')}
              className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-950"
            >
              <option value="LIVRO">Livro</option>
              <option value="EQUIPAMENTO">Equipamento</option>
            </select>
          </div>

          <div className="flex-1 w-full">
            <label className="text-sm font-medium text-slate-700">Nome do Solicitante</label>
            <Input
              value={usuarioNome}
              onChange={(e) => setUsuarioNome(e.target.value)}
              placeholder="Ex: Gabriel"
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full md:w-auto">
            {loading ? 'Salvando...' : 'Reservar'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
