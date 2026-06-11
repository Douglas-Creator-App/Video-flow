import type { ExternalAssetSearchResult } from "@/lib/types";

export async function searchUnsplashPhotos(query: string, options: { perPage?: number } = {}) {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return fallback(query, "UNSPLASH_ACCESS_KEY ausente; resultados demonstrativos usados.");
  try {
    const url = new URL("https://api.unsplash.com/search/photos");
    url.searchParams.set("query", query);
    url.searchParams.set("per_page", String(options.perPage ?? 12));
    const res = await fetch(url, { headers: { Authorization: `Client-ID ${key}` } });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return { providerMode: "real" as const, results: (data.results ?? []).map(photoResult), warning: null };
  } catch (error) {
    return fallback(query, error instanceof Error ? `Unsplash falhou: ${error.message}` : "Unsplash falhou.");
  }
}

function photoResult(item: any): ExternalAssetSearchResult {
  return { id: `unsplash_photo_${item.id}`, provider: "unsplash", type: "image", title: item.alt_description ?? item.description ?? "Unsplash photo", thumbnailUrl: item.urls?.small, fileUrl: item.urls?.regular, width: item.width, height: item.height, author: item.user?.name, sourceUrl: item.links?.html };
}

function fallback(query: string, warning: string) {
  return { providerMode: "mock" as const, results: Array.from({ length: 6 }, (_, i) => ({ id: `unsplash_image_${i + 1}`, provider: "unsplash" as const, type: "image" as const, title: `${query} imagem ${i + 1}`, thumbnailUrl: `/media/mock-thumbnail-${(i % 6) + 1}.jpg`, fileUrl: `/media/mock-thumbnail-${(i % 6) + 1}.jpg`, width: 1080, height: 1080, author: "unsplash", sourceUrl: `https://unsplash.com/mock/${i + 1}` })), warning };
}
