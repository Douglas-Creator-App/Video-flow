# Beta Readiness Audit - Video Flow

Data: 2026-06-10

## Resumo executivo

O Video Flow esta em estado de beta fechado tecnico. O nucleo Magic -> Render -> Export foi conectado a workspace real, jobs reais, billing real, Supabase e Storage, mas a validacao ponta a ponta ainda depende de ambiente configurado com Supabase, OpenAI e FFmpeg.

Status geral: **BETA**

## Classificacao geral

| Area | Status | Observacao |
| --- | --- | --- |
| Auth e workspace | concluido | Contexto real via `/api/workspaces/context`, workspace switcher e guards. |
| Billing e wallet | parcial | Consulta real e reserva/settle via jobs; checkout nao existe. |
| Job queue | concluido | Supabase como padrao em producao, lock, retry, cancelamento e logs. |
| Magic Mode | beta | Exige OpenAI/Storage/Supabase reais; falha sem fallback mockado. |
| Render | beta | FFmpeg real; bloqueado se FFmpeg ausente. |
| Export ZIP | beta | ZIP real e persistencia `export_packages`; depende de render/thumbnail reais. |
| Admin Health | beta | Checks consolidados para env, banco, storage, providers, worker, billing, audit e rate limit. |
| Logs operacionais | beta | `/app/admin/logs` lista jobs, auditoria, security events e rate limits. |
| Onboarding | parcial | Wizard existe, mas ainda usa dados demonstrativos/templates mockados. |
| AI Video/Talking Scenes | demo | Arquitetura futura; nao faz parte do beta principal. |
| Trends/Strategist/Analytics | demo | Telas de estrategia com dados internos/mockados. |
| Asset Library | hibrido | Busca/import/upload ainda parcialmente demonstrativos. |

## Inventario REAL/BETA/DEMO

| Modulo | Status | Motivo |
| --- | --- | --- |
| Workspace context | REAL | Supabase real com auth/membership/roles. |
| Queue | REAL | `background_jobs`, `background_job_logs`, worker heartbeat. |
| Billing/wallet | BETA | Usa Supabase e RPCs; sem checkout. |
| Magic Mode | BETA | Pipeline real preparado; exige provider/storage. |
| Editor | BETA | Le renders reais, mas UI ainda mistura estados demonstrativos. |
| Render | BETA | FFmpeg real; ambiente local sem FFmpeg bloqueia smoke. |
| Export Center | BETA | Lista packages reais e mantem area demo quando nao ha render. |
| Admin Health | REAL | API real com checks operacionais. |
| Operational Logs | REAL | Painel real para tabelas operacionais. |
| Onboarding/Quick Start | BETA | Ajuda fluxo inicial, mas ainda depende de templates mockados. |
| Premium Templates | DEMO | Dados demonstrativos. |
| AI Video | DEMO | Provider mock/hibrido para arquitetura futura. |
| Talking Scenes | DEMO | Futuro video provider. |
| Trends/Topics/Strategist | DEMO | Sem fontes externas reais nesta fase. |
| Test Lab | DEMO | Relatorio estatico/simulador. |

## Bloqueios para beta externo

- Configurar `.env.local` com Supabase, service role, OpenAI e APP_URL.
- Instalar FFmpeg e validar `ffmpeg -version`.
- Criar buckets privados no Supabase Storage.
- Aplicar migrations em projeto Supabase limpo.
- Rodar seed minimo.
- Criar usuario/workspace real de teste.
- Executar smoke test oficial completo.

## Itens removiveis ou adiaveis

- Rotas/telas de AI Video avancado durante beta inicial.
- Talking Characters.
- Analytics executivos avancados.
- Content Factory em massa.
- Test Lab simulado.

Esses itens nao precisam ser removidos agora, mas devem permanecer marcados como DEMO para nao criar promessa falsa no beta.

## Performance review

Riscos observados:

- Sidebar tem muitos links e aumenta custo cognitivo do beta.
- Varias telas importam listas grandes de `mock-data`.
- React Query esta centralizado em workspace hooks, mas algumas telas ainda usam `fetch` manual.
- Admin Health e Logs fazem leituras amplas; limites foram mantidos em 80 linhas no painel de logs.

Recomendacoes:

- Beta inicial deve guiar usuario para `/app/quick-start`, `/app/magic`, `/app/queue`, `/app/export-center`.
- Manter dados operacionais paginados.
- Evitar carregar telas demo durante suporte beta.

## Smoke test oficial

Checklist:

- Login com usuario real.
- Workspace real carregado no header.
- Wallet real visivel em Billing.
- Criar Magic job.
- Worker processa job.
- `video_projects` criado.
- `video_scenes` criadas.
- `media_assets` criados.
- Render final cria MP4.
- `video_renders.render_url` salvo.
- Export cria ZIP.
- `export_packages.package_url` salvo.
- Download via signed URL funciona.
- `/app/queue` mostra logs.
- `/app/admin-master/health` sem criticos.
- `/app/admin/logs` mostra eventos.

## Resultado da validacao local

- Typecheck: pendente de execucao final R7.
- Build: pendente de execucao final R7.
- Smoke real: nao executado neste ambiente sem `.env` e sem FFmpeg no PATH.

## Prontidao estimada

| Dimensao | Nota |
| --- | ---: |
| Arquitetura | 8 |
| Segurança | 7 |
| Banco | 7 |
| Workers | 8 |
| Billing | 6 |
| UX beta | 6 |
| Observabilidade | 7 |
| Deploy readiness | 5 |

Estimativa geral para beta fechado: **68/100**.
