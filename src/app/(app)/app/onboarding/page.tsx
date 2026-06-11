import { ModuleHeader } from "@/components/module-header";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export default function OnboardingPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Onboarding Inteligente"
        title="Primeiro video guiado"
        description="Crie canal, escolha template, voz, visual e gere seu primeiro video com o First Video Wizard."
        status="BETA"
      />
      <OnboardingWizard />
    </div>
  );
}
