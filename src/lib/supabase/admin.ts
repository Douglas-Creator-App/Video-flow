import { createClient } from "@supabase/supabase-js";
import { validateEnv } from "@/lib/env";

export function isSupabaseAdminConfigured() {
  const env = validateEnv({ productionStrict: false });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(env.invalid.length === 0 && url && key && !url.includes("your-project") && !key.includes("server-only"));
}

export function createAdminClient() {
  if (!isSupabaseAdminConfigured()) {
    throw new Error("Supabase service role nao configurada. Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.");
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}
