# Phase 4: Content AI Engine

## Scope

Phase 4 implements the first real AI engine for Video Flow. It transforms ideas and user inputs into complete content assets through a secure backend route.

OpenAI is the primary provider. Gemini and Claude are represented in the provider abstraction and database model for future implementation.

## Security Model

- The frontend never calls AI provider APIs directly.
- OpenAI calls are made through `src/app/api/ai/generate/route.ts`.
- `OPENAI_API_KEY` must be configured on the server only.
- Provider API keys are represented as `api_key_encrypted` in `ai_providers`.
- A basic in-memory rate limit protects the generation endpoint in development.
- All generation events are modeled for audit, cost, queue, and history storage.

## OpenAI Integration

The backend uses the OpenAI Responses API at:

`POST https://api.openai.com/v1/responses`

The provider adapter lives in:

- `src/lib/ai/openai-provider.ts`
- `src/lib/ai/provider-registry.ts`
- `src/lib/ai/prompt-builders.ts`

Default model: `gpt-5.2`

## Provider Abstraction

Supported provider registry:

- OpenAI: implemented
- Gemini: adapter placeholder
- Claude: adapter placeholder

The UI and database allow multiple active providers per workspace.

## Routes

Administrative route:

- `/app/ai`

Generators:

- `/app/ai/titles`
- `/app/ai/hooks`
- `/app/ai/scripts`
- `/app/ai/carousels`
- `/app/ai/posts`
- `/app/ai/articles`
- `/app/ai/emails`
- `/app/ai/whatsapp`

Playground:

- `/app/playground`

## Database Tables

### `ai_providers`

Stores provider configuration by workspace:

- provider name
- provider type
- encrypted API key placeholder
- status
- default model
- temperature
- max tokens
- input/output cost

### `prompt_templates`

Professional prompt engine with:

- category
- system prompt
- user prompt
- provider
- model
- status
- version
- parent template for duplication/versioning

### `ai_generations`

Stores:

- provider
- model
- prompt
- response
- input/output tokens
- cost
- duration
- status
- error message

### `ai_generation_jobs`

Queue model with:

- aguardando
- processando
- concluído
- erro

### `ai_agents`

Default and custom agents:

- Copywriter
- SEO
- YouTube
- TikTok
- Reels
- Vendas
- WhatsApp
- VSL

### `playground_messages`

Stores messages for future agent conversations.

### `ai_credit_usage`

Tracks tokens, costs, provider, model, user, and generation.

## Generated Content Modules

Implemented with a shared UI component:

`src/components/ai/ai-generator-panel.tsx`

Each generator sends input to `/api/ai/generate` and renders the response.

The current save buttons are UI-ready; persistence targets are represented in `ai_generations`, `content_items`, and related tables.

## Prompt Engine

Prompt building is centralized in:

`src/lib/ai/prompt-builders.ts`

This keeps prompt composition out of UI components and prepares future template lookup from Supabase.

## Notes

To run real OpenAI generation, set:

```env
OPENAI_API_KEY=sk-your-openai-key
```

Do not expose this value through `NEXT_PUBLIC_*`.
