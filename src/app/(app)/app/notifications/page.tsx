import { NotificationsBoard } from "@/components/channels/operation-cards";
import { ModuleHeader } from "@/components/module-header";

export default function NotificationsPage() {
  return <div className="space-y-6"><ModuleHeader eyebrow="Alerts" title="Notificacoes" description="Alertas de job concluido, falha, creditos baixos e fila congestionada." /><NotificationsBoard /></div>;
}
