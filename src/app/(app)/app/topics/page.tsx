import { ModuleHeader } from "@/components/module-header";
import { TopicsEngineDashboard } from "@/components/studio/youtube-studio-ai-panels";

export default function TopicsPage() {
  return <div className="space-y-6"><ModuleHeader eyebrow="Topics Engine" title="Gerador de ideias" description="Gere temas, titulos, ganchos, thumbnails sugeridas e score de potencial por nicho/canal." /><TopicsEngineDashboard /></div>;
}
