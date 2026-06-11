const requiredServerKeys = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "APP_URL", "NODE_ENV"] as const;
const optionalServerKeys = ["OPENAI_API_KEY", "ELEVENLABS_API_KEY", "STORAGE_BUCKETS", "MEDIA_SIGNED_URL_TTL_SECONDS"] as const;

export type EnvKey = (typeof requiredServerKeys)[number] | (typeof optionalServerKeys)[number];

export type EnvValidationResult = {
  ok: boolean;
  missing: EnvKey[];
  invalid: EnvKey[];
  values: Record<EnvKey, string | undefined>;
};

export function validateEnv(options: { productionStrict?: boolean } = {}): EnvValidationResult {
  const productionStrict = options.productionStrict ?? process.env.NODE_ENV === "production";
  const values = Object.fromEntries([...requiredServerKeys, ...optionalServerKeys].map((key) => [key, process.env[key]])) as Record<EnvKey, string | undefined>;
  const missing = requiredServerKeys.filter((key) => !values[key]);
  const invalid: EnvKey[] = [];

  if (values.NEXT_PUBLIC_SUPABASE_URL && !isValidHttpUrl(values.NEXT_PUBLIC_SUPABASE_URL)) invalid.push("NEXT_PUBLIC_SUPABASE_URL");
  if (values.APP_URL && !isValidHttpUrl(values.APP_URL)) invalid.push("APP_URL");
  if (values.NODE_ENV && !["development", "test", "production"].includes(values.NODE_ENV)) invalid.push("NODE_ENV");
  if (values.NEXT_PUBLIC_SUPABASE_ANON_KEY && values.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes("your-")) invalid.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (values.SUPABASE_SERVICE_ROLE_KEY && values.SUPABASE_SERVICE_ROLE_KEY.includes("server-only")) invalid.push("SUPABASE_SERVICE_ROLE_KEY");

  return {
    ok: productionStrict ? missing.length === 0 && invalid.length === 0 : invalid.length === 0,
    missing: productionStrict ? [...missing] : missing.filter((key) => key !== "SUPABASE_SERVICE_ROLE_KEY"),
    invalid,
    values
  };
}

export function assertServerEnv() {
  const result = validateEnv({ productionStrict: true });
  if (!result.ok) {
    const parts = [
      result.missing.length ? `ausentes: ${result.missing.join(", ")}` : "",
      result.invalid.length ? `invalidas: ${result.invalid.join(", ")}` : ""
    ].filter(Boolean);
    throw new Error(`Variaveis de ambiente obrigatorias invalidas (${parts.join("; ")}).`);
  }
  return result.values;
}

export function getStorageBuckets() {
  return (process.env.STORAGE_BUCKETS ?? "videos,thumbnails,exports,audio,images,temp")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}
