import { ExportCenterDashboard } from "@/components/export/export-center-dashboard";
import { ModuleHeader } from "@/components/module-header";
import { WorkspaceGuard } from "@/components/workspace/workspace-guard";

export default function ExportCenterPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Export Center"
        title="Kit de publicacao manual"
        description="Prepare videos, thumbnails, titulos, descricoes, hashtags, tags e pacotes ZIP para YouTube, TikTok, Instagram e Facebook."
        status="BETA"
      />
      <WorkspaceGuard requirePermission="export_video" emptyTitle="Workspace obrigatorio para exportacao" emptyDescription="Selecione um workspace real para listar pacotes, gerar signed URLs e preparar exports.">
        <ExportCenterDashboard />
      </WorkspaceGuard>
    </div>
  );
}
