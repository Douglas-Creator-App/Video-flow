import { ContentLibrary } from "@/components/content/content-library";
import { ModuleHeader } from "@/components/module-header";

export default function IdeiasPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Ideias"
        title="Ideias e rascunhos"
        description="Filtre a biblioteca para organizar oportunidades editoriais antes da produção."
      />
      <ContentLibrary />
    </div>
  );
}
