import { ThumbnailStudio } from "@/components/media/thumbnail-studio";
import { ModuleHeader } from "@/components/module-header";

export default async function VideoThumbnailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <ModuleHeader eyebrow="Thumbnail AI" title="Gerador de thumbnails" description="Gere 6 variações, selecione a principal, baixe e salve na biblioteca." />
      <ThumbnailStudio videoId={id} />
    </div>
  );
}
