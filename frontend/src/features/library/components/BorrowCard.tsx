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
  const isOverdue =
    new Date(borrow.dataPrevistaDevolucao) < new Date() &&
    borrow.status === 'ativo';

  const statusConfig = {
    ativo:     { label: 'Ativo',     bg: '#fefce8', color: '#a16207', border: '#fde68a' },
    atrasado:  { label: 'Atrasado',  bg: '#fff5f5', color: '#dc2626', border: '#fecaca' },
    devolvido: { label: 'Devolvido', bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  } as const;

  const status = statusConfig[borrow.status as keyof typeof statusConfig] ?? {
    label: borrow.status, bg: '#f8fafc', color: '#64748b', border: '#e2e8f0',
  };

  return (
    <>
      <style>{`
        .brc-card {
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

        .brc-card:hover {
          box-shadow: 0 6px 20px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }

        .brc-card.overdue {
          border-color: #fca5a5;
          background: #fffafa;
        }

        /* ── Header ── */
        .brc-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.75rem;
        }

        .brc-header-left {
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          flex: 1;
          min-width: 0;
        }

        .brc-icon {
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

        .brc-icon.overdue {
          background: #fff5f5;
          border-color: #fecaca;
          color: #ef4444;
        }

        .brc-title {
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          color: #0f172a;
          line-height: 1.35;
          margin: 0;
          padding-top: 0.1rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* ── Status badge ── */
        .brc-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.2rem 0.6rem;
          border-radius: 999px;
          font-family: 'Inter', sans-serif;
          font-size: 0.7rem;
          font-weight: 600;
          white-space: nowrap;
          flex-shrink: 0;
          border: 1px solid;
        }

        .brc-badge-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: currentColor;
          opacity: 0.7;
        }

        /* ── Divider ── */
        .brc-divider {
          height: 1px;
          background: #f1f5f9;
        }

        /* ── Meta ── */
        .brc-meta {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .brc-meta-row {
          display: flex;
          align-items: baseline;
          gap: 0.35rem;
          font-family: 'Inter', sans-serif;
          font-size: 0.8rem;
        }

        .brc-meta-label {
          font-weight: 600;
          color: #64748b;
          white-space: nowrap;
          min-width: 120px;
        }

        .brc-meta-value {
          color: #334155;
        }

        /* ── Overdue banner ── */
        .brc-overdue-banner {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.55rem 0.8rem;
          background: #fff5f5;
          border: 1px solid #fecaca;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 0.78rem;
          font-weight: 600;
          color: #dc2626;
        }

        /* ── Fine ── */
        .brc-fine {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.8rem;
          background: #fff5f5;
          border: 1px solid #fecaca;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 0.8rem;
          font-weight: 600;
          color: #dc2626;
        }

        /* ── Actions ── */
        .brc-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        /* Renew — light blue */
        .brc-btn-renew {
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

        .brc-btn-renew:hover {
          background: #dbeafe;
          box-shadow: 0 2px 8px rgba(59,130,246,0.15);
        }

        /* Return — solid blue */
        .brc-btn-return {
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
          box-shadow: 0 1px 3px rgba(59,130,246,0.3);
          transition: background 0.18s, box-shadow 0.18s, transform 0.1s;
        }

        .brc-btn-return:hover {
          background: #2563eb;
          border-color: #2563eb;
          box-shadow: 0 4px 10px rgba(59,130,246,0.35);
          transform: translateY(-1px);
        }

        /* Delete — light red */
        .brc-btn-delete {
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

        .brc-btn-delete:hover {
          background: #fee2e2;
          box-shadow: 0 2px 8px rgba(239,68,68,0.15);
        }
      `}</style>

      <div className={`brc-card ${isOverdue ? 'overdue' : ''}`}>
        {/* Header */}
        <div className="brc-header">
          <div className="brc-header-left">
            <span className={`brc-icon ${isOverdue ? 'overdue' : ''}`}>
              {isOverdue ? (
                <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                  <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/>
                </svg>
              ) : (
                <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                  <path d="M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75h-1.5m-4.5 0V3m0 .75h3m-3 0h-3m3 0V3"/>
                </svg>
              )}
            </span>
            <h2 className="brc-title">{bookTitle || `Livro #${borrow.livroId}`}</h2>
          </div>

          <span
            className="brc-badge"
            style={{
              background: status.bg,
              color: status.color,
              borderColor: status.border,
            }}
          >
            <span className="brc-badge-dot" />
            {status.label}
          </span>
        </div>

        <div className="brc-divider" />

        {/* Meta */}
        <div className="brc-meta">
          <div className="brc-meta-row">
            <span className="brc-meta-label">Empréstimo</span>
            <span className="brc-meta-value">{borrow.dataEmprestimo}</span>
          </div>
          <div className="brc-meta-row">
            <span className="brc-meta-label">Devolução prevista</span>
            <span className="brc-meta-value" style={{ color: isOverdue ? '#dc2626' : undefined, fontWeight: isOverdue ? 600 : undefined }}>
              {borrow.dataPrevistaDevolucao}
            </span>
          </div>
          {borrow.dataDevolucao && (
            <div className="brc-meta-row">
              <span className="brc-meta-label">Devolvido em</span>
              <span className="brc-meta-value">{borrow.dataDevolucao}</span>
            </div>
          )}
        </div>

        {/* Overdue banner */}
        {isOverdue && (
          <div className="brc-overdue-banner">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/>
            </svg>
            Devolução em atraso
          </div>
        )}

        {/* Fine */}
        {borrow.multa > 0 && (
          <div className="brc-fine">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
            </svg>
            Multa: R$ {borrow.multa.toFixed(2)}
          </div>
        )}

        {/* Actions */}
        <div className="brc-divider" />
        <div className="brc-actions">
          {borrow.status === 'ativo' && onRenew && (
            <button onClick={() => onRenew(borrow.id)} className="brc-btn-renew">
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"/>
              </svg>
              Renovar
            </button>
          )}
          {borrow.status === 'ativo' && onReturn && (
            <button onClick={() => onReturn(borrow.id)} className="brc-btn-return">
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"/>
              </svg>
              Devolver
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(borrow.id)} className="brc-btn-delete">
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