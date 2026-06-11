import { OperationalLogsPanel } from "@/components/admin/operational-logs-panel";
import { ModuleHeader } from "@/components/module-header";

export default function AdminLogsPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader eyebrow="Admin" title="Logs operacionais" description="Visualize jobs, auditoria, eventos de seguranca e rate limits do beta fechado." status="REAL" />
      <OperationalLogsPanel />
    </div>
  );
}
