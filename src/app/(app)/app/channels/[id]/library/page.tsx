import { ChannelLibrary } from "@/components/channels/operation-cards";
import { ModuleHeader } from "@/components/module-header";

export default async function ChannelLibraryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <div className="space-y-6"><ModuleHeader eyebrow="Channel Library" title="Biblioteca do canal" description="Filtre videos, shorts, cortes, thumbnails, roteiros, imagens e audios por canal." /><ChannelLibrary channelId={id} /></div>;
}
