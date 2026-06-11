import { readFile } from "node:fs/promises";
import path from "node:path";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export type MediaBucket = "videos" | "thumbnails" | "exports" | "audio" | "images" | "temp";
export type StorageResourceType = "renders" | "projects" | "packages" | "tts" | "generated" | "frames" | "bulk";

export interface MediaObjectRef {
  bucket: MediaBucket;
  path: string;
  url: string;
  size?: number;
  mimeType?: string;
}

export function isSupabaseStorageConfigured() {
  return isSupabaseAdminConfigured();
}

export async function uploadMediaFile(input: {
  bucket: MediaBucket;
  objectPath: string;
  filePath?: string;
  data?: Buffer | Uint8Array | ArrayBuffer;
  contentType: string;
  upsert?: boolean;
}) {
  if (!isSupabaseStorageConfigured()) throw new Error("Supabase Storage nao configurado para upload real.");
  const data = input.data ? toBuffer(input.data) : await readFile(input.filePath!);
  const normalizedPath = normalizeObjectPath(input.objectPath);
  const { error } = await createAdminClient().storage
    .from(input.bucket)
    .upload(normalizedPath, data, { contentType: input.contentType, upsert: input.upsert ?? true });
  if (error) throw new Error(`Falha ao enviar arquivo para Storage (${input.bucket}): ${error.message}`);
  return { bucket: input.bucket, path: normalizedPath, url: toStorageUrl(input.bucket, normalizedPath), size: data.byteLength, mimeType: input.contentType } satisfies MediaObjectRef;
}

export async function downloadMediaFile(urlOrRef: string | MediaObjectRef) {
  const ref = typeof urlOrRef === "string" ? parseStorageUrl(urlOrRef) : urlOrRef;
  if (!ref) throw new Error("URL de storage invalida para download.");
  const { data, error } = await createAdminClient().storage.from(ref.bucket).download(ref.path);
  if (error || !data) throw new Error(`Falha ao baixar arquivo do Storage: ${error?.message ?? "sem dados"}`);
  return Buffer.from(await data.arrayBuffer());
}

export async function deleteMediaFile(urlOrRef: string | MediaObjectRef) {
  const ref = typeof urlOrRef === "string" ? parseStorageUrl(urlOrRef) : urlOrRef;
  if (!ref) throw new Error("URL de storage invalida para exclusao.");
  const { error } = await createAdminClient().storage.from(ref.bucket).remove([ref.path]);
  if (error) throw new Error(`Falha ao excluir arquivo do Storage: ${error.message}`);
  return true;
}

export async function getSignedMediaUrl(urlOrRef: string | MediaObjectRef, expiresInSeconds = Number(process.env.MEDIA_SIGNED_URL_TTL_SECONDS ?? 3600)) {
  const ref = typeof urlOrRef === "string" ? parseStorageUrl(urlOrRef) : urlOrRef;
  if (!ref) throw new Error("URL de storage invalida para signed URL.");
  const { data, error } = await createAdminClient().storage.from(ref.bucket).createSignedUrl(ref.path, expiresInSeconds);
  if (error || !data?.signedUrl) throw new Error(`Falha ao criar signed URL: ${error?.message ?? "sem URL"}`);
  return data.signedUrl;
}

export async function validateMediaExists(urlOrRef: string | MediaObjectRef, expected?: { minSize?: number; mimePrefix?: string }) {
  const ref = typeof urlOrRef === "string" ? parseStorageUrl(urlOrRef) : urlOrRef;
  if (!ref) return { exists: false, error: "Referencia de storage invalida." };
  const folder = path.posix.dirname(ref.path);
  const name = path.posix.basename(ref.path);
  const { data, error } = await createAdminClient().storage.from(ref.bucket).list(folder === "." ? "" : folder, { search: name, limit: 1 });
  if (error) return { exists: false, error: error.message };
  const item = data?.find((entry) => entry.name === name);
  if (!item) return { exists: false, error: "Arquivo nao encontrado no bucket." };
  const size = Number(item.metadata?.size ?? 0);
  const mimeType = String(item.metadata?.mimetype ?? item.metadata?.mimeType ?? "");
  if (expected?.minSize && size < expected.minSize) return { exists: false, error: "Arquivo menor que o minimo esperado.", size, mimeType };
  if (expected?.mimePrefix && mimeType && !mimeType.startsWith(expected.mimePrefix)) return { exists: false, error: "MIME inesperado.", size, mimeType };
  return { exists: true, size, mimeType, bucket: ref.bucket, path: ref.path };
}

export function toStorageUrl(bucket: MediaBucket, objectPath: string) {
  return `supabase://${bucket}/${normalizeObjectPath(objectPath)}`;
}

export function buildWorkspaceStoragePath(input: {
  workspaceId: string;
  resourceType: StorageResourceType;
  fileId: string;
  extension: string;
}) {
  const extension = input.extension.replace(/^\./, "");
  return normalizeObjectPath(`${input.workspaceId}/${input.resourceType}/${input.fileId}.${extension}`);
}

export function parseStorageUrl(url: string): MediaObjectRef | null {
  if (!url.startsWith("supabase://")) return null;
  const rest = url.replace("supabase://", "");
  const [bucket, ...pathParts] = rest.split("/");
  if (!bucket || !pathParts.length) return null;
  return { bucket: bucket as MediaBucket, path: pathParts.join("/"), url };
}

function normalizeObjectPath(value: string) {
  return value.replace(/^\/+/, "").replace(/\\/g, "/");
}

function toBuffer(data: Buffer | Uint8Array | ArrayBuffer) {
  if (Buffer.isBuffer(data)) return data;
  if (data instanceof ArrayBuffer) return Buffer.from(data);
  return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
}
