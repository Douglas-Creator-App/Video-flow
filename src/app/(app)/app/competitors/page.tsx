import { CompetitorManager } from "@/components/intelligence/competitor-manager";
import { ModuleHeader } from "@/components/module-header";

export default function CompetitorsPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Inteligência competitiva"
        title="Concorrentes e referências"
        description="Cadastre referências, visualize análises mockadas e organize aprendizados para futuras integrações."
      />
      <CompetitorManager />
    </div>
  );
}
