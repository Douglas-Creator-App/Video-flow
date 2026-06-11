import { ModuleHeader } from "@/components/module-header";
import { ProjectManager } from "@/components/projects/project-manager";

export default function ProjetosPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Projetos"
        title="Projetos de conteúdo"
        description="Crie, edite, duplique, arquive e exclua projetos por workspace com nicho, marca, idioma, país e status."
      />
      <ProjectManager />
    </div>
  );
}
