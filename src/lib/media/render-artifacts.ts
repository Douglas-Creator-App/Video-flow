import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { videoRenders } from "@/lib/mock-data";
import { isVerifiedArtifactUrl } from "@/lib/artifact-verification";
import { getLatestVideoRender, saveVideoRender } from "@/lib/video/video-repository";

export interface RenderArtifactRecord {
  id: string;
  workspaceId: string;
  videoProjectId: string;
  renderUrl: string;
  thumbnailUrl?: string;
  status: "completed" | "failed";
  durationSeconds?: number | null;
  fileSize: number;
  logs: string[];
  createdAt: string;
}

const storePath = path.join(process.cwd(), ".data", "render-artifacts.json");

export async function saveRenderArtifact(record: Omit<RenderArtifactRecord, "id" | "createdAt">) {
  await saveVideoRender({
    workspaceId: record.workspaceId,
    videoProjectId: record.videoProjectId,
    renderUrl: record.renderUrl,
    thumbnailUrl: record.thumbnailUrl,
    status: record.status,
    durationSeconds: record.durationSeconds,
    fileSize: record.fileSize,
    logs: record.logs
  });
  const items = await readRenderArtifacts();
  const next: RenderArtifactRecord = {
    ...record,
    id: `render_${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  const filtered = items.filter((item) => item.videoProjectId !== record.videoProjectId);
  filtered.unshift(next);
  await mkdir(path.dirname(storePath), { recursive: true });
  await writeFile(storePath, JSON.stringify(filtered, null, 2), "utf8");
  return next;
}

export async function getLatestRenderArtifact(videoProjectId: string) {
  const dbRender = await getLatestVideoRender(videoProjectId);
  if (dbRender?.render_url && isVerifiedArtifactUrl(dbRender.render_url)) {
    return {
      id: `db_render_${videoProjectId}`,
      workspaceId: "",
      videoProjectId,
      renderUrl: dbRender.render_url,
      status: "completed",
      durationSeconds: dbRender.duration_seconds ? Number(dbRender.duration_seconds) : null,
      fileSize: dbRender.file_size ? Number(dbRender.file_size) : 0,
      logs: dbRender.logs ?? [],
      createdAt: new Date().toISOString()
    } satisfies RenderArtifactRecord;
  }
  const local = await readRenderArtifacts();
  const realLocal = local.find((item) => item.videoProjectId === videoProjectId && item.status === "completed" && isVerifiedArtifactUrl(item.renderUrl));
  if (realLocal) return realLocal;
  const existing = videoRenders.find((item) => item.videoProjectId === videoProjectId && item.status === "completed" && isVerifiedArtifactUrl(item.renderUrl));
  if (!existing) return null;
  return {
    id: existing.id,
    workspaceId: existing.workspaceId,
    videoProjectId: existing.videoProjectId,
    renderUrl: existing.renderUrl ?? "",
    thumbnailUrl: undefined,
    status: "completed",
    durationSeconds: existing.durationSeconds,
    fileSize: existing.fileSize ?? 0,
    logs: existing.logs,
    createdAt: existing.createdAt
  } satisfies RenderArtifactRecord;
}

export async function readRenderArtifacts(): Promise<RenderArtifactRecord[]> {
  try {
    return JSON.parse(await readFile(storePath, "utf8")) as RenderArtifactRecord[];
  } catch {
    return [];
  }
}
