import { PersonaManager } from "@/components/content/persona-manager";
import { ModuleHeader } from "@/components/module-header";

export default function PersonasPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Personas"
        title="Personas por projeto"
        description="Gerencie dores, objetivos, objeções, desejos e interesses que orientarão futuros agentes sem implementar IA nesta fase."
      />
      <PersonaManager />
    </div>
  );
}
