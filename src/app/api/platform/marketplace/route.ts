import { NextResponse, type NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

const listingTypes = ["template", "agent", "workflow"];
const pricingTypes = ["free", "premium", "community"];

export async function GET(request: NextRequest) {
  if (!isSupabaseAdminConfigured()) return NextResponse.json({ listings: [], source: "supabase_unconfigured" });
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const status = searchParams.get("status") ?? "published";
  let query = createAdminClient()
    .from("marketplace_listings")
    .select("*")
    .eq("status", status)
    .order("is_featured", { ascending: false })
    .order("usage_count", { ascending: false })
    .limit(100);
  if (type && listingTypes.includes(type)) query = query.eq("type", type);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ listings: data ?? [], source: "supabase" });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const workspaceId = String(body.workspace_id ?? "");
  if (!workspaceId) return NextResponse.json({ error: "workspace_id obrigatorio." }, { status: 400 });
  const context = await requirePermission(workspaceId, "content.create");
  if (!isSupabaseAdminConfigured()) return NextResponse.json({ error: "Supabase admin nao configurado." }, { status: 503 });

  const type = listingTypes.includes(String(body.type)) ? String(body.type) : "template";
  const pricingType = pricingTypes.includes(String(body.pricing_type)) ? String(body.pricing_type) : "community";
  const { data, error } = await createAdminClient().from("marketplace_listings").insert({
    workspace_id: workspaceId,
    creator_user_id: context.user.id,
    type,
    name: String(body.name ?? "Novo item"),
    description: body.description ?? null,
    category: body.category ?? null,
    niche: body.niche ?? null,
    pricing_type: pricingType,
    price: Number(body.price ?? 0),
    status: "review",
    metadata: body.metadata ?? {}
  }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ listing: data, status: "review" });
}
