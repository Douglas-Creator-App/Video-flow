import { AssetLibraryDashboard } from "@/components/assets/asset-library-dashboard";
import { ModuleHeader } from "@/components/module-header";

export default function AssetsFavoritesPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader eyebrow="Favorites" title="Assets favoritos" description="Imagens, videos, musicas e thumbnails favoritas para insercao rapida." />
      <AssetLibraryDashboard favoritesOnly />
    </div>
  );
}
