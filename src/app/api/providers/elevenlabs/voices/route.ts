import { NextResponse } from "next/server";
import { registerAuditLog } from "@/lib/audit";
import { requireAuth } from "@/lib/auth";
import { listElevenLabsVoices } from "@/lib/providers/elevenlabs";

export async function GET() {
  await requireAuth();
  const result = await listElevenLabsVoices();
  await registerAuditLog({ action: "create", entityType: "voice_provider", metadata: { provider: "elevenlabs", provider_mode: result.providerMode, voices: result.voices.length } });
  return NextResponse.json({ ...result, is_demo: result.providerMode !== "real" });
}
