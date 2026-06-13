-- C13: BYOK (Bring Your Own Key) — chaves de API por USUÁRIO, criptografadas.
-- Cada usuário guarda as próprias chaves de provedor (OpenAI, ElevenLabs, etc).
-- O valor é criptografado pela aplicação (AES-256-GCM) antes de salvar.

-- A versão antiga (C9) era global (uma chave por provider no sistema inteiro).
-- Recriamos como por-usuário.
drop table if exists public.provider_credentials cascade;

create table public.provider_credentials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  key_name text not null,
  key_value text not null, -- valor criptografado (iv:authTag:ciphertext em base64)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, key_name)
);

comment on table public.provider_credentials is
  'Chaves de API por usuário (BYOK), criptografadas pela aplicação. Acesso só via service role.';

create index idx_provider_credentials_user on public.provider_credentials(user_id);

alter table public.provider_credentials enable row level security;

-- Sem policies para anon/authenticated: somente o backend (service role) lê/escreve.
-- O usuário gerencia as próprias chaves através das rotas autenticadas da aplicação.
