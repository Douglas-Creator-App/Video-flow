import { AsyncLocalStorage } from "node:async_hooks";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

// Chaves de provedores que cada usuário pode configurar (modelo BYOK).
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

// ---------------------------------------------------------------------------
// Criptografia das chaves dos clientes (AES-256-GCM).
// A chave de criptografia vem de AI_ENCRYPTION_KEY; derivamos 32 bytes via SHA-256
// para aceitar qualquer string de configuração.
// ---------------------------------------------------------------------------
function encryptionKey() {
  const secret = process.env.AI_ENCRYPTION_KEY || "video-flow-default-dev-key-change-me";
  return createHash("sha256").update(secret).digest(); // 32 bytes
}

export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${authTag.toString("base64")}:${ciphertext.toString("base64")}`;
}

export function decryptSecret(stored: string): string {
  const [ivB64, tagB64, dataB64] = stored.split(":");
  if (!ivB64 || !tagB64 || !dataB64) {
    // Valor legado/sem criptografia: devolve como está (tolerância).
    return stored;
  }
  try {
    const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(ivB64, "base64"));
    decipher.setAuthTag(Buffer.from(tagB64, "base64"));
    return Buffer.concat([decipher.update(Buffer.from(dataB64, "base64")), decipher.final()]).toString("utf8");
  } catch {
    return "";
  }
}

// ---------------------------------------------------------------------------
// Contexto por requisição/job: guarda as chaves do usuário atual.
// getProviderKey() lê primeiro do contexto; se não houver, cai no process.env
// (útil para o dono da plataforma em dev e para chaves de infraestrutura).
// ---------------------------------------------------------------------------
type CredentialStore = Map<string, string>;
const credentialContext = new AsyncLocalStorage<CredentialStore>();

export function getProviderKey(name: string): string | undefined {
  const store = credentialContext.getStore();
  const fromUser = store?.get(name);
  if (fromUser) return fromUser;
  return process.env[name] || undefined;
}

export async function getUserProviderKeys(userId: string): Promise<CredentialStore> {
  const store: CredentialStore = new Map();
  if (!userId || !isSupabaseAdminConfigured()) return store;
  const { data, error } = await createAdminClient()
    .from("provider_credentials")
    .select("key_name, key_value")
    .eq("user_id", userId);
  if (error || !data) return store;
  for (const row of data) {
    if (isManagedProviderKey(row.key_name) && row.key_value) {
      const value = decryptSecret(row.key_value);
      if (value) store.set(row.key_name, value);
    }
  }
  return store;
}

/** Executa `fn` com as chaves do usuário disponíveis em getProviderKey(). */
export async function runWithUserCredentials<T>(userId: string | undefined, fn: () => Promise<T>): Promise<T> {
  if (!userId) return fn();
  const store = await getUserProviderKeys(userId);
  return credentialContext.run(store, fn);
}

// ---------------------------------------------------------------------------
// Gestão das chaves (usado pela tela de Configuração).
// ---------------------------------------------------------------------------
export type ProviderKeyStatus = {
  key_name: ManagedProviderKey;
  configured: boolean;
  masked: string | null;
  updated_at: string | null;
};

export async function getUserProviderKeyStatuses(userId: string): Promise<ProviderKeyStatus[]> {
  const stored = new Map<string, { value: string; updated_at: string }>();
  if (isSupabaseAdminConfigured()) {
    const { data } = await createAdminClient()
      .from("provider_credentials")
      .select("key_name, key_value, updated_at")
      .eq("user_id", userId);
    for (const row of data ?? []) {
      stored.set(row.key_name, { value: decryptSecret(row.key_value), updated_at: row.updated_at });
    }
  }
  return MANAGED_PROVIDER_KEYS.map((keyName) => {
    const row = stored.get(keyName);
    return {
      key_name: keyName,
      configured: Boolean(row?.value),
      masked: row?.value ? maskCredential(row.value) : null,
      updated_at: row?.updated_at ?? null
    };
  });
}

export async function setUserProviderKey(userId: string, keyName: ManagedProviderKey, rawValue: string) {
  const admin = createAdminClient();
  const value = rawValue.trim();
  if (!value) {
    const { error } = await admin.from("provider_credentials").delete().eq("user_id", userId).eq("key_name", keyName);
    if (error) throw new Error(`Falha ao remover chave: ${error.message}`);
    return { removed: true };
  }
  const { error } = await admin.from("provider_credentials").upsert(
    { user_id: userId, key_name: keyName, key_value: encryptSecret(value), updated_at: new Date().toISOString() },
    { onConflict: "user_id,key_name" }
  );
  if (error) throw new Error(`Falha ao salvar chave: ${error.message}`);
  return { saved: true, masked: maskCredential(value) };
}

export function maskCredential(value: string) {
  if (value.length <= 8) return "••••";
  return `${value.slice(0, 4)}…${value.slice(-4)}`;
}
