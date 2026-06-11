import { AnalyticsBoard } from "@/components/channels/operation-cards";
import { ModuleHeader } from "@/components/module-header";

export default function AnalyticsPage() {
  return <div className="space-y-6"><ModuleHeader eyebrow="Analytics" title="Estatisticas" description="Acompanhe videos, cortes, thumbnails, horas produzidas, creditos e custo estimado por canal." /><AnalyticsBoard /></div>;
}
