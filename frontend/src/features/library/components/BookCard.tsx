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
    <>
      <style>{`
        .bc-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          transition: box-shadow 0.18s ease, transform 0.18s ease;
        }

        .bc-card:hover {
          box-shadow: 0 6px 20px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }

        /* ── Header ── */
        .bc-header {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .bc-icon {
          width: 38px;
          height: 38px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #3b82f6;
        }

        .bc-title {
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          color: #0f172a;
          line-height: 1.35;
          flex: 1;
          margin: 0;
        }

        /* ── Meta ── */
        .bc-meta {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .bc-meta-row {
          display: flex;
          align-items: baseline;
          gap: 0.35rem;
          font-family: 'Inter', sans-serif;
          font-size: 0.8rem;
        }

        .bc-meta-label {
          font-weight: 600;
          color: #64748b;
          white-space: nowrap;
          min-width: 70px;
        }

        .bc-meta-value {
          color: #334155;
        }

        /* ── Divider ── */
        .bc-divider {
          height: 1px;
          background: #f1f5f9;
          margin: 0.25rem 0;
        }

        /* ── Actions ── */
        .bc-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-top: 0.25rem;
        }

        /* Borrow — solid blue */
        .bc-btn-borrow {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.42rem 0.85rem;
          font-family: 'Inter', sans-serif;
          font-size: 0.775rem;
          font-weight: 600;
          color: #ffffff;
          background: #3b82f6;
          border: 1px solid #3b82f6;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.18s, box-shadow 0.18s, transform 0.1s;
          box-shadow: 0 1px 3px rgba(59,130,246,0.3);
        }

        .bc-btn-borrow:hover {
          background: #2563eb;
          border-color: #2563eb;
          box-shadow: 0 4px 10px rgba(59,130,246,0.35);
          transform: translateY(-1px);
        }

        /* Edit — light blue ghost */
        .bc-btn-edit {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.42rem 0.85rem;
          font-family: 'Inter', sans-serif;
          font-size: 0.775rem;
          font-weight: 500;
          color: #3b82f6;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.18s, box-shadow 0.18s;
        }

        .bc-btn-edit:hover {
          background: #dbeafe;
          box-shadow: 0 2px 8px rgba(59,130,246,0.15);
        }

        /* Delete — light red ghost */
        .bc-btn-delete {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.42rem 0.85rem;
          font-family: 'Inter', sans-serif;
          font-size: 0.775rem;
          font-weight: 500;
          color: #ef4444;
          background: #fff5f5;
          border: 1px solid #fecaca;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.18s, box-shadow 0.18s;
        }

        .bc-btn-delete:hover {
          background: #fee2e2;
          box-shadow: 0 2px 8px rgba(239,68,68,0.15);
        }
      `}</style>

      <div className="bc-card">
        {/* Header */}
        <div className="bc-header">
          <span className="bc-icon">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
          </span>
          <h2 className="bc-title">{book.nome}</h2>
        </div>

        <div className="bc-divider" />

        {/* Meta */}
        <div className="bc-meta">
          <div className="bc-meta-row">
            <span className="bc-meta-label">Autor</span>
            <span className="bc-meta-value">{book.autor}</span>
          </div>
          <div className="bc-meta-row">
            <span className="bc-meta-label">Editora</span>
            <span className="bc-meta-value">{book.editora}</span>
          </div>
          <div className="bc-meta-row">
            <span className="bc-meta-label">Publicação</span>
            <span className="bc-meta-value">{book.datapubli}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="bc-divider" />
        <div className="bc-actions">
          {onBorrow && (
            <button onClick={() => onBorrow(book)} className="bc-btn-borrow">
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75h-1.5m-4.5 0V3m0 .75h3m-3 0h-3m3 0V3"/>
              </svg>
              Emprestar
            </button>
          )}
          {onEdit && (
            <button onClick={() => onEdit(book)} className="bc-btn-edit">
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z"/>
              </svg>
              Editar
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(book.id)} className="bc-btn-delete">
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>
              </svg>
              Deletar
            </button>
          )}
        </div>
      </div>
    </>
  );
};