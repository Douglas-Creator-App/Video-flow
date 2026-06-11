# Fase 18 - YouTube Studio AI

## Objetivo

Criar um modulo consultivo para canais usando dados internos do workspace. Nesta fase nao existe integracao real com YouTube Analytics nem APIs externas de concorrentes.

## Rotas

- `/app/channel-insights`
- `/app/topics`
- `/app/trends`
- `/app/title-lab`
- `/app/thumb-lab`
- `/app/strategist`
- `/app/executive`
- `/app/insights`
- `/api/studio/strategy`

## Banco de Dados

Tabelas adicionadas:

- `trend_topics`
- `idea_bank`
- `tracked_channels`

Recursos:

- RLS habilitado.
- Indices por categoria, idioma, workspace, canal, status, score, plataforma e nicho.
- Realtime habilitado.

## Modulos

- Channel Insights.
- Topics Engine.
- Content Gap Analysis.
- Trend Discovery.
- Idea Bank.
- Video Opportunities.
- Title Lab.
- Thumb Lab.
- Content Calendar AI.
- Channel Health Score.
- AI Strategist.
- Competitor Tracker.
- Dashboard Executivo.
- Recommendation Engine.
- Relatorios PDF/CSV/XLSX simulados.
- Analytics `/app/insights`.
- Admin Master Insights.

## Dados Internos Utilizados

- Channels.
- Video Projects.
- Export Packages.
- Manual Publications.
- Premium Templates.
- Quality Scores.
- Bulk Jobs.
- Calendar Items.
- Provider Costs.

## Arquivos Principais

- `src/lib/types.ts`
- `src/lib/mock-data.ts`
- `src/lib/youtube-studio-ai.ts`
- `src/components/studio/youtube-studio-ai-panels.tsx`
- `src/app/api/studio/strategy/route.ts`
- `supabase/schema.sql`

## Estado Atual

Funcional em modo interno/mockado, preparado para integrações futuras com APIs reais de analytics, concorrentes e tendências.
