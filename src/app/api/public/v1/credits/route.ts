import { NextResponse, type NextRequest } from "next/server";
import { authenticatePublicApiKey, platformErrorResponse, recordPlatformUsage } from "@/lib/platform/api-keys";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const key = await authenticatePublicApiKey(request, "credits.read");
    const { data, error } = await createAdminClient()
      .from("credit_wallets")
      .select("balance, monthly_allowance, purchased_credits, used_this_period, reset_at")
      .eq("workspace_id", key.workspaceId)
      .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await recordPlatformUsage({ workspaceId: key.workspaceId, apiKeyId: key.id, eventType: "public.credits_retrieved", resourceType: "credit_wallet" });
    return NextResponse.json({ wallet: data ?? null });
  } catch (error) {
    return platformErrorResponse(error);
  }
}
