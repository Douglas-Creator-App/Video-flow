import { ModuleHeader } from "@/components/module-header";
import { PersonalTemplatesPanel } from "@/components/templates/premium-template-store";

export default function PersonalTemplatesPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Personal Templates"
        title="Templates personalizados"
        description="Crie, duplique e ajuste seus proprios templates de nicho, voz, visual, prompts, legenda e thumbnail."
      />
      <PersonalTemplatesPanel />
    </div>
  );
}
