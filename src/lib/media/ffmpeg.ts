import { execFile, spawnSync } from "node:child_process";
import { stat } from "node:fs/promises";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const FFMPEG_MISSING_ERROR = "FFmpeg não está instalado ou não está disponível no PATH.";

export interface FfmpegAvailability {
  available: boolean;
  path: string;
  version?: string;
  error?: string;
}

export function getFfmpegPath() {
  return process.env.FFMPEG_PATH || "ffmpeg";
}

export function getFfprobePath() {
  return process.env.FFPROBE_PATH || "ffprobe";
}

export function checkFfmpegAvailable(): FfmpegAvailability {
  const ffmpegPath = getFfmpegPath();
  try {
    const result = spawnSync(ffmpegPath, ["-version"], { encoding: "utf8", windowsHide: true });
    if (result.status === 0) return { available: true, path: ffmpegPath, version: firstLine(result.stdout) };
    return { available: false, path: ffmpegPath, error: FFMPEG_MISSING_ERROR };
  } catch {
    return { available: false, path: ffmpegPath, error: FFMPEG_MISSING_ERROR };
  }
}

export function getFfmpegVersion() {
  return checkFfmpegAvailable().version;
}

export function assertFfmpegAvailable() {
  const status = checkFfmpegAvailable();
  if (!status.available) throw new Error(FFMPEG_MISSING_ERROR);
  return status;
}

export async function runFfmpeg(args: string[], timeoutMs = 180_000) {
  assertFfmpegAvailable();
  return execFileAsync(getFfmpegPath(), args, { windowsHide: true, timeout: timeoutMs });
}

export async function extractFrameThumbnail(inputPath: string, outputPath: string) {
  await runFfmpeg(["-y", "-ss", "0.1", "-i", inputPath, "-frames:v", "1", outputPath]);
  const file = await stat(outputPath);
  if (file.size <= 0) throw new Error("Thumbnail extraida do MP4 esta vazia.");
  return { path: outputPath, size: file.size };
}

export async function validateMp4Artifact(filePath: string) {
  const file = await stat(filePath);
  if (file.size <= 0) throw new Error("MP4 gerado esta vazio.");
  const durationSeconds = await getVideoDurationSeconds(filePath);
  if (durationSeconds !== null && durationSeconds <= 0) throw new Error("MP4 gerado nao possui duracao valida.");
  return { size: file.size, durationSeconds };
}

async function getVideoDurationSeconds(filePath: string) {
  try {
    const result = await execFileAsync(getFfprobePath(), [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      filePath
    ], { windowsHide: true, timeout: 30_000 });
    const duration = Number(String(result.stdout).trim());
    return Number.isFinite(duration) ? duration : null;
  } catch {
    return null;
  }
}

function firstLine(value: string) {
  return value.split(/\r?\n/)[0];
}
