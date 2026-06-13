import { logMediaUsage, logProviderUsage } from "@/lib/billing/credit-ledger";
import { generateOpenAiImages } from "@/lib/providers/openai-images";
import { buildWorkspaceStoragePath, isSupabaseStorageConfigured, uploadMediaFile } from "@/lib/storage/media-storage";
import { getProviderKey } from "@/lib/providers/credentials";

export interface ImageProviderInput {
  workspaceId: string;
  userId?: string;
  prompt: string;
  style?: string;
  aspectRatio?: string;
  quantity?: number;
  provider?: "openai_images";
  referenceId?: string;
  allowFallback?: boolean;
}

export async function generateImagesReal(input: ImageProviderInput) {
  const result = await generateOpenAiImages({
    prompt: input.prompt,
    style: input.style,
    aspectRatio: input.aspectRatio,
    quantity: input.quantity,
    model: process.env.OPENAI_IMAGE_MODEL
  });
  if (result.providerMode !== "real" && !input.allowFallback) {
    throw new Error(result.warning ?? "Image provider indisponível. Imagem real não concluída.");
  }

  const imageUrls: string[] = [];
  for (const [index, image] of result.images.entries()) {
    if (result.providerMode === "real" && isSupabaseStorageConfigured() && image.startsWith("data:")) {
      const bytes = Buffer.from(image.split(",")[1] ?? "", "base64");
      const object = await uploadMediaFile({
        bucket: "images",
        objectPath: buildWorkspaceStoragePath({ workspaceId: input.workspaceId, resourceType: "generated", fileId: `${input.referenceId ?? Date.now()}-${index + 1}`, extension: "png" }),
        data: bytes,
        contentType: "image/png"
      });
      imageUrls.push(object.url);
    } else {
      imageUrls.push(image);
    }
  }

  await logMediaUsage({ workspaceId: input.workspaceId, userId: input.userId, provider: result.provider, actionType: "image_generation", units: imageUrls.length, cost: result.cost, referenceId: input.referenceId });
  await logProviderUsage({ workspaceId: input.workspaceId, userId: input.userId, jobId: input.referenceId, provider: result.provider, taskType: "image_generation", inputUnits: 1, outputUnits: imageUrls.length, costEstimate: result.cost, status: "completed" });
  return { ...result, images: imageUrls, imageUrl: imageUrls[0] };
}

export function imageProviderStatus() {
  return { openai_images: Boolean(getProviderKey("OPENAI_API_KEY")) };
}
