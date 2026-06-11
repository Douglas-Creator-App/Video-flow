import { ChannelsWorkspace } from "@/components/channels/operation-cards";
import { ModuleHeader } from "@/components/module-header";

export default function ChannelsPage() {
  return <div className="space-y-6"><ModuleHeader eyebrow="Channels Engine" title="Canais" description="Gerencie multiplos canais, templates, metas e producao em escala." /><ChannelsWorkspace /></div>;
}
