// Tipos para a Biblioteca

export interface Livro {
  id: number;
  nome: string;
  autor: string;
  editora: string;
  datapubli: string;
}

export interface CreateLivroInput {
  nome: string;
  autor: string;
  editora: string;
  datapubli: string;
}

export interface Emprestimo {
  id: number;
  usuarioId: number;
  livroId: number;
  dataEmprestimo: string;
  dataPrevistaDevolucao: string;
  dataDevolucao: string | null;
  status: 'ativo' | 'devolvido' | 'atrasado';
  multa: number;
}

export interface CreateEmprestimoInput {
  livroId: number;
  dataPrevistaDevolucao: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
