import React, { useState } from "react";
import type { CreateEmprestimoInput, Livro } from "../types/libraryTypes";

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
    dataPrevistaDevolucao: "",
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
      setError("Data de devolução é obrigatória");
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar empréstimo");
    }
  };

  const minDate = new Date().toISOString().split("T")[0];
  const defaultDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  return (
    <div className="modal modal-open">
      <div className="modal-box w-full max-w-md p-0 overflow-hidden">
        <style>{`
          .brf-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 1rem;
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            box-shadow: 0 1px 3px rgba(15,23,42,0.08);
            transition: box-shadow 0.18s ease, transform 0.18s ease;
          }

          .brf-card:hover {
            box-shadow: 0 8px 24px rgba(15,23,42,0.12);
            transform: translateY(-1px);
          }

          .brf-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 0.85rem;
          }

          .brf-header-left {
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            flex: 1;
            min-width: 0;
          }

          .brf-icon {
            width: 40px;
            height: 40px;
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 0.75rem;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            color: #2563eb;
          }

          .brf-title {
            font-family: 'Inter', sans-serif;
            font-size: 1rem;
            font-weight: 700;
            color: #0f172a;
            line-height: 1.3;
            margin: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .brf-subtitle {
            margin: 0.25rem 0 0;
            color: #475569;
            font-size: 0.9rem;
            line-height: 1.5;
          }

          .brf-divider {
            height: 1px;
            background: #f1f5f9;
            border: none;
            margin: 0;
          }

          .brf-body {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .brf-actions {
            display: flex;
            flex-wrap: wrap;
            justify-content: flex-end;
            gap: 0.75rem;
          }

          .brf-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.75rem 1.1rem;
            border-radius: 0.75rem;
            font-weight: 600;
            min-width: 120px;
            transition: background 0.18s, transform 0.12s;
          }

          .brf-btn-secondary {
            color: #334155;
            background: #f8fafc;
            border: 1px solid #cbd5e1;
          }

          .brf-btn-secondary:hover {
            background: #e2e8f0;
          }

          .brf-btn-primary {
            color: #ffffff;
            background: #3b82f6;
            border: 1px solid #3b82f6;
          }

          .brf-btn-primary:hover {
            background: #2563eb;
          }

          .brf-field {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .brf-label {
            font-size: 0.9rem;
            font-weight: 600;
            color: #334155;
          }

          .brf-help {
            font-size: 0.82rem;
            color: #64748b;
          }
        `}</style>

        <div className="brf-card">
          <div className="brf-header">
            <div className="brf-header-left">
              <span className="brf-icon" aria-hidden="true">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M5.25 4.5h13.5a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5H5.25A1.5 1.5 0 0 1 3.75 18V6a1.5 1.5 0 0 1 1.5-1.5Z" />
                  <path d="M7.5 7.5h9m-9 4.5h9" />
                </svg>
              </span>
              <div>
                <h3 className="brf-title">Emprestar Livro</h3>
                <p className="brf-subtitle">Registre o prazo de devolução para o livro selecionado.</p>
              </div>
            </div>
          </div>

          <div className="brf-divider" />

          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="brf-body">
            <div className="brf-field">
              <label className="brf-label" htmlFor="book-name">
                Livro
              </label>
              <input
                id="book-name"
                aria-label="Livro selecionado"
                type="text"
                value={book.nome}
                className="input input-bordered"
                disabled
              />
            </div>

            <div className="brf-field">
              <label className="brf-label" htmlFor="dataPrevistaDevolucao">
                Data Prevista de Devolução
              </label>
              <input
                id="dataPrevistaDevolucao"
                aria-label="Data prevista de devolução"
                type="date"
                name="dataPrevistaDevolucao"
                value={formData.dataPrevistaDevolucao || defaultDate}
                onChange={handleChange}
                min={minDate}
                className="input input-bordered"
                required
              />
              <span className="brf-help">Período padrão: 14 dias</span>
            </div>

            <div className="brf-actions">
              <button
                type="button"
                onClick={onCancel}
                className="brf-btn brf-btn-secondary"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="brf-btn brf-btn-primary"
                disabled={loading}
              >
                {loading ? "Processando..." : "Emprestar"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <button
        type="button"
        className="modal-backdrop"
        aria-label="Fechar formulário de empréstimo"
        onClick={onCancel}
      />
    </div>
  );
};
