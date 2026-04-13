# Bedrock

Bedrock e uma plataforma web institucional para comunicacao, organizacao academica e gestao de atividades colaborativas. O projeto reune autenticacao, instituicoes, papeis de usuario, area administrativa, disciplinas, projetos, biblioteca, indicadores e chat em tempo real.

O sistema ainda esta em evolucao, mas ja possui uma base funcional para uso local e para consolidacao gradual rumo a uma arquitetura mais robusta. O foco atual e fortalecer a fundacao do produto antes de avancar para hospedagem em nuvem ou arquitetura hibrida.

## Visao Geral

O objetivo do Bedrock e centralizar rotinas comuns de um ambiente academico ou institucional:

- cadastro, login e sessao autenticada com JWT
- organizacao de usuarios por instituicao
- papeis globais e papeis institucionais
- area administrativa para usuarios, instituicoes e governanca
- disciplinas com posts, arquivos, membros e tarefas
- projetos com tarefas, tags e visualizacao em grafo
- biblioteca com livros e emprestimos
- estatisticas e dashboard
- chat com DMs, grupos e canais em tempo real

## Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- Tailwind CSS
- DaisyUI
- Radix UI
- Framer Motion
- Socket.IO Client

### Backend

- Node.js
- Express
- PostgreSQL
- JWT
- bcrypt
- Multer
- Socket.IO
- pg

## Estrutura

```text
Bedrock/
|- backend/                  # API, banco, autenticacao, regras e sockets
|  |- src/
|  |  |- auth/               # papeis, permissoes e contexto de autorizacao
|  |  |- controllers/        # entrada das rotas HTTP
|  |  |- middlewares/        # autenticacao, autorizacao, upload e validacao
|  |  |- migrations/         # migrations versionadas
|  |  |- repositories/       # acesso a dados
|  |  |- routes/             # rotas da API
|  |  |- services/           # regras de negocio compartilhadas
|  |  |- chatCore.js         # regras centrais do chat
|  |  |- chatSocket.js       # Socket.IO do chat
|  |  |- db.js               # conexao PostgreSQL
|  |  |- dbInit.js           # bootstrap legado do schema
|  |  |- migrationRunner.js  # execucao de migrations
|  |  |- server.js           # servidor Express
|
|- frontend/
|  |- src/
|  |  |- features/
|  |  |  |- admin/           # area administrativa
|  |  |  |- auth/            # login, cadastro e rotas protegidas
|  |  |  |- chat/            # conversas em tempo real
|  |  |  |- dashboard/       # visao geral
|  |  |  |- disciplines/     # disciplinas, posts, arquivos e tarefas
|  |  |  |- library/         # livros e emprestimos
|  |  |  |- organizations/   # servicos de instituicao
|  |  |  |- projects/        # projetos, tarefas, tags e grafo
|  |  |  |- settings/        # perfil e configuracoes de conta
|  |  |  |- statistics/      # indicadores
|  |  |- shared/             # componentes e servicos compartilhados
|
|- scripts/                  # scripts utilitarios do monorepo
|- README.md
```

## Modulos Principais

### Autenticacao e Sessao

- cadastro e login de usuarios
- autenticacao com JWT
- rotas privadas no frontend
- sincronizacao do usuario autenticado
- armazenamento local da sessao no frontend

### Organizacoes, Papeis e Permissoes

O projeto possui base institucional com organizacoes, memberships e papeis separados entre escopo global e escopo institucional.

Papel global atual:

- `system_admin`

Papeis institucionais atuais:

- `organization_owner`
- `organization_admin`
- `coordinator`
- `professor`
- `student`
- `external_partner`

A autorizacao centralizada fica em `backend/src/auth/accessControl.js`, com permissoes como:

- `system:admin`
- `organization:view`
- `organization:manage`
- `organization:manage_members`
- `user:view_directory`
- `discipline:create`
- `project:create`
- `chat:access`
- `chat:create_direct`
- `chat:create_group`
- `chat:create_channel`
- `chat:manage_all`

### Area Administrativa

A area administrativa fica em `/admin` no frontend e usa rotas protegidas. Ela contempla:

- resumo administrativo
- listagem e atualizacao de usuarios
- listagem e criacao de instituicoes
- governanca por papeis e permissoes

O acesso depende do papel e das permissoes efetivas do usuario autenticado.

### Disciplinas

- criacao, edicao, listagem e exclusao de disciplinas
- posts por disciplina
- upload, listagem, download e remocao de arquivos
- membros por disciplina
- tarefas vinculadas a disciplina
- abas internas para visao geral, materiais, posts, membros, tarefas e chat

### Projetos

- criacao e listagem de projetos
- tarefas por projeto
- tags por projeto
- visualizacao de grafo
- painel lateral e componentes de apoio para organizar o fluxo

### Biblioteca

- cadastro e listagem de livros
- emprestimos
- telas e componentes dedicados para livros e emprestimos

### Chat

O chat usa HTTP para operacoes de consulta/criacao e Socket.IO para mensagens e presenca em tempo real.

Funcionalidades atuais:

- listagem de conversas
- filtros por todas, DMs, grupos e canais
- conversas diretas
- grupos privados
- canais
- envio e recebimento de mensagens em tempo real
- leitura de mensagens
- presenca de usuarios
- painel de membros e detalhes
- busca para iniciar conversas por nome ou e-mail
- selecao de usuarios por chips/tokens na busca
- criacao de DM com 1 usuario selecionado
- criacao de grupo privado com 2 ou mais usuarios selecionados

Observacao: a criacao de canais foi removida do topo da busca do chat para simplificar o fluxo atual. Se for necessario criar canais pela interface, a acao deve ser reposicionada em um local especifico futuramente.

## Rotas Principais

Base local da API:

```text
http://localhost:4000/api
```

### Autenticacao

- `POST /auth/cadastrar`
- `POST /auth/entrar`
- `GET /auth/eu`
- `PUT /auth/atualizar-perfil`
- `DELETE /auth/deletar`

### Administracao

- `GET /admin/summary`
- `GET /admin/users`
- `PATCH /admin/users/:userId`
- `GET /admin/organizations`
- `POST /admin/organizations`

### Organizacoes

- `GET /organizations/current`
- `GET /organizations/current/members`
- `POST /organizations/current/members`
- `PATCH /organizations/current/members/:userId/role`

### Chat

- `GET /chat/users/search`
- `GET /chat/presence`
- `GET /chat/conversations`
- `POST /chat/conversations/direct`
- `POST /chat/conversations`
- `GET /chat/conversations/:id`
- `PATCH /chat/conversations/:id`
- `POST /chat/conversations/:id/members`
- `DELETE /chat/conversations/:id/members/:userId`
- `GET /chat/conversations/:id/messages`
- `POST /chat/conversations/:id/messages`
- `POST /chat/conversations/:id/read`

### Disciplinas, Projetos e Indicadores

O backend tambem expoe rotas para:

- `/dashboard`
- `/disciplines`
- `/projects`
- `/statistics`
- `/livros`
- `/emprestimos`
- `/estatisticas`

## Como Executar Localmente

### Pre-requisitos

- Node.js
- npm
- PostgreSQL

### 1. Instalar dependencias

Na raiz do projeto:

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

### 2. Configurar ambiente do backend

Crie um arquivo `backend/.env` com valores locais. Nao use credenciais reais no repositorio.

Exemplo:

```env
DATABASE_URL=postgres://usuario:senha@localhost:5432/bedrock
JWT_SECRET=defina_um_segredo_forte
PORT=4000
```

### 3. Iniciar aplicacao

Na raiz:

```bash
npm start
```

Esse comando inicia backend e frontend.

Tambem e possivel iniciar separadamente:

```bash
npm run start:backend
npm run start:frontend
```

Por padrao local:

- backend: `http://localhost:4000`
- frontend Vite: `http://localhost:5173`

## Scripts

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

## Banco de Dados e Migrations

O backend executa duas etapas ao iniciar:

1. `ensureAppSchema()` em `backend/src/dbInit.js`, que ainda faz bootstrap legado de tabelas.
2. `runMigrations()` em `backend/src/migrationRunner.js`, que executa migrations versionadas em `backend/src/migrations`.

Migrations atuais:

- `001_institution_foundation`
- `002_discipline_memberships`
- `003_discipline_tasks`
- `004_legacy_cleanup`

Diretriz do projeto: novas alteracoes de schema devem ir para migrations versionadas. O `dbInit.js` ainda existe por compatibilidade, mas nao deve continuar crescendo indefinidamente.

## Seguranca

- nao commitar arquivos `.env` com credenciais reais
- usar `JWT_SECRET` forte fora do ambiente local
- revisar CORS antes de producao
- tratar `backend/uploads` como armazenamento local de desenvolvimento
- revisar permissoes antes de expor rotas administrativas
- substituir URLs fixas de localhost por variaveis de ambiente antes de publicar

## Estado Atual e Limitacoes

O projeto esta funcional em ambiente local, mas ainda existem pontos em transicao:

- frontend ainda possui algumas URLs locais fixas para API e Socket.IO
- banco ainda combina bootstrap legado com migrations
- permissoes existem, mas ainda devem ser aplicadas de forma mais uniforme em todos os modulos
- chat ja foi reorganizado em componentes, mas ainda pode evoluir em anexos, replies, reacoes e regras mais finas de canal
- modelo multi-instituicao ja foi iniciado, mas ainda precisa amadurecer isolamento, interacao entre instituicoes e configuracao por dominio/subdominio

## Roadmap Tecnico

- consolidar configuracao por ambiente no frontend e backend
- migrar novas mudancas de schema exclusivamente por migrations
- ampliar aplicacao das permissoes em disciplinas, projetos, tarefas, arquivos, posts e chat
- evoluir diretorio de usuarios por escopo institucional
- revisar UX do chat para anexos, respostas e reacoes
- adicionar testes automatizados no frontend e backend
- preparar deploy com CORS, logs e armazenamento externo de arquivos

## Licenca

Defina a licenca antes de distribuir ou publicar o projeto formalmente.
