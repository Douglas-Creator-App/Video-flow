import { ensureProviderCredentials } from "@/lib/providers/credentials";
import type { AssetOrientation, ExternalAssetSearchResult } from "@/lib/types";

export async function searchPexelsPhotos(query: string, options: { perPage?: number; orientation?: AssetOrientation } = {}) {
  await ensureProviderCredentials();
  const key = process.env.PEXELS_API_KEY;
  if (!key) return fallback("pexels", query, "image", "PEXELS_API_KEY ausente; resultados demonstrativos usados.");
  try {
    const url = new URL("https://api.pexels.com/v1/search");
    url.searchParams.set("query", query);
    url.searchParams.set("per_page", String(options.perPage ?? 12));
    if (options.orientation && options.orientation !== "square") url.searchParams.set("orientation", options.orientation === "vertical" ? "portrait" : "landscape");
    const res = await fetch(url, { headers: { Authorization: key } });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return { providerMode: "real" as const, results: (data.photos ?? []).map(photoResult), warning: null };
  } catch (error) {
    return fallback("pexels", query, "image", error instanceof Error ? `Pexels falhou: ${error.message}` : "Pexels falhou.");
  }
}

export async function searchPexelsVideos(query: string, options: { perPage?: number; orientation?: AssetOrientation } = {}) {
  await ensureProviderCredentials();
  const key = process.env.PEXELS_API_KEY;
  if (!key) return fallback("pexels", query, "video", "PEXELS_API_KEY ausente; resultados demonstrativos usados.");
  try {
    const url = new URL("https://api.pexels.com/videos/search");
    url.searchParams.set("query", query);
    url.searchParams.set("per_page", String(options.perPage ?? 12));
    if (options.orientation) url.searchParams.set("orientation", options.orientation === "vertical" ? "portrait" : "landscape");
    const res = await fetch(url, { headers: { Authorization: key } });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return { providerMode: "real" as const, results: (data.videos ?? []).map(videoResult), warning: null };
  } catch (error) {
    return fallback("pexels", query, "video", error instanceof Error ? `Pexels falhou: ${error.message}` : "Pexels falhou.");
  }
}

function photoResult(item: any): ExternalAssetSearchResult {
  return { id: `pexels_photo_${item.id}`, provider: "pexels", type: "image", title: item.alt || "Pexels photo", thumbnailUrl: item.src?.medium, fileUrl: item.src?.large2x ?? item.src?.large, width: item.width, height: item.height, author: item.photographer, sourceUrl: item.url };
}
function videoResult(item: any): ExternalAssetSearchResult {
  const file = item.video_files?.find((v: any) => v.quality === "hd") ?? item.video_files?.[0];
  return { id: `pexels_video_${item.id}`, provider: "pexels", type: "video", title: `Pexels video ${item.id}`, thumbnailUrl: item.image, fileUrl: file?.link, previewUrl: file?.link, width: item.width, height: item.height, durationSeconds: item.duration, author: item.user?.name, sourceUrl: item.url };
}
function fallback(provider: "pexels", query: string, type: "image" | "video", warning: string) {
  return { providerMode: "mock" as const, results: mock(provider, query, type), warning };
}
function mock(provider: "pexels", query: string, type: "image" | "video"): ExternalAssetSearchResult[] {
  return Array.from({ length: 6 }, (_, i) => ({ id: `${provider}_${type}_${i + 1}`, provider, type, title: `${query} ${type} ${i + 1}`, thumbnailUrl: `/media/mock-thumbnail-${(i % 6) + 1}.jpg`, fileUrl: type === "video" ? "/media/mock-render.mp4" : `/media/mock-thumbnail-${(i % 6) + 1}.jpg`, previewUrl: type === "video" ? "/media/mock-render.mp4" : undefined, width: 1080, height: type === "video" ? 1920 : 1080, durationSeconds: type === "video" ? 8 + i : undefined, author: provider, sourceUrl: `https://${provider}.com/mock/${i + 1}` }));
}
