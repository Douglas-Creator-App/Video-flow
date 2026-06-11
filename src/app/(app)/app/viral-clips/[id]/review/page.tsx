import { ModuleHeader } from "@/components/module-header";
import { ViralClipsReview } from "@/components/viral/viral-clips-review";

export default async function ViralClipReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <ModuleHeader eyebrow="Review" title="Revisar cortes sugeridos" description="Aprove, rejeite, ajuste inicio/fim, edite titulos e renderize os cortes selecionados." />
      <ViralClipsReview jobId={id} />
    </div>
  );
}
