import { recordHeartbeat } from "@/lib/jobs/job-queue";
import { ensureProviderCredentials } from "@/lib/providers/credentials";
import { processNextJob } from "@/workers/runner";

const workerId = `video-flow-worker-${Date.now()}`;
const intervalMs = Number(process.env.WORKER_POLL_INTERVAL_MS ?? 5000);
const concurrency = Math.max(1, Math.min(Number(process.env.WORKER_CONCURRENCY ?? 1), 5));

async function loop() {
  console.log(`[worker] ${workerId} iniciado. Polling ${intervalMs}ms. Concorrencia ${concurrency}.`);
  await ensureProviderCredentials(true);
  await recordHeartbeat(workerId, "active", { pid: "node", intervalMs, concurrency });
  while (true) {
    const results = await Promise.all(Array.from({ length: concurrency }, (_, index) => processNextJob(`${workerId}-${index + 1}`)));
    if (results.every((result) => result.status === "idle")) await sleep(intervalMs);
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

loop().catch(async (error) => {
  console.error("[worker] falha fatal", error);
  await recordHeartbeat(workerId, "stopped", { error: error instanceof Error ? error.message : String(error) });
  process.exit(1);
});
