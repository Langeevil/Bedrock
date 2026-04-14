import { useState } from 'react';
import { useBooks } from '../hooks/useBooks';
import { useBorrows } from '../hooks/useBorrows';
import { BookCard } from '../components/BookCard';
import { BorrowCard } from '../components/BorrowCard';
import { BookForm } from '../components/BookForm';
import { BorrowForm } from '../components/BorrowForm';
import { SidebarSimple } from '../../../components/sidebar-simple';
import type { Livro } from '../types/libraryTypes';

export default function LibraryScreen() {
  const { books, loading: booksLoading, createBook, updateBook, deleteBook } = useBooks();
  const { borrows, loading: borrowsLoading, createBorrow, renewBorrow, returnBorrow, deleteBorrow } = useBorrows();

  const [activeTab, setActiveTab] = useState<'books' | 'borrows'>('books');
  const [showBookForm, setShowBookForm] = useState(false);
  const [showBorrowForm, setShowBorrowForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Livro | null>(null);
  const [selectedBookForBorrow, setSelectedBookForBorrow] = useState<Livro | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Manipuladores para livros
  const handleEditBook = (book: Livro) => {
    setEditingBook(book);
    setShowBookForm(true);
  };

  const handleSaveBook = async (data: any) => {
    try {
      if (editingBook) {
        await updateBook(editingBook.id, data);
      } else {
        await createBook(data);
      }
      setShowBookForm(false);
      setEditingBook(null);
    } catch (error) {
      console.error('Erro ao salvar livro:', error);
    }
  };

  const handleDeleteBook = async (id: number) => {
    if (window.confirm('Tem certeza que deseja deletar este livro?')) {
      try {
        await deleteBook(id);
      } catch (error) {
        console.error('Erro ao deletar livro:', error);
      }
    }
  };

  const handleBorrowBook = (book: Livro) => {
    setSelectedBookForBorrow(book);
    setShowBorrowForm(true);
  };

  // Manipuladores para empréstimos
  const handleSaveBorrow = async (data: any) => {
    try {
      await createBorrow(data);
      setShowBorrowForm(false);
      setSelectedBookForBorrow(null);
    } catch (error) {
      console.error('Erro ao criar empréstimo:', error);
    }
  };

  const handleRenewBorrow = async (id: number) => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    try {
      await renewBorrow(id, tomorrow);
    } catch (error) {
      console.error('Erro ao renovar empréstimo:', error);
    }
  };

  const handleReturnBorrow = async (id: number) => {
    if (window.confirm('Registrar devolução deste livro?')) {
      try {
        await returnBorrow(id);
      } catch (error) {
        console.error('Erro ao registrar devolução:', error);
      }
    }
  };

  const handleDeleteBorrow = async (id: number) => {
    if (window.confirm('Tem certeza que deseja deletar este empréstimo?')) {
      try {
        await deleteBorrow(id);
      } catch (error) {
        console.error('Erro ao deletar empréstimo:', error);
      }
    }
  };

  // Mapear ID de livro para nome
  const getBookTitle = (bookId: number): string => {
    const book = books.find(b => b.id === bookId);
    return book?.nome || `Livro #${bookId}`;
  };

  // Filtrar livros por busca
  const filteredBooks = books.filter(book =>
    book.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.autor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.editora.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarSimple />

      <div className="app-page min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <h1 className="mb-6 text-3xl font-semibold text-[var(--app-text)]">📚 Biblioteca</h1>

        {/* Tabs */}
        <div role="tablist" className="tabs tabs-boxed mb-6 app-panel p-1">
          <button
            role="tab"
            className={`tab ${activeTab === 'books' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('books')}
          >
            📖 Livros ({books.length})
          </button>
          <button
            role="tab"
            className={`tab ${activeTab === 'borrows' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('borrows')}
          >
            ✋ Empréstimos ({borrows.length})
          </button>
        </div>

        {/* TAB: LIVROS */}
        {activeTab === 'books' && (
          <div className="space-y-6">
            {/* Search e botão novo */}
            <div className="card app-panel mb-6 flex flex-col gap-3 p-4 shadow md:flex-row md:items-center md:justify-between">
              <input
                aria-label="Buscar livro por titulo, autor ou editora"
                className="input input-bordered app-input flex-1"
                placeholder="Buscar livro por título, autor ou editora"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
              <button
                onClick={() => {
                  setEditingBook(null);
                  setShowBookForm(true);
                }}
                className="btn btn-primary"
              >
                + Novo Livro
              </button>
            </div>

            {booksLoading ? (
              <div className="text-center py-12">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : filteredBooks.length === 0 && searchTerm === '' ? (
              <div className="alert alert-info">
                <span>Nenhum livro cadastrado. Comece adicionando novo livro!</span>
              </div>
            ) : filteredBooks.length === 0 ? (
              <div className="alert alert-warning">
                <span>Nenhum livro encontrado com esse critério de busca.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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

        {/* TAB: EMPRÉSTIMOS */}
        {activeTab === 'borrows' && (
          <div className="space-y-6">
            {borrowsLoading ? (
              <div className="text-center py-12">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : borrows.length === 0 ? (
              <div className="alert alert-info">
                <span>Nenhum empréstimo ativo.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
      </div>

      {/* Forms */}
      {showBookForm && (
        <BookForm
          book={editingBook || undefined}
          onSubmit={handleSaveBook}
          onCancel={() => {
            setShowBookForm(false);
            setEditingBook(null);
          }}
        />
      )}

      {showBorrowForm && selectedBookForBorrow && (
        <BorrowForm
          book={selectedBookForBorrow}
          onSubmit={handleSaveBorrow}
          onCancel={() => {
            setShowBorrowForm(false);
            setSelectedBookForBorrow(null);
          }}
        />
      )}
    </div>
  );
}
