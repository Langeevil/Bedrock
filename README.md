# Bedrock

Bedrock e uma plataforma web voltada para organizacao academica e colaboracao entre usuarios. O projeto combina autenticacao, gerenciamento de disciplinas, organizacao de projetos com tarefas e tags, chat em tempo real e uma camada de dashboard para acompanhar indicadores do sistema.

O repositorio esta estruturado como um monorepo com frontend e backend separados, permitindo evolucao independente da interface e da API.

## Visao Geral

O objetivo do Bedrock e centralizar rotinas comuns de um ambiente academico ou colaborativo em uma unica aplicacao:

- cadastro e autenticacao de usuarios
- definicao de perfil no sistema
- acompanhamento de disciplinas
- publicacao de posts e envio de arquivos por disciplina
- organizacao de projetos com tarefas e tags
- conversas diretas, grupos e canais em tempo real
- dashboard e indicadores de uso

## Principais Funcionalidades

### Autenticacao e conta

- cadastro de usuario
- login com JWT
- rota protegida no frontend
- consulta do usuario autenticado
- atualizacao de perfil e definicao de papel no sistema

### Dashboard

- exibicao de estatisticas gerais
- acompanhamento de disciplinas ativas
- indicador de completude de perfil

### Disciplinas

- criacao, edicao, listagem e exclusao de disciplinas
- busca por nome, codigo e professor
- paginacao
- publicacao de posts por disciplina
- upload, listagem, download e remocao de arquivos

### Projetos

- criacao de projetos por usuario
- cadastro de tarefas com status
- organizacao por tags
- visualizacao em lista e em grafo

### Chat

- conversas diretas entre usuarios
- criacao de grupos privados
- criacao de canais
- notificacoes e atualizacao em tempo real via Socket.IO
- controle de presenca e leitura

### Outras areas da interface

- biblioteca com filtros por tipo e assunto
- tela de estatisticas consolidando dados do sistema
- pagina publica de apresentacao do produto

## Arquitetura

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS
- DaisyUI
- Radix UI
- Framer Motion
- React Hook Form
- Zod
- Socket.IO Client

### Backend

- Node.js
- Express
- PostgreSQL
- pg
- JWT
- bcrypt
- Multer
- Socket.IO

### Estrutura geral

```text
Bedrock/
|- backend/   # API, banco, regras de negocio e sockets
|- frontend/  # aplicacao React
|- scripts/   # scripts utilitarios do monorepo
|- README.md
```

## Estrutura do Projeto

### `frontend/src/features`

- `auth`: login, cadastro e protecao de rotas
- `dashboard`: indicadores principais
- `disciplines`: cadastro, posts, arquivos e detalhes de disciplina
- `projects`: projetos, tarefas, tags e visualizacao em grafo
- `chat`: mensageria e conversas em tempo real
- `library`: biblioteca e filtros de materiais
- `statistics`: consolidacao de indicadores
- `settings`: dados da conta e perfil do usuario

### `backend/src`

- `routes`: definicao das rotas da API
- `controllers`: entrada das requisicoes HTTP
- `repositories`: acesso aos dados
- `middlewares`: autenticacao, upload e validacoes
- `dtos`: validacao de payloads
- `db.js`: conexao com PostgreSQL
- `dbInit.js`: criacao e ajuste automatico do schema
- `chatSocket.js` e `chatCore.js`: camada de comunicacao em tempo real

## Como Executar

### Pre-requisitos

- Node.js instalado
- PostgreSQL disponivel
- npm

### 1. Instale as dependencias

Na raiz:

```bash
npm install
```

No frontend:

```bash
cd frontend
npm install
```

No backend:

```bash
cd backend
npm install
```

### 2. Configure as variaveis de ambiente

Crie um arquivo `.env` dentro de `backend/` com valores equivalentes a estes:

```env
DATABASE_URL=postgres://usuario:senha@localhost:5432/bedrock
JWT_SECRET=defina_um_segredo_forte
PORT=4000
```

Observacoes:

- `DATABASE_URL` e obrigatoria para a conexao com o PostgreSQL
- `JWT_SECRET` deve ser alterada em qualquer ambiente real
- se `PORT` nao for definida, o backend sobe na porta `4000`

### 3. Inicie o projeto

Na raiz do repositorio:

```bash
npm start
```

Esse comando sobe:

- backend em `http://localhost:4000`
- frontend em ambiente Vite, normalmente em `http://localhost:5173`

Tambem e possivel iniciar separadamente:

```bash
npm run start:backend
npm run start:frontend
```

## Banco de Dados

O backend executa uma rotina de bootstrap ao iniciar a aplicacao. Isso significa que as tabelas principais sao criadas automaticamente, incluindo entidades de:

- usuarios
- disciplinas
- arquivos e posts de disciplinas
- conversas, membros, mensagens e presenca no chat
- projetos, tarefas, tags e relacionamento entre tarefas e tags

Tambem existe exposicao publica de arquivos enviados pela pasta `/uploads`.

## Rotas Principais da API

Base da API: `http://localhost:4000/api`

### Autenticacao

- `POST /auth/cadastrar`
- `POST /auth/entrar`
- `GET /auth/eu`
- `PUT /auth/atualizar-perfil`
- `DELETE /auth/deletar`

### Dashboard

- `GET /dashboard/stats`

### Disciplinas

- `GET /disciplines`
- `POST /disciplines`
- `GET /disciplines/:id`
- `PUT /disciplines/:id`
- `DELETE /disciplines/:id`
- `GET /disciplines/:id/posts`
- `POST /disciplines/:id/posts`
- `GET /disciplines/:id/arquivos`
- `POST /disciplines/:id/arquivos/upload`

### Projetos

- `GET /projects`
- `POST /projects`
- `GET /projects/:id/graph`
- `GET /projects/:projectId/tasks`
- `POST /projects/:projectId/tasks`
- `PUT /projects/:projectId/tasks/:taskId`
- `DELETE /projects/:projectId/tasks/:taskId`
- `GET /projects/:projectId/tags`
- `POST /projects/:projectId/tags`

### Chat

- `GET /chat/conversations`
- `POST /chat/conversations`
- `POST /chat/conversations/direct`
- `GET /chat/conversations/:id/messages`
- `POST /chat/conversations/:id/messages`
- `GET /chat/users/search`

## Seguranca e Boas Praticas

- nao publique credenciais reais no repositorio
- utilize uma `JWT_SECRET` forte fora do ambiente local
- revise a politica de `cors()` antes de publicar em producao
- trate a pasta `backend/uploads` como armazenamento local de desenvolvimento
- considere adicionar logs, testes automatizados e variaveis de ambiente por ambiente

## Estado Atual

O projeto ja apresenta uma base funcional completa para autenticacao, disciplinas, projetos e chat. Algumas areas da interface, como biblioteca e parte dos indicadores, ainda podem ser expandidas com integracoes e dados mais robustos.

## Scripts Disponiveis

### Raiz

```bash
npm start
npm run start:backend
npm run start:frontend
```

### Frontend

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

### Backend

```bash
npm start
npm run dev
```

## Possiveis Evolucoes

- testes automatizados no frontend e backend
- pipeline de CI
- controle de permissao por papel
- armazenamento externo de arquivos
- observabilidade e monitoramento
- deploy com configuracao por ambiente

## Licenca

Defina aqui a licenca adotada para o projeto, caso deseje publicar ou distribuir o sistema formalmente.
