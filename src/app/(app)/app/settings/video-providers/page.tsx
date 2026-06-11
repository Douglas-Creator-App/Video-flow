import { VideoProvidersPanel } from "@/components/ai-video/ai-video-panels";
import { ModuleHeader } from "@/components/module-header";

export default function VideoProvidersPage() {
  return <div className="space-y-6"><ModuleHeader eyebrow="AI Video Providers" title="Providers de video IA" description="Configure Runway, Kling, Pika, Luma, Veo ou Mock Provider sem expor chaves no frontend." /><VideoProvidersPanel /></div>;
}
