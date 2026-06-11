import { OperationsCenter } from "@/components/channels/operation-cards";
import { ModuleHeader } from "@/components/module-header";

export default function OperationsPage() {
  return <div className="space-y-6"><ModuleHeader eyebrow="Operations" title="Central de operacoes" description="Centro de controle para canais ativos, jobs, filas, creditos, erros e consumo." /><OperationsCenter /></div>;
}
