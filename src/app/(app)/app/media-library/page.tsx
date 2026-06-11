import { MediaLibrary } from "@/components/media/media-library";
import { ModuleHeader } from "@/components/module-header";

export default function MediaLibraryPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader eyebrow="Media Engine" title="Biblioteca de mídia" description="Uploads, assets gerados por IA, músicas, thumbnails e fontes externas." />
      <MediaLibrary />
    </div>
  );
}
