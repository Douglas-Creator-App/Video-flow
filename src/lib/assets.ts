import { assetLibraryItems } from "@/lib/mock-data";
import type {
  AssetLibraryItem,
  AssetOrientation,
  AssetProvider,
  AssetSourceType,
  AssetType,
  ExternalAssetSearchResult
} from "@/lib/types";

export function searchAssets(input: {
  query?: string;
  type?: AssetType | "all";
  source?: AssetSourceType | "all";
  favorite?: boolean;
  tags?: string[];
  orientation?: AssetOrientation | "all";
}) {
  const query = input.query?.toLowerCase().trim() ?? "";
  return assetLibraryItems
    .filter((asset) => input.type && input.type !== "all" ? asset.type === input.type : true)
    .filter((asset) => input.source && input.source !== "all" ? asset.source === input.source : true)
    .filter((asset) => input.favorite ? asset.favorite : true)
    .filter((asset) => input.orientation && input.orientation !== "all" ? orientationForAsset(asset) === input.orientation : true)
    .filter((asset) => input.tags?.length ? input.tags.some((tag) => asset.tags.includes(tag)) : true)
    .filter((asset) => query ? [asset.title, asset.description, asset.tags.join(" ")].join(" ").toLowerCase().includes(query) : true)
    .sort((a, b) => b.qualityScore - a.qualityScore);
}

export function autoMatchVisual(sceneText: string) {
  const tokens = sceneText.toLowerCase().split(/\W+/).filter((token) => token.length > 3);
  return assetLibraryItems
    .map((asset) => {
      const haystack = [asset.title, asset.description, asset.tags.join(" ")].join(" ").toLowerCase();
      const relevance = tokens.reduce((score, token) => score + (haystack.includes(token) ? 12 : 0), 0) + asset.qualityScore * 0.4 - asset.usageCount * 0.4;
      return { asset, relevance: Math.round(relevance) };
    })
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 6);
}

export function calculateAssetQuality(asset: Pick<AssetLibraryItem, "width" | "height" | "usageCount" | "favorite" | "type">) {
  let score = 30;
  const pixels = (asset.width ?? 0) * (asset.height ?? 0);
  if (pixels >= 1920 * 1080) score += 25;
  if (pixels >= 1280 * 720) score += 15;
  if (asset.type === "video" || asset.type === "image") score += 10;
  score += Math.min(15, asset.usageCount);
  if (asset.favorite) score += 10;
  return Math.min(100, score);
}

export function detectDuplicateAsset(input: { fileUrl?: string; hash?: string; title?: string }) {
  return assetLibraryItems.find((asset) => (
    Boolean(input.fileUrl && asset.fileUrl === input.fileUrl)
    || Boolean(input.hash && asset.hash === input.hash)
    || Boolean(input.title && asset.title.toLowerCase() === input.title.toLowerCase())
  ));
}

export function importExternalAsset(result: ExternalAssetSearchResult, workspaceId: string) {
  if (!workspaceId) throw new Error("workspaceId obrigatorio para importar asset.");
  const duplicate = detectDuplicateAsset({ fileUrl: result.fileUrl, title: result.title });
  if (duplicate) return { status: "duplicate" as const, asset: duplicate, warning: "Asset ja existe na biblioteca local." };

  const asset: AssetLibraryItem = {
    id: `asset_import_${Date.now()}`,
    workspaceId,
    type: result.type,
    source: sourceFromProvider(result.provider),
    title: result.title,
    description: `Importado de ${result.provider}. Autor: ${result.author ?? "desconhecido"}.`,
    tags: [result.provider, result.type],
    fileUrl: result.fileUrl,
    thumbnailUrl: result.thumbnailUrl,
    previewUrl: result.previewUrl,
    durationSeconds: result.durationSeconds,
    width: result.width,
    height: result.height,
    fileSize: 0,
    mimeType: result.type === "video" ? "video/mp4" : "image/jpeg",
    favorite: false,
    usageCount: 0,
    qualityScore: calculateAssetQuality({ width: result.width, height: result.height, usageCount: 0, favorite: false, type: result.type }),
    createdBy: result.provider,
    createdAt: new Date().toISOString()
  };
  return { status: "imported" as const, asset };
}

function sourceFromProvider(provider: AssetProvider): AssetSourceType {
  if (provider === "pexels" || provider === "pixabay" || provider === "unsplash" || provider === "upload") return provider;
  if (provider === "internal_ai") return "generated";
  return "generated";
}

function orientationForAsset(asset: AssetLibraryItem): AssetOrientation {
  if (!asset.width || !asset.height) return "horizontal";
  if (asset.width === asset.height) return "square";
  return asset.width > asset.height ? "horizontal" : "vertical";
}

