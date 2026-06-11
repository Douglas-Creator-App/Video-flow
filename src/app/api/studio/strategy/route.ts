import { NextResponse, type NextRequest } from "next/server";
import { registerAuditLog } from "@/lib/audit";
import { requireAuth } from "@/lib/auth";
import { topicSuggestions } from "@/lib/mock-data";
import { answerStrategistQuestion, getExecutiveOverview } from "@/lib/youtube-studio-ai";

export async function GET() {
  await requireAuth();
  return NextResponse.json({
    status: "ready",
    provider_mode: "internal_mock",
    overview: getExecutiveOverview(),
    suggestions: topicSuggestions
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const question = body.question ?? "Qual canal devo focar?";
  await requireAuth();

  await registerAuditLog({
    action: "create",
    entityType: "studio_strategy",
    metadata: { question, provider_mode: "internal_mock" }
  });

  return NextResponse.json({
    status: "completed",
    provider_mode: "internal_mock",
    answer: answerStrategistQuestion(question)
  });
}
