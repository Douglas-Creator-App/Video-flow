import { AiGeneratorPanel } from "@/components/ai/ai-generator-panel";
import { ModuleHeader } from "@/components/module-header";

export default function AiWhatsappPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader eyebrow="IA" title="Gerador de WhatsApp" description="Mensagens para prospecção, follow-up, recuperação, pós-venda, cobrança e remarketing." />
      <AiGeneratorPanel title="WhatsApp" description="Preparado para futura integração com Meta API." generator="whatsapp" formats={["prospecção", "follow-up", "recuperação", "pós-venda", "cobrança", "remarketing"]} />
    </div>
  );
}
