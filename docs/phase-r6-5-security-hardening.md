# Fase R6.5 - Security Hardening e Auth Consolidation

Data: 2026-06-10

## Objetivo

Consolidar autenticacao, autorizacao, isolamento multi-tenant, protecao de APIs, storage, auditoria e rate limit para aproximar o Video Flow de um beta externo seguro.

## Entregas implementadas

- `middleware.ts` global protegendo rotas privadas.
- Helpers em `src/lib/auth/index.ts`:
  - `requireAuth()`
  - `requireWorkspace()`
  - `requirePermission()`
  - `requireAdmin()`
  - `requireRateLimit()`
- Auditoria persistida em `audit_logs` via `src/lib/audit.ts`.
- API segura para auditoria client-side em `/api/audit`.
- Eventos de seguranca persistidos em `security_events` para permission denied e rate limit.
- Rate limit persistido via tabela `rate_limit_events`.
- Protecao explicita em todas as API routes.
- Signed URL protegido por sessao, workspace e permissao.
- Providers status/test protegidos por sessao/permissao.
- Jobs protegidos por workspace, ownership logico e permissao.
- Admin Health recebeu bloco `Security hardening`.

## Middleware

O middleware protege:

- `/app/*`
- `/api/*`
- demais rotas privadas do produto

Rotas publicas preservadas:

- `/`
- `/auth/login`
- `/auth/reset-password`
- `/auth/confirm-email`
- `/auth/callback`
- `/login`
- `/signup`
- `/terms`
- `/privacy`
- `/webhooks/*` quando existir

Para APIs sem sessao, a resposta e:

```json
{ "status": "unauthorized", "error": "Autenticacao obrigatoria." }
```

## Isolamento multi-tenant

As rotas nao usam mais `body.user_id` como identidade. O usuario vem da sessao Supabase.

`workspace_id` pode continuar sendo enviado como seletor, mas e validado por:

- membership ativa em `workspace_users`
- owner em `workspaces.owner_id`
- permissao em `role_permissions`
- platform admin quando aplicavel

## Rotas protegidas

Todas as API routes importam pelo menos um helper de auth:

- `requireAuth`
- `requireWorkspace`
- `requirePermission`
- `requireAdmin`

Categorias endurecidas:

- IA: `/api/ai/*`
- Media: `/api/media/*`
- Render: `/api/render/video`
- Export: `/api/export/*`
- Jobs: `/api/jobs/*`
- Providers: `/api/providers/*`
- Storage: `/api/storage/signed-url`
- Assets: `/api/assets/*`
- Magic, Viral Clips, AI Video, Factories, Templates, Quality, Studio e Onboarding

## Storage

`/api/storage/signed-url` agora:

- exige usuario autenticado
- valida workspace
- valida permissao `export_video`
- extrai workspace pelo caminho `supabase://bucket/workspace_id/...`
- valida existencia do arquivo antes de assinar

Arquivos fora do storage exigem `workspace_id` validado antes de passthrough.

## Jobs

`/api/jobs`:

- exige `workspace_id`
- valida permissao `content.create`
- cria jobs com `user.id` da sessao

`/api/jobs/[id]`, cancel e retry:

- carregam o job
- validam o workspace do job
- so entao retornam/cancelam/retry

`/api/jobs/process-next`:

- exige `requireAdmin()`

## Rate limit

Foi criada a migration:

`supabase/migrations/20260610_r6_5_security_hardening.sql`

Tabela:

- `rate_limit_events`

Features com limite padrao:

- `openai_text`
- `openai_tts`
- `openai_images`
- `export_package`
- `render_video`
- `jobs`
- `providers_test`
- `storage_signed_url`

Se existir configuracao em `rate_limits`, ela sobrescreve o padrao.

## Auditoria

`registerAuditLog()` agora:

- no browser, envia para `/api/audit`
- no server, tenta resolver o usuario pela sessao
- persiste em `audit_logs` quando Supabase admin esta configurado
- nao expoe service role no frontend

## Security Events

Eventos persistidos:

- `permission_denied`
- `credit_block` para rate limit

Observacao: falhas totalmente anonimas bloqueadas pelo middleware nao entram em `security_events`, porque a tabela atual exige `workspace_id`. Elas sao bloqueadas no edge/middleware antes do handler.

## Checklist de validacao

- Usuario sem sessao nao acessa `/api/*`.
- Usuario sem sessao nao acessa `/app/*`.
- Usuario nao acessa workspace alheio se nao estiver em `workspace_users` ou nao for owner.
- Job nao pode ser consultado, cancelado ou reprocessado sem acesso ao workspace do job.
- Signed URL nao pode ser gerada sem sessao e permissao `export_video`.
- Provider test exige sessao e permissao `workspace.manage`.
- APIs nao aceitam `body.user_id` como identidade.
- Rate limit registra eventos em `rate_limit_events`.
- Permission denied registra `security_events`.
- Typecheck passa.
- Build passa.

## Pendencias conhecidas

- `canUseFeature()` ainda consulta `mock-data`; billing real deve ser a proxima prioridade.
- Alguns fluxos seguem mockados, agora protegidos.
- A policy de storage depende de object path iniciar com workspace UUID.
- Falhas anonimas antes de workspace conhecido nao sao gravadas em `security_events` por limitacao do schema atual.
