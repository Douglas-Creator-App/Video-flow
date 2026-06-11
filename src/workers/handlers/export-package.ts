import { createBulkExportPackage, createRealExportPackage } from "@/lib/export/export-package";
import { logMediaUsage } from "@/lib/billing/credit-ledger";
import type { ExportPlatform } from "@/lib/types";
import type { JobHandler } from "@/workers/handlers/types";

export const exportPackageHandler: JobHandler = async (job, context) => {
  const platform = (job.payload.target_platform ?? "youtube_shorts") as ExportPlatform;
  const ids = job.payload.video_project_ids as string[] | undefined;
  await context.update(20, "Validando render e thumbnail");
  if (await context.shouldCancel()) throw new Error("Job cancelado antes do ZIP.");
  await context.update(45, "Gerando metadados");
  const result = ids?.length
    ? await createBulkExportPackage(ids, platform)
    : await createRealExportPackage(String(job.payload.video_project_id ?? ""), platform);
  await context.log("Export package executado", { status: result.status });
  if (result.status === "failed") throw new Error(result.error);
  await logMediaUsage({ workspaceId: job.workspaceId, userId: job.userId, provider: "internal_zip", actionType: "export_package", units: 1, cost: Number(job.payload.required_credits ?? 0), referenceId: job.id });
  await context.update(90, "ZIP criado");
  return result as unknown as Record<string, unknown>;
};
