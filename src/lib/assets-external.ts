import { assetSearchCache } from "@/lib/mock-data";
import { searchPexelsPhotos, searchPexelsVideos } from "@/lib/providers/pexels";
import { searchPixabayImages, searchPixabayVideos } from "@/lib/providers/pixabay";
import { searchUnsplashPhotos } from "@/lib/providers/unsplash";
import type { AssetOrientation, AssetProvider, ExternalAssetSearchResult } from "@/lib/types";

// Busca de assets em provedores externos (Pexels/Pixabay/Unsplash).
// Fica separado de assets.ts porque importa código server-only (chaves/criptografia)
// que não pode ser empacotado em componentes de tela (cliente).
export async function searchExternalAssets(input: {
  workspaceId: string;
  provider: AssetProvider;
  query: string;
  type: "image" | "video";
  orientation?: AssetOrientation;
}) {
  const cached = assetSearchCache.find((item) => item.workspaceId === input.workspaceId && item.provider === input.provider && item.query === input.query);
  if (cached?.results.length) return { providerMode: "cache" as const, results: cached.results };

  if (input.provider === "pexels") {
    return input.type === "video"
      ? searchPexelsVideos(input.query, { orientation: input.orientation })
      : searchPexelsPhotos(input.query, { orientation: input.orientation });
  }
  if (input.provider === "pixabay") {
    return input.type === "video"
      ? searchPixabayVideos(input.query, { orientation: input.orientation })
      : searchPixabayImages(input.query, { orientation: input.orientation });
  }
  if (input.provider === "unsplash") return searchUnsplashPhotos(input.query);

  return { providerMode: "demo" as const, results: mockExternalResults(input), warning: `${input.provider} sem provider real conectado.` };
}

function mockExternalResults(input: { provider: AssetProvider; query: string; type: "image" | "video"; orientation?: AssetOrientation }): ExternalAssetSearchResult[] {
  return Array.from({ length: 6 }, (_, index) => ({
    id: `${input.provider}_${input.type}_${index + 1}`,
    provider: input.provider,
    type: input.type,
    title: `${input.query} ${input.type === "video" ? "video" : "imagem"} ${index + 1}`,
    thumbnailUrl: `/media/mock-thumbnail-${(index % 6) + 1}.jpg`,
    fileUrl: input.type === "video" ? "/media/mock-render.mp4" : `/media/mock-thumbnail-${(index % 6) + 1}.jpg`,
    previewUrl: input.type === "video" ? "/media/mock-render.mp4" : undefined,
    width: input.orientation === "vertical" ? 1080 : 1920,
    height: input.orientation === "vertical" ? 1920 : 1080,
    durationSeconds: input.type === "video" ? 8 + index : undefined,
    author: input.provider,
    sourceUrl: `https://${input.provider}.com/mock/${index + 1}`
  }));
}
