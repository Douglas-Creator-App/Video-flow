import { ModuleHeader } from "@/components/module-header";
import { ChannelInsightsDashboard } from "@/components/studio/youtube-studio-ai-panels";

export default function ChannelInsightsPage() {
  return <div className="space-y-6"><ModuleHeader eyebrow="YouTube Studio AI" title="Channel Insights" description="Analise producao, templates, exportacoes, publicacoes e saude dos canais com dados internos." /><ChannelInsightsDashboard /></div>;
}
