import { UploadCenter } from "@/components/assets/asset-library-dashboard";
import { ModuleHeader } from "@/components/module-header";

export default function AssetsUploadPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader eyebrow="Upload Center" title="Upload de assets" description="Valide arquivos, prepare storage, gere thumbnails automaticas e evite duplicados." />
      <UploadCenter />
    </div>
  );
}
