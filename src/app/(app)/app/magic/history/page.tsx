import { MagicHistory } from "@/components/magic/magic-history";
import { ModuleHeader } from "@/components/module-header";

export default function MagicHistoryPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader eyebrow="Magic Jobs" title="Historico Magic Mode" description="Acompanhe videos concluidos, erros, custos, usuarios, projetos e jobs prontos para abrir no editor." />
      <MagicHistory />
    </div>
  );
}
