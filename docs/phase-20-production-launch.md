# Fase 20 - Production Launch, Seguranca, Backups e Deploy

## Objetivo

A Fase 20 prepara o Video Flow para uso real controlado: checklist de lancamento, ambiente, providers, storage, backups, seguranca, LGPD, jobs, logs, health check, modo demo e documentacao interna.

Nao foram ativadas cobrancas reais, publicacao automatica ou chamadas externas novas.

## Rotas criadas

- `/app/launch`
- `/app/admin-master/environment`
- `/app/admin-master/providers-health`
- `/app/admin-master/storage`
- `/app/admin-master/backups`
- `/app/admin-master/security`
- `/app/admin-master/jobs`
- `/app/admin-master/errors`
- `/app/admin-master/health`
- `/app/admin-master/branding-check`
- `/app/admin-master/smoke-test`
- `/app/admin-master/retention`
- `/app/admin-master/demo-mode`
- `/app/docs/production`
- `/app/settings/data`
- `/terms`
- `/privacy`

## Banco de dados

Tabelas adicionadas em `supabase/schema.sql`:

- `backup_jobs`
- `data_retention_policies`
- `security_events`
- `rate_limits`
- `error_logs`
- `user_legal_acceptances`
- `data_requests`

Todas as tabelas de workspace possuem indices, RLS, politicas e Realtime. Tabelas criticas tambem entram no fluxo de auditoria via `audit_logs`.

## Environment Manager

O painel mostra apenas status das variaveis:

- `configured`
- `missing`
- `invalid`

Valores reais nunca sao renderizados. As variaveis server-side continuam tratadas como segredos.

## Provider Health

O health check foi preparado com estado interno/mock:

- OpenAI
- ElevenLabs
- Pexels
- Pixabay
- Unsplash
- Supabase
- Storage
- Video providers

Status suportados:

- `online`
- `offline`
- `missing_key`
- `error`

## Storage

Buckets esperados:

- `videos`
- `thumbnails`
- `audio`
- `images`
- `assets`
- `exports`
- `temp`

O painel mostra existencia, policy, upload, leitura e tamanho maximo.

## Seguranca

O Security Center cobre:

- RLS
- chaves obrigatorias ausentes
- workspaces suspensos
- permission denied
- eventos sensiveis
- ultimos logins
- error logs
- rate limits

## LGPD e Legal

Criadas paginas publicas:

- `/terms`
- `/privacy`

O onboarding agora possui checkbox de aceite dos termos e politica de privacidade. A tabela `user_legal_acceptances` prepara persistencia do aceite real.

`/app/settings/data` permite simular:

- exportacao do workspace
- download de dados pessoais
- solicitacao de exclusao

## Backups e Retencao

Backups manuais estao mockados na UI e preparados no banco. Automacao agendada fica como proximo passo.

Politicas de retencao preparadas para:

- arquivos temporarios
- jobs falhos
- logs antigos
- assets deletados

## Demo Mode

Modo demo documentado e exibido:

- nao consumir creditos reais
- marcar resultados como demo
- exigir confirmacao para exportacao final
- avisar antes de provider real

## Pendencias antes de producao real

- Configurar secrets reais no provedor de deploy.
- Criar buckets reais e revisar policies no Supabase.
- Testar RLS por role com usuarios reais.
- Validar dominio, SSL e callbacks de Auth.
- Revisao juridica final de Termos e Privacidade.
- Ativar backups agendados fora do mock.
- Definir monitoramento externo e alertas reais.
