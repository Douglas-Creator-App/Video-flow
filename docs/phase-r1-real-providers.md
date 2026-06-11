# Fase R1 - Real Providers

## Implementado

Providers server-side:

- `src/lib/providers/openai-text.ts`
- `src/lib/providers/openai-tts.ts`
- `src/lib/providers/openai-images.ts`
- `src/lib/providers/elevenlabs.ts`
- `src/lib/providers/pexels.ts`
- `src/lib/providers/pixabay.ts`
- `src/lib/providers/unsplash.ts`

Rotas backend:

- `/api/ai/text`
- `/api/ai/tts`
- `/api/ai/images`
- `/api/providers/elevenlabs/voices`
- `/api/assets/search`
- `/api/assets/import`
- rotas existentes `/api/media/tts` e `/api/media/images` continuam compativeis

## Variaveis

- `OPENAI_API_KEY`
- `ELEVENLABS_API_KEY`
- `PEXELS_API_KEY`
- `PIXABAY_API_KEY`
- `UNSPLASH_ACCESS_KEY`

Nenhuma chave e exposta para o frontend.

## Fallback

Quando a chave esta ausente, o provider retorna:

- `providerMode: "mock"`
- `is_demo: true`
- `warning` amigavel

Quando a chave existe, a rota chama o provider real pelo backend.

## Custos e logs

As rotas retornam custo estimado e registram audit logs. A persistencia fisica em `ai_generations`, `audio_generations`, `image_generations`, `media_usage_logs` e `credit_transactions` ainda depende de conectar Supabase server-side real com service role.

## Ainda mockado

- Render MP4 real
- ZIP/export real
- Workers reais
- Upload de assets para Supabase Storage
- Reconciliacao financeira real com provider billing
