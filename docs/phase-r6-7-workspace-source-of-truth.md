# Fase R6.7 - Workspace Context Real e Supabase como Fonte Unica da UI Central

## Objetivo

Consolidar os fluxos centrais da interface para dependerem do contexto autenticado real do workspace, carregado do Supabase, em vez de ids fixos ou dados globais de mock.

Esta fase nao remove todos os mocks do produto. Modulos demonstrativos continuam podendo usar dados locais, mas fluxos criticos agora exigem workspace real e retornam erro claro quando o contexto nao existe.

## Fonte unica de contexto

O endpoint `GET /api/workspaces/context` carrega:

- usuario autenticado;
- perfil do usuario;
- workspaces acessiveis via `workspace_users`;
- role atual;
- permissoes por role;
- assinatura ativa ou trial;
- plano ativo;
- credit wallet;
- feature flags globais e do workspace.

O workspace selecionado vem de `workspace_id` na query quando for acessivel ao usuario. Caso contrario, o sistema usa o primeiro workspace ativo do usuario.

## Provider global

O app passa a usar `WorkspaceProvider` dentro de `src/components/providers.tsx`.

Ele:

- persiste o workspace selecionado em `localStorage` na chave `video-flow:selected-workspace-id`;
- refaz o fetch quando a sessao de auth muda;
- fornece `user`, `workspaces`, `currentWorkspace`, `featureFlags`, `loading`, `error` e `refetch`;
- impede que componentes centrais precisem assumir `ws_1`.

## Hooks criados

Arquivo: `src/lib/workspace/hooks.ts`

- `useWorkspaceContext()`
- `useWorkspaceList()`
- `useCurrentWorkspace()`
- `useWorkspacePermissions()`
- `useCreditWallet()`
- `usePlanUsage()`
- `useJobs()`
- `useJobLogs()`
- `useVideoRenders()`
- `useExportPackages()`

## Guardas de workspace

Arquivo: `src/components/workspace/workspace-guard.tsx`

O guard cobre:

- carregamento;
- erro de contexto;
- usuario nao autenticado;
- ausencia de workspace;
- permissao insuficiente.

Paginas protegidas nesta fase:

- `/app/magic`
- `/app/videos/[id]/editor`
- `/app/export-center`
- `/app/export-center/history`
- `/app/queue`
- `/app/billing`
- `/app/assets`
- `/app/viral-clips`

## Fluxos centrais atualizados

### Header e alternador de workspace

`AppHeader` e `WorkspaceSwitcher` usam o workspace real e exibem email, nome do workspace, plano e role do usuario.

### Billing

`BillingDashboard` usa `currentWorkspace.planDetails`, `currentWorkspace.subscription` e `currentWorkspace.wallet` quando disponiveis. Dados mockados ficam apenas como fallback visual para ambiente sem Supabase populado.

### Jobs e Queue

`JobQueueDashboard` lista jobs por `workspace_id` real e reseta a selecao quando o usuario troca de workspace.

### Magic Mode

O payload de `/api/magic/jobs` recebe `workspace_id` do contexto real. A rota agora rejeita requests sem `workspace_id`.

### Editor e Render

O editor consulta renders reais via `/api/video-renders?workspace_id=...` e sincroniza `render_url`/status quando existe render real para o video atual. Render e AI Video jobs enviam o workspace atual.

### Export Center

O centro de exportacao consulta `/api/export/packages?workspace_id=...` e mostra pacotes reais do Supabase quando existem. Downloads reais usam `package_url` e signed URL protegida por workspace.

### Asset Library

Busca externa, importacao e upload demo passam `workspace_id` do contexto atual.

### Viral Clips e AI Video

As chamadas de jobs agora enviam `workspace_id` real e bloqueiam a acao quando nenhum workspace esta selecionado.

## APIs endurecidas nesta fase

As rotas abaixo nao aceitam mais fallback silencioso para `ws_1`:

- `POST /api/magic/jobs`
- `POST /api/render/video`
- `POST /api/media/render`
- `POST /api/media/images`
- `POST /api/media/tts`
- `POST /api/media/thumbnails`
- `POST /api/viral-clips/jobs`
- `POST /api/ai-video/jobs`
- `POST /api/export/package`
- `POST /api/export/packages`

Quando `workspace_id` nao e enviado, retornam `400` com `workspace_id obrigatorio.`

## O que continua demo

Ainda existem listas e cards alimentados por `src/lib/mock-data.ts`, principalmente para modulos que nao foram definidos como fonte unica nesta fase:

- cards de biblioteca visual;
- historicos demonstrativos;
- canais/projetos mockados em selects;
- previews de providers;
- paineis administrativos nao centrais.

Esses mocks permanecem intencionais ate a fase de migracao completa dos modulos de produto.

## Validacao manual sugerida

1. Entrar com usuario autenticado.
2. Abrir `/app/billing` e confirmar plano/wallet do workspace atual.
3. Trocar workspace no header e confirmar que billing, queue e export center refazem consulta.
4. Abrir `/app/magic` e calcular custo.
5. Criar job Magic e confirmar que `/app/queue` lista no workspace correto.
6. Abrir editor e confirmar que render real aparece quando existe `video_renders`.
7. Abrir `/app/export-center` e confirmar que pacotes reais aparecem antes dos demos.
8. Tentar chamar API critica sem `workspace_id` e confirmar erro `400`.

## Limitacoes conhecidas

- A validacao ponta a ponta depende de Supabase populado com roles, permissions, workspace, plan, subscription e wallet.
- O endpoint de contexto usa service role para montar o agregado. Em ambiente sem service role, retorna contexto autenticado sem workspaces.
- Modulos nao centrais ainda podem exibir dados demonstrativos.
- Esta fase nao executa migrations remotas nem cria dados no projeto Supabase.

## Checklist R6.7

- Contexto real de workspace criado.
- Provider global instalado.
- Workspace switcher real.
- Guardas aplicados nas paginas centrais.
- Billing, queue, editor, Magic, export center, assets, viral clips e AI video ligados ao workspace atual.
- APIs criticas sem fallback `ws_1`.
- Typecheck executado.
- Build executado.
