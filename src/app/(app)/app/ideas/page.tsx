import { IdeasWorkspace } from "@/components/intelligence/ideas-workspace";
import { ModuleHeader } from "@/components/module-header";

export default function IdeasPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Motor de ideias"
        title="Banco de ideias"
        description="Lista, kanban, calendário, detalhe, geração mockada, scores visuais e relatórios sem IA real nesta fase."
      />
      <IdeasWorkspace />
    </div>
  );
}
