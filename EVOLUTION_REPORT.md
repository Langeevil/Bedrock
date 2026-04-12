# Relatório de Evolução Técnica - Projeto Bedrock

Este documento registra o plano de ação estratégico e as melhorias técnicas implementadas para transformar o Bedrock em uma plataforma institucional multi-tenant robusta.

## 🎯 Objetivo da Intervenção
Consolidar a arquitetura **Multi-Instituição**, blindar a segurança de dados (Multi-tenancy) e estabilizar o núcleo de comunicação (Chat) e governança (Permissões/Banco).

---

## 📋 Plano de Ação Estratégico

O plano foi dividido em fases incrementais para garantir estabilidade:

1.  **Fase 1: O Encanamento (Core Tenancy)** - *CONCLUÍDA*
    *   Injeção de contexto de organização em todas as requisições.
    *   Blindagem de repositórios contra vazamento de dados entre instituições.
2.  **Fase 2: Identidade e Diretório** - *CONCLUÍDA (Backend)*
    *   Busca de usuários escopada por instituição e domínio.
    *   Aplicação de permissões RBAC nas rotas principais.
3.  **Fase 3: Refatoração do Chat** - *CONCLUÍDA (Core/Socket)*
    *   Isolamento de presença e mensagens por organização no Socket.IO.
4.  **Fase 4: Administração Institucional** - *INICIADA (Backend)*
    *   Endpoints administrativos protegidos por escopo.
5.  **Fase 5: Evolução do Frontend** - *PENDENTE*
    *   Refatoração da UI para consumir permissões e multi-tenancy.

---

## 🛠️ Mudanças Implementadas

### 1. Arquitetura Multi-Tenant (Backend)
*   **Middleware de Autenticação**: Atualizado para injetar `req.orgId` e `req.systemRole` automaticamente.
*   **Blindagem de Modelos**: 
    *   `disciplineModel.js` e `projectRepository.js` agora exigem `organization_id` em todas as operações de escrita (`UPDATE`/`DELETE`).
    *   Isso impede que usuários manipulem IDs de outras instituições (Prevenção de IDOR).

### 2. Comunicação em Tempo Real (Socket.IO)
*   **Organization Rooms**: Cada conexão de socket agora entra automaticamente em uma sala `org:{id}`.
*   **Isolamento de Presença**: Eventos de `presence:changed` agora são emitidos apenas para a sala da organização, garantindo privacidade institucional.

### 3. Segurança e Permissões (RBAC)
*   **requirePermission Middleware**: Aplicado nas rotas de **Disciplinas**, **Projetos** e **Administração**.
*   **Rotas Protegidas**: Endpoints de criação e gestão agora exigem permissões explícitas (ex: `DISCIPLINE_CREATE`, `ORGANIZATION_MANAGE_MEMBERS`).

### 4. Banco de Dados e Migrations
*   **Migration Runner**: Corrigido para incluir a migration `003` (Tarefas).
*   **Migration 004 (Legacy Cleanup)**: Criada para unificar as tabelas de Biblioteca e Estatísticas, adicionando escopo de organização e eliminando o "bootstrap legado".
*   **dbInit.js**: Limpo para delegar a criação de tabelas complexas às migrations numeradas.

### 5. Diretório de Usuários
*   **Busca por Domínio**: O `chatUsersController` agora permite encontrar usuários da mesma instituição via domínio de e-mail (ex: `@escola.com`), respeitando o isolamento.

---

## 🚦 Status Atual

| Módulo | Status | Descrição |
| :--- | :--- | :--- |
| **Autenticação** | ✅ Estável | Multi-tenant e RBAC integrados. |
| **Disciplinas** | ✅ Blindado | Operações escopadas e protegidas. |
| **Projetos** | ✅ Blindado | Repositório exige `orgId` para escrita. |
| **Chat Socket** | ✅ Isolado | Sem vazamento de presença entre orgs. |
| **Banco de Dados** | ✅ Versionado | 100% via migrations numeradas. |
| **Admin UI** | ⚠️ Pendente | Frontend precisa de telas de gestão. |
| **Chat UI** | ⚠️ Pendente | Frontend precisa de indicadores de org. |

---

## 💡 Recomendações Técnicas (Próximos Passos)

1.  **Frontend (React)**:
    *   Atualizar o `authStore` para ler o objeto `authz.permissions` e esconder elementos da interface que o usuário não pode acessar.
    *   Garantir que todas as chamadas de API de listagem passem o `organization_id` (se necessário no path) ou confiem no `orgId` injetado pelo backend via JWT.
2.  **Sessão**: Implementar Refresh Tokens para melhorar a experiência do usuário em conexões instáveis.
3.  **Arquitetura de Subdomínios**: Preparar o backend para identificar o `orgId` através do Host da requisição (ex: `instituicao.bedrock.com`).

---
**Relatório gerado em:** 12 de Abril de 2026
**Responsável:** Arquiteto de Software (Gemini CLI)
