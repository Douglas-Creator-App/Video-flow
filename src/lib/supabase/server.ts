import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  type CookieToSet = {
    name: string;
    value: string;
    options?: Parameters<typeof cookieStore.set>[2];
  };

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return createMissingClient(cookieStore);
  }

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot set cookies; middleware handles session refresh.
        }
      }
    }
  });
}

function createMissingClient(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  const error = new Error("Supabase nao configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  return {
    auth: {
      async exchangeCodeForSession() {
        return { data: { session: null }, error };
      },
      async getSession() {
        return { data: { session: null }, error };
      },
      async getUser() {
        return { data: { user: null }, error };
      }
    },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {}
    }
  } as unknown as ReturnType<typeof createServerClient>;
}
