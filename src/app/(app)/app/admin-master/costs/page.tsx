import { CostAnalyticsDashboard } from "@/components/billing/admin-master-dashboard";
import { ModuleHeader } from "@/components/module-header";

export default function AdminMasterCostsPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Cost Analytics"
        title="Custos por provider"
        description="Relatorio operacional de custo estimado por workspace, provider, video, render, imagem, voz, viral clips e AI video."
        status="REAL"
      />
      <CostAnalyticsDashboard />
    </div>
  );
}
