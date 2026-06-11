import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export async function GET() {
  await requireAdmin();
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ source: "supabase_unconfigured", jobs: [], audit: [], security: [], rateLimits: [] });
  }

  const supabase = createAdminClient();
  const [jobs, audit, security, rateLimits] = await Promise.all([
    supabase.from("background_job_logs").select("*").order("created_at", { ascending: false }).limit(80),
    supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(80),
    supabase.from("security_events").select("*").order("created_at", { ascending: false }).limit(80),
    supabase.from("rate_limit_events").select("*").order("created_at", { ascending: false }).limit(80)
  ]);

  const errors = [jobs.error, audit.error, security.error, rateLimits.error].filter(Boolean).map((error) => error?.message);
  return NextResponse.json({
    source: "supabase",
    errors,
    jobs: jobs.data ?? [],
    audit: audit.data ?? [],
    security: security.data ?? [],
    rateLimits: rateLimits.data ?? []
  });
}
