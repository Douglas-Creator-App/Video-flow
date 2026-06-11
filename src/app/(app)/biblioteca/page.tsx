import { ContentLibrary } from "@/components/content/content-library";
import { FavoritesPanel } from "@/components/content/favorites-panel";
import { FolderBoard } from "@/components/content/folder-board";
import { ModuleHeader } from "@/components/module-header";

export default function BibliotecaPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Biblioteca"
        title="Biblioteca central de conteúdo"
        description="Organize ideias, roteiros, artigos, carrosséis, vídeos, shorts, reels, emails, copies e anúncios com tags, status e pastas."
      />
      <ContentLibrary />
      <FavoritesPanel />
      <FolderBoard />
    </div>
  );
}
