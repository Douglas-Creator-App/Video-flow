# Fase R2 - Real Render Engine com FFmpeg

## Implementado

- Utilitario `src/lib/render/ffmpeg-check.ts` para validar FFmpeg.
- Engine `src/lib/render/ffmpeg-renderer.ts`.
- API `POST /api/render/video`.
- Compatibilidade mantida em `POST /api/media/render`.
- Editor passa a chamar `/api/render/video`.
- Saidas locais preparadas:
  - `public/renders`
  - `public/previews`
  - `public/thumbnails`

## Status deste ambiente

FFmpeg nao esta instalado neste ambiente. O comando `ffmpeg -version` falhou.

Por isso, a API nao finge render real. Ela retorna erro claro:

`Render engine nao configurado: FFmpeg nao esta instalado ou FFMPEG_PATH esta incorreto.`

## Como habilitar no Windows

1. Instalar FFmpeg.
2. Adicionar `ffmpeg.exe` ao PATH, ou configurar:

```env
FFMPEG_PATH=C:\ffmpeg\bin\ffmpeg.exe
```

3. Reiniciar o servidor Next.js.
4. Chamar:

```http
POST /api/render/video
{
  "video_project_id": "video_1",
  "quality": "preview"
}
```

## Suporte preparado

- MP4 preview/final
- 9:16, 16:9 e 1:1
- cenas com imagens locais
- cenas com videos locais
- fallback visual quando asset esta ausente
- legendas SRT via filtro `subtitles`
- thumbnail do frame inicial
- logs tecnicos
- bloqueio sem saldo
- erro amigavel sem FFmpeg

## Ainda pendente

- Upload real para Supabase Storage.
- Persistencia real em `video_renders` e `media_usage_logs` via service role.
- Mix completo de narracao/musica com normalizacao fina.
- Transicoes avancadas entre cenas.
