# Fase 12 - Billing, Planos, Creditos e Admin Master

Data: 2026-06-08

## Objetivo

Criar a estrutura comercial do Video Flow sem cobranca real. A fase prepara o produto para planos, assinaturas, creditos, limites por plano, trial, checkout placeholder, Admin Master, custos e auditoria.

## Banco de dados

Novas tabelas adicionadas em `supabase/schema.sql`:

- `plans`
- `subscriptions`
- `credit_wallets`
- `credit_transactions`
- `credit_packages`
- `billing_events`
- `invoices`
- `platform_admins`
- `feature_flags`

Todas receberam RLS, indices e realtime.

## Planos padrao

- Starter
- Pro
- Agency
- Enterprise

Cada plano define creditos inclusos, limites de workspaces, canais, projetos, usuarios, videos, renders, AI video, cortes virais, watermark, fila prioritaria e white label.

## Validacao central

Arquivo: `src/lib/billing.ts`

Funcao principal:

```ts
canUseFeature(workspaceId, feature, requiredCredits?)
```

Valida:

- status da assinatura
- saldo de creditos
- limite mensal
- recurso incluso no plano
- feature flag
- workspace suspenso
- watermark do plano

Features cobertas:

- `generate_script`
- `generate_voice`
- `generate_image`
- `render_video`
- `generate_thumbnail`
- `viral_clips`
- `ai_video`
- `bulk_generation`
- `create_channel`
- `create_project`
- `invite_user`
- `white_label`

## APIs protegidas por uso

As seguintes rotas passam a chamar `canUseFeature`:

- `/api/magic/jobs`
- `/api/media/tts`
- `/api/media/images`
- `/api/media/thumbnails`
- `/api/media/render`
- `/api/viral-clips/jobs`
- `/api/ai-video/jobs`

Quando bloqueado, retornam `402` com mensagem clara e objeto `usage`.

## Billing Page

Rota: `/app/billing`

Exibe:

- plano atual
- creditos disponiveis
- uso do periodo
- limites do plano
- trial
- watermark
- bloqueios por recurso
- planos
- pacotes extras
- transacoes
- invoices
- eventos de checkout mockados

Botao de assinar/comprar cria evento mockado em memoria, representando futura integracao Stripe/Mercado Pago.

## Admin Master

Rota: `/app/admin-master`

Exibe:

- total de workspaces
- usuarios estimados
- assinaturas ativas/trial
- receita estimada
- creditos consumidos
- videos
- renders
- jobs com erro
- custo estimado de providers

Acoes mockadas:

- ajustar creditos
- alterar plano
- pausar workspace
- reativar workspace
- registrar evento de billing/auditoria mockado

Observacao: em producao, a rota deve ser protegida server-side por `platform_admin`.

## Cost Analytics

Rota: `/app/admin-master/costs`

Exibe custo estimado por:

- provider
- workspace
- texto
- voz
- imagem
- render
- AI video
- viral clips

## Trial

Trial padrao modelado em `subscriptions.trial_ends_at`.

No mock atual, `ws_1` usa plano Pro em trial de 7 dias.

## Watermark

`plans.watermark_enabled` controla o aviso e o retorno das APIs de render.

`/api/media/render` retorna:

- `watermark_applied`
- `provider_mode`
- `warning`
- `usage`

## Checkout placeholder

Nao ha cobranca real.

Arquitetura preparada para:

- Stripe
- Mercado Pago

Eventos sao criados via `createMockBillingEvent` e mapeados para futura tabela `billing_events`.

## Pendencias para producao

- Conectar Stripe Checkout.
- Conectar Mercado Pago.
- Persistir eventos mockados no Supabase.
- Persistir transacoes de credito em cada consumo real.
- Criar saldo real por workspace.
- Proteger `/app/admin-master` server-side por `platform_admin`.
- Criar webhooks de assinatura/invoice.
- Criar bloqueio de render no worker real.
- Criar job queue real com consumo atomico de creditos.
