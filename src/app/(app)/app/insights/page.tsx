import { ModuleHeader } from "@/components/module-header";
import { CompetitorTrackerPanel, InsightsAnalyticsDashboard } from "@/components/studio/youtube-studio-ai-panels";

export default function InsightsPage() {
  return <div className="space-y-6"><ModuleHeader eyebrow="Analytics" title="Insights da operacao" description="Ideias geradas/usadas, videos produzidos, taxa de conclusao, score medio, relatorios e concorrentes." /><InsightsAnalyticsDashboard /><CompetitorTrackerPanel /></div>;
}
