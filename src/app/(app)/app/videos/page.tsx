import { VideoWorkspace } from "@/components/media/video-workspace";
import { ModuleHeader } from "@/components/module-header";

export default function VideosPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader eyebrow="Media Engine" title="Video Projects" description="Transforme roteiros em vídeos com narração, imagens, cenas, legendas, editor e render." />
      <VideoWorkspace />
    </div>
  );
}
