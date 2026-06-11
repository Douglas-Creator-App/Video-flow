import { ExportHistoryDashboard } from "@/components/export/export-center-dashboard";
import { ModuleHeader } from "@/components/module-header";
import { WorkspaceGuard } from "@/components/workspace/workspace-guard";

export default function ExportHistoryPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Export History"
        title="Historico de exportacoes"
        description="Pacotes gerados, downloads, publicacoes manuais, usuarios, plataformas e datas."
      />
      <WorkspaceGuard requirePermission="export_video">
        <ExportHistoryDashboard />
      </WorkspaceGuard>
    </div>
  );
}
