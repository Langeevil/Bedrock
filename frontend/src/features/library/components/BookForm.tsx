import React, { useEffect, useState } from "react";
import type { CreateLivroInput, Livro } from "../types/libraryTypes";

interface BookFormProps {
  book?: Livro;
  onSubmit: (data: CreateLivroInput) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const BookForm: React.FC<BookFormProps> = ({
  book,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState<CreateLivroInput>({
    nome: "",
    autor: "",
    editora: "",
    datapubli: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (book) {
      setFormData({
        nome: book.nome,
        autor: book.autor,
        editora: book.editora,
        datapubli: book.datapubli,
      });
    }
  }, [book]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar livro");
    }
  };

  return (
    <>
      <style>{`
        .bf-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(3px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          padding: 1rem;
          animation: bf-fade-in 0.18s ease;
        }

        @keyframes bf-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .bf-modal {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.14);
          width: 100%;
          max-width: 440px;
          animation: bf-slide-up 0.2s ease;
          overflow: hidden;
        }

        @keyframes bf-slide-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Modal header ── */
        .bf-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem 1rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .bf-header-left {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .bf-header-icon {
          width: 34px;
          height: 34px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #3b82f6;
          flex-shrink: 0;
        }

        .bf-title {
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .bf-close {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 8px;
          color: #94a3b8;
          cursor: pointer;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
        }

        .bf-close:hover {
          background: #f1f5f9;
          border-color: #e2e8f0;
          color: #475569;
        }

        /* ── Form body ── */
        .bf-body {
          padding: 1.25rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        /* ── Error ── */
        .bf-error {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.75rem 1rem;
          background: #fff5f5;
          border: 1px solid #fecaca;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 0.8rem;
          color: #dc2626;
        }

        /* ── Field ── */
        .bf-field {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .bf-label {
          font-family: 'Inter', sans-serif;
          font-size: 0.78rem;
          font-weight: 600;
          color: #475569;
          letter-spacing: 0.01em;
        }

        .bf-input {
          width: 100%;
          padding: 0.6rem 0.875rem;
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          color: #0f172a;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
          box-sizing: border-box;
        }

        .bf-input::placeholder {
          color: #94a3b8;
        }

        .bf-input:focus {
          border-color: #93c5fd;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(147,197,253,0.25);
        }

        /* ── Footer ── */
        .bf-footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.6rem;
          padding: 1rem 1.5rem 1.25rem;
          border-top: 1px solid #f1f5f9;
        }

        .bf-btn-cancel {
          display: inline-flex;
          align-items: center;
          padding: 0.55rem 1.1rem;
          font-family: 'Inter', sans-serif;
          font-size: 0.82rem;
          font-weight: 500;
          color: #64748b;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.18s, color 0.18s;
        }

        .bf-btn-cancel:hover:not(:disabled) {
          background: #f1f5f9;
          color: #334155;
        }

        .bf-btn-cancel:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .bf-btn-submit {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.55rem 1.2rem;
          font-family: 'Inter', sans-serif;
          font-size: 0.82rem;
          font-weight: 600;
          color: #ffffff;
          background: #3b82f6;
          border: 1px solid #3b82f6;
          border-radius: 8px;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(59,130,246,0.3);
          transition: background 0.18s, box-shadow 0.18s, transform 0.1s;
        }

        .bf-btn-submit:hover:not(:disabled) {
          background: #2563eb;
          border-color: #2563eb;
          box-shadow: 0 4px 12px rgba(59,130,246,0.35);
          transform: translateY(-1px);
        }

        .bf-btn-submit:active:not(:disabled) {
          transform: translateY(0);
        }

        .bf-btn-submit:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }

        .bf-spinner {
          width: 13px;
          height: 13px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: bf-spin 0.65s linear infinite;
        }

        @keyframes bf-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Backdrop */}
      <div className="bf-overlay" onClick={onCancel}>
        <div className="bf-modal" onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="bf-header">
            <div className="bf-header-left">
              <span className="bf-header-icon">
                <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                  <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
              </span>
              <h3 className="bf-title">{book ? "Editar Livro" : "Novo Livro"}</h3>
            </div>
            <button className="bf-close" onClick={onCancel} aria-label="Fechar">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M6 18 18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="bf-body">
            {error && (
              <div className="bf-error">
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "contents" }}>
              <div className="bf-field">
                <label className="bf-label" htmlFor="bf-nome">Título</label>
                <input
                  id="bf-nome"
                  aria-label="Título do livro"
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Digite o título do livro"
                  className="bf-input"
                  required
                />
              </div>

              <div className="bf-field">
                <label className="bf-label" htmlFor="bf-autor">Autor</label>
                <input
                  id="bf-autor"
                  aria-label="Autor do livro"
                  type="text"
                  name="autor"
                  value={formData.autor}
                  onChange={handleChange}
                  placeholder="Digite o nome do autor"
                  className="bf-input"
                  required
                />
              </div>

              <div className="bf-field">
                <label className="bf-label" htmlFor="bf-editora">Editora</label>
                <input
                  id="bf-editora"
                  aria-label="Editora do livro"
                  type="text"
                  name="editora"
                  value={formData.editora}
                  onChange={handleChange}
                  placeholder="Digite o nome da editora"
                  className="bf-input"
                  required
                />
              </div>

              <div className="bf-field">
                <label className="bf-label" htmlFor="bf-datapubli">Data de Publicação</label>
                <input
                  id="bf-datapubli"
                  aria-label="Data de publicação do livro"
                  type="date"
                  name="datapubli"
                  value={formData.datapubli}
                  onChange={handleChange}
                  className="bf-input"
                  required
                />
              </div>

              {/* Footer inside form so submit works */}
              <div className="bf-footer" style={{ margin: "0 -1.5rem -1.25rem", padding: "1rem 1.5rem 1.25rem" }}>
                <button
                  type="button"
                  onClick={onCancel}
                  className="bf-btn-cancel"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bf-btn-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="bf-spinner" />
                      Salvando…
                    </>
                  ) : (
                    <>
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M4.5 12.75l6 6 9-13.5"/>
                      </svg>
                      Salvar
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};