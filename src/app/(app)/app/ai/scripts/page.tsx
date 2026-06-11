import { AiGeneratorPanel } from "@/components/ai/ai-generator-panel";
import { ModuleHeader } from "@/components/module-header";

export default function AiScriptsPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader eyebrow="IA" title="Gerador de roteiros" description="Roteiros com título, gancho, desenvolvimento, CTA e observações visuais." />
      <AiGeneratorPanel title="Roteiros" description="Short 30s/60s, Reels, TikTok, vídeo longo, VSL e Webinar." generator="roteiro" formats={["Short 30 segundos", "Short 60 segundos", "Reels", "TikTok", "Vídeo longo", "VSL", "Webinar"]} />
    </div>
  );
}
