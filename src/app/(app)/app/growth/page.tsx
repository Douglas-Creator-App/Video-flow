import { GrowthEngineDashboard } from "@/components/growth/growth-engine-dashboard";
import { ModuleHeader } from "@/components/module-header";

export default function GrowthPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Growth"
        title="Growth Engine"
        description="Centro de aquisicao, referral, funil, CRM, feedback, notificacoes, receita e auditoria comercial para o beta fechado."
        status="BETA"
      />
      <GrowthEngineDashboard />
    </div>
  );
}
