# 📚 Biblioteca - Guia de Integração Frontend-Backend

## Arquitetura

```
Frontend (React + TypeScript)
    ↓
[Services] → HTTP Requests
    ↓
Backend (Express.js)
    ↓
[Controllers] → Business Logic
    ↓
[Services] → Database Operations
    ↓
PostgreSQL
```

## Estrutura do Backend

```
backend/src/Biblioteca/
├── Livro/
│   ├── controller/livroController.js      # Manipuladores HTTP
│   ├── models/Livro.js                    # Classe modelo
│   ├── repositories/livroRepository.js    # Acesso a dados
│   ├── services/livroService.js           # Lógica de negócio
│   └── routes/livroRoute.js               # Definição de rotas
└── Emprestimo/
    ├── controller/emprestimoController.js
    ├── models/Emprestimo.js
    ├── repositories/emprestimoRepository.js
    ├── services/emprestimoService.js
    └── routes/emprestimoRoute.js
```

## Fluxo de Dados

### Criar um Livro

1. **Frontend** → Usuário preenche formulário e clica "Salvar"
2. **BookForm.tsx** → Valida dados e chama `handleSaveBook()`
3. **useBooks Hook** → Chama `createBook(data)`
4. **livroService.ts** → Faz POST para `/api/livros` com token
5. **Backend - livroRoute.js** → Passa por middleware de autenticação
6. **Backend - livroController.js** → Recebe request e chama `livroService.criarLivro()`
7. **Backend - livroService.js** → Organiza dados e chama `livroRepository.criar()`
8. **Backend - livroRepository.js** → Insere na PostgreSQL
9. **Resposta** → Retorna novo livro para frontend
10. **Frontend** → Atualiza estado com novo livro e exibe no grid

### Emprestar um Livro

1. **Frontend** → Usuário clica em "Emprestar" em um livro
2. **BorrowForm.tsx** → Abre modal com formulário de empréstimo
3. **useBorrows Hook** → Chama `createBorrow(data){livroId, dataPrevistaDevolucao}`
4. **emprestimoService.ts** → Faz POST para `/api/emprestimos` com token
5. **Backend - emprestimoRoute.js** → Middleware de autenticação valida token
6. **Backend - emprestimoController.js** → Adiciona `usuarioId` de `req.userId`
7. **Backend - emprestimoService.js** → Cria empréstimo com dados completos
8. **Backend - emprestimoRepository.js** → Insere na PostgreSQL com status "ativo"
9. **Resposta** → Retorna novo empréstimo
10. **Frontend** → Exibe em "Empréstimos" com status verde

## Endpoints Disponíveis

### Livros API
```
GET    /api/livros           → Listar todos
GET    /api/livros/:id       → Buscar um
POST   /api/livros           → Criar [auth]
PUT    /api/livros/:id       → Atualizar [auth]
DELETE /api/livros/:id       → Deletar [auth]
```

### Empréstimos API
```
GET    /api/emprestimos      → Listar [auth]
GET    /api/emprestimos/:id  → Buscar um [auth]
POST   /api/emprestimos      → Criar [auth]
PUT    /api/emprestimos/:id  → Atualizar [auth]
DELETE /api/emprestimos/:id  → Deletar [auth]
```

**[auth]** = Requer token JWT no header Authorization

## Formato das Requisições

### Criar Livro
```bash
curl -X POST http://localhost:3000/api/livros \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Clean Code",
    "autor": "Robert C. Martin",
    "editora": "Prentice Hall",
    "datapubli": "2008-08-11"
  }'
```

### Criar Empréstimo
```bash
curl -X POST http://localhost:3000/api/emprestimos \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "livroId": 1,
    "dataPrevistaDevolucao": "2025-01-10"
  }'
```

### Renovar Empréstimo
```bash
curl -X PUT http://localhost:3000/api/emprestimos/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dataPrevistaDevolucao": "2025-02-10"
  }'
```

### Devolver Livro
```bash
curl -X PUT http://localhost:3000/api/emprestimos/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dataDevolucao": "2025-01-08",
    "status": "devolvido"
  }'
```

## Autenticação

Todos os endpoints protegidos requerem um token JWT:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI...
```

O token é automaticamente adicionado pelos serviços frontend:

```typescript
// livroService.ts
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}
```

## Estados de Empréstimo

- **ativo**: Empréstimo em andamento
- **devolvido**: Livro foi devolvido
- **atrasado**: Passou da data de devolução sem devolver

## Detecção de Atrasos

No frontend, a detecção é feita em `BorrowCard.tsx`:

```typescript
const isOverdue = new Date(borrow.dataPrevistaDevolucao) < new Date() 
                  && borrow.status === 'ativo';
```

No backend (quando necessário), implementar na `emprestimoService.js`.

## Tratamento de Erros

### Frontend
```typescript
try {
  await createBook(data);
} catch (error) {
  // error.message vem do backend
  console.error('Erro:', error.message);
}
```

### Backend
```javascript
try {
  const livro = await livroService.criarLivro(req.body);
  res.status(201).json(livro);
} catch (error) {
  res.status(500).json({ error: error.message });
}
```

## Variáveis de Ambiente

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

### Backend (.env)
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bedrock
DB_USER=postgres
DB_PASSWORD=password
JWT_SECRET=segredo_super_forte
```

## Exemplo de Fluxo Completo

### 1. Usuário acessa biblioteca

```
App → LibraryScreen montado
  → useBooks() hook executado
    → fetchBooks() chamado
      → livroService.listarLivros()
        → GET /api/livros (sem auth, não requer)
        → Backend retorna [] ou lista
      → setBooks(data)
    → Grid renderizado com cards
```

### 2. Usuário cria novo livro

```
[+Novo Livro] clicado
  → setShowBookForm(true)
  → <BookForm /> renderizado
Usuário preenche e clica "Salvar"
  → handleSaveBook(formData)
    → createBook(formData) do hook
      → livroService.criarLivro(formData)
        → POST /api/livros com token
        → Backend valida, insere, retorna
      → setBooks([...books, novoLivro])
    → setShowBookForm(false)
Novo livro aparece no grid
```

### 3. Usuário empresta um livro

```
[Emprestar] clicado em um card
  → setSelectedBookForBorrow(book)
  → setShowBorrowForm(true)
  → <BorrowForm /> renderizado
Usuário define data de devolução e clica "Emprestar"
  → handleSaveBorrow(formData)
    → createBorrow(formData) do hook
      → emprestimoService.criarEmprestimo(formData)
        → POST /api/emprestimos com token
        → Backend adiciona usuarioId
        → Insere com status "ativo"
        → Retorna empréstimo
      → setBorrows([...borrows, novoEmprestimo])
    → setShowBorrowForm(false)
Switch para aba "Empréstimos"
Novo empréstimo aparece no grid
```

## Deploy

### Backend
```bash
npm install
npm start
# Roda em http://localhost:3000
```

### Frontend
```bash
npm install
npm run dev
# Roda em http://localhost:5173
```

## Troubleshooting

### "The requested module does not provide an export named 'authMiddleware'"
**Solução**: Use import default `import authMiddleware from "..."` (já corrigido em livroRoute.js)

### "Token não fornecido"
**Solução**: Verificar se token está sendo salvo no localStorage após login

### "Cors error"
**Solução**: Backend tem `cors()` habilitado, verificar origem do frontend

### "Livros não carregam"
**Solução**: 
1. Backend rodando? `npm start` em /backend
2. URL correta? Verificar `VITE_API_URL` no frontend
3. Network tab do DevTools para ver request

## Próximas Implementações

- [ ] Validação de formato de data melhorada
- [ ] Upload de capa de livro (imagem)
- [ ] Filtros avançados (por categoria, autor, etc)
- [ ] Paginação na listagem
- [ ] Exportar lista em CSV/PDF
- [ ] Notificações de vencimento
- [ ] Histórico de empréstimos por usuário
- [ ] Dashboard com estatísticas
