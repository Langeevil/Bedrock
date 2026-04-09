import React from 'react';
import type { Livro } from '../types/libraryTypes';

interface BookCardProps {
  book: Livro;
  onEdit?: (book: Livro) => void;
  onDelete?: (id: number) => void;
  onBorrow?: (book: Livro) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onEdit,
  onDelete,
  onBorrow,
}) => {
  return (
    <div className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
      <div className="card-body">
        <h2 className="card-title text-lg">{book.nome}</h2>
        
        <div className="space-y-2 text-sm">
          <p className="text-base-content/70">
            <span className="font-semibold">Autor:</span> {book.autor}
          </p>
          <p className="text-base-content/70">
            <span className="font-semibold">Editora:</span> {book.editora}
          </p>
          <p className="text-base-content/70">
            <span className="font-semibold">Publicação:</span> {book.datapubli}
          </p>
        </div>

        <div className="card-actions justify-end gap-2 mt-4">
          {onBorrow && (
            <button
              onClick={() => onBorrow(book)}
              className="btn btn-sm btn-primary"
            >
              Emprestar
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(book)}
              className="btn btn-sm btn-secondary"
            >
              Editar
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(book.id)}
              className="btn btn-sm btn-error"
            >
              Deletar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
