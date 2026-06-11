import { AiGeneratorPanel } from "@/components/ai/ai-generator-panel";
import { ModuleHeader } from "@/components/module-header";

export default function AiArticlesPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader eyebrow="IA" title="Gerador de artigos SEO" description="Artigos curtos, médios e longos com introdução, tópicos, conclusão e CTA." />
      <AiGeneratorPanel title="Artigos" description="Estrutura orientada para SEO e clareza editorial." generator="artigo" formats={["curto", "médio", "longo"]} />
    </div>
  );
}
