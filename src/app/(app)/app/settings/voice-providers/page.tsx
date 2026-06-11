import { ProviderSettings } from "@/components/media/provider-settings";
import { ModuleHeader } from "@/components/module-header";

export default function VoiceProvidersPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader eyebrow="Media Engine" title="Voice Providers" description="ElevenLabs, OpenAI TTS, CapCut manual e mock provider." />
      <ProviderSettings type="voice" />
    </div>
  );
}
