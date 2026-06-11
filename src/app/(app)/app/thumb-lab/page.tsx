import { ModuleHeader } from "@/components/module-header";
import { ThumbLabDashboard } from "@/components/studio/youtube-studio-ai-panels";

export default function ThumbLabPage() {
  return <div className="space-y-6"><ModuleHeader eyebrow="Thumb Lab" title="Ideias de thumbnail" description="Textos, emocoes, estilos e ideias integradas ao futuro Thumbnail AI." /><ThumbLabDashboard /></div>;
}
