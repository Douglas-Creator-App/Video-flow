# Beta Operations Guide - Video Flow

## Objetivo

Guia operacional para conduzir o beta fechado do Video Flow com usuarios reais sem mascarar mocks ou falhas.

## Rotas principais do beta

- `/app/onboarding`
- `/app/quick-start`
- `/app/magic`
- `/app/queue`
- `/app/videos/[id]/editor`
- `/app/export-center`
- `/app/billing`
- `/app/admin-master/health`
- `/app/admin/logs`

## Setup obrigatorio

1. Criar projeto Supabase.
2. Aplicar `supabase/schema.sql` e migrations.
3. Rodar seed minimo.
4. Criar buckets privados:
   - `videos`
   - `thumbnails`
   - `exports`
   - `audio`
   - `images`
   - `temp`
5. Configurar `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
APP_URL=http://127.0.0.1:3000
STORAGE_BUCKETS=videos,thumbnails,exports,audio,images,temp
```

6. Instalar FFmpeg e validar:

```powershell
ffmpeg -version
```

7. Subir app:

```powershell
npm.cmd run dev
```

8. Rodar worker:

```powershell
npm.cmd run worker
```

## Onboarding beta recomendado

1. Criar conta.
2. Criar ou selecionar workspace.
3. Verificar wallet em `/app/billing`.
4. Abrir `/app/quick-start`.
5. Escolher template/tema.
6. Abrir Magic Mode.
7. Criar job.
8. Acompanhar `/app/queue`.
9. Renderizar no editor.
10. Exportar ZIP em `/app/export-center`.

## Suporte operacional

### Health

Abrir `/app/admin-master/health`.

Verificar:

- env;
- service role;
- providers;
- FFmpeg;
- migrations;
- storage buckets;
- billing;
- wallet;
- rate limit;
- audit logs;
- job queue;
- beta pipeline.

### Logs

Abrir `/app/admin/logs`.

Fontes:

- `background_job_logs`;
- `audit_logs`;
- `security_events`;
- `rate_limit_events`.

## Troubleshooting

### Magic falha imediatamente

Possiveis causas:

- `OPENAI_API_KEY` ausente.
- Supabase Storage ausente.
- Sem permissao `content.create`.
- Workspace nao selecionado.

### Render falha

Possiveis causas:

- FFmpeg ausente no PATH.
- Assets reais nao encontrados no Storage.
- Projeto sem cenas.

### Export falha

Possiveis causas:

- Video sem `render_url` real.
- Thumbnail ausente.
- Storage `exports` ausente.
- Usuario sem `export_video`.

### Creditos incorretos

Verificar:

- `credit_wallets`;
- `credit_transactions`;
- `background_jobs.payload.required_credits`;
- logs de settle/reserva.

## Regras para suporte beta

- Nao marcar job como sucesso se artefato real nao existir.
- Nao liberar download se `package_url` nao for real.
- Nao tratar tela DEMO como funcionalidade produtiva.
- Registrar bug com rota, workspace, job id, horario e print/log.

## Smoke test oficial

Executar antes de convidar usuarios:

- Login.
- Workspace.
- Wallet.
- Magic.
- Queue.
- Render.
- Export.
- Download ZIP.
- Admin Health.
- Admin Logs.

Resultado esperado:

- Sem checks criticos em health.
- Job Magic concluido.
- Render concluido com MP4 real.
- Export concluido com ZIP real.
- Logs completos.
- Creditos debitados/estornados corretamente.

## Checklist final beta

- [ ] Supabase limpo validado.
- [ ] Env configurado.
- [ ] FFmpeg instalado.
- [ ] OpenAI configurado.
- [ ] Storage buckets existem.
- [ ] Worker ativo.
- [ ] Health sem criticos.
- [ ] Smoke real concluido.
- [ ] Modulos demo identificados.
- [ ] Suporte sabe ler `/app/admin/logs`.
