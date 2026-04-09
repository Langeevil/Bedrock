import React from 'react';
import type { Emprestimo } from '../types/libraryTypes';

interface BorrowCardProps {
  borrow: Emprestimo;
  bookTitle?: string;
  onRenew?: (id: number) => void;
  onReturn?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export const BorrowCard: React.FC<BorrowCardProps> = ({
  borrow,
  bookTitle,
  onRenew,
  onReturn,
  onDelete,
}) => {
  const isOverdue = new Date(borrow.dataPrevistaDevolucao) < new Date() && borrow.status === 'ativo';
  
  return (
    <div className={`card shadow-md hover:shadow-lg transition-shadow ${
      isOverdue ? 'border-2 border-error' : 'bg-base-100'
    }`}>
      <div className="card-body">
        <h2 className="card-title text-lg">{bookTitle || `Livro #${borrow.livroId}`}</h2>
        
        <div className="space-y-2 text-sm">
          <p className="text-base-content/70">
            <span className="font-semibold">Empréstimo:</span> {borrow.dataEmprestimo}
          </p>
          <p className="text-base-content/70">
            <span className="font-semibold">Devolução prevista:</span> {borrow.dataPrevistaDevolucao}
          </p>
          
          {isOverdue && (
            <p className="text-error font-semibold">⚠️ Atrasado!</p>
          )}
          
          {borrow.dataDevolucao && (
            <p className="text-base-content/70">
              <span className="font-semibold">Devolvido em:</span> {borrow.dataDevolucao}
            </p>
          )}
          
          <div className="flex items-center gap-2">
            <span className={`badge ${
              borrow.status === 'ativo' ? 'badge-warning' :
              borrow.status === 'atrasado' ? 'badge-error' :
              'badge-success'
            }`}>
              {borrow.status}
            </span>
          </div>

          {borrow.multa > 0 && (
            <p className="text-error font-semibold">
              Multa: R$ {borrow.multa.toFixed(2)}
            </p>
          )}
        </div>

        <div className="card-actions justify-end gap-2 mt-4">
          {borrow.status === 'ativo' && onRenew && (
            <button
              onClick={() => onRenew(borrow.id)}
              className="btn btn-sm btn-info"
            >
              Renovar
            </button>
          )}
          {borrow.status === 'ativo' && onReturn && (
            <button
              onClick={() => onReturn(borrow.id)}
              className="btn btn-sm btn-success"
            >
              Devolver
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(borrow.id)}
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
