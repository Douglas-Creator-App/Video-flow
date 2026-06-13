import { getProviderKey } from "@/lib/providers/credentials";
import { friendlyProviderError, providerMissing, sanitizePrompt } from "@/lib/providers/provider-utils";

export async function generateOpenAiImages(input: { prompt: string; aspectRatio?: string; size?: string; quantity?: number; style?: string; model?: string }) {
  const startedAt = Date.now();
  const apiKey = getProviderKey("OPENAI_API_KEY");
  const prompt = sanitizePrompt(`${input.prompt}\nStyle: ${input.style ?? "cinematografico"}\nAspect ratio: ${input.aspectRatio ?? "9:16"}`, 4000);
  const quantity = Math.max(1, Math.min(Number(input.quantity ?? 1), 4));

  if (!apiKey) return mockImages(prompt, quantity, "mock", providerMissing("OPENAI_API_KEY"), startedAt);

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: input.model ?? "gpt-image-1", prompt, n: quantity, size: input.size ?? imageSize(input.aspectRatio ?? "9:16") })
    });
    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    const images = (data.data ?? []).map((item: { b64_json?: string; url?: string }) => item.b64_json ? `data:image/png;base64,${item.b64_json}` : item.url).filter(Boolean);
    if (!images.length) return mockImages(prompt, quantity, "fallback", "OpenAI Images nao retornou imagem.", startedAt);
    return { status: "completed" as const, providerMode: "real" as const, provider: "openai_images", images, imageUrl: images[0], cost: Number((images.length * 0.04).toFixed(4)), durationMs: Date.now() - startedAt, warning: null };
  } catch (error) {
    return mockImages(prompt, quantity, "fallback", friendlyProviderError("OpenAI Images", error), startedAt);
  }
}

function mockImages(prompt: string, quantity: number, providerMode: "mock" | "fallback", warning: string, startedAt: number) {
  const images = Array.from({ length: quantity }, (_, index) => mockImage(prompt, index));
  return { status: "completed" as const, providerMode, provider: "openai_images", images, imageUrl: images[0], cost: 0, durationMs: Date.now() - startedAt, warning };
}

function mockImage(prompt: string, index: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920"><rect width="1080" height="1920" fill="#0A0A0A"/><circle cx="540" cy="${520 + index * 80}" r="340" fill="#C9A84C" opacity=".18"/><text x="90" y="900" fill="#F5F0E8" font-size="56" font-family="Arial" font-weight="700">Video Flow</text><text x="90" y="990" fill="#C9A84C" font-size="34" font-family="Arial">${escapeXml(prompt).slice(0, 42)}</text></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function imageSize(aspectRatio: string) {
  if (aspectRatio === "16:9") return "1536x864";
  if (aspectRatio === "9:16") return "1024x1536";
  return "1024x1024";
}

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[char] ?? char);
}
