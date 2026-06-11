import { ModuleHeader } from "@/components/module-header";
import { TemplateAnalyticsDashboard } from "@/components/templates/premium-template-store";

export default function TemplateAnalyticsPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Template Analytics"
        title="Performance dos templates"
        description="Templates mais usados, videos gerados, creditos consumidos, canais criados e taxa de conclusao."
      />
      <TemplateAnalyticsDashboard />
    </div>
  );
}
