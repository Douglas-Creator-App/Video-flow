import { ChannelDashboard } from "@/components/channels/operation-cards";
import { ModuleHeader } from "@/components/module-header";

export default async function ChannelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <div className="space-y-6"><ModuleHeader eyebrow="Channel Dashboard" title="Dashboard do canal" description="Acompanhe producao, creditos, ultimos videos, geracoes e metas." /><ChannelDashboard channelId={id} /></div>;
}
