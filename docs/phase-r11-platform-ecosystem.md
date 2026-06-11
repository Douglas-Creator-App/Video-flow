# Fase R11 - Ecossistema e Plataforma

## Objetivo

Transformar o Video Flow / Content Engine AI em uma plataforma operavel por terceiros, com API publica, API keys, webhooks, marketplace, SDK JavaScript, multi-workspace avancado, credit pools corporativos e analytics de plataforma.

## Rotas criadas

### Console

- `/app/platform`

### Administrativas

- `GET /api/platform/api-keys?workspace_id=...`
- `POST /api/platform/api-keys`
- `DELETE /api/platform/api-keys/:id`
- `GET /api/platform/webhooks?workspace_id=...`
- `POST /api/platform/webhooks`
- `DELETE /api/platform/webhooks/:id`
- `GET /api/platform/marketplace`
- `POST /api/platform/marketplace`
- `GET /api/admin/platform-analytics`

### API publica v1

- `POST /api/public/v1/projects`
- `POST /api/public/v1/render`
- `GET /api/public/v1/jobs`
- `GET /api/public/v1/jobs/:id`
- `POST /api/public/v1/exports`
- `GET /api/public/v1/credits`

## Autenticacao publica

Enviar a API key em um dos formatos:

```http
Authorization: Bearer vf_live_xxx
```

ou:

```http
x-api-key: vf_live_xxx
```

As chaves sao gravadas somente como hash SHA-256 em `public_api_keys.key_hash`. O segredo completo e exibido apenas uma vez no momento da criacao.

## Escopos

- `projects.write`
- `render.write`
- `jobs.read`
- `exports.write`
- `credits.read`
- `marketplace.write`
- `webhooks.write`
- `*`

Cada chamada publica valida:

- API key ativa.
- Workspace da chave.
- Escopo necessario.
- Expiracao.
- Rate limit por minuto.
- Billing/creditos quando aplicavel.

## Exemplos REST

### Criar projeto

```bash
curl -X POST https://app.videoflow.ai/api/public/v1/projects \
  -H "Authorization: Bearer vf_live_xxx" \
  -H "Content-Type: application/json" \
  -d '{"name":"Canal Biblical","main_niche":"Biblical","language":"pt-BR"}'
```

### Iniciar render

```bash
curl -X POST https://app.videoflow.ai/api/public/v1/render \
  -H "Authorization: Bearer vf_live_xxx" \
  -H "Content-Type: application/json" \
  -d '{"video_project_id":"uuid","quality":"final","duration_seconds":60}'
```

### Consultar job

```bash
curl https://app.videoflow.ai/api/public/v1/jobs/job_id \
  -H "Authorization: Bearer vf_live_xxx"
```

### Gerar export

```bash
curl -X POST https://app.videoflow.ai/api/public/v1/exports \
  -H "Authorization: Bearer vf_live_xxx" \
  -H "Content-Type: application/json" \
  -d '{"video_project_id":"uuid","target_platform":"youtube_shorts"}'
```

### Consultar creditos

```bash
curl https://app.videoflow.ai/api/public/v1/credits \
  -H "Authorization: Bearer vf_live_xxx"
```

## Webhooks

Eventos suportados:

- `job_completed`
- `render_completed`
- `export_ready`
- `credits_low`
- `subscription_updated`

Headers enviados:

```http
x-video-flow-event: render_completed
x-video-flow-signature: sha256=...
user-agent: VideoFlow-Webhooks/1.0
```

Payload:

```json
{
  "id": "evt_...",
  "type": "render_completed",
  "workspace_id": "uuid",
  "created_at": "2026-06-10T00:00:00.000Z",
  "data": {
    "job_id": "job_...",
    "job_type": "render_video",
    "status": "completed",
    "result": {}
  }
}
```

Verificacao de assinatura:

```ts
import crypto from "node:crypto";

const expected = "sha256=" + crypto
  .createHmac("sha256", process.env.VIDEO_FLOW_WEBHOOK_SECRET!)
  .update(rawBody)
  .digest("hex");
```

## SDK JavaScript

Local:

- `sdk/video-flow-js`

Uso:

```ts
import { VideoFlowClient } from "@videoflow/sdk";

const client = new VideoFlowClient({
  apiKey: process.env.VIDEO_FLOW_API_KEY!,
  baseUrl: "https://app.videoflow.ai"
});

await client.createProject({ name: "Canal Biblical", main_niche: "Biblical" });
await client.startRender({ video_project_id: "uuid", quality: "final" });
await client.createExport({ video_project_id: "uuid", target_platform: "youtube_shorts" });
await client.getCredits();
```

## Marketplace

Tabela:

- `marketplace_listings`

Tipos:

- `template`
- `agent`
- `workflow`

Pricing:

- `free`
- `premium`
- `community`

Fluxo atual:

1. Criador envia item via `/app/platform`.
2. Item entra como `review`.
3. Admin pode publicar futuramente mudando `status = published`.
4. Analytics agrega uso e receita por tipo.

Status: BETA.

## Multi-workspace avancado

Tabelas:

- `workspace_organizations`
- `workspace_organization_members`

Casos suportados por estrutura:

- empresas
- agencias
- franquias
- clientes vinculados
- white-label parcial por dominio

Status: BETA estrutural. Ainda nao ha UI completa de administracao de franquias/white-label.

## Creditos corporativos

Tabela:

- `corporate_credit_pools`

Campos principais:

- organizacao
- workspace
- saldo
- reservado
- limite mensal
- status

Status: BETA estrutural. A carteira principal continua em `credit_wallets`; pools corporativos foram preparados para a proxima etapa de alocacao automatica.

## Analytics de plataforma

API:

- `GET /api/admin/platform-analytics`

Mede:

- API keys ativas
- webhooks
- entregas de webhook
- taxa de falha
- templates usados
- agentes usados
- workflows usados
- receita de marketplace
- eventos de plataforma
- organizacoes
- pools corporativos

## Tabelas novas

- `public_api_keys`
- `webhook_endpoints`
- `webhook_deliveries`
- `marketplace_listings`
- `platform_usage_events`
- `workspace_organizations`
- `workspace_organization_members`
- `corporate_credit_pools`

## Status real da R11

| Area | Status | Observacao |
| --- | --- | --- |
| API publica | REAL | Endpoints funcionais com API key, escopos e rate limit. |
| API keys | REAL | Geracao, revogacao, hash e limites. |
| Webhooks | REAL | Entrega assinada para job/render/export concluido. |
| Marketplace | BETA | Estrutura, envio para revisao e analytics; checkout/revenue share externo pendente. |
| Marketplace de agentes | BETA | Mesmo mecanismo de `marketplace_listings` com `type = agent`. |
| Marketplace de workflows | BETA | Mesmo mecanismo com `type = workflow`. |
| SDK JS | REAL | Cliente REST criado no repo. Publicacao npm ainda pendente. |
| Multi-workspace avancado | BETA | Tabelas estruturais criadas; UI operacional completa pendente. |
| Credit pools corporativos | BETA | Tabela criada; debito automatico do pool ainda pendente. |
| Analytics de plataforma | REAL | Agregacao sobre eventos, listings, webhooks, keys e pools. |

## Checklist de validacao

- Gerar API key em `/app/platform`.
- Usar API key em `/api/public/v1/credits`.
- Criar projeto via API publica.
- Iniciar render via API publica.
- Consultar job via API publica.
- Gerar export via API publica.
- Criar webhook em `/app/platform`.
- Concluir job e validar delivery em `webhook_deliveries`.
- Enviar template/agente/workflow para review.
- Abrir analytics em `/app/platform`.
- Rodar `npm.cmd run typecheck`.
- Rodar `npm.cmd run build`.

## Pendencias para plataforma comercial

1. Publicar SDK no npm.
2. Criar portal publico de docs fora do app autenticado.
3. Adicionar moderacao/admin para publicar marketplace listings.
4. Conectar revenue share/payout de marketplace.
5. Criptografar webhook secrets com KMS/secret manager em producao.
6. Fazer retry com backoff para webhooks falhos.
7. Debitar credit pools corporativos antes de `credit_wallets` quando aplicavel.
8. Criar UI completa para organizacoes, franquias e white-label.

