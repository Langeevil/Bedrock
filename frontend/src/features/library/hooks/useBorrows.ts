import { useState, useEffect, useCallback } from 'react';
import type { Emprestimo, CreateEmprestimoInput } from '../types/libraryTypes';
import { emprestimoService } from '../services/emprestimoService';

export function useBorrows() {
  const [borrows, setBorrows] = useState<Emprestimo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar empréstimos
  const fetchBorrows = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await emprestimoService.listarEmprestimos();
      setBorrows(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar empréstimos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar empréstimo por ID
  const getBorrow = useCallback(async (id: number) => {
    try {
      return await emprestimoService.buscarEmprestimoPorId(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar empréstimo');
      throw err;
    }
  }, []);

  // Criar empréstimo
  const createBorrow = useCallback(async (emprestimo: CreateEmprestimoInput) => {
    setError(null);
    try {
      const novoEmprestimo = await emprestimoService.criarEmprestimo(emprestimo);
      setBorrows((prev) => [...prev, novoEmprestimo]);
      return novoEmprestimo;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar empréstimo';
      setError(message);
      throw err;
    }
  }, []);

  // Renovar empréstimo
  const renewBorrow = useCallback(async (id: number, novaDevolucao: string) => {
    setError(null);
    try {
      const emprestimoRenovado = await emprestimoService.renovarEmprestimo(id, novaDevolucao);
      setBorrows((prev) =>
        prev.map((e) => (e.id === id ? emprestimoRenovado : e))
      );
      return emprestimoRenovado;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao renovar empréstimo';
      setError(message);
      throw err;
    }
  }, []);

  // Registrar devolução
  const returnBorrow = useCallback(async (id: number) => {
    setError(null);
    try {
      const emprestimoDevolvido = await emprestimoService.registrarDevolucao(id);
      setBorrows((prev) =>
        prev.map((e) => (e.id === id ? emprestimoDevolvido : e))
      );
      return emprestimoDevolvido;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao registrar devolução';
      setError(message);
      throw err;
    }
  }, []);

  // Deletar empréstimo
  const deleteBorrow = useCallback(async (id: number) => {
    setError(null);
    try {
      await emprestimoService.deletarEmprestimo(id);
      setBorrows((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar empréstimo';
      setError(message);
      throw err;
    }
  }, []);

  // Carregar empréstimos ao montar
  useEffect(() => {
    fetchBorrows();
  }, [fetchBorrows]);

  return {
    borrows,
    loading,
    error,
    fetchBorrows,
    getBorrow,
    createBorrow,
    renewBorrow,
    returnBorrow,
    deleteBorrow,
  };
}
