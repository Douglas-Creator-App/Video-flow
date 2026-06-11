import { NicheManager } from "@/components/content/niche-manager";
import { ModuleHeader } from "@/components/module-header";

export default function NichosPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Nichos"
        title="Banco de nichos"
        description="Use nichos padrão e personalizados para estruturar projetos, palavras-chave e conteúdos."
      />
      <NicheManager />
    </div>
  );
}
