import { ModuleHeader } from "@/components/module-header";
import { PremiumTemplateStore } from "@/components/templates/premium-template-store";

export default function TemplateFavoritesPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Templates"
        title="Meus Favoritos"
        description="Templates favoritos para iniciar videos, canais e lotes com menos cliques."
      />
      <PremiumTemplateStore favoritesOnly />
    </div>
  );
}
