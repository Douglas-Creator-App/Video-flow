# Fase R4 - Real Workers e Filas em Background

## Entrega

- Core de fila em `src/lib/jobs/job-queue.ts`.
- Worker Node em `src/workers/index.ts`.
- Runner reutilizavel em `src/workers/runner.ts`.
- Handlers em `src/workers/handlers/*`.
- APIs:
  - `GET /api/jobs`
  - `POST /api/jobs`
  - `GET /api/jobs/[id]`
  - `POST /api/jobs/[id]/retry`
  - `POST /api/jobs/[id]/cancel`
  - `POST /api/jobs/process-next`
- Integracoes assincronas:
  - `POST /api/render/video` cria job `render_video`.
  - `POST /api/media/render` cria job `render_video`.
  - `POST /api/export/package` cria job `export_package`.
  - `POST /api/magic/jobs` cria job `magic_video` depois do preview.
  - `POST /api/factories/generate` cria job `factory_generation`.
- UI:
  - `/app/queue` mostra fila real, filtros, logs, retry, cancelamento, heartbeat e processamento manual.
  - `JobProgressPanel` pode ser usado por Magic, Render, Export Center, Viral Clips e Factories.

## Modo de operacao

Em desenvolvimento, os jobs sao persistidos em:

```text
.data/background-jobs.json
```

Isto permite validar polling, retry, cancelamento, locks, logs e worker sem exigir Redis/BullMQ nem uma instancia Supabase local.

Para processamento continuo:

```bash
npm run worker
```

Sem worker rodando, a UI mostra aviso claro e permite processar manualmente um job pelo botao `Processar proximo job` em `/app/queue`.

## Tipos de job

- `magic_video`
- `ai_generation`
- `tts_generation`
- `image_generation`
- `render_video`
- `export_package`
- `viral_clip`
- `text_to_video`
- `image_to_video`
- `talking_character`
- `backup`
- `factory_generation`

## Status

- `queued`
- `running`
- `completed`
- `failed`
- `cancelled`
- `retrying`

## Retry e cancelamento

- `max_attempts` padrao: 3.
- Backoff exponencial simples.
- Erros de credito nao entram em retry automatico.
- Jobs `running` recebem `cancel_requested`; o handler verifica antes das etapas pesadas.
- Jobs `queued`/`retrying` sao cancelados imediatamente.

## Lock e stuck recovery

Ao iniciar processamento, o worker preenche:

- `locked_at`
- `locked_by`
- `lock_expired_at`

A rotina `recoverStuckJobs()` reprocessa jobs com lock expirado, marcando `retrying` ou `failed` conforme tentativas restantes.

## SQL recomendado para Supabase/PostgreSQL

```sql
create table if not exists background_jobs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  user_id uuid,
  type text not null,
  status text not null default 'queued',
  priority integer not null default 5,
  payload jsonb not null default '{}'::jsonb,
  result jsonb,
  progress integer not null default 0,
  current_step text not null default 'Na fila',
  attempts integer not null default 0,
  max_attempts integer not null default 3,
  error_message text,
  scheduled_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  cancel_requested boolean not null default false,
  locked_at timestamptz,
  locked_by text,
  lock_expired_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists background_job_logs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references background_jobs(id) on delete cascade,
  workspace_id uuid not null,
  level text not null,
  message text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists worker_heartbeats (
  id uuid primary key default gen_random_uuid(),
  worker_id text not null unique,
  status text not null,
  last_seen_at timestamptz not null default now(),
  metadata jsonb
);

create index if not exists idx_background_jobs_queue
  on background_jobs (status, scheduled_at, priority desc);

create index if not exists idx_background_jobs_workspace
  on background_jobs (workspace_id, created_at desc);

create index if not exists idx_background_job_logs_job
  on background_job_logs (job_id, created_at);

alter table background_jobs enable row level security;
alter table background_job_logs enable row level security;
alter table worker_heartbeats enable row level security;
```

## Estado real por handler

- `render_video`: usa FFmpeg real da R2. Falha claramente se FFmpeg nao estiver instalado.
- `export_package`: usa ZIP real da R3. Falha claramente se MP4/thumbnail reais estiverem ausentes.
- `ai_generation`: usa OpenAI Text real com fallback seguro se chave ausente.
- `tts_generation`: usa OpenAI TTS real com fallback seguro se chave ausente.
- `image_generation`: usa OpenAI Images real com fallback seguro se chave ausente.
- `magic_video`: executa pipeline interno existente, ainda baseado em dados mockados.
- `factory_generation`: executa motor interno existente, ainda sem persistencia Supabase.
- `viral_clip` e `video IA`: handlers preparados, mas processamento real depende das fases/providers correspondentes.
- `backup`: preparado; backup real depende de service role/storage.

## Limitacoes atuais

- Persistencia de jobs em arquivo local para desenvolvimento.
- Debito financeiro definitivo ainda precisa transacao atomica em Supabase.
- UI de Magic/Viral/Factories pode adotar `JobProgressPanel` em telas especificas, enquanto `/app/queue` ja monitora todos os jobs.
- `npm run worker` exige `tsx` instalado em `node_modules`.
