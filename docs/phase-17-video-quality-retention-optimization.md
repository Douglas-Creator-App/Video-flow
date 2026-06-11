# Fase 17 - Qualidade, Score de Retencao e Otimizacao de Videos

## Objetivo

Criar uma camada de analise antes de exportar/postar videos. A fase recomenda melhorias em gancho, roteiro, narração, ritmo, cenas, thumbnail, legendas e metadados, sem bloquear exportacao e sem substituir conteudo automaticamente.

## Rotas e APIs

- `/app/quality`: dashboard de qualidade, bulk check, medias por canal/template e recomendacoes pendentes.
- `/api/quality/analyze`: analise mockada/free ou IA demo com registro de auditoria como `quality_analysis`.

## Banco de Dados

Tabelas adicionadas:

- `video_quality_scores`
- `video_recommendations`

Recursos:

- RLS habilitado.
- Indices por workspace, video, score, tipo, severidade e status.
- Realtime habilitado.
- Politicas para membros lerem e criadores registrarem analises/recomendacoes.

## Modulos

- Video Quality Score 0-100.
- Retention Analyzer.
- Hook Analyzer.
- Script Improver.
- Scene Pacing.
- Thumbnail Analyzer.
- Subtitle Readability.
- Platform Optimizer.
- Quality Panel no editor.
- Pre-export check no Export Center.
- AI Recommendations.
- Comparacao de versoes.
- Dashboard de qualidade.
- Bulk Quality Check.
- Registro de creditos/uso em modo demo.

## Integracoes

### Editor

O editor exibe o painel `Qualidade` com:

- Score geral.
- Problemas encontrados.
- Sugestoes.
- Botao aplicar correcao.
- Botao ignorar sugestao.
- Analise de retencao, gancho, roteiro, cenas, thumbnail e versoes.

### Export Center

O Export Center mostra checklist pre-exportacao:

- Qualidade acima de 70.
- Thumbnail selecionada.
- Titulo gerado.
- Descricao gerada.
- Legenda revisada.
- Render concluido.

Exportacao permanece permitida com avisos.

### Creditos

Analise simples: gratuita.

Analise IA demo: 6 creditos.

O endpoint registra auditoria com `action_type: quality_analysis`, preparado para persistir em `media_usage_logs`.

## Arquivos Principais

- `src/lib/types.ts`
- `src/lib/mock-data.ts`
- `src/lib/video-quality.ts`
- `src/components/quality/video-quality-panels.tsx`
- `src/app/(app)/app/quality/page.tsx`
- `src/app/api/quality/analyze/route.ts`
- `src/components/media/video-editor.tsx`
- `src/components/export/export-center-dashboard.tsx`
- `supabase/schema.sql`

## Estado Atual

Funcional com dados mockados e arquitetura pronta para conectar analises reais de IA e persistencia Supabase.
