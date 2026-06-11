import { ModuleHeader } from "@/components/module-header";
import { TemplateDetail } from "@/components/templates/premium-template-store";

export default async function TemplateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Template Detail"
        title="Configuracao premium"
        description="Prompts, temas, titulos, scores e acoes para usar o template no Magic Mode ou em canais."
      />
      <TemplateDetail templateId={id} />
    </div>
  );
}
