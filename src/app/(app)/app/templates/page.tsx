import { ModuleHeader } from "@/components/module-header";
import { PremiumTemplateStore } from "@/components/templates/premium-template-store";

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Premium Niche Templates"
        title="Template Store"
        description="Templates prontos para canais, videos, estilos, prompts e fluxos de producao."
      />
      <PremiumTemplateStore />
    </div>
  );
}
