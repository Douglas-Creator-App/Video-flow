import { BulkGenerationBoard } from "@/components/channels/operation-cards";
import { ModuleHeader } from "@/components/module-header";

export default function BulkGenerationPage() {
  return <div className="space-y-6"><ModuleHeader eyebrow="Bulk Generation" title="Producao em massa" description="Gere dezenas ou centenas de conteudos em lote, todos em fila." /><BulkGenerationBoard /></div>;
}
