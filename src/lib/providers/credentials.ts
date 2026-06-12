import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

// Chaves de provedores que podem ser gerenciadas pela UI e hidratadas no runtime.
// Chaves de infraestrutura (Supabase, storage) ficam fora de proposito: apenas .env.
export const MANAGED_PROVIDER_KEYS = [
  "OPENAI_API_KEY",
  "ELEVENLABS_API_KEY",
  "RUNWAY_API_KEY",
  "KLING_API_KEY",
  "PIKA_API_KEY",
  "VEO_API_KEY",
  "LUMA_API_KEY",
  "PEXELS_API_KEY",
  "PIXABAY_API_KEY",
  "UNSPLASH_ACCESS_KEY"
] as const;

export type ManagedProviderKey = (typeof MANAGED_PROVIDER_KEYS)[number];

export function isManagedProviderKey(value: string): value is ManagedProviderKey {
  return (MANAGED_PROVIDER_KEYS as readonly string[]).includes(value);
}

const CACHE_TTL_MS = 60_000;
let lastLoadedAt = 0;
let pendingLoad: Promise<void> | null = null;

/**
 * Carrega as credenciais salvas no Supabase e aplica em process.env.
 * Valores salvos pela UI tem prioridade sobre o .env para permitir
 * atualizacao de chave sem reiniciar o servidor/worker.
 */
export async function ensureProviderCredentials(force = false) {
  if (!isSupabaseAdminConfigured()) return;
  const now = Date.now();
  if (!force && now - lastLoadedAt < CACHE_TTL_MS) return;
  if (pendingLoad) return pendingLoad;

  pendingLoad = (async () => {
    const { data, error } = await createAdminClient()
      .from("provider_credentials")
      .select("key_name, key_value");
    if (error) {
      // Tabela ausente ou erro transitorio: mantem o .env como fonte.
      return;
    }
    for (const row of data ?? []) {
      if (isManagedProviderKey(row.key_name) && row.key_value) {
        process.env[row.key_name] = row.key_value;
      }
    }
    lastLoadedAt = Date.now();
  })().finally(() => {
    pendingLoad = null;
  });
  return pendingLoad;
}

export function maskCredential(value: string) {
  if (value.length <= 8) return "••••";
  return `${value.slice(0, 4)}…${value.slice(-4)}`;
}
