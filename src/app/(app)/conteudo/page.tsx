import { ContentMetrics } from "@/components/content/content-metrics";
import { ModuleHeader } from "@/components/module-header";

export default function ConteudoPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Métricas"
        title="Dashboard de conteúdo"
        description="Acompanhe total de conteúdos, distribuição por categoria, status, projeto e nicho."
      />
      <ContentMetrics />
    </div>
  );
}
