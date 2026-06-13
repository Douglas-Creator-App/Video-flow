import { NextResponse, type NextRequest } from "next/server";
import { AuthError, requireAuth } from "@/lib/auth";
import {
  getUserProviderKeyStatuses,
  isManagedProviderKey,
  setUserProviderKey
} from "@/lib/providers/credentials";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

function errorResponse(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ status: "failed", error: error.message }, { status: error.status });
  }
  return NextResponse.json({
    status: "failed",
    error: error instanceof Error ? error.message : "Falha ao gerenciar chaves de API."
  }, { status: 500 });
}

// Lista o status das chaves do PRÓPRIO usuário (modelo BYOK).
export async function GET() {
  try {
    const { user } = await requireAuth();
    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ status: "failed", error: "Supabase admin nao configurado." }, { status: 503 });
    }
    const keys = await getUserProviderKeyStatuses(user.id);
    return NextResponse.json({ status: "completed", keys });
  } catch (error) {
    return errorResponse(error);
  }
}

// Salva/remove uma chave do PRÓPRIO usuário.
export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAuth();
    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ status: "failed", error: "Supabase admin nao configurado." }, { status: 503 });
    }
    const body = await request.json();
    const keyName = String(body.key_name ?? "");
    if (!isManagedProviderKey(keyName)) {
      return NextResponse.json({ status: "failed", error: "Chave de provider invalida." }, { status: 400 });
    }
    const keyValue = String(body.key_value ?? "");
    const result = await setUserProviderKey(user.id, keyName, keyValue);
    if ("removed" in result) {
      return NextResponse.json({ status: "completed", removed: true, key_name: keyName });
    }
    return NextResponse.json({ status: "completed", key_name: keyName, masked: result.masked });
  } catch (error) {
    return errorResponse(error);
  }
}
