import { ModuleHeader } from "@/components/module-header";
import { ProviderSettingsDashboard } from "@/components/providers/provider-settings-dashboard";

export default function ProvidersSettingsPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader eyebrow="Providers" title="Providers reais" description="OpenAI, TTS, imagens, video IA, storage, health check e testes server-side sem expor chaves." />
      <ProviderSettingsDashboard />
    </div>
  );
}
