import { extractFrameThumbnail } from "@/lib/media/ffmpeg";
import { generateImagesReal } from "@/lib/providers/image-provider";
import { buildWorkspaceStoragePath, isSupabaseStorageConfigured, uploadMediaFile } from "@/lib/storage/media-storage";

export async function generateThumbnailReal(input: {
  workspaceId: string;
  userId?: string;
  videoProjectId: string;
  title: string;
  prompt?: string;
  baseVideoPath?: string;
  allowFallback?: boolean;
}) {
  if (input.prompt) {
    const result = await generateImagesReal({
      workspaceId: input.workspaceId,
      userId: input.userId,
      prompt: `${input.prompt}\nThumbnail title: ${input.title}`,
      style: "high contrast YouTube thumbnail, clear subject, bold composition",
      aspectRatio: "16:9",
      quantity: 1,
      referenceId: input.videoProjectId,
      allowFallback: input.allowFallback
    });
    return { status: "completed" as const, thumbnailUrl: result.imageUrl, provider: result.provider, cost: result.cost };
  }

  if (input.baseVideoPath) {
    const framePath = `public/thumbnails/${input.videoProjectId}-frame-${Date.now()}.png`;
    await extractFrameThumbnail(input.baseVideoPath, framePath);
    if (isSupabaseStorageConfigured()) {
      const object = await uploadMediaFile({ bucket: "thumbnails", objectPath: buildWorkspaceStoragePath({ workspaceId: input.workspaceId, resourceType: "frames", fileId: `${input.videoProjectId}-frame`, extension: "png" }), filePath: framePath, contentType: "image/png" });
      return { status: "completed" as const, thumbnailUrl: object.url, provider: "ffmpeg_frame", cost: 0 };
    }
    return { status: "completed" as const, thumbnailUrl: `/${framePath.replace(/^public[\\/]/, "").replace(/\\/g, "/")}`, provider: "ffmpeg_frame", cost: 0 };
  }

  throw new Error("Thumbnail real não pôde ser criada: informe prompt de IA ou vídeo base para extrair frame.");
}
