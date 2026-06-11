# Fase R6 - Providers reais de IA, audio, imagem e video

## Objetivo

Esta fase conecta a plataforma a providers reais de conteudo, sem depender de simulacao silenciosa nos fluxos principais.

## O que foi preparado

- `OpenAI` para texto, imagem e TTS.
- `ElevenLabs` para TTS.
- `Runway`, `Kling`, `Pika`, `Veo` e `Luma` como base arquitetural para video.
- Camada de roteamento em backend para evitar chamadas diretas do frontend.
- Status de providers via API.
- Endpoint de teste controlado por backend.

## Variaveis de ambiente

- `OPENAI_API_KEY`
- `OPENAI_TEXT_MODEL`
- `OPENAI_TTS_MODEL`
- `OPENAI_IMAGE_MODEL`
- `ELEVENLABS_API_KEY`
- `RUNWAY_API_KEY`
- `KLING_API_KEY`
- `PIKA_API_KEY`
- `VEO_API_KEY`
- `LUMA_API_KEY`
- `DEFAULT_TTS_PROVIDER`
- `DEFAULT_VIDEO_PROVIDER`
- `PROVIDER_ALLOW_MOCK_FALLBACK`

## Rotas novas

- `GET /api/providers/status`
- `POST /api/providers/test`
- `POST /api/ai/text`
- `POST /api/ai/images`
- `POST /api/media/images`
- `POST /api/media/tts`
- `POST /api/media/thumbnails`

## Comportamento real

- Se a chave do provider nao existir, o fluxo falha com erro claro.
- Se houver fallback tecnico no provider base, os wrappers estritos bloqueiam a conclusao sem autorizacao explicita.
- Logs de uso de provider e de midia continuam sendo registrados.

## Video IA

O suporte arquitetural para video esta pronto, mas a geracao real ainda depende da implementacao HTTP especifica de cada provider externo e das credenciais validas.

## Validacao

Executar:

```bash
npm.cmd run typecheck
npm.cmd run build
```

## Observacao

Esta fase prioriza verdade operacional. Nenhum endpoint novo deve retornar sucesso real sem artefato real ou provider configurado.
