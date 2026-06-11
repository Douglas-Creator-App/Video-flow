import { AssetLibraryDashboard } from "@/components/assets/asset-library-dashboard";
import { ModuleHeader } from "@/components/module-header";
import { WorkspaceGuard } from "@/components/workspace/workspace-guard";

export default function AssetsPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader eyebrow="Asset Library" title="Biblioteca central de assets" description="Hub de imagens, videos, audios, musicas, thumbnails, uploads, IA e bancos externos." />
      <WorkspaceGuard requirePermission="library.manage">
        <AssetLibraryDashboard />
      </WorkspaceGuard>
    </div>
  );
}
