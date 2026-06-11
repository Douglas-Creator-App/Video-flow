import { AiAdminPanels } from "@/components/ai/ai-admin-panels";
import { ModuleHeader } from "@/components/module-header";

export default function AiEnginePage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Content AI Engine"
        title="AI Engine"
        description="Providers, prompt engine, agentes, créditos, filas e histórico com backend seguro."
      />
      <AiAdminPanels />
    </div>
  );
}
