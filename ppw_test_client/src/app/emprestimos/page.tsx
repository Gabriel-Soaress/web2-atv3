import { getAllEmprestimos } from '@/features/emprestimos/api/emprestimo.actions';
import { EmprestimosTable } from '@/features/emprestimos/components/EmprestimosTable';
import { BookMarked } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function EmprestimosPage() {
  const initialData = await getAllEmprestimos();

  return (
    <main className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <BookMarked className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Sistema de Controle de Empréstimos e Reservas
              </h1>
              <p className="text-sm text-muted-foreground">
                Atividade 2 — Arquitetura Limpa (Clean Arch / CQRS) e Formulários com Dialogs (Next.js)
              </p>
            </div>
          </div>
        </div>

        {/* Tabela de Dados e Ações com Dialogs */}
        <EmprestimosTable initialData={initialData} />
      </div>
    </main>
  );
}
