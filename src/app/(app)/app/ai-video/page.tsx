import { AiVideoStudio, AiVideoAssetsLibrary } from "@/components/ai-video/ai-video-panels";
import { ModuleHeader } from "@/components/module-header";

export default function AiVideoPage() {
  return <div className="space-y-6"><ModuleHeader eyebrow="AI Video Engine" title="Text to Video" description="Modulo demonstrativo/hibrido para arquitetura futura de video IA; nao faz parte do fluxo beta principal." status="DEMO" /><AiVideoStudio /><AiVideoAssetsLibrary /></div>;
}
