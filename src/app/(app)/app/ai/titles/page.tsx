import { AiGeneratorPanel } from "@/components/ai/ai-generator-panel";
import { ModuleHeader } from "@/components/module-header";

export default function AiTitlesPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader eyebrow="IA" title="Gerador de títulos" description="Gere títulos com score viral e comercial estimado." />
      <AiGeneratorPanel title="Títulos" description="Crie variações de títulos para qualquer nicho, persona, objetivo e plataforma." generator="título" formats={["short_title", "youtube_title", "ad_title", "seo_title"]} />
    </div>
  );
}
