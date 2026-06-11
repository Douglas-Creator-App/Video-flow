# Fase 19 - Content Factory

## Objetivo

A Fase 19 adiciona a camada de automacao de fabrica de conteudo do Video Flow. O modulo organiza factories por canal/template, agenda producao, cria filas, aplica quality gate, envia itens para revisao humana e controla recursos/creditos antes de gerar ou renderizar videos.

Publicacao automatica nao foi implementada. Todo resultado gerado pelo backend retorna `publish_blocked: true` e a UI deixa claro que a publicacao exige aprovacao humana.

## Rotas

- `/app/factories`: dashboard principal com factories, templates, alertas e execucao simulada.
- `/app/factories/[id]`: detalhes da factory, regras, agenda, resource manager, quality gate e jobs.
- `/app/factories/queues`: fila operacional com status queued/generating/review/rendering/completed/failed.
- `/app/factories/analytics`: analytics de producao, creditos, falhas e quality score por factory.
- `/app/review-queue`: aprovacao, edicao, rejeicao e reenvio de itens retidos por quality gate.
- `/api/factories/generate`: rota backend para simular geracao/regeneracao com auditoria.

## Banco de dados

Tabelas adicionadas em `supabase/schema.sql`:

- `content_factories`
- `production_rules`
- `factory_schedules`
- `content_series`
- `factory_queue_jobs`
- `review_queue_items`
- `factory_alerts`

Todas possuem RLS habilitado, indices operacionais, triggers de auditoria e Realtime configurado. `production_rules` e `factory_schedules` usam `factory_id`; a funcao de auditoria resolve o `workspace_id` pela tabela `content_factories`.

## Fluxo do motor

O helper `src/lib/content-factory.ts` implementa o `runFactoryGeneration(factoryId)` com dados internos:

1. Seleciona ideia do Idea Bank.
2. Consulta Topics Engine.
3. Consulta Trend Discovery.
4. Aplica o template da factory.
5. Simula geracao de roteiro, voz, cenas, assets e thumbnail.
6. Calcula quality score estimado.
7. Aplica `quality_gate_threshold`.
8. Envia para `review_queue` quando a factory exige revisao ou score fica abaixo do limite.
9. Envia para `render_queue` apenas quando a regra permite.

## Resource Manager

Cada factory possui `resource_priority`, por exemplo:

- Biblioteca propria
- Pexels
- Pixabay
- Stock videos
- IA

Quando a carteira de creditos esta baixa ou a fila esta congestionada, recursos de IA ficam marcados como limitados para preservar custo.

## Review Queue

A fila de revisao suporta:

- Aprovar
- Rejeitar
- Editar
- Reenviar

Essas acoes estao mockadas em estado de client component nesta fase. A arquitetura de banco ja possui `review_queue_items.status` para persistencia futura.

## Admin Master

O painel `AdminFactoryPanel` foi adicionado ao Admin Master com:

- factories ativas
- total de jobs
- templates
- schedules
- series
- reviews pendentes
- alertas
- quality score medio

## Seguranca

- Nenhuma API externa e chamada.
- Nenhuma chave e exposta.
- Geracao passa por `/api/factories/generate`.
- Auditoria registra a execucao mockada.
- RLS limita leitura a membros do workspace.
- Escrita de factories exige `ai.manage`.
- Escrita de jobs/alertas exige `ai.generate`.
- Publicacao automatica permanece bloqueada.

## Estado atual

Modulo funcional com dados mockados e infraestrutura Supabase preparada para persistencia real. A proxima etapa natural e conectar as telas aos dados reais do Supabase e substituir o motor interno por jobs assincronos persistentes.
