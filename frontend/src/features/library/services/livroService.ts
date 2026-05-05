import type { Livro, CreateLivroInput } from '../types/libraryTypes';
import { API_BASE_URL } from '../../../shared/services/config';

const API_URL = API_BASE_URL;

export const livroService = {
  // Listar todos os livros
  async listarLivros(): Promise<Livro[]> {
    try {
      const response = await fetch(`${API_URL}/livros`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao listar livros');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao listar livros:', error);
      throw error;
    }
  },

  // Buscar livro por ID
  async buscarLivroPorId(id: number): Promise<Livro> {
    try {
      const response = await fetch(`${API_URL}/livros/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Livro não encontrado');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar livro:', error);
      throw error;
    }
  },

  // Criar novo livro
  async criarLivro(livro: CreateLivroInput): Promise<Livro> {
    try {
      const response = await fetch(`${API_URL}/livros`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(livro),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar livro');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar livro:', error);
      throw error;
    }
  },

  // Atualizar livro
  async atualizarLivro(id: number, livro: Partial<CreateLivroInput>): Promise<Livro> {
    try {
      const response = await fetch(`${API_URL}/livros/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(livro),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar livro');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar livro:', error);
      throw error;
    }
  },

  // Deletar livro
  async deletarLivro(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/livros/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar livro');
      }
    } catch (error) {
      console.error('Erro ao deletar livro:', error);
      throw error;
    }
  },
};
