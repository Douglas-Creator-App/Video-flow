# Fase R10 - Growth Engine e Escala Comercial

## Objetivo

Preparar o Video Flow / Content Engine AI para operar crescimento comercial no beta fechado, cobrindo aquisicao, indicacao, retencao, feedback, CRM basico, campanhas e visao executiva.

Esta fase nao adiciona novos modulos de IA, checkout, payout externo ou provedor de e-mail. O foco foi criar a camada operacional de crescimento usando dados reais ja disponiveis no sistema e sinalizar claramente o que ainda depende de integracoes comerciais.

## Entregas

### Growth Engine

Rota:

- `/app/growth`

API:

- `GET /api/admin/growth`
- `POST /api/growth/feedback`

O dashboard consolida:

- MRR
- ARR
- churn
- LTV
- usuarios ativos
- videos gerados
- videos exportados
- custo mensal de providers
- margem bruta estimada
- funil de conversao
- analytics de produto
- CRM basico
- campanhas
- notificacoes in-app
- feedback/NPS
- auditoria comercial

## Fontes de dados

O Growth Engine le dados reais das tabelas:

- `workspaces`
- `workspace_users`
- `subscriptions`
- `plans`
- `video_projects`
- `video_renders`
- `export_packages`
- `provider_usage_logs`
- `media_usage_logs`
- `operation_notifications`
- `audit_logs`

Quando Supabase admin nao estiver configurado, a API retorna estado vazio com `source: supabase_unconfigured`.

## Status por modulo

| Modulo | Status | Observacao |
| --- | --- | --- |
| Dashboard executivo comercial | BETA | Le dados reais, mas CAC depende de dados de midia paga. |
| Funil de conversao | BETA | Cadastro, trial, video, export e assinante usam dados reais; visitantes ainda sao estimados. |
| Analytics de produto | BETA | Usa eventos reais derivados de tabelas existentes. Retencao e tempo ate valor sao estimativas operacionais. |
| CRM basico | REAL | Classifica leads, trials, clientes ativos e cancelados a partir de workspaces/subscriptions. |
| In-app notifications | REAL | Usa `operation_notifications`. |
| Feedback/NPS | REAL | `POST /api/growth/feedback` persiste em `audit_logs` com `entity_type = growth_feedback`. |
| Programa de afiliados | BETA | Playbook, tiers e padrao de link prontos; payout externo ainda nao integrado. |
| Referral program | BETA | Politica de recompensa definida; credito automatico depende de evento de assinatura/convite final. |
| E-mails transacionais | BETA | Fluxos definidos; provedor de e-mail externo ainda nao conectado. |
| Campanhas/cupons | BETA | Campanhas e guardrails definidos; checkout/coupon provider ainda nao integrado. |
| Auditoria comercial | REAL | Regras rodam sobre MRR, custos, churn, videos e exportacoes. |

## Programa de afiliados

Padrao de link:

```text
{APP_URL}/signup?ref={affiliate_code}
```

Tiers:

- Starter: 20% ate 10 vendas ativas.
- Growth: 25% de 11 a 50 vendas ativas.
- Scale: 30% acima de 50 vendas ativas.

Politica operacional:

- Cookie recomendado: 60 dias.
- Pagamento externo ainda nao implementado.
- Validar comissao apenas para assinatura ativa.
- Evitar pagar autoindicacao ou workspace duplicado.

## Referral

Regras iniciais:

- Quem indica recebe 500 creditos.
- Convidado recebe 250 creditos.
- Desconto sugerido: 15% no primeiro mes.
- Bonus expira em 30 dias.

Guardrails:

- Aplicar recompensa apenas uma vez por workspace.
- Exigir usuario autenticado e workspace valido.
- Registrar credito em `credit_transactions` quando a automacao definitiva for conectada.

## Funil comercial

Fluxo monitorado:

```text
Visitante -> Cadastro -> Trial -> Primeiro video -> Primeira exportacao -> Assinante
```

Estado atual:

- Cadastro: derivado de workspaces e usuarios.
- Trial: derivado de `subscriptions.status = trialing`.
- Primeiro video: workspace com pelo menos um `video_project`.
- Primeira exportacao: workspace com pelo menos um `export_package`.
- Assinante: `subscriptions.status = active`.
- Visitante: estimado ate existir analytics web real.

## E-mails transacionais

Fluxos definidos:

- Boas-vindas.
- Onboarding.
- Creditos baixos.
- Renovacao.
- Cancelamento.
- Reativacao.

Proxima etapa para producao:

- Escolher provedor de e-mail.
- Criar templates HTML.
- Gravar eventos de envio/erro.
- Criar opt-out quando aplicavel.

## Feedback e NPS

Endpoint:

```http
POST /api/growth/feedback
```

Payload:

```json
{
  "workspace_id": "uuid",
  "type": "bug | suggestion | nps | satisfaction",
  "score": 8,
  "message": "texto do feedback"
}
```

Seguranca:

- Exige usuario autenticado.
- Valida acesso ao workspace via `requireWorkspace`.
- Nao aceita `user_id` vindo do body.
- Persiste em `audit_logs`.

## Auditoria comercial

Regras implementadas:

- Receita zerada.
- Gargalo entre video gerado e exportacao.
- Margem negativa.
- Churn acima do alvo.
- Usuarios sem producao recente.
- Videos recentes sem exportacao.

## Limitacoes conhecidas

- CAC ainda nao e real porque nao ha integracao com plataformas de anuncios.
- Afiliados nao possuem payout externo.
- Cupons nao estao conectados a checkout.
- E-mails nao sao enviados por provedor externo.
- Visitantes do funil sao estimados.
- Retencao D1/D7/D30 e tempo ate valor sao calculos derivados, nao eventos analiticos dedicados.

## Checklist de validacao

- `/app/growth` abre no app.
- `GET /api/admin/growth` exige admin.
- Feedback exige workspace real.
- Feedback aparece em `audit_logs` como `growth_feedback`.
- Funil mostra dados quando existem workspaces, subscriptions, videos e exports.
- CRM mostra leads, trials, clientes ativos e cancelados.
- Notificacoes usam `operation_notifications`.
- Estados BETA/REAL/DEMO ficam visiveis.
- `npm.cmd run typecheck` passa.
- `npm.cmd run build` passa.

## Proximas prioridades

1. Conectar provider de e-mail transacional.
2. Criar tabelas dedicadas para affiliate/referral attribution quando checkout for definido.
3. Integrar cupons ao provedor de billing.
4. Registrar eventos web reais de visitante e signup source.
5. Automatizar recompensa de referral em `credit_transactions`.
6. Criar relatorio mensal comercial exportavel.

