import { z } from 'zod';

export const emprestimoCreateSchema = z.object({
  tituloItem: z.string().min(2, { message: 'O título do item deve ter pelo menos 2 caracteres.' }),
  tipoItem: z.string().min(1, { message: 'Selecione o tipo do item.' }),
  usuarioNome: z.string().min(2, { message: 'O nome do usuário deve ter pelo menos 2 caracteres.' }),
});

export type EmprestimoCreateSchema = z.infer<typeof emprestimoCreateSchema>;

export const emprestimoUpdateSchema = z.object({
  tituloItem: z.string().min(2, { message: 'O título do item deve ter pelo menos 2 caracteres.' }),
  tipoItem: z.string().min(1, { message: 'Selecione o tipo do item.' }),
  usuarioNome: z.string().min(2, { message: 'O nome do usuário deve ter pelo menos 2 caracteres.' }),
});

export type EmprestimoUpdateSchema = z.infer<typeof emprestimoUpdateSchema>;

export const devolucaoSchema = z.object({
  temAvaria: z.boolean(),
  descricaoAvaria: z.string().optional(),
});

export type DevolucaoSchema = z.infer<typeof devolucaoSchema>;
