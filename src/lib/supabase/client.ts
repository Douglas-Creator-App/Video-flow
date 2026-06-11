import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return createMissingClient();
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function createMissingClient() {
  const error = new Error("Supabase nao configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  return {
    auth: {
      async signInWithPassword() {
        return { data: { user: null, session: null }, error };
      },
      async signInWithOAuth() {
        return { data: { provider: null, url: null }, error };
      },
      async resetPasswordForEmail() {
        return { data: null, error };
      },
      async signOut() {
        return { error };
      },
      async getSession() {
        return { data: { session: null }, error };
      },
      async getUser() {
        return { data: { user: null }, error };
      },
      onAuthStateChange() {
        return { data: { subscription: { unsubscribe() {} } } };
      },
      async exchangeCodeForSession() {
        return { data: { session: null }, error };
      }
    }
  } as unknown as ReturnType<typeof createBrowserClient>;
}
