import { BillingDashboard } from "@/components/billing/billing-dashboard";
import { ModuleHeader } from "@/components/module-header";
import { WorkspaceGuard } from "@/components/workspace/workspace-guard";

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Billing"
        title="Planos, creditos e uso"
        description="Estrutura comercial do SaaS com planos, trial, limites, checkout placeholder, eventos mockados e historico financeiro."
      />
      <WorkspaceGuard emptyTitle="Workspace obrigatorio para billing" emptyDescription="Selecione um workspace real para consultar plano, wallet e uso.">
        <BillingDashboard />
      </WorkspaceGuard>
    </div>
  );
}
