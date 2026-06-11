# Fase R4.1 - FFmpeg e Validacao E2E

## Objetivo

Validar o pipeline real:

```text
Magic Mode -> Job assincrono -> Render worker -> MP4 real -> Export worker -> ZIP real -> Download final
```

Sem marcar sucesso quando o artefato real nao existe.

## Estado deste ambiente

Resultado local em Windows:

```text
ffmpeg -version
FFmpeg nao encontrado no PATH

ffprobe -version
ffprobe nao encontrado no PATH
```

Por isso, o teste de render real ficou corretamente bloqueado. O worker nao finge sucesso.

Erro validado:

```text
FFmpeg não está instalado ou não está disponível no PATH.
```

## Implementacao

### Helper FFmpeg

Arquivo:

```text
src/lib/media/ffmpeg.ts
```

Funcoes:

- `checkFfmpegAvailable()`
- `getFfmpegVersion()`
- `assertFfmpegAvailable()`
- `runFfmpeg()`
- `extractFrameThumbnail()`
- `validateMp4Artifact()`

### Render worker

Arquivo:

```text
src/workers/handlers/render-video.ts
```

Antes de renderizar, o worker:

1. valida FFmpeg;
2. registra log no job;
3. falha com erro claro se ausente;
4. chama o renderer real apenas quando FFmpeg esta disponivel.

### Renderer

Arquivo:

```text
src/lib/render/ffmpeg-renderer.ts
```

Agora o renderer:

- valida tamanho do MP4;
- tenta validar duracao via `ffprobe`;
- gera thumbnail do frame inicial;
- valida thumbnail;
- grava artefato real no registry local.

### Registry local de renders

Arquivo:

```text
src/lib/media/render-artifacts.ts
```

Persistencia dev:

```text
.data/render-artifacts.json
```

Esse registry representa, em desenvolvimento, o papel futuro de `video_renders.render_url`. Ele so grava render concluido se o arquivo real existir.

### Export worker

Arquivo:

```text
src/lib/export/export-package.ts
```

O export real agora procura render em:

1. `video_projects.renderUrl`;
2. ultimo render real no registry local;
3. `videoRenders` existente, somente se nao for mock.

Thumbnail segue fallback:

1. thumbnail do projeto;
2. thumbnail gerada;
3. thumbnail do render;
4. frame extraido do MP4 com FFmpeg;
5. erro claro se nada funcionar.

## Como instalar FFmpeg no Windows

Opcao winget:

```powershell
winget install Gyan.FFmpeg
```

Opcao Chocolatey:

```powershell
choco install ffmpeg
```

Opcao manual:

1. Baixar build em `https://www.gyan.dev/ffmpeg/builds/`.
2. Extrair para `C:\ffmpeg`.
3. Adicionar `C:\ffmpeg\bin` ao PATH do usuario ou do sistema.
4. Fechar e abrir novamente o terminal.

Validar:

```powershell
ffmpeg -version
ffprobe -version
```

Alternativa sem PATH:

```env
FFMPEG_PATH=C:\ffmpeg\bin\ffmpeg.exe
FFPROBE_PATH=C:\ffmpeg\bin\ffprobe.exe
```

## Como instalar em producao

Linux/Debian/Ubuntu:

```bash
apt-get update
apt-get install -y ffmpeg
ffmpeg -version
ffprobe -version
```

Docker:

```dockerfile
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*
```

Servicos serverless:

- usar runtime com FFmpeg empacotado;
- ou worker dedicado em container;
- evitar render pesado em request HTTP.

## Como rodar worker

```bash
npm run worker
```

Sem worker continuo, usar:

```text
/app/queue -> Processar proximo job
```

## Como rodar teste ponta a ponta

1. Abrir Magic Mode.
2. Criar video.
3. Confirmar job `magic_video` em `/app/queue`.
4. Processar/concluir job.
5. Abrir editor do video.
6. Clicar em Renderizar.
7. Confirmar job `render_video`.
8. Rodar worker ate concluir.
9. Validar arquivo em:

```text
public/renders/*.mp4
public/thumbnails/*
.data/render-artifacts.json
```

10. Abrir Export Center.
11. Gerar pacote.
12. Confirmar job `export_package`.
13. Rodar worker ate concluir.
14. Validar ZIP em:

```text
public/exports/*.zip
```

15. Baixar ZIP e conferir:

```text
/video.mp4
/thumbnail.png
/title.txt
/description.txt
/hashtags.txt
/tags.txt
/pinned_comment.txt
/metadata.json
```

## Resultado do teste neste ambiente

Foi criado um job `render_video` real via worker.

Resultado:

```json
{
  "processStatus": "failed",
  "finalStatus": "retrying",
  "error": "FFmpeg não está instalado ou não está disponível no PATH."
}
```

Logs gerados:

```text
Job enfileirado
Job travado pelo worker
Iniciando handler render_video
Job falhou: FFmpeg não está instalado ou não está disponível no PATH.
```

Isso confirma que:

- o job aparece na fila;
- o worker processa;
- a ausencia de FFmpeg falha com erro claro;
- nao existe MP4/ZIP falso marcado como sucesso.

## Checklist final

- [x] FFmpeg detectado corretamente como ausente.
- [x] Erro claro implementado.
- [x] Render worker valida FFmpeg antes do render.
- [x] MP4 validado por tamanho e duracao quando FFmpeg/ffprobe existirem.
- [x] Thumbnail real validada.
- [x] Fallback por frame do MP4 implementado no export.
- [x] Export worker depende de MP4/thumbnail reais.
- [x] Registry local de render criado para dev.
- [x] Logs aparecem em `/app/queue`.
- [x] Health continua usando heartbeat da R4.
- [x] Typecheck passando.
- [ ] Teste MP4 real concluido neste Windows: bloqueado ate instalar FFmpeg.
- [ ] ZIP real do fluxo completo concluido neste Windows: depende do MP4 real.
