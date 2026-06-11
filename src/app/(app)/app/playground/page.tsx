import { AiGeneratorPanel } from "@/components/ai/ai-generator-panel";
import { ModuleHeader } from "@/components/module-header";

export default function PlaygroundPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader eyebrow="AI Agents" title="Playground" description="Converse com agentes escolhendo provider, modelo e contexto. Histórico previsto no schema." />
      <AiGeneratorPanel title="Playground de agente" description="Use como conversa livre com um agente especializado." generator="roteiro" formats={["Copywriter", "SEO", "YouTube", "TikTok", "Reels", "Vendas", "WhatsApp", "VSL"]} />
    </div>
  );
}
