import { ModuleHeader } from "@/components/module-header";
import { ExecutiveDashboard } from "@/components/studio/youtube-studio-ai-panels";

export default function ExecutivePage() {
  return <div className="space-y-6"><ModuleHeader eyebrow="Executive" title="Dashboard executivo" description="Visao geral de canais, producao, videos, creditos, templates, ideias e tendencias. Para MRR, funil e CRM use o Growth Engine." status="BETA" /><ExecutiveDashboard /></div>;
}
