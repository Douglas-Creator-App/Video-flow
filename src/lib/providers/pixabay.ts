import { ensureProviderCredentials } from "@/lib/providers/credentials";
import type { AssetOrientation, ExternalAssetSearchResult } from "@/lib/types";

export async function searchPixabayImages(query: string, options: { perPage?: number; orientation?: AssetOrientation } = {}) {
  return searchPixabay("image", query, options);
}

export async function searchPixabayVideos(query: string, options: { perPage?: number; orientation?: AssetOrientation } = {}) {
  return searchPixabay("video", query, options);
}

async function searchPixabay(type: "image" | "video", query: string, options: { perPage?: number; orientation?: AssetOrientation }) {
  await ensureProviderCredentials();
  const key = process.env.PIXABAY_API_KEY;
  if (!key) return fallback(query, type, "PIXABAY_API_KEY ausente; resultados demonstrativos usados.");
  try {
    const url = new URL(type === "video" ? "https://pixabay.com/api/videos/" : "https://pixabay.com/api/");
    url.searchParams.set("key", key);
    url.searchParams.set("q", query);
    url.searchParams.set("per_page", String(options.perPage ?? 12));
    url.searchParams.set("safesearch", "true");
    if (options.orientation && options.orientation !== "square") url.searchParams.set("orientation", options.orientation === "vertical" ? "vertical" : "horizontal");
    const res = await fetch(url);
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return { providerMode: "real" as const, results: (data.hits ?? []).map((item: any) => type === "video" ? videoResult(item) : imageResult(item)), warning: null };
  } catch (error) {
    return fallback(query, type, error instanceof Error ? `Pixabay falhou: ${error.message}` : "Pixabay falhou.");
  }
}

function imageResult(item: any): ExternalAssetSearchResult {
  return { id: `pixabay_image_${item.id}`, provider: "pixabay", type: "image", title: item.tags ?? "Pixabay image", thumbnailUrl: item.previewURL, fileUrl: item.largeImageURL ?? item.webformatURL, width: item.imageWidth, height: item.imageHeight, author: item.user, sourceUrl: item.pageURL };
}

function videoResult(item: any): ExternalAssetSearchResult {
  const video = item.videos?.large ?? item.videos?.medium ?? item.videos?.small;
  return { id: `pixabay_video_${item.id}`, provider: "pixabay", type: "video", title: item.tags ?? "Pixabay video", thumbnailUrl: item.picture_id ? `https://i.vimeocdn.com/video/${item.picture_id}_640x360.jpg` : "/media/mock-thumbnail-1.jpg", fileUrl: video?.url, previewUrl: video?.url, width: video?.width, height: video?.height, durationSeconds: item.duration, author: item.user, sourceUrl: item.pageURL };
}

function fallback(query: string, type: "image" | "video", warning: string) {
  return { providerMode: "mock" as const, results: Array.from({ length: 6 }, (_, i) => ({ id: `pixabay_${type}_${i + 1}`, provider: "pixabay" as const, type, title: `${query} ${type} ${i + 1}`, thumbnailUrl: `/media/mock-thumbnail-${(i % 6) + 1}.jpg`, fileUrl: type === "video" ? "/media/mock-render.mp4" : `/media/mock-thumbnail-${(i % 6) + 1}.jpg`, previewUrl: type === "video" ? "/media/mock-render.mp4" : undefined, width: 1080, height: 1080, durationSeconds: type === "video" ? 9 + i : undefined, author: "pixabay", sourceUrl: `https://pixabay.com/mock/${i + 1}` })), warning };
}
