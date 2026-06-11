import { ProductionPlanBoard } from "@/components/channels/operation-cards";
import { ModuleHeader } from "@/components/module-header";

export default function ProductionPlanPage() {
  return <div className="space-y-6"><ModuleHeader eyebrow="Production Plan" title="Plano de producao" description="Defina metas por canal: videos por dia, semana, shorts e videos longos." /><ProductionPlanBoard /></div>;
}
