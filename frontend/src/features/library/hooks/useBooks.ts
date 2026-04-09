import { useState, useEffect, useCallback } from 'react';
import type { Livro, CreateLivroInput } from '../types/libraryTypes';
import { livroService } from '../services/livroService';

export function useBooks() {
  const [books, setBooks] = useState<Livro[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregue livros
  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await livroService.listarLivros();
      setBooks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar livros');
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar livro por ID
  const getBook = useCallback(async (id: number) => {
    try {
      return await livroService.buscarLivroPorId(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar livro');
      throw err;
    }
  }, []);

  // Criar livro
  const createBook = useCallback(async (livro: CreateLivroInput) => {
    setError(null);
    try {
      const novoLivro = await livroService.criarLivro(livro);
      setBooks((prev) => [...prev, novoLivro]);
      return novoLivro;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar livro';
      setError(message);
      throw err;
    }
  }, []);

  // Atualizar livro
  const updateBook = useCallback(async (id: number, livro: Partial<CreateLivroInput>) => {
    setError(null);
    try {
      const livroAtualizado = await livroService.atualizarLivro(id, livro);
      setBooks((prev) =>
        prev.map((l) => (l.id === id ? livroAtualizado : l))
      );
      return livroAtualizado;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar livro';
      setError(message);
      throw err;
    }
  }, []);

  // Deletar livro
  const deleteBook = useCallback(async (id: number) => {
    setError(null);
    try {
      await livroService.deletarLivro(id);
      setBooks((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar livro';
      setError(message);
      throw err;
    }
  }, []);

  // Carregar livros ao montar
  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  return {
    books,
    loading,
    error,
    fetchBooks,
    getBook,
    createBook,
    updateBook,
    deleteBook,
  };
}
