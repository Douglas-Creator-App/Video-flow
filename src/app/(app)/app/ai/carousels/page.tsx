import { AiGeneratorPanel } from "@/components/ai/ai-generator-panel";
import { ModuleHeader } from "@/components/module-header";

export default function AiCarouselsPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader eyebrow="IA" title="Gerador de carrosséis" description="Carrosséis de 5, 7, 10 ou 15 slides com observação visual." />
      <AiGeneratorPanel title="Carrosséis" description="Cada slide contém título, conteúdo e direção visual." generator="carrossel" formats={["5 slides", "7 slides", "10 slides", "15 slides"]} />
    </div>
  );
}
