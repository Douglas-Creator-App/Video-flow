import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export async function GET() {
  await requireAdmin();
  if (!isSupabaseAdminConfigured()) return NextResponse.json(empty("supabase_unconfigured"));
  const supabase = createAdminClient();
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  const [keys, webhooks, deliveries, listings, usage, pools, orgs] = await Promise.all([
    supabase.from("public_api_keys").select("id, workspace_id, scopes, status, last_used_at, created_at").limit(5000),
    supabase.from("webhook_endpoints").select("id, workspace_id, events, status, created_at").limit(5000),
    supabase.from("webhook_deliveries").select("id, workspace_id, event_type, status, http_status, created_at").gte("created_at", monthStart.toISOString()).limit(10000),
    supabase.from("marketplace_listings").select("id, type, pricing_type, status, usage_count, revenue, created_at").limit(5000),
    supabase.from("platform_usage_events").select("event_type, resource_type, workspace_id, created_at").gte("created_at", monthStart.toISOString()).limit(10000),
    supabase.from("corporate_credit_pools").select("id, balance, reserved, status").limit(1000),
    supabase.from("workspace_organizations").select("id, status").limit(1000)
  ]);
  const errors = [keys.error, webhooks.error, deliveries.error, listings.error, usage.error, pools.error, orgs.error].filter(Boolean).map((error) => error?.message);
  const listingRows = rows(listings.data);
  const deliveryRows = rows(deliveries.data);
  const usageRows = rows(usage.data);

  return NextResponse.json({
    source: "supabase",
    errors,
    totals: {
      apiKeys: rows(keys.data).length,
      activeApiKeys: rows(keys.data).filter((row) => row.status === "active").length,
      webhooks: rows(webhooks.data).length,
      webhookDeliveriesThisMonth: deliveryRows.length,
      webhookFailureRate: rate(deliveryRows.filter((row) => row.status === "failed").length, deliveryRows.length),
      marketplaceListings: listingRows.length,
      marketplaceRevenue: listingRows.reduce((total, row) => total + amount(row.revenue), 0),
      platformEventsThisMonth: usageRows.length,
      organizations: rows(orgs.data).length,
      creditPools: rows(pools.data).length,
      corporateCreditsAvailable: rows(pools.data).reduce((total, row) => total + amount(row.balance) - amount(row.reserved), 0)
    },
    marketplace: {
      templates: summarizeListings(listingRows, "template"),
      agents: summarizeListings(listingRows, "agent"),
      workflows: summarizeListings(listingRows, "workflow")
    },
    usageByEvent: group(usageRows, "event_type"),
    webhookEvents: group(deliveryRows, "event_type")
  });
}

function empty(source: string) {
  return { source, errors: [], totals: {}, marketplace: {}, usageByEvent: [], webhookEvents: [] };
}

function rows(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value as Record<string, unknown>[] : [];
}

function summarizeListings(rows: Record<string, unknown>[], type: string) {
  const filtered = rows.filter((row) => row.type === type);
  return {
    total: filtered.length,
    published: filtered.filter((row) => row.status === "published").length,
    free: filtered.filter((row) => row.pricing_type === "free").length,
    premium: filtered.filter((row) => row.pricing_type === "premium").length,
    community: filtered.filter((row) => row.pricing_type === "community").length,
    usage: filtered.reduce((total, row) => total + amount(row.usage_count), 0),
    revenue: filtered.reduce((total, row) => total + amount(row.revenue), 0)
  };
}

function group(rows: Record<string, unknown>[], key: string) {
  const grouped = new Map<string, number>();
  rows.forEach((row) => grouped.set(String(row[key] ?? "unknown"), (grouped.get(String(row[key] ?? "unknown")) ?? 0) + 1));
  return [...grouped.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
}

function amount(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function rate(part: number, total: number) {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}
