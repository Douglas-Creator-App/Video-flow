# Fase R5 - Producao Real: Supabase, Storage, Creditos, Transacoes e RLS

## Objetivo

Mover a infraestrutura de jobs, arquivos e creditos para Supabase/Postgres/Storage real, sem depender de arquivos locais em producao.

## Arquivos principais

- `src/lib/supabase/admin.ts`
- `src/lib/jobs/supabase-job-queue.ts`
- `src/lib/jobs/job-queue.ts`
- `src/lib/storage/media-storage.ts`
- `src/lib/billing/credit-ledger.ts`
- `supabase/migrations/20260610_r5_production_infra.sql`

## Variaveis de ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=server-only-service-role-key
JOB_QUEUE_BACKEND=supabase
MEDIA_SIGNED_URL_TTL_SECONDS=3600
FFMPEG_PATH=ffmpeg
FFPROBE_PATH=ffprobe
```

`SUPABASE_SERVICE_ROLE_KEY` e obrigatoria para worker, jobs administrativos, Storage privado e transacoes de creditos.

## Buckets privados

A migration cria/normaliza:

- `videos`
- `thumbnails`
- `exports`
- `audio`
- `images`
- `temp`

Todos ficam com `public = false`. Downloads devem usar signed URL.

## Storage real

Servico:

```text
src/lib/storage/media-storage.ts
```

Funcoes:

- `uploadMediaFile()`
- `downloadMediaFile()`
- `deleteMediaFile()`
- `getSignedMediaUrl()`
- `validateMediaExists()`

Rota backend para download temporario:

```text
POST /api/storage/signed-url
```

Body:

```json
{ "url": "supabase://exports/workspace/video/package.zip" }
```

Retorno:

```json
{ "status": "ready", "signed_url": "https://..." }
```

URLs internas privadas usam:

```text
supabase://bucket/path
```

Exemplo:

```text
supabase://videos/<workspace_id>/<video_project_id>/final.mp4
```

## Jobs reais

Quando `SUPABASE_SERVICE_ROLE_KEY` esta configurada, `src/lib/jobs/job-queue.ts` usa Supabase:

- `background_jobs`
- `background_job_logs`
- `worker_heartbeats`

Sem service role real, cai para modo dev local em `.data/background-jobs.json`. Isso e apenas para desenvolvimento; em producao deve ser considerado configuracao incompleta.

## Locking

RPC:

```sql
public.claim_background_job(worker_id_input text, lock_minutes_input integer)
```

Usa `for update skip locked`, evitando dois workers processarem o mesmo job.

## Creditos

RPCs:

```sql
public.reserve_credits_for_job(...)
public.settle_reserved_credits_for_job(...)
```

Regras implementadas:

- reserva ao enfileirar job com `required_credits`;
- debita ao concluir;
- libera reserva ao falhar/cancelar antes do consumo;
- impede reserva sem saldo disponivel;
- registra em `credit_transactions`.

`credit_wallets` recebe:

```sql
reserved_balance numeric(12,2) not null default 0
```

## Media usage

Handlers registram `media_usage_logs` para:

- `ai_generation`
- `tts_generation`
- `image_generation`
- `render_video`
- `export_package`

## Render real

Quando Storage esta configurado:

1. FFmpeg gera MP4 local temporario.
2. MP4 e thumbnail sao validados.
3. MP4 sobe para bucket `videos` ou `temp`.
4. Thumbnail sobe para bucket `thumbnails`.
5. Render artifact salva `supabase://...`.

Sem Storage, o modo dev continua salvando em `public/renders` e `public/thumbnails`.

## Export real

O export worker:

1. localiza MP4 real via `video_projects.renderUrl` ou registry de render;
2. baixa MP4 de Supabase Storage quando a URL e `supabase://`;
3. baixa thumbnail privada ou extrai frame local quando aplicavel;
4. cria ZIP local temporario;
5. sobe ZIP para bucket `exports`;
6. salva `package_url` como `supabase://exports/...`.
7. Export Center chama `/api/storage/signed-url` para download temporario quando o pacote esta em bucket privado.

## RLS

Migration adiciona RLS para:

- `background_jobs`
- `background_job_logs`
- `worker_heartbeats`

E revisa constraints/policies relacionadas a:

- `credit_transactions`
- `media_usage_logs`
- `export_packages`
- storage buckets privados

Usuarios autenticados so leem dados do workspace. Worker deve usar service role.

## Como aplicar migration

```bash
supabase db push
```

Ou executar `supabase/migrations/20260610_r5_production_infra.sql` no SQL Editor do Supabase.

## Como rodar worker em producao

```bash
npm run worker
```

Recomendacao:

- rodar como processo separado do Next.js;
- usar container/VM com FFmpeg instalado;
- manter `SUPABASE_SERVICE_ROLE_KEY` apenas no ambiente do servidor/worker;
- configurar restart automatico.

## Validacao manual

Checklist:

- criar job real em `background_jobs`;
- confirmar reserva em `credit_transactions`;
- rodar worker;
- ver `worker_heartbeats`;
- ver logs em `background_job_logs`;
- renderizar MP4 real;
- validar objeto no bucket `videos`;
- validar thumbnail no bucket `thumbnails`;
- exportar ZIP;
- validar objeto no bucket `exports`;
- gerar signed URL;
- testar RLS entre workspaces;
- testar super admin;
- testar cancelamento/retry.

## Troubleshooting

### Worker nao aparece ativo

- conferir `SUPABASE_SERVICE_ROLE_KEY`;
- rodar `npm run worker`;
- checar tabela `worker_heartbeats`;
- verificar logs do processo.

### Job fica preso em running

- conferir `lock_expired_at`;
- rodar worker novamente;
- `recoverStuckJobs()` marca como retrying/failed.

### Storage falha

- verificar buckets privados;
- verificar service role;
- conferir MIME permitido;
- conferir path com `<workspace_id>/<entity_id>/arquivo`.

### Creditos insuficientes

- verificar `credit_wallets.balance`;
- verificar `reserved_balance`;
- conferir transacoes `reserve`, `usage` e `release`.

## Estado validado nesta maquina

TypeScript compila com a camada Supabase/Storage.

Nao foi possivel validar banco real porque este ambiente nao possui credenciais Supabase reais. Quando `SUPABASE_SERVICE_ROLE_KEY` real for configurada e a migration aplicada, a fila passa automaticamente para Supabase.
