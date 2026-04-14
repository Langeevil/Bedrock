import type { Emprestimo, CreateEmprestimoInput } from '../types/libraryTypes';
import { API_BASE_URL } from '../../../shared/services/config';

const API_URL = API_BASE_URL;

export const emprestimoService = {
  // Listar todos os empréstimos
  async listarEmprestimos(): Promise<Emprestimo[]> {
    try {
      const response = await fetch(`${API_URL}/emprestimos`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao listar empréstimos');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao listar empréstimos:', error);
      throw error;
    }
  },

  // Buscar empréstimo por ID
  async buscarEmprestimoPorId(id: number): Promise<Emprestimo> {
    try {
      const response = await fetch(`${API_URL}/emprestimos/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Empréstimo não encontrado');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar empréstimo:', error);
      throw error;
    }
  },

  // Criar novo empréstimo
  async criarEmprestimo(emprestimo: CreateEmprestimoInput): Promise<Emprestimo> {
    try {
      const response = await fetch(`${API_URL}/emprestimos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(emprestimo),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar empréstimo');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar empréstimo:', error);
      throw error;
    }
  },

  // Renovar empréstimo (atualizar data de devolução)
  async renovarEmprestimo(id: number, novaDevolucao: string): Promise<Emprestimo> {
    try {
      const response = await fetch(`${API_URL}/emprestimos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ dataPrevistaDevolucao: novaDevolucao }),
      });

      if (!response.ok) {
        throw new Error('Erro ao renovar empréstimo');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao renovar empréstimo:', error);
      throw error;
    }
  },

  // Registrar devolução
  async registrarDevolucao(id: number): Promise<Emprestimo> {
    try {
      const response = await fetch(`${API_URL}/emprestimos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          dataDevolucao: new Date().toISOString().split('T')[0],
          status: 'devolvido',
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao registrar devolução');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao registrar devolução:', error);
      throw error;
    }
  },

  // Deletar empréstimo
  async deletarEmprestimo(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/emprestimos/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar empréstimo');
      }
    } catch (error) {
      console.error('Erro ao deletar empréstimo:', error);
      throw error;
    }
  },
};
