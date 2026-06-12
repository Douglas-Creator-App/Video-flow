import { ModuleHeader } from "@/components/module-header";
import { ProviderKeysPanel } from "@/components/admin/provider-keys-panel";

export default function ApiKeysSettingsPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Configurações"
        title="API Keys"
        description="Cole as chaves dos provedores de IA e mídia (OpenAI, ElevenLabs, Pexels e outros) para ativar geração real."
      />
      <ProviderKeysPanel />
    </div>
  );
}
