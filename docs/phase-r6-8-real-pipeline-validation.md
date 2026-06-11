# Fase R6.8 - Pipeline Real End-to-End Magic -> Render -> Export

## Objetivo

Validar e preparar o primeiro fluxo real do nucleo do Video Flow:

Magic Mode -> roteiro -> cenas -> TTS -> imagens -> thumbnail -> render FFmpeg -> Export ZIP -> download.

Esta fase nao cria novos modulos de produto. Ela conecta os fluxos centrais existentes a usuario, workspace, billing, jobs, storage e banco reais.

## Requisitos para executar o teste real

- Usuario autenticado no Supabase Auth.
- Workspace real com membership ativo.
- Permissao `content.create` para Magic/render.
- Permissao `export_video` para export.
- `NEXT_PUBLIC_SUPABASE_URL`.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- `SUPABASE_SERVICE_ROLE_KEY`.
- Buckets de storage: `videos`, `thumbnails`, `exports`, `audio`, `images`, `temp`.
- `OPENAI_API_KEY` para TTS e imagens reais.
- FFmpeg instalado e disponivel no PATH.
- Worker ativo com `npm.cmd run worker` ou processamento manual por `/app/queue`.

## Estado do ambiente local desta validacao

Durante a validacao local desta fase:

- `npm.cmd run typecheck` passou.
- `ffmpeg -version` falhou porque FFmpeg nao esta no PATH.
- `.env` e `.env.local` nao existem no workspace.
- Por isso, o smoke test real ponta a ponta nao foi executado localmente.

O sistema esta preparado para falhar de forma clara nesses casos:

- Sem FFmpeg: o render worker retorna erro de FFmpeg ausente.
- Sem Supabase real: o Magic worker falha ao tentar persistir projeto/cenas/assets.
- Sem OpenAI real: Magic falha em TTS ou imagens, sem marcar sucesso mockado.
- Sem Storage: artefatos data URL nao sao materializados como arquivos reais.

## Implementacao entregue

### 1. Repositorio real de video

Arquivo: `src/lib/video/video-repository.ts`

Responsabilidades:

- Persistir `video_projects`.
- Persistir `video_scenes`.
- Persistir `subtitle_segments`.
- Persistir `media_assets`.
- Materializar data URLs reais em Supabase Storage.
- Ler bundle real de video para render.
- Persistir `video_renders`.
- Ler ultimo render real.
- Persistir `video_metadata`.
- Persistir `export_packages`.

### 2. Magic Mode real

O worker `magic_video` agora:

- exige `workspaceId` real;
- gera roteiro;
- gera TTS real com OpenAI;
- gera imagem real por cena com OpenAI Images;
- falha se OpenAI retornar mock/fallback;
- cria IDs UUID reais;
- persiste projeto, cenas, legendas e assets no Supabase;
- registra uso em `media_usage_logs`;
- registra provider usage em `provider_usage_logs`;
- mantem logs em `background_job_logs`.

### 3. Render real

O render FFmpeg agora:

- busca primeiro o bundle real em `video_projects`, `video_scenes`, `subtitle_segments` e `media_assets`;
- baixa assets do Supabase Storage para diretório temporario;
- renderiza cenas via FFmpeg;
- gera MP4 real;
- extrai thumbnail real;
- envia MP4 e thumbnail para Supabase Storage quando configurado;
- persiste `video_renders`;
- atualiza `video_projects.render_url`, `thumbnail_url` e status.

### 4. Export real

O export ZIP agora:

- busca o projeto real no Supabase;
- valida `render_url` real;
- valida thumbnail real ou extrai frame quando aplicavel;
- busca ou gera `video_metadata`;
- cria ZIP com:
  - `video.mp4`
  - `thumbnail.png`
  - `title.txt`
  - `description.txt`
  - `hashtags.txt`
  - `tags.txt`
  - `pinned_comment.txt`
  - `metadata.json`
- envia ZIP para Supabase Storage quando configurado;
- persiste `export_packages`.

### 5. Pipeline Execution View

A tela `/app/queue` ganhou uma visualizacao simples do job selecionado:

- Magic
- Projeto
- TTS
- Imagens
- Render
- Export ZIP
- Artefatos detectados

Ela usa o resultado do job e logs reais para mostrar progresso operacional.

## Smoke test oficial

### Roteiro

1. Configurar `.env.local` com Supabase, service role e OpenAI.
2. Confirmar FFmpeg:

```powershell
ffmpeg -version
```

3. Subir app:

```powershell
npm.cmd run dev
```

4. Rodar worker:

```powershell
npm.cmd run worker
```

5. Entrar com usuario real.
6. Selecionar workspace real no header.
7. Abrir `/app/magic`.
8. Calcular custo.
9. Criar job Magic.
10. Abrir `/app/queue`.
11. Confirmar logs:
    - roteiro;
    - TTS;
    - imagens;
    - persistencia Supabase.
12. Abrir editor do `videoProjectId` retornado.
13. Solicitar render final.
14. Confirmar `video_renders.render_url`.
15. Abrir `/app/export-center`.
16. Gerar pacote para plataforma alvo.
17. Confirmar `export_packages.package_url`.
18. Baixar ZIP via signed URL.
19. Validar conteudo do ZIP.

### Resultado local

Nao executado ponta a ponta neste ambiente porque:

- FFmpeg nao esta instalado/disponivel no PATH.
- Variaveis `.env`/`.env.local` nao existem no workspace.

## Troubleshooting

### FFmpeg ausente

Erro esperado:

```text
FFmpeg nao esta instalado ou nao esta disponivel no PATH.
```

Correcao:

- instalar FFmpeg no Windows;
- adicionar `bin` ao PATH;
- reabrir terminal;
- validar `ffmpeg -version`.

### OpenAI ausente

Erro esperado:

```text
TTS real indisponivel. Configure OPENAI_API_KEY antes de executar o pipeline real.
```

ou

```text
Imagem real indisponivel para cena X. Configure OPENAI_API_KEY antes de executar o pipeline real.
```

### Storage ausente

Erro esperado:

```text
Supabase Storage nao configurado para materializar artefato real.
```

### Supabase ausente

Erro esperado:

```text
Supabase real nao configurado para persistir o Magic Mode.
```

## Checklist R6.8

- Pipeline real conectado ao workspace real.
- Magic nao marca sucesso com mock/fallback.
- Projeto real persistido.
- Cenas reais persistidas.
- Assets reais persistidos.
- Render le projeto real.
- Render persiste `video_renders`.
- Export le projeto/render real.
- Export persiste `export_packages`.
- Logs em `background_job_logs`.
- Creditos via reserva/settle da job queue Supabase.
- `media_usage_logs` para Magic, render e export.
- `provider_usage_logs` para Magic.
- Pipeline Execution View em `/app/queue`.
- Typecheck passando.
- Build passando.
