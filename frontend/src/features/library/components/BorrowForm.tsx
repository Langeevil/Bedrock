import React, { useState } from 'react';
import type { CreateEmprestimoInput, Livro } from '../types/libraryTypes';

interface BorrowFormProps {
  book: Livro;
  onSubmit: (data: CreateEmprestimoInput) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const BorrowForm: React.FC<BorrowFormProps> = ({
  book,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState<CreateEmprestimoInput>({
    livroId: book.id,
    dataPrevistaDevolucao: '',
  });

  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.dataPrevistaDevolucao) {
      setError('Data de devolução é obrigatória');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar empréstimo');
    }
  };

  const minDate = new Date().toISOString().split('T')[0];
  const defaultDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  return (
    <div className="modal modal-open">
      <div className="modal-box w-full max-w-md">
        <h3 className="font-bold text-lg mb-4">Emprestar Livro</h3>

        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Livro</span>
            </label>
            <input
              aria-label="Livro selecionado"
              type="text"
              value={book.nome}
              className="input input-bordered"
              disabled
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Data Prevista de Devolução</span>
            </label>
            <input
              aria-label="Data prevista de devolucao"
              type="date"
              name="dataPrevistaDevolucao"
              value={formData.dataPrevistaDevolucao || defaultDate}
              onChange={handleChange}
              min={minDate}
              className="input input-bordered"
              required
            />
            <label className="label">
              <span className="label-text-alt text-base-content/70">
                Período padrão: 14 dias
              </span>
            </label>
          </div>

          <div className="modal-action gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="btn"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Processando...' : 'Emprestar'}
            </button>
          </div>
        </form>
      </div>
      <button type="button" className="modal-backdrop" aria-label="Fechar formulario de emprestimo" onClick={onCancel} />
    </div>
  );
};
