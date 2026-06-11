import { ModuleHeader } from "@/components/module-header";
import { ViralClipsStudio } from "@/components/viral/viral-clips-studio";
import { WorkspaceGuard } from "@/components/workspace/workspace-guard";

export default function ViralClipsPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader eyebrow="Viral Clips" title="Cortes virais" description="Transforme videos longos em Shorts, Reels e TikToks com transcricao, analise de momentos, legendas e reframe." />
      <WorkspaceGuard requirePermission="content.create">
        <ViralClipsStudio />
      </WorkspaceGuard>
    </div>
  );
}
