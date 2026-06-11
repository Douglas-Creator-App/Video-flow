import { ModuleHeader } from "@/components/module-header";
import { QualityDashboard } from "@/components/quality/video-quality-panels";

export default function QualityPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Video Quality"
        title="Qualidade e retencao"
        description="Analise gancho, roteiro, cenas, thumbnail, legendas, metadados e potencial de viralizacao antes de exportar."
      />
      <QualityDashboard />
    </div>
  );
}
