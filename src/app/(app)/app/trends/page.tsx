import { ModuleHeader } from "@/components/module-header";
import { TrendDiscoveryDashboard } from "@/components/studio/youtube-studio-ai-panels";

export default function TrendsPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Inteligencia de mercado"
        title="Trend Discovery"
        description="Tendencias por nicho, idioma e categoria usando dados internos e fontes mockadas, sem APIs externas nesta fase."
      />
      <TrendDiscoveryDashboard />
    </div>
  );
}
