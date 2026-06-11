import { ChannelTemplatesBoard } from "@/components/channels/operation-cards";
import { ModuleHeader } from "@/components/module-header";

export default function ChannelTemplatesPage() {
  return <div className="space-y-6"><ModuleHeader eyebrow="Channel Templates" title="Templates de canal" description="Salve voz, estilo visual, duracao, formato, prompts, legenda e thumbnail." /><ChannelTemplatesBoard /></div>;
}
