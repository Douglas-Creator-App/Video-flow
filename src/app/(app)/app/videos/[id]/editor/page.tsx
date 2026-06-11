import { VideoEditor } from "@/components/media/video-editor";
import { ModuleHeader } from "@/components/module-header";
import { WorkspaceGuard } from "@/components/workspace/workspace-guard";

export default async function VideoEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <ModuleHeader eyebrow="Editor" title="Editor por cenas" description="Timeline simples para ajustar cenas, imagens, narração, legendas, música e render." />
      <WorkspaceGuard requirePermission="content.create">
        <VideoEditor videoId={id} />
      </WorkspaceGuard>
    </div>
  );
}
