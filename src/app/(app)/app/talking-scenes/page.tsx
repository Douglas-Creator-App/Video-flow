import { TalkingScenesStudio } from "@/components/ai-video/ai-video-panels";
import { ModuleHeader } from "@/components/module-header";

export default function TalkingScenesPage() {
  return <div className="space-y-6"><ModuleHeader eyebrow="Talking Character" title="Personagem falante" description="Escolha imagem/personagem, fala, voz, estilo e gere um mini video com fallback mockado." /><TalkingScenesStudio /></div>;
}
