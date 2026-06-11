import { checkFfmpegAvailable, getFfmpegPath } from "@/lib/media/ffmpeg";

export interface FfmpegStatus {
  available: boolean;
  version?: string;
  path: string;
  error?: string;
}

export function checkFfmpeg(): FfmpegStatus {
  return checkFfmpegAvailable();
}

export { getFfmpegPath };
