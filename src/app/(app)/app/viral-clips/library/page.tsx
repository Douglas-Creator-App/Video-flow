import { ModuleHeader } from "@/components/module-header";
import { ViralClipsLibrary } from "@/components/viral/viral-clips-library";

export default function ViralClipsLibraryPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader eyebrow="Library" title="Biblioteca de cortes" description="Acompanhe cortes gerados, status, duracao, formato e acoes de download, editor, duplicacao e exclusao." />
      <ViralClipsLibrary />
    </div>
  );
}
