import { NextResponse } from "next/server";
import { registerAuditLog } from "@/lib/audit";
import { requireAuth } from "@/lib/auth";
import { listElevenLabsVoices } from "@/lib/providers/elevenlabs";
import { runWithUserCredentials } from "@/lib/providers/credentials";

export async function GET() {
  const { user } = await requireAuth();
  const result = await runWithUserCredentials(user.id, () => listElevenLabsVoices());
  await registerAuditLog({ action: "create", entityType: "voice_provider", metadata: { provider: "elevenlabs", provider_mode: result.providerMode, voices: result.voices.length } });
  return NextResponse.json({ ...result, is_demo: result.providerMode !== "real" });
}
