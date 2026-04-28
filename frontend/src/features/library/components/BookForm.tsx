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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
    <div className="modal modal-open">
      <div className="modal-box w-full max-w-md">
        <h3 className="mb-4 text-lg font-bold">
          {book ? "Editar Livro" : "Novo Livro"}
        </h3>

        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Título</span>
            </label>
            <input
              aria-label="Título do livro"
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Digite o título do livro"
              className="input input-bordered"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Autor</span>
            </label>
            <input
              aria-label="Autor do livro"
              type="text"
              name="autor"
              value={formData.autor}
              onChange={handleChange}
              placeholder="Digite o nome do autor"
              className="input input-bordered"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Editora</span>
            </label>
            <input
              aria-label="Editora do livro"
              type="text"
              name="editora"
              value={formData.editora}
              onChange={handleChange}
              placeholder="Digite o nome da editora"
              className="input input-bordered"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Data de Publicação</span>
            </label>
            <input
              aria-label="Data de publicação do livro"
              type="date"
              name="datapubli"
              value={formData.datapubli}
              onChange={handleChange}
              className="input input-bordered"
              required
            />
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
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
      <button
        type="button"
        className="modal-backdrop"
        aria-label="Fechar formulário de livro"
        onClick={onCancel}
      />
    </div>
  );
};
