import { AiGeneratorPanel } from "@/components/ai/ai-generator-panel";
import { ModuleHeader } from "@/components/module-header";

export default function AiEmailsPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader eyebrow="IA" title="Gerador de emails" description="Emails de prospecção, vendas, follow-up, recuperação e newsletter." />
      <AiGeneratorPanel title="Emails" description="Crie emails comerciais com contexto e CTA." generator="email" formats={["prospecção", "vendas", "follow-up", "recuperação", "newsletter"]} />
    </div>
  );
}
