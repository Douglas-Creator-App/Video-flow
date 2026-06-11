import { AdminMasterDashboard } from "@/components/billing/admin-master-dashboard";
import { ModuleHeader } from "@/components/module-header";

export default function AdminMasterPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Admin Master"
        title="Controle da plataforma"
        description="Visao platform_admin para workspaces, assinaturas, creditos, uso, bloqueios, ajustes e eventos de auditoria mockados."
      />
      <AdminMasterDashboard />
    </div>
  );
}
