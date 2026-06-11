import { VoiceLibrary } from "@/components/media/voice-library";
import { ModuleHeader } from "@/components/module-header";

export default function VoicesPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader eyebrow="Media Engine" title="Biblioteca de vozes" description="Filtre vozes por idioma, gênero, estilo, provider e favoritos." />
      <VoiceLibrary />
    </div>
  );
}
