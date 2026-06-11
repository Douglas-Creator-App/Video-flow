import { Suspense } from "react";
import { MagicMode } from "@/components/magic/magic-mode";
import { ModuleHeader } from "@/components/module-header";
import { WorkspaceGuard } from "@/components/workspace/workspace-guard";

export default function MagicPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader eyebrow="Magic Mode" title="Gerar video completo" description="Informe um tema, revise custos e crie roteiro, voz, cenas, imagens, legendas e thumbnail em um fluxo unico." status="BETA" />
      <WorkspaceGuard requirePermission="content.create">
        <Suspense fallback={<div className="rounded-md border border-white/5 bg-secondary/40 p-4 text-sm text-muted-foreground">Carregando Magic Mode...</div>}>
          <MagicMode />
        </Suspense>
      </WorkspaceGuard>
    </div>
  );
}
