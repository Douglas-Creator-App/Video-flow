# Fase 13 - Export Center, Download em Lote e Kit de Publicacao

Data: 2026-06-08

## Objetivo

Criar uma central para preparar publicacao manual de videos em YouTube, YouTube Shorts, TikTok, Instagram Reels e Facebook Reels.

Nao ha postagem automatica e nenhuma API externa de rede social foi conectada.

## Banco de dados

Novas tabelas em `supabase/schema.sql`:

- `export_packages`
- `video_metadata`
- `bulk_export_jobs`
- `manual_publications`

Todas receberam indices, RLS, policies e realtime.

## Permissoes

Novas permissoes:

- `export_video`
- `download_package`
- `mark_as_published`
- `edit_metadata`

## Rotas

- `/app/export-center`
- `/app/export-center/history`
- `/api/export/packages`

## Export Center

Exibe videos prontos para exportacao com filtros por:

- canal
- projeto
- status
- plataforma
- busca por titulo

Permite:

- preparar pacote
- selecionar multiplos videos
- gerar exportacao em lote mockada
- copiar titulo, descricao, hashtags, tags e comentario fixado
- marcar como publicado manualmente
- abrir geracao de thumbnail quando nao existe thumbnail real

## Metadata Generator

Arquivo: `src/lib/export-center.ts`

Gera:

- titulo principal
- 5 variacoes de titulo
- descricao
- hashtags
- tags
- comentario fixado
- texto de comunidade
- CTA
- SEO score

## Platform Presets

Presets implementados:

- YouTube Longo
- YouTube Shorts
- TikTok
- Instagram Reels
- Facebook Reels

Cada preset define limite de titulo, modo de descricao, obrigatoriedade de thumbnail, hashtags e estilo de CTA.

## ZIP / Pacote

O sistema gera um manifest de pacote com:

- `video-final.mp4`
- `thumbnail.png`
- `titulo.txt`
- `descricao.txt`
- `hashtags.txt`
- `tags.txt`
- `comentario-fixado.txt`
- `metadata.json`

Nesta fase o `package_url` e o ZIP sao placeholders. Em producao, um worker deve montar o ZIP real e salvar em Supabase Storage.

## Checklist

Cada pacote mostra:

- video renderizado
- thumbnail criada
- titulo gerado
- descricao gerada
- hashtags geradas
- pacote baixado
- publicado manualmente

## Integracao com canais

Em `/app/channels/[id]`, foi adicionada a secao `Exportacoes` com:

- pacotes do canal
- prontos
- publicados manualmente
- link para Export Center

## Integracao com calendario

O calendario editorial passou a listar tambem:

- videos prontos para exportar
- videos publicados manualmente

Drag and drop foi marcado como pendente, pois ainda exige persistencia real de agenda.

## Pendencias para producao

- Worker real para gerar ZIP.
- Supabase Storage para salvar pacotes.
- Persistir status de download.
- Persistir publicacao manual com formulario completo.
- Permissoes aplicadas server-side por sessao real.
- Integrar pacote exportado com render real e thumbnail real.
- Adicionar testes de API e UI.
