import { CalendarBoard } from "@/components/channels/operation-cards";
import { ModuleHeader } from "@/components/module-header";

export default function CalendarPage() {
  return <div className="space-y-6"><ModuleHeader eyebrow="Editorial Calendar" title="Calendario editorial" description="Planeje videos, shorts, cortes, thumbnails e roteiros em visoes de dia, semana e mes." /><CalendarBoard /></div>;
}
