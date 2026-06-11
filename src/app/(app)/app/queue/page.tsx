import { JobQueueDashboard } from "@/components/jobs/job-progress-panel";
import { ModuleHeader } from "@/components/module-header";
import { WorkspaceGuard } from "@/components/workspace/workspace-guard";

export default function QueuePage() {
  return <div className="space-y-6"><ModuleHeader eyebrow="Production Queue" title="Filas de background" description="Jobs reais com lock, retry, cancelamento, logs, heartbeat de worker e processamento manual em desenvolvimento." status="REAL" /><WorkspaceGuard requirePermission="content.create"><JobQueueDashboard /></WorkspaceGuard></div>;
}
