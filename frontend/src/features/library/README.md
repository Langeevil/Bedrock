# 📚 Biblioteca - Documentação

## Visão Geral

O módulo de **Biblioteca** é um sistema completo para gerenciamento de livros e empréstimos. Ele permite criar, editar, deletar e emprestar livros, além de acompanhar os empréstimos com renovação e controle de devoluções.

## Estrutura do Projeto

```
library/
├── components/          # Componentes React reutilizáveis
│   ├── BookCard.tsx     # Card para exibir livro
│   ├── BorrowCard.tsx   # Card para exibir empréstimo
│   ├── BookForm.tsx     # Formulário para criar/editar livro
│   └── BorrowForm.tsx   # Formulário para criar empréstimo
├── hooks/               # Custom Hooks
│   ├── useBooks.ts      # Hook para gerenciar livros
│   └── useBorrows.ts    # Hook para gerenciar empréstimos
├── services/            # Comunicação com API
│   ├── livroService.ts  # Serviço de livros
│   └── emprestimoService.ts # Serviço de empréstimos
├── pages/               # Páginas principais
│   └── LibraryScreen.tsx # Página principal da biblioteca
└── types/               # TypeScript types
    └── libraryTypes.ts  # Interfaces e tipos
```

## Componentes

### BookCard
Componente para exibir as informações de um livro em formato de card.

```tsx
import { BookCard } from '@/features/library';

<BookCard
  book={livro}
  onEdit={(book) => console.log('Editar', book)}
  onDelete={(id) => console.log('Deletar', id)}
  onBorrow={(book) => console.log('Emprestar', book)}
/>
```

### BorrowCard
Componente para exibir as informações de um empréstimo em formato de card.

```tsx
import { BorrowCard } from '@/features/library';

<BorrowCard
  borrow={emprestimo}
  bookTitle="Nome do Livro"
  onRenew={(id) => console.log('Renovar', id)}
  onReturn={(id) => console.log('Devolver', id)}
  onDelete={(id) => console.log('Deletar', id)}
/>
```

### BookForm
Formulário para criar ou editar um livro.

```tsx
import { BookForm } from '@/features/library';

<BookForm
  book={undefined} // undefined para novo livro
  onSubmit={async (data) => console.log('Salvar', data)}
  onCancel={() => console.log('Cancelar')}
  loading={false}
/>
```

### BorrowForm
Formulário para criar um novo empréstimo.

```tsx
import { BorrowForm } from '@/features/library';

<BorrowForm
  book={livroSelecionado}
  onSubmit={async (data) => console.log('Emprestar', data)}
  onCancel={() => console.log('Cancelar')}
  loading={false}
/>
```

## Hooks

### useBooks
Hook para gerenciar livros (listar, criar, editar, deletar).

```tsx
import { useBooks } from '@/features/library';

const MyComponent = () => {
  const {
    books,           // Array de livros
    loading,         // Estado de carregamento
    error,          // Mensagem de erro
    fetchBooks,     // Função para recarregar livros
    getBook,        // Função para buscar livro específico
    createBook,     // Função para criar livro
    updateBook,     // Função para atualizar livro
    deleteBook,     // Função para deletar livro
  } = useBooks();

  return (
    <div>
      {loading && <p>Carregando...</p>}
      {error && <p>Erro: {error}</p>}
      {books.map(book => (
        <div key={book.id}>{book.nome}</div>
      ))}
    </div>
  );
};
```

### useBorrows
Hook para gerenciar empréstimos (listar, criar, renovar, devolver, deletar).

```tsx
import { useBorrows } from '@/features/library';

const MyComponent = () => {
  const {
    borrows,        // Array de empréstimos
    loading,        // Estado de carregamento
    error,         // Mensagem de erro
    fetchBorrows,  // Função para recarregar empréstimos
    getBorrow,     // Função para buscar empréstimo específico
    createBorrow,  // Função para criar empréstimo
    renewBorrow,   // Função para renovar empréstimo
    returnBorrow,  // Função para registrar devolução
    deleteBorrow,  // Função para deletar empréstimo
  } = useBorrows();

  return (
    <div>
      {loading && <p>Carregando...</p>}
      {error && <p>Erro: {error}</p>}
      {borrows.map(borrow => (
        <div key={borrow.id}>
          Livro #{borrow.livroId} - Status: {borrow.status}
        </div>
      ))}
    </div>
  );
};
```

## Serviços

### livroService
Comunicação com a API de livros.

```ts
import { livroService } from '@/features/library';

// Listar todos os livros
const livros = await livroService.listarLivros();

// Buscar livro por ID
const livro = await livroService.buscarLivroPorId(1);

// Criar novo livro
const novoLivro = await livroService.criarLivro({
  nome: "Clean Code",
  autor: "Robert C. Martin",
  editora: "Prentice Hall",
  datapubli: "2008-08-11",
});

// Atualizar livro
const livroAtualizado = await livroService.atualizarLivro(1, {
  nome: "Clean Code Updated",
});

// Deletar livro
await livroService.deletarLivro(1);
```

### emprestimoService
Comunicação com a API de empréstimos.

```ts
import { emprestimoService } from '@/features/library';

// Listar todos os empréstimos
const emprestimos = await emprestimoService.listarEmprestimos();

// Buscar empréstimo por ID
const emprestimo = await emprestimoService.buscarEmprestimoPorId(1);

// Criar novo empréstimo
const novoEmprestimo = await emprestimoService.criarEmprestimo({
  livroId: 1,
  dataPrevistaDevolucao: "2024-12-31",
});

// Renovar empréstimo
const renovado = await emprestimoService.renovarEmprestimo(1, "2025-01-31");

// Registrar devolução
const devolvido = await emprestimoService.registrarDevolucao(1);

// Deletar empréstimo
await emprestimoService.deletarEmprestimo(1);
```

## Types

```ts
export interface Livro {
  id: number;
  nome: string;
  autor: string;
  editora: string;
  datapubli: string;
}

export interface Emprestimo {
  id: number;
  usuarioId: number;
  livroId: number;
  dataEmprestimo: string;
  dataPrevistaDevolucao: string;
  dataDevolucao: string | null;
  status: 'ativo' | 'devolvido' | 'atrasado';
  multa: number;
}
```

## Endpoints da API

### Livros
- `GET /api/livros` - Listar todos os livros
- `GET /api/livros/:id` - Buscar livro por ID
- `POST /api/livros` - Criar novo livro
- `PUT /api/livros/:id` - Atualizar livro
- `DELETE /api/livros/:id` - Deletar livro

### Empréstimos
- `GET /api/emprestimos` - Listar todos os empréstimos (requer autenticação)
- `GET /api/emprestimos/:id` - Buscar empréstimo por ID (requer autenticação)
- `POST /api/emprestimos` - Criar novo empréstimo (requer autenticação)
- `PUT /api/emprestimos/:id` - Atualizar empréstimo (requer autenticação)
- `DELETE /api/emprestimos/:id` - Deletar empréstimo (requer autenticação)

## Exemplo de Uso Completo

```tsx
import { LibraryScreen } from '@/features/library';

export default function App() {
  return <LibraryScreen />;
}
```

A página `LibraryScreen` inclui:
- ✅ Tab de Livros com busca e filtro
- ✅ Tab de Empréstimos
- ✅ Formulário para criar/editar livros
- ✅ Formulário para emprestar livros
- ✅ Ações: Editar, Deletar, Emprestar, Renovar, Devolver
- ✅ Indicador de empréstimos atrasados
- ✅ Controle de multas

## Autenticação

Todos os endpoints exceto GET de livros requerem autenticação via token JWT no header `Authorization: Bearer <token>`.

O token é obtido do localStorage e enviado automaticamente pelo serviço.

## Tratamento de Erros

Os serviços e hooks implementam tratamento robusto de erros:

```tsx
try {
  await createBook(data);
} catch (error) {
  console.error('Erro:', error.message);
}
```

## Próximas Melhorias

- [ ] Filtros avançados de livros (por autor, editora, data)
- [ ] Exportar lista de empréstimos
- [ ] Notificações de empréstimos próximos do vencimento
- [ ] Sistema de reserva de livros
- [ ] Histórico de empréstimos
- [ ] Dashboard com estatísticas
