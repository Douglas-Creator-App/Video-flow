# Fase R6.6 - Supabase Clean Setup, Billing Real e Fonte Unica Inicial

## Objetivo

Preparar o Video Flow para beta interno usando Supabase real como fonte principal dos fluxos centrais: auth, workspace, billing, credit wallet, jobs, storage, audit, rate limit e health.

Esta fase nao adiciona checkout, telas grandes ou providers novos.

## Arquivos principais

- `src/lib/env.ts`
- `src/lib/billing.ts`
- `src/lib/billing/credit-ledger.ts`
- `src/lib/jobs/job-queue.ts`
- `src/lib/jobs/supabase-job-queue.ts`
- `src/lib/storage/media-storage.ts`
- `src/app/api/admin/health/route.ts`
- `supabase/migrations/20260610_r6_6_supabase_clean_billing.sql`
- `supabase/seed.sql`

## Variaveis de ambiente

Criticas:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `APP_URL`
- `NODE_ENV`

Opcionais:

- `OPENAI_API_KEY`
- `ELEVENLABS_API_KEY`
- `STORAGE_BUCKETS`
- `MEDIA_SIGNED_URL_TTL_SECONDS`

`src/lib/env.ts` valida formato de URL, `NODE_ENV`, placeholders e ausencia de variaveis criticas. Em producao, service role ausente deve ser tratado como erro critico.

## Ordem de setup Supabase

1. Criar projeto Supabase.
2. Aplicar `supabase/schema.sql` como baseline atual do banco.
3. Aplicar migrations em ordem:
   - `20260610_r5_production_infra.sql`
   - `20260610_r6_5_security_hardening.sql`
   - `20260610_r6_real_ai_providers.sql`
   - `20260610_r6_6_supabase_clean_billing.sql`
4. Rodar `supabase/seed.sql`.
5. Criar usuario real no Supabase Auth.
6. Criar workspace real para o usuario ou usar o bloco opcional comentado no seed.
7. Validar `/app/admin-master/health`.

Observacao: o projeto ainda usa `schema.sql` como baseline. A proxima melhoria recomendada e converter esse baseline em uma migration inicial versionada para um `supabase db reset` totalmente linear.

## Billing real

`canUseFeature()` deixou de usar `mock-data` nos fluxos criticos de API.

Agora consulta Supabase real:

- `workspaces`
- `subscriptions`
- `plans`
- `feature_flags`
- `credit_wallets`
- `credit_transactions`
- `workspace_users`
- contadores operacionais como `video_renders`, `background_jobs`, `channels` e `projects`

Regras aplicadas:

- workspace real obrigatorio
- service role obrigatoria para billing real
- workspace suspenso bloqueia uso
- assinatura ativa/trial obrigatoria
- plano ativo obrigatorio
- feature flag respeitada
- limites mensais respeitados
- saldo disponivel considera `balance - reserved_balance`
- saldo negativo bloqueado por constraint
- wallet ausente e criada automaticamente com creditos do plano

## Credit wallet

A migration R6.6 adiciona:

- `credit_wallets.reserved_balance`
- constraint para impedir saldo/reserva negativos
- trigger `create_credit_wallet_after_workspace_insert`
- function `create_credit_wallet_for_workspace()`

O ledger real segue por RPCs existentes:

- `reserve_credits_for_job`
- `settle_reserved_credits_for_job`

Fluxo:

1. API valida `canUseFeature()`.
2. Job e criado em `background_jobs`.
3. `enqueueSupabaseJob()` reserva creditos se `required_credits` existir no payload.
4. Worker conclui e consome creditos.
5. Falha/cancelamento libera reserva.
6. Historico entra em `credit_transactions`.

## Job queue real

Em desenvolvimento, o fallback local `.data/background-jobs.json` continua permitido.

Em producao:

- se `SUPABASE_SERVICE_ROLE_KEY` estiver ausente, o fallback local falha com erro claro
- jobs devem usar `background_jobs`
- logs devem usar `background_job_logs`
- heartbeat deve usar `worker_heartbeats`

Erro esperado:

`Job queue real exige Supabase service role em producao. Fallback .data/background-jobs.json e permitido apenas em development.`

## Storage path standard

Uploads reais agora usam helper central:

`buildWorkspaceStoragePath()`

Padrao:

- `videos/{workspace_id}/renders/{render_id}.mp4`
- `thumbnails/{workspace_id}/projects/{project_id}.jpg`
- `exports/{workspace_id}/packages/{package_id}.zip`
- `exports/{workspace_id}/bulk/{package_id}.zip`
- `audio/{workspace_id}/tts/{audio_id}.mp3`
- `images/{workspace_id}/generated/{image_id}.png`
- `thumbnails/{workspace_id}/frames/{frame_id}.png`

As policies de storage validam que o primeiro segmento do path e um UUID antes de fazer cast.

## Seed minimo

`supabase/seed.sql` cria:

- permissoes basicas
- plano `basic`
- plano `pro`
- feature flags globais
- buckets privados essenciais

Nao cria usuario demo automaticamente porque usuarios devem ser criados no Supabase Auth. O seed inclui um bloco comentado para workspace demo opcional apos existir `auth.users.id`.

## Health check real

Endpoint:

`GET /api/admin/health`

Protecao:

- exige `requireAdmin()`

Valida:

- env
- service role
- tabelas minimas
- buckets
- planos ativos
- wallets
- rate limit events
- audit logs
- job queue e worker heartbeat

O Admin Health consome esse endpoint no widget de seguranca/infra.

## Fluxos criticos sem mock como fonte de verdade

Migrados para Supabase real:

- billing
- credit wallet
- credit transactions/reservas
- jobs em producao
- job logs em producao
- worker heartbeat em producao
- storage signed URL protegido desde R6.5
- storage upload paths
- health runtime

Ainda podem continuar mockados nesta fase:

- telas de produto sem acao critica
- dashboard visual
- templates premium
- canais/analytics demonstrativos
- historicos antigos de Magic/Viral onde indicado como demo

## Checklist beta interno

- [ ] Aplicar `schema.sql` baseline em Supabase limpo.
- [ ] Aplicar migrations R5, R6.5, R6 providers e R6.6.
- [ ] Rodar seed minimo.
- [ ] Configurar `NEXT_PUBLIC_SUPABASE_URL`.
- [ ] Configurar `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- [ ] Configurar `SUPABASE_SERVICE_ROLE_KEY`.
- [ ] Configurar `APP_URL`.
- [ ] Criar usuario real via Supabase Auth.
- [ ] Criar workspace real.
- [ ] Confirmar wallet criada.
- [ ] Confirmar subscription criada ou inserir plano manualmente.
- [ ] Confirmar buckets privados.
- [ ] Gerar job real.
- [ ] Confirmar reserva em `credit_transactions`.
- [ ] Rodar worker.
- [ ] Confirmar settle/release de creditos.
- [ ] Validar `/app/admin-master/health`.
- [ ] Rodar `npm.cmd run typecheck`.
- [ ] Rodar `npm.cmd run build`.

## Limitacoes conhecidas

- O baseline principal ainda esta em `supabase/schema.sql`; migrations incrementais dependem desse baseline.
- Checkout real nao foi implementado nesta fase.
- Alguns componentes client ainda exibem dados demo e devem continuar marcados como demo quando aplicavel.
- `canUseFeature()` bloqueia `workspace_id` mockado como `ws_1` em APIs criticas.
- Para beta externo, o proximo passo e migrar workspace switcher e contexto de workspace atual para Supabase real na UI inteira.
