# 🚀 Quick Start - Biblioteca

## ⚡ Setup em 5 Minutos

### 1. Verificar que o Backend está rodando
```bash
cd backend
npm start
# Deve mostrar: 🚀 Servidor rodando em http://localhost:3000
```

### 2. Verificar que o Frontend está rodando  
```bash
cd frontend
npm run dev
# Deve mostrar: VITE v... ready in ... ms
```

### 3. Acessar a Aplicação
```
http://localhost:5173
```

### 4. Fazer Login
- Email: seu_email@example.com
- Senha: sua_senha
- Token será salvo automaticamente em localStorage

### 5. Acessar Biblioteca
- Clique em "Biblioteca" no menu
- Ou navegue para http://localhost:5173/biblioteca

---

## 📝 Usuário Padrão (para testes)

Se precisar de um usuário de teste:

```sql
INSERT INTO users (email, password, nome, status_conta)
VALUES ('test@library.com', 'hashed_password', 'User Test', 'active');
```

---

## 🧪 Testar APIs com cURL

### Fazer Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@library.com",
    "password": "sua_senha"
  }'

# Resposta contém o token
# Salve o TOKEN para próximas requisições
```

### Criar Livro
```bash
curl -X POST http://localhost:3000/api/livros \
  -H "Authorization: Bearer TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Clean Code",
    "autor": "Robert C. Martin",
    "editora": "Prentice Hall",
    "datapubli": "2008-08-11"
  }'
```

### Listar Livros
```bash
curl -X GET http://localhost:3000/api/livros \
  -H "Authorization: Bearer TOKEN_AQUI"
```

### Criar Empréstimo
```bash
curl -X POST http://localhost:3000/api/emprestimos \
  -H "Authorization: Bearer TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "livroId": 1,
    "dataPrevistaDevolucao": "2025-02-01"
  }'
```

### Renovar Empréstimo
```bash
curl -X PUT http://localhost:3000/api/emprestimos/1 \
  -H "Authorization: Bearer TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "dataPrevistaDevolucao": "2025-02-15"
  }'
```

### Devolver Livro
```bash
curl -X PUT http://localhost:3000/api/emprestimos/1 \
  -H "Authorization: Bearer TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "dataDevolucao": "2025-02-01",
    "status": "devolvido"
  }'
```

---

## 📱 Testando no Frontend

### 1. Criar um Livro
1. Clique em "📚 Biblioteca"
2. Clique em "+ Novo Livro"
3. Preencha os dados:
   - Título: "Clean Code"
   - Autor: "Robert C. Martin"
   - Editora: "Prentice Hall"
   - Data: "11/08/2008"
4. Clique em "Salvar"

### 2. Emprestar um Livro
1. Clique em "Emprestar" no card do livro
2. Selecione a data de devolução (padrão é 14 dias)
3. Clique em "Emprestar"

### 3. Ver Empréstimos
1. Clique na tab "✋ Empréstimos"
2. Veja todos seus empréstimos ativos
3. Use os botões para:
   - **Renovar**: Estende a data de devolução
   - **Devolver**: Marca como devolvido
   - **Deletar**: Remove o empréstimo

---

## 🐛 Troubleshooting

### Erro: "Token não fornecido"
```
❌ Solução: Fazer login primeiro. O token é salvo em localStorage.
```

### Erro: "Livro não encontrado" (404)
```
❌ Solução: Certifique-se que o ID do livro existe.
```

### Erro: "CORS error"
```
❌ Solução: Backend tem CORS habilitado. Verificar se está rodando.
```

### Erro: "Conexão recusada"
```
❌ Solução: Backend não está rodando. Execute: npm start em /backend
```

### Modais não abrem
```
❌ Solução: Verificar console (F12) para erros React.
```

---

## 🎯 Fluxo Recomendado de Teste

1. ✅ Login na aplicação  
2. ✅ Criar 3 livros diferentes
3. ✅ Emprestar 2 livros
4. ✅ Ver na tab "Empréstimos"
5. ✅ Renovar um empréstimo
6. ✅ Devolver um livro
7. ✅ Editar um livro
8. ✅ Deletar um livro

---

## 📊 Estrutura de Pastas Rápida

```
Bedrock/
├── backend/
│   ├── src/
│   │   ├── Biblioteca/
│   │   │   ├── Livro/
│   │   │   │   ├── controller/
│   │   │   │   ├── routes/
│   │   │   │   ├── services/
│   │   │   │   └── models/
│   │   │   └── Emprestimo/
│   │   │       ├── controller/
│   │   │       ├── routes/
│   │   │       ├── services/
│   │   │       └── models/
│   │   └── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   └── features/
│   │       └── library/
│   │           ├── components/
│   │           ├── hooks/
│   │           ├── pages/
│   │           ├── services/
│   │           ├── types/
│   │           ├── index.ts
│   │           └── README.md
│   └── package.json
│
├── BIBLIOTECA_GUIDE.md
├── BIBLIOTECA_IMPLEMENTATION.md
└── QUICK_START.md (este arquivo)
```

---

## 📖 Links para Documentação Completa

- **BIBLIOTECA_IMPLEMENTATION.md** - O que foi criado, estrutura completa
- **BIBLIOTECA_GUIDE.md** - Guia de integração frontend-backend
- **backend/src/Biblioteca/README.md** - Documentação técnica backend
- **frontend/src/features/library/README.md** - Documentação frontend

---

## ✅ Verificar Instalação

### Backend
```bash
curl http://localhost:3000/api/livros \
  -H "Authorization: Bearer test-token" 
# Deve retornar lista (pode estar vazia) ou erro 401
```

### Frontend  
```bash
Verificar em http://localhost:5173
# Deve carregar a aplicação
```

---

## 🚀 Próximo Passo

Após testar tudo:

1. Implementar mais funcionalidades (veja Próximas Implementações)
2. Adicionar validações mais rigorosas
3. Criar testes unitários
4. Deploy em ambiente de produção

---

## 💡 Dicas

- Use DevTools do navegador (F12) para debugar
- Verifique Network tab para ver as requisições HTTP
- Use console para ver logs dos hooks
- Leia os READMEs para documentação detalhada

---

**Tudo pronto! Aproveite sua Biblioteca! 📚**
