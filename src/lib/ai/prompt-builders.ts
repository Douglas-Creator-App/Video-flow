import type { AiGeneratorRequest, PromptCategory } from "@/lib/types";

const labels: Record<string, string> = {
  "título": "títulos com score viral e comercial",
  gancho: "ganchos curtos para vídeo e anúncio",
  roteiro: "roteiros estruturados",
  carrossel: "carrosséis slide a slide",
  artigo: "artigos SEO",
  email: "emails comerciais",
  whatsapp: "mensagens de WhatsApp",
  anúncio: "copies de anúncio",
  post: "posts para redes sociais"
};

export function buildGeneratorPrompt(request: AiGeneratorRequest) {
  const category = request.generator as PromptCategory | "post";
  const outputKind = labels[category] ?? "conteúdos";

  const systemPrompt = [
    "Você é um especialista sênior em estratégia de conteúdo para vídeo e canais digitais.",
    "Gere conteúdo em português do Brasil, com estrutura clara e pronto para salvar em biblioteca.",
    "Retorne em Markdown, sem mencionar que é uma IA.",
    "Quando houver scores, use escala de 0 a 100."
  ].join("\n");

  const userPrompt = [
    `Tipo de geração: ${outputKind}.`,
    `Nicho: ${request.niche}.`,
    `Persona: ${request.persona || "persona geral do projeto"}.`,
    `Objetivo: ${request.objective}.`,
    `Plataforma: ${request.platform || "não especificada"}.`,
    `Quantidade: ${request.quantity || 3}.`,
    `Formato: ${request.format || "não especificado"}.`,
    `Duração/tamanho/tipo: ${request.duration || request.size || request.type || "não especificado"}.`,
    `Tom de comunicação: ${request.tone || "profissional, direto e útil"}.`,
    "",
    "Inclua estrutura, CTA quando fizer sentido e observações visuais para conteúdos de vídeo/carrossel."
  ].join("\n");

  return { systemPrompt, userPrompt };
}
