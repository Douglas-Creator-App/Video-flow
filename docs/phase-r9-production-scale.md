# Fase R9 - Escalabilidade, Custos e Operacao em Producao

## Objetivo

Preparar o Video Flow para crescimento controlado em beta/producao, com foco em performance, custos, observabilidade, estabilidade e escalabilidade.

Nao foram criados novos modulos de IA.

## Entregas implementadas

### Provider Cost Center

API:

- `GET /api/admin/cost-center`

Tela existente reaproveitada:

- `/app/admin-master/costs`

Fontes reais:

- `provider_usage_logs`
- `media_usage_logs`
- `workspaces`
- `subscriptions`
- `plans`
- `video_renders`
- `export_packages`
- `background_jobs`
- `worker_heartbeats`

Indicadores:

- custo diario;
- custo mensal;
- creditos cobrados;
- custo por provider;
- custo por workspace;
- custo por usuario;
- custo por video/reference;
- alertas de worker/fila/falhas.

### Margem por cliente/plano

Calculo:

```text
margem = receita do plano - custo provider - storage estimado - infra estimada
```

Campos calculados:

- receita mensal;
- custo provider;
- custo storage estimado;
- custo infra estimado;
- margem em R$;
- margem percentual.

### Cleanup automatico

API:

- `POST /api/admin/cleanup`

Padrao seguro:

- executa em `dry_run` por padrao;
- nao remove nada sem `dry_run=false`;
- exige admin.

Politicas iniciais:

- jobs completos: 45 dias;
- jobs falhos: 90 dias;
- logs: 180 dias;
- exports baixados: 30 dias.

Tabelas-alvo:

- `background_jobs`;
- `background_job_logs`;
- `export_packages`.

Arquivos temporarios em Storage ainda exigem rotina com listagem por bucket antes de remocao efetiva.

### Performance e metricas

Pontos adicionados/observados:

- Cost Center limita leituras a 5000 linhas por fonte para evitar carga sem paginacao.
- Logs operacionais limitam leitura a 80 linhas por fonte.
- Worker agora aceita `WORKER_CONCURRENCY`, limitado entre 1 e 5.
- Health mostra fila, worker ativo, jobs travados e falhos.

Riscos restantes:

- Algumas telas demo ainda importam `mock-data` grande.
- Sidebar tem muitos links e aumenta carga cognitiva.
- Queries de admin agregam em memoria; para escala maior, criar views materializadas ou RPCs agregadas.

### Observabilidade

Fontes operacionais:

- `/app/admin/logs`;
- `/api/admin/logs`;
- `/api/admin/health`;
- `/api/admin/cost-center`.

Eventos monitorados:

- falhas de render via `background_jobs` e `background_job_logs`;
- falhas de export via jobs/logs;
- falhas de provider via `provider_usage_logs` e logs;
- billing via `credit_transactions`, wallets e jobs;
- rate limit via `rate_limit_events`;
- security via `security_events`;
- audit via `audit_logs`.

### Alertas operacionais

Alertas calculados no Cost Center:

- worker sem heartbeat recente;
- fila acima de 25 jobs pendentes/retry;
- jobs falhos no periodo;
- falhas de leitura operacional.

Alertas do Health:

- FFmpeg ausente;
- OpenAI ausente;
- service role ausente;
- tabelas/buckets ausentes;
- job queue local em producao;
- pipeline beta incompleto.

### Escalabilidade de workers

O worker ja suportava multiplas instancias por lock em `background_jobs`.

Adicionado:

```env
WORKER_CONCURRENCY=1
WORKER_POLL_INTERVAL_MS=5000
```

Limite atual:

- concorrencia minima: 1;
- concorrencia maxima local: 5;
- multiplos processos/containers podem rodar em paralelo usando locks do Supabase.

Recomendacao:

- `render_video`: baixa concorrencia por CPU;
- `magic_video`: concorrencia moderada por custo de provider;
- `export_package`: concorrencia moderada;
- separar workers por tipo em fase futura se volume crescer.

### Backups

Estado:

- tabelas `backup_jobs` e painel Admin existem;
- handler `backup` registra aviso operacional;
- rotina de backup real ainda depende de ambiente Supabase/Storage externo.

Plano de recuperacao recomendado:

1. Backup diario do Postgres/Supabase.
2. Backup incremental dos buckets `videos`, `thumbnails`, `exports`, `audio`, `images`.
3. Export semanal das configuracoes criticas.
4. Teste mensal de restore em projeto Supabase separado.

### Segurança operacional

Revalidado:

- Auth central;
- workspace context real;
- APIs principais exigem `workspace_id`;
- Storage signed URL valida workspace/permissao;
- Admin APIs exigem `requireAdmin`;
- Cost Center e Cleanup sao admin-only;
- RLS existe no schema para tabelas centrais.

Risco restante:

- Algumas rotas demo/legadas ainda usam fallback visual/mock, mas nao fazem parte do fluxo beta principal.

## Validacao executada

- `npm.cmd run typecheck`
- `npm.cmd run build`

## Checklist de producao R9

- [x] Cost Center real.
- [x] Margem por cliente/plano.
- [x] Alertas operacionais basicos.
- [x] Worker concurrency configuravel.
- [x] Cleanup com dry-run.
- [x] Health reforcado.
- [x] Logs operacionais.
- [x] Documentacao R9.
- [ ] Backup real testado em Supabase externo.
- [ ] Cleanup de Storage executado com bucket real.
- [ ] Smoke real com FFmpeg/OpenAI/Supabase configurados.

## Proxima recomendacao

Antes de convidar usuarios beta:

1. Configurar ambiente real.
2. Rodar migrations/seed.
3. Instalar FFmpeg.
4. Rodar smoke R6.8.
5. Abrir `/app/admin-master/health`.
6. Abrir `/app/admin-master/costs`.
7. Executar `/api/admin/cleanup` em dry-run.
8. Validar backup/restore em projeto separado.
