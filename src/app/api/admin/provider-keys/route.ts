import { NextResponse, type NextRequest } from "next/server";
import { AuthError, requireAuth, requirePermission } from "@/lib/auth";
import {
  MANAGED_PROVIDER_KEYS,
  ensureProviderCredentials,
  isManagedProviderKey,
  maskCredential
} from "@/lib/providers/credentials";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

function errorResponse(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ status: "failed", error: error.message }, { status: error.status });
  }
  return NextResponse.json({
    status: "failed",
    error: error instanceof Error ? error.message : "Falha ao gerenciar chaves de provedores."
  }, { status: 500 });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspace_id") ?? "";
    if (!workspaceId) return NextResponse.json({ status: "failed", error: "workspace_id obrigatorio." }, { status: 400 });
    await requirePermission(workspaceId, "workspace.manage");
    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ status: "failed", error: "Supabase admin nao configurado." }, { status: 503 });
    }

    const { data, error } = await createAdminClient()
      .from("provider_credentials")
      .select("key_name, key_value, updated_at");
    if (error) throw new Error(`Falha ao listar chaves: ${error.message}`);

    const stored = new Map((data ?? []).map((row) => [row.key_name, row]));
    const keys = MANAGED_PROVIDER_KEYS.map((keyName) => {
      const row = stored.get(keyName);
      const envValue = process.env[keyName];
      const source = row ? "app" : envValue ? "env" : null;
      const value = row?.key_value ?? envValue ?? "";
      return {
        key_name: keyName,
        configured: Boolean(value),
        source,
        masked: value ? maskCredential(value) : null,
        updated_at: row?.updated_at ?? null
      };
    });
    return NextResponse.json({ status: "completed", keys });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const workspaceId = String(body.workspace_id ?? "");
    if (!workspaceId) return NextResponse.json({ status: "failed", error: "workspace_id obrigatorio." }, { status: 400 });
    const { user } = await requireAuth();
    await requirePermission(workspaceId, "workspace.manage");
    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ status: "failed", error: "Supabase admin nao configurado." }, { status: 503 });
    }

    const keyName = String(body.key_name ?? "");
    if (!isManagedProviderKey(keyName)) {
      return NextResponse.json({ status: "failed", error: "Chave de provider invalida." }, { status: 400 });
    }
    const keyValue = String(body.key_value ?? "").trim();
    const admin = createAdminClient();

    if (!keyValue) {
      const { error } = await admin.from("provider_credentials").delete().eq("key_name", keyName);
      if (error) throw new Error(`Falha ao remover chave: ${error.message}`);
      delete process.env[keyName];
      await ensureProviderCredentials(true);
      return NextResponse.json({ status: "completed", removed: true, key_name: keyName });
    }

    const { error } = await admin.from("provider_credentials").upsert({
      key_name: keyName,
      key_value: keyValue,
      updated_by: user.id,
      updated_at: new Date().toISOString()
    }, { onConflict: "key_name" });
    if (error) throw new Error(`Falha ao salvar chave: ${error.message}`);

    await ensureProviderCredentials(true);
    return NextResponse.json({ status: "completed", key_name: keyName, masked: maskCredential(keyValue) });
  } catch (error) {
    return errorResponse(error);
  }
}
