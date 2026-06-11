# Fase R3 - Real Export Engine

## Implementado

- Servico `src/lib/export/export-package.ts`.
- ZIP writer sem dependencia externa em `src/lib/export/zip-writer.ts`.
- API `POST /api/export/package`.
- Integracao com `/api/export/packages`.
- Export Center chama a API real.
- Export simples e export em lote.
- Metadados gerados por provider OpenAI Text da R1 quando nao existem, com fallback.

## Conteudo do ZIP

- `video.mp4`
- `thumbnail.png`
- `title.txt`
- `description.txt`
- `hashtags.txt`
- `tags.txt`
- `pinned_comment.txt`
- `metadata.json`

## Regras

O ZIP real so e criado quando:

- `video_project.renderUrl` existe
- `renderUrl` e artefato verificavel
- arquivo MP4 existe em `public/renders`, `public/previews`, storage local ou URL real
- thumbnail existe

Se o video nao estiver renderizado, a API retorna erro claro e nao libera download.

## Status deste ambiente

Como a Fase R2 depende de FFmpeg e FFmpeg nao esta instalado neste ambiente, os videos mockados atuais nao possuem MP4 real verificavel. Portanto R3 esta implementada, mas o teste de ZIP real depende primeiro de gerar um MP4 real pela R2.

## Ainda pendente

- Upload do ZIP para Supabase Storage bucket `exports`.
- Persistencia real em `export_packages`, `bulk_export_jobs`, `credit_transactions` e `media_usage_logs`.
- Download historico persistido com usuario real.
