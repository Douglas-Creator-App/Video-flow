import { AiVideoHistory } from "@/components/ai-video/ai-video-panels";
import { ModuleHeader } from "@/components/module-header";

export default function AiVideoHistoryPage() {
  return <div className="space-y-6"><ModuleHeader eyebrow="AI Video History" title="Historico de video IA" description="Jobs de imagem animada, text-to-video, personagem falando, intros, outros, status, custo e provider." /><AiVideoHistory /></div>;
}
