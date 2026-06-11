import { ModuleHeader } from "@/components/module-header";
import { StrategistDashboard } from "@/components/studio/youtube-studio-ai-panels";

export default function StrategistPage() {
  return <div className="space-y-6"><ModuleHeader eyebrow="AI Strategist" title="Consultor estrategico" description="Pergunte sobre canais, templates, creditos e nichos usando dados internos do workspace." /><StrategistDashboard /></div>;
}
