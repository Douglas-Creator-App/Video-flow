import { NextResponse, type NextRequest } from "next/server";
import { requireAuth, requirePermission, requireRateLimit } from "@/lib/auth";
import { getAiProvider } from "@/lib/ai/provider-registry";
import { buildGeneratorPrompt } from "@/lib/ai/prompt-builders";
import type { AiGeneratorRequest, AiProviderType } from "@/lib/types";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as AiGeneratorRequest & {
    provider?: AiProviderType;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    workspace_id?: string;
    workspaceId?: string;
  };
  const { user } = await requireAuth();
  const workspace = await requirePermission(String(body.workspace_id ?? body.workspaceId ?? "ws_1"), "content.create");
  await requireRateLimit({ workspaceId: workspace.workspaceId!, userId: user.id, feature: "openai_text", route: "/api/ai/generate" });

  const providerName = body.provider ?? "openai";
  const model = body.model ?? "gpt-5.2";
  const prompt = buildGeneratorPrompt(body);
  const provider = getAiProvider(providerName);

  try {
    const result = await provider.generate({
      provider: providerName,
      model,
      systemPrompt: prompt.systemPrompt,
      userPrompt: prompt.userPrompt,
      temperature: body.temperature,
      maxTokens: body.maxTokens
    });

    return NextResponse.json({
      status: "concluído",
      provider: providerName,
      model,
      prompt: prompt.userPrompt,
      response: result.text,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      durationMs: result.durationMs
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "erro",
        error: error instanceof Error ? error.message : "Erro desconhecido na geração."
      },
      { status: 500 }
    );
  }
}
