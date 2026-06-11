import type { ExportPackage, ExportPackageManifest } from "@/lib/types";

const realArtifactPrefixes = ["supabase://", "/storage/", "/renders/", "/previews/", "/thumbnails/", "/exports/", "https://", "http://"];

export function isVerifiedArtifactUrl(url?: string | null) {
  if (!url) return false;
  if (url.includes("/mock-")) return false;
  return realArtifactPrefixes.some((prefix) => url.startsWith(prefix));
}

export function verifyRenderArtifact(renderUrl?: string | null) {
  const verified = isVerifiedArtifactUrl(renderUrl);
  return {
    verified,
    status: verified ? "verified" : "demo_only",
    message: verified
      ? "Arquivo MP4 verificado para exportacao."
      : "Render demonstrativo sem MP4 real verificado no storage."
  };
}

export function verifyExportPackage(pkg?: ExportPackage, manifest?: ExportPackageManifest | null) {
  const packageVerified = isVerifiedArtifactUrl(pkg?.packageUrl);
  const videoFile = manifest?.files.find((file) => file.type === "video");
  const videoVerified = isVerifiedArtifactUrl(videoFile?.url);
  return {
    packageVerified,
    videoVerified,
    exportReady: packageVerified && videoVerified,
    message: packageVerified && videoVerified
      ? "Pacote e MP4 verificados."
      : "Pacote ou MP4 ainda nao foram gerados por storage/worker real."
  };
}
