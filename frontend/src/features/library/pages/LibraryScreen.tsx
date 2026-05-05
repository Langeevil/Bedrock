import { useState } from "react";
import { SidebarSimple } from "../../../components/sidebar-simple";
import { BookCard } from "../components/BookCard";
import { BookForm } from "../components/BookForm";
import { BorrowCard } from "../components/BorrowCard";
import { BorrowForm } from "../components/BorrowForm";
import { useBooks } from "../hooks/useBooks";
import { useBorrows } from "../hooks/useBorrows";
import type {
  CreateEmprestimoInput,
  CreateLivroInput,
  Livro,
} from "../types/libraryTypes";

export default function LibraryScreen() {
  const {
    books,
    loading: booksLoading,
    createBook,
    updateBook,
    deleteBook,
  } = useBooks();
  const {
    borrows,
    loading: borrowsLoading,
    createBorrow,
    renewBorrow,
    returnBorrow,
    deleteBorrow,
  } = useBorrows();

  const [activeTab, setActiveTab] = useState<"books" | "borrows">("books");
  const [showBookForm, setShowBookForm] = useState(false);
  const [showBorrowForm, setShowBorrowForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Livro | null>(null);
  const [selectedBookForBorrow, setSelectedBookForBorrow] =
    useState<Livro | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleEditBook = (book: Livro) => {
    setEditingBook(book);
    setShowBookForm(true);
  };

  const handleSaveBook = async (data: CreateLivroInput) => {
    try {
      if (editingBook) {
        await updateBook(editingBook.id, data);
      } else {
        await createBook(data);
      }
      setShowBookForm(false);
      setEditingBook(null);
    } catch (error) {
      console.error("Erro ao salvar livro:", error);
    }
  };

  const handleDeleteBook = async (id: number) => {
    if (window.confirm("Tem certeza que deseja deletar este livro?")) {
      try {
        await deleteBook(id);
      } catch (error) {
        console.error("Erro ao deletar livro:", error);
      }
    }
  };

  const handleBorrowBook = (book: Livro) => {
    setSelectedBookForBorrow(book);
    setShowBorrowForm(true);
  };

  const handleSaveBorrow = async (data: CreateEmprestimoInput) => {
    try {
      await createBorrow(data);
      setShowBorrowForm(false);
      setSelectedBookForBorrow(null);
    } catch (error) {
      console.error("Erro ao criar empréstimo:", error);
    }
  };

  const handleRenewBorrow = async (id: number) => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    try {
      await renewBorrow(id, tomorrow);
    } catch (error) {
      console.error("Erro ao renovar empréstimo:", error);
    }
  };

  const handleReturnBorrow = async (id: number) => {
    if (window.confirm("Registrar devolução deste livro?")) {
      try {
        await returnBorrow(id);
      } catch (error) {
        console.error("Erro ao registrar devolução:", error);
      }
    }
  };

  const handleDeleteBorrow = async (id: number) => {
    if (window.confirm("Tem certeza que deseja deletar este empréstimo?")) {
      try {
        await deleteBorrow(id);
      } catch (error) {
        console.error("Erro ao deletar empréstimo:", error);
      }
    }
  };

  const getBookTitle = (bookId: number): string => {
    const book = books.find((entry) => entry.id === bookId);
    return book?.nome || `Livro #${bookId}`;
  };

  const filteredBooks = books.filter((book) =>
    [book.nome, book.autor, book.editora].some((value) =>
      value.toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        .lib-root {
          --lib-bg: #f0f4f8;
          --lib-surface: #ffffff;
          --lib-border: #e2e8f0;
          --lib-border-focus: #93c5fd;
          --lib-text: #0f172a;
          --lib-text-muted: #64748b;
          --lib-blue: #3b82f6;
          --lib-blue-light: #eff6ff;
          --lib-blue-hover: #2563eb;
          --lib-blue-border: #bfdbfe;
          --lib-radius: 12px;
          --lib-radius-sm: 8px;
          font-family: 'Inter', sans-serif;
        }

        .lib-layout {
          display: flex;
          height: 100dvh;
          overflow: hidden;
          background: var(--lib-bg);
        }

        .lib-main {
          flex: 1;
          min-width: 0;
          overflow-y: auto;
          padding: 2rem 1.5rem;
          background: var(--lib-bg);
        }

        @media (min-width: 640px) {
          .lib-main { padding: 2.5rem 2rem; }
        }
        @media (min-width: 1024px) {
          .lib-main { padding: 3rem 3rem; }
        }

        /* ── Header ── */
        .lib-header {
          margin-bottom: 2rem;
        }

        .lib-title {
          font-size: clamp(1.5rem, 3vw, 2rem);
          font-weight: 700;
          color: var(--lib-text);
          letter-spacing: -0.025em;
          line-height: 1.2;
        }

        .lib-subtitle {
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--lib-text-muted);
          margin-bottom: 0.3rem;
          letter-spacing: 0.02em;
        }

        /* ── Tabs ── */
        .lib-tabs {
          display: flex;
          gap: 0.25rem;
          margin-bottom: 1.75rem;
          background: var(--lib-surface);
          border: 1px solid var(--lib-border);
          border-radius: var(--lib-radius);
          padding: 0.3rem;
          width: fit-content;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        .lib-tab {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.5rem 1.1rem;
          font-size: 0.82rem;
          font-weight: 500;
          color: var(--lib-text-muted);
          background: transparent;
          border: none;
          border-radius: var(--lib-radius-sm);
          cursor: pointer;
          transition: all 0.18s ease;
        }

        .lib-tab:hover {
          color: var(--lib-text);
          background: var(--lib-bg);
        }

        .lib-tab.active {
          color: var(--lib-blue);
          background: var(--lib-blue-light);
          font-weight: 600;
        }

        .lib-tab-badge {
          font-size: 0.68rem;
          font-weight: 600;
          background: var(--lib-border);
          color: var(--lib-text-muted);
          padding: 0.1rem 0.45rem;
          border-radius: 999px;
          min-width: 1.4rem;
          text-align: center;
          transition: all 0.18s ease;
        }

        .lib-tab.active .lib-tab-badge {
          background: var(--lib-blue);
          color: #fff;
        }

        /* ── Toolbar ── */
        .lib-toolbar {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          background: var(--lib-surface);
          border: 1px solid var(--lib-border);
          border-radius: var(--lib-radius);
          padding: 0.75rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        .lib-search-wrap {
          flex: 1;
          min-width: 180px;
          position: relative;
          display: flex;
          align-items: center;
        }

        .lib-search-icon {
          position: absolute;
          left: 0.75rem;
          color: var(--lib-text-muted);
          pointer-events: none;
          width: 16px;
          height: 16px;
        }

        .lib-search {
          width: 100%;
          padding: 0.6rem 0.9rem 0.6rem 2.25rem;
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          color: var(--lib-text);
          background: var(--lib-bg);
          border: 1px solid var(--lib-border);
          border-radius: var(--lib-radius-sm);
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
        }

        .lib-search::placeholder {
          color: var(--lib-text-muted);
        }

        .lib-search:focus {
          border-color: var(--lib-border-focus);
          box-shadow: 0 0 0 3px rgba(147,197,253,0.25);
        }

        /* ── Buttons ── */
        .lib-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.6rem 1.2rem;
          font-family: 'Inter', sans-serif;
          font-size: 0.82rem;
          font-weight: 600;
          color: #fff;
          background: var(--lib-blue);
          border: 1px solid var(--lib-blue);
          border-radius: var(--lib-radius-sm);
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.18s, box-shadow 0.18s, transform 0.1s;
          box-shadow: 0 1px 3px rgba(59,130,246,0.3);
        }

        .lib-btn-primary:hover {
          background: var(--lib-blue-hover);
          border-color: var(--lib-blue-hover);
          box-shadow: 0 4px 12px rgba(59,130,246,0.35);
          transform: translateY(-1px);
        }

        .lib-btn-primary:active {
          transform: translateY(0);
        }

        .lib-btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 1rem;
          font-family: 'Inter', sans-serif;
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--lib-blue);
          background: var(--lib-blue-light);
          border: 1px solid var(--lib-blue-border);
          border-radius: var(--lib-radius-sm);
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.18s, box-shadow 0.18s;
        }

        .lib-btn-secondary:hover {
          background: #dbeafe;
          box-shadow: 0 2px 8px rgba(59,130,246,0.15);
        }

        /* ── Grid ── */
        .lib-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        @media (min-width: 768px) {
          .lib-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (min-width: 1280px) {
          .lib-grid { grid-template-columns: repeat(3, 1fr); }
        }

        /* ── Alerts ── */
        .lib-alert {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          font-size: 0.875rem;
          border: 1px solid var(--lib-border);
          border-radius: var(--lib-radius);
          background: var(--lib-surface);
          color: var(--lib-text-muted);
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        .lib-alert-icon {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
          color: var(--lib-blue);
          opacity: 0.7;
        }

        .lib-alert.warn .lib-alert-icon {
          color: #f59e0b;
          opacity: 1;
        }

        /* ── Spinner ── */
        .lib-spinner-wrap {
          display: flex;
          justify-content: center;
          padding: 4rem 0;
        }

        .lib-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid var(--lib-border);
          border-top-color: var(--lib-blue);
          border-radius: 50%;
          animation: lib-spin 0.7s linear infinite;
        }

        @keyframes lib-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="lib-root lib-layout">
        <SidebarSimple />

        <main className="lib-main">
          {/* Header */}
          <header className="lib-header">
            <p className="lib-subtitle">Sistema de Gestão</p>
            <h1 className="lib-title">Biblioteca</h1>
          </header>

          {/* Tabs */}
          <nav className="lib-tabs" role="tablist">
            <button
              role="tab"
              className={`lib-tab ${activeTab === "books" ? "active" : ""}`}
              aria-selected={activeTab === "books"}
              onClick={() => setActiveTab("books")}
            >
              Livros
              <span className="lib-tab-badge">{books.length}</span>
            </button>
            <button
              role="tab"
              className={`lib-tab ${activeTab === "borrows" ? "active" : ""}`}
              aria-selected={activeTab === "borrows"}
              onClick={() => setActiveTab("borrows")}
            >
              Empréstimos
              <span className="lib-tab-badge">{borrows.length}</span>
            </button>
          </nav>

          {/* Books tab */}
          {activeTab === "books" && (
            <div>
              <div className="lib-toolbar">
                <div className="lib-search-wrap">
                  {/* Search icon */}
                  <svg className="lib-search-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input
                    aria-label="Buscar livro por título, autor ou editora"
                    className="lib-search"
                    placeholder="Buscar por título, autor ou editora…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => { setEditingBook(null); setShowBookForm(true); }}
                  className="lib-btn-primary"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  Novo Livro
                </button>
              </div>

              {booksLoading ? (
                <div className="lib-spinner-wrap">
                  <div className="lib-spinner" />
                </div>
              ) : filteredBooks.length === 0 && searchTerm === "" ? (
                <div className="lib-alert">
                  <svg className="lib-alert-icon" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"/>
                  </svg>
                  Nenhum livro cadastrado. Comece adicionando um novo livro.
                </div>
              ) : filteredBooks.length === 0 ? (
                <div className="lib-alert warn">
                  <svg className="lib-alert-icon" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/>
                  </svg>
                  Nenhum livro encontrado com esse critério de busca.
                </div>
              ) : (
                <div className="lib-grid">
                  {filteredBooks.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      onEdit={handleEditBook}
                      onDelete={handleDeleteBook}
                      onBorrow={handleBorrowBook}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Borrows tab */}
          {activeTab === "borrows" && (
            <div>
              {borrowsLoading ? (
                <div className="lib-spinner-wrap">
                  <div className="lib-spinner" />
                </div>
              ) : borrows.length === 0 ? (
                <div className="lib-alert">
                  <svg className="lib-alert-icon" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"/>
                  </svg>
                  Nenhum empréstimo ativo.
                </div>
              ) : (
                <div className="lib-grid">
                  {borrows.map((borrow) => (
                    <BorrowCard
                      key={borrow.id}
                      borrow={borrow}
                      bookTitle={getBookTitle(borrow.livroId)}
                      onRenew={handleRenewBorrow}
                      onReturn={handleReturnBorrow}
                      onDelete={handleDeleteBorrow}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

        {showBookForm && (
          <BookForm
            book={editingBook || undefined}
            onSubmit={handleSaveBook}
            onCancel={() => { setShowBookForm(false); setEditingBook(null); }}
          />
        )}

        {showBorrowForm && selectedBookForBorrow && (
          <BorrowForm
            book={selectedBookForBorrow}
            onSubmit={handleSaveBorrow}
            onCancel={() => { setShowBorrowForm(false); setSelectedBookForBorrow(null); }}
          />
        )}
      </div>
    </>
  );
}