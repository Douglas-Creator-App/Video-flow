import { AiGeneratorPanel } from "@/components/ai/ai-generator-panel";
import { ModuleHeader } from "@/components/module-header";

export default function AiHooksPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader eyebrow="IA" title="Gerador de ganchos" description="Ganchos de 3 e 5 segundos para shorts, reels e anúncios." />
      <AiGeneratorPanel title="Ganchos" description="Gere aberturas fortes para vídeo curto e campanhas." generator="gancho" formats={["3 segundos", "5 segundos", "shorts", "reels", "anúncios"]} />
    </div>
  );
}
