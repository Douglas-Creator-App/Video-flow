import { ModuleHeader } from "@/components/module-header";
import { QuickStartWizard } from "@/components/onboarding/onboarding-wizard";

export default function QuickStartPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Quick Start"
        title="Gerar video rapido"
        description="Selecione template e tema. O restante vem da configuracao premium do template."
        status="BETA"
      />
      <QuickStartWizard />
    </div>
  );
}
