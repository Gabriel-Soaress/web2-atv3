import Link from 'next/link';

export default function Home() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen p-8 text-center space-y-6 bg-slate-50"
      suppressHydrationWarning
    >
      <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
        Ambiente de Prática - PPW II
      </h1>
      <p className="text-slate-600 max-w-md">
        Sistema de gestão e ciclo de vida de Empréstimos e Reservas de livros e equipamentos com NestJS, Prisma e Next.js.
      </p>
      <div className="flex gap-4">
        <Link
          href="/emprestimos"
          className="px-5 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
        >
          Acessar Módulo de Empréstimos
        </Link>
      </div>
    </div>
  );
}
