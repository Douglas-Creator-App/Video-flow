import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/",
  "/terms",
  "/privacy",
  "/auth/login",
  "/auth/reset-password",
  "/auth/confirm-email",
  "/auth/callback",
  "/login",
  "/signup",
  "/webhooks"
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next({ request: { headers: request.headers } });
  type CookieToSet = { name: string; value: string; options?: Parameters<typeof response.cookies.set>[2] };
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        }
      }
    }
  );

  const { data } = await supabase.auth.getUser();
  const isAuthenticated = Boolean(data.user);
  const isPublic = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const isApi = pathname.startsWith("/api/");

  if (isAuthenticated && (pathname === "/auth/login" || pathname === "/login")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isAuthenticated && !isPublic) {
    if (isApi) {
      return NextResponse.json({ status: "unauthorized", error: "Autenticacao obrigatoria." }, { status: 401 });
    }
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"
  ]
};
