import { ModuleHeader } from "@/components/module-header";
import { ProviderKeysPanel } from "@/components/admin/provider-keys-panel";

export default function ApiKeysSettingsPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Configuração"
        title="Configuração das suas chaves de API"
        description="Cole as suas chaves dos provedores de IA e mídia (OpenAI, ElevenLabs, Pexels e outros) para liberar a geração. Você usa as suas próprias chaves e paga o consumo direto no provedor."
      />
      <ProviderKeysPanel />
    </div>
  );
}
