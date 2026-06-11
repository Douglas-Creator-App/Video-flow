import { execFile } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { mediaAssets, subtitleSegments, videoProjects, videoScenes } from "@/lib/mock-data";
import { checkFfmpeg, getFfmpegPath } from "@/lib/render/ffmpeg-check";
import { saveRenderArtifact } from "@/lib/media/render-artifacts";
import { validateMp4Artifact } from "@/lib/media/ffmpeg";
import { buildWorkspaceStoragePath, downloadMediaFile, isSupabaseStorageConfigured, parseStorageUrl, uploadMediaFile } from "@/lib/storage/media-storage";
import { getVideoProjectBundle } from "@/lib/video/video-repository";
import type { MediaAsset, MotionType, VideoAspectRatio, VideoScene } from "@/lib/types";

const execFileAsync = promisify(execFile);

export type RenderQuality = "preview" | "final";
export type RenderEngineStatus = "queued" | "preparing" | "rendering_scenes" | "mixing_audio" | "adding_subtitles" | "uploading" | "completed" | "failed";

export async function renderVideoWithFfmpeg(input: { videoProjectId: string; quality: RenderQuality }) {
  const startedAt = Date.now();
  const logs: string[] = ["Render solicitado", `Qualidade: ${input.quality}`];
  const ffmpeg = checkFfmpeg();
  if (!ffmpeg.available) {
    return failed(ffmpeg.error ?? "FFmpeg não está instalado ou não está disponível no PATH.", logs.concat(ffmpeg.error ?? "FFmpeg indisponivel."), startedAt);
  }

  const bundle = await getVideoProjectBundle(input.videoProjectId);
  const project = bundle?.project ?? videoProjects.find((item) => item.id === input.videoProjectId);
  if (!project) return failed("video_project_id nao encontrado.", logs, startedAt);

  const scenes = (bundle?.scenes ?? videoScenes.filter((scene) => scene.videoProjectId === project.id)).sort((a, b) => a.orderIndex - b.orderIndex);
  if (!scenes.length) return failed("Nenhuma cena encontrada para renderizar.", logs, startedAt);
  const sceneAssets = new Map((bundle?.mediaAssets ?? mediaAssets).map((asset) => [asset.id, asset]));

  const size = sizeFor(project.aspectRatio, input.quality);
  const tmpDir = path.join(process.cwd(), ".render-tmp", `${project.id}-${Date.now()}`);
  const publicDir = path.join(process.cwd(), "public");
  const outputFolder = input.quality === "preview" ? "previews" : "renders";
  const outputDir = path.join(publicDir, outputFolder);
  const thumbnailDir = path.join(publicDir, "thumbnails");
  await mkdir(tmpDir, { recursive: true });
  await mkdir(outputDir, { recursive: true });
  await mkdir(thumbnailDir, { recursive: true });

  try {
    logs.push(`FFmpeg ok: ${ffmpeg.version}`);
    logs.push(`Preparando ${scenes.length} cenas em ${size.width}x${size.height}`);
    const segmentPaths: string[] = [];

    for (const scene of scenes) {
      const segmentPath = path.join(tmpDir, `scene-${scene.orderIndex}.mp4`);
      await renderScene({ scene, outputPath: segmentPath, width: size.width, height: size.height, fps: 30, logs, assets: sceneAssets, tmpDir });
      segmentPaths.push(segmentPath);
    }

    const concatList = path.join(tmpDir, "concat.txt");
    await writeFile(concatList, segmentPaths.map((file) => `file '${file.replace(/\\/g, "/")}'`).join("\n"), "utf8");
    const joinedPath = path.join(tmpDir, "joined.mp4");
    logs.push("Concatenando cenas");
    await ffmpegExec(["-y", "-f", "concat", "-safe", "0", "-i", concatList, "-c", "copy", joinedPath], logs);

    let currentPath = joinedPath;
    const subtitles = bundle?.subtitles ?? subtitleSegments.filter((item) => item.videoProjectId === project.id);
    if (project.subtitleEnabled && subtitles.length) {
      logs.push("Renderizando legendas");
      const srtPath = path.join(tmpDir, "subtitles.srt");
      await writeFile(srtPath, buildSrt(subtitles), "utf8");
      const subtitledPath = path.join(tmpDir, "subtitled.mp4");
      await ffmpegExec(["-y", "-i", currentPath, "-vf", `subtitles=${escapeFilterPath(srtPath)}`, "-c:a", "copy", subtitledPath], logs);
      currentPath = subtitledPath;
    }

    const outputName = `${project.id}-${input.quality}-${Date.now()}.mp4`;
    const outputPath = path.join(outputDir, outputName);
    logs.push("Finalizando MP4");
    await ffmpegExec(["-y", "-i", currentPath, "-movflags", "+faststart", "-c:v", "libx264", "-preset", "veryfast", "-crf", input.quality === "preview" ? "26" : "22", "-c:a", "aac", outputPath], logs);
    const artifact = await validateMp4Artifact(outputPath);
    logs.push(`MP4 validado: ${artifact.size} bytes${artifact.durationSeconds ? `, ${artifact.durationSeconds.toFixed(1)}s` : ""}`);

    const thumbnailName = `${project.id}-${input.quality}-${Date.now()}.jpg`;
    const thumbnailPath = path.join(thumbnailDir, thumbnailName);
    logs.push("Gerando thumbnail do frame inicial");
    await ffmpegExec(["-y", "-ss", "0.1", "-i", outputPath, "-frames:v", "1", thumbnailPath], logs);
    const thumbnailFile = await validateThumbnail(thumbnailPath);

    let renderUrl = `/${outputFolder}/${outputName}`;
    let thumbnailUrl = `/thumbnails/${thumbnailName}`;
    if (isSupabaseStorageConfigured()) {
      logs.push("Enviando MP4 e thumbnail para Supabase Storage privado");
      const renderObject = await uploadMediaFile({
        bucket: input.quality === "preview" ? "temp" : "videos",
        objectPath: buildWorkspaceStoragePath({ workspaceId: project.workspaceId, resourceType: input.quality === "preview" ? "frames" : "renders", fileId: `${project.id}-${input.quality}-${Date.now()}`, extension: "mp4" }),
        filePath: outputPath,
        contentType: "video/mp4"
      });
      const thumbnailObject = await uploadMediaFile({
        bucket: "thumbnails",
        objectPath: buildWorkspaceStoragePath({ workspaceId: project.workspaceId, resourceType: "projects", fileId: `${project.id}-${input.quality}-${Date.now()}`, extension: "jpg" }),
        filePath: thumbnailPath,
        contentType: "image/jpeg"
      });
      renderUrl = renderObject.url;
      thumbnailUrl = thumbnailObject.url;
    }

    await rm(tmpDir, { recursive: true, force: true });
    await saveRenderArtifact({
      workspaceId: project.workspaceId,
      videoProjectId: project.id,
      renderUrl,
      thumbnailUrl,
      status: "completed",
      durationSeconds: artifact.durationSeconds,
      fileSize: artifact.size,
      logs: logs.concat(`Thumbnail validada: ${thumbnailFile.size} bytes`)
    });
    return {
      status: "completed" as RenderEngineStatus,
      renderUrl,
      thumbnailUrl,
      artifactVerified: true,
      providerMode: "real" as const,
      durationMs: Date.now() - startedAt,
      logs
    };
  } catch (error) {
    await rm(tmpDir, { recursive: true, force: true });
    return failed(error instanceof Error ? error.message : "Falha desconhecida no render FFmpeg.", logs, startedAt);
  }
}

async function renderScene(input: { scene: VideoScene; outputPath: string; width: number; height: number; fps: number; logs: string[]; assets: Map<string, MediaAsset>; tmpDir: string }) {
  const asset = input.scene.mediaAssetId ? input.assets.get(input.scene.mediaAssetId) : undefined;
  const assetPath = asset?.fileUrl ? await resolveAssetToLocalPath(asset.fileUrl, input.tmpDir, `asset-${input.scene.orderIndex}`, input.logs) : null;
  const duration = Math.max(1, input.scene.durationSeconds);
  const vf = sceneVideoFilter(input.scene.motionType, input.width, input.height, duration);

  if (assetPath && existsSync(assetPath) && asset?.type === "image") {
    input.logs.push(`Cena ${input.scene.orderIndex}: imagem ${asset.fileUrl}`);
    await ffmpegExec(["-y", "-loop", "1", "-t", String(duration), "-i", assetPath, "-vf", vf, "-r", String(input.fps), "-an", "-c:v", "libx264", "-pix_fmt", "yuv420p", input.outputPath], input.logs);
    return;
  }

  if (assetPath && existsSync(assetPath) && asset?.type === "video") {
    input.logs.push(`Cena ${input.scene.orderIndex}: video ${asset.fileUrl}`);
    await ffmpegExec(["-y", "-stream_loop", "-1", "-t", String(duration), "-i", assetPath, "-vf", baseScaleCrop(input.width, input.height), "-an", "-c:v", "libx264", "-pix_fmt", "yuv420p", input.outputPath], input.logs);
    return;
  }

  input.logs.push(`Cena ${input.scene.orderIndex}: asset ausente, usando fundo gerado com erro claro no log.`);
  await ffmpegExec(["-y", "-f", "lavfi", "-i", `color=c=0x0a0a0a:s=${input.width}x${input.height}:d=${duration}`, "-r", String(input.fps), "-c:v", "libx264", "-pix_fmt", "yuv420p", input.outputPath], input.logs);
}

async function ffmpegExec(args: string[], logs: string[]) {
  try {
    await execFileAsync(getFfmpegPath(), args, { windowsHide: true, timeout: 180_000 });
  } catch (error) {
    const anyError = error as { stderr?: string; message?: string };
    logs.push(anyError.stderr?.slice(0, 700) ?? anyError.message ?? "FFmpeg falhou.");
    throw new Error(anyError.stderr?.slice(0, 500) ?? anyError.message ?? "FFmpeg falhou.");
  }
}

function sizeFor(aspectRatio: VideoAspectRatio, quality: RenderQuality) {
  if (aspectRatio === "16:9") return quality === "preview" ? { width: 1280, height: 720 } : { width: 1920, height: 1080 };
  if (aspectRatio === "1:1") return quality === "preview" ? { width: 720, height: 720 } : { width: 1080, height: 1080 };
  return quality === "preview" ? { width: 720, height: 1280 } : { width: 1080, height: 1920 };
}

function baseScaleCrop(width: number, height: number) {
  return `scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height}`;
}

function sceneVideoFilter(motion: MotionType, width: number, height: number, duration: number) {
  const base = baseScaleCrop(width, height);
  if (motion === "zoom_in" || motion === "organic_motion") return `${base},zoompan=z='min(zoom+0.0015,1.08)':d=${Math.max(1, Math.round(duration * 30))}:s=${width}x${height}:fps=30`;
  if (motion === "zoom_out") return `${base},zoompan=z='max(1.08-on/900,1)':d=${Math.max(1, Math.round(duration * 30))}:s=${width}x${height}:fps=30`;
  return base;
}

async function resolveAssetToLocalPath(url: string, tmpDir: string, fileId: string, logs: string[]) {
  const storageRef = parseStorageUrl(url);
  if (storageRef) {
    const extension = path.extname(storageRef.path) || ".bin";
    const outputPath = path.join(tmpDir, `${fileId}${extension}`);
    const bytes = await downloadMediaFile(storageRef);
    await writeFile(outputPath, bytes);
    logs.push(`Asset baixado do storage: ${storageRef.bucket}/${storageRef.path}`);
    return outputPath;
  }
  if (url.startsWith("data:") || /^https?:\/\//.test(url)) return null;
  if (url.startsWith("/")) return path.join(process.cwd(), "public", url);
  return path.join(process.cwd(), "public", url);
}

function buildSrt(subtitles: Array<{ startTime: number; endTime: number; text: string }>) {
  return subtitles.map((item, index) => `${index + 1}\n${srtTime(item.startTime)} --> ${srtTime(item.endTime)}\n${item.text}\n`).join("\n");
}

function srtTime(seconds: number) {
  const date = new Date(Math.max(0, seconds) * 1000);
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  const ss = String(date.getUTCSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss},000`;
}

function escapeFilterPath(filePath: string) {
  return filePath.replace(/\\/g, "/").replace(/:/g, "\\:");
}

async function validateThumbnail(filePath: string) {
  const { stat } = await import("node:fs/promises");
  const file = await stat(filePath);
  if (file.size <= 0) throw new Error("Thumbnail gerada esta vazia.");
  return file;
}

function failed(error: string, logs: string[], startedAt: number) {
  return { status: "failed" as RenderEngineStatus, providerMode: "unavailable" as const, artifactVerified: false, error, durationMs: Date.now() - startedAt, logs };
}
