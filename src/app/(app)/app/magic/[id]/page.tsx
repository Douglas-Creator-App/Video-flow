import { MagicJobProgress } from "@/components/magic/magic-job-progress";
import { ModuleHeader } from "@/components/module-header";

export default async function MagicJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <ModuleHeader eyebrow="Magic Job" title="Acompanhamento em tempo real" description="Visualize etapa atual, percentual, logs, tempo estimado e acoes do job." />
      <MagicJobProgress jobId={id} />
    </div>
  );
}
