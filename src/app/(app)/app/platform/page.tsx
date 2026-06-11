import { ModuleHeader } from "@/components/module-header";
import { PlatformConsole } from "@/components/platform/platform-console";

export default function PlatformPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Platform"
        title="Ecossistema e Plataforma"
        description="API publica, API keys, webhooks, marketplace, SDK, multi-workspace avancado, credit pools e analytics de plataforma."
        status="BETA"
      />
      <PlatformConsole />
    </div>
  );
}
