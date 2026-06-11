import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { processNextJob } from "@/workers/runner";

export async function POST() {
  await requireAdmin();
  const result = await processNextJob("manual-dev-worker");
  return NextResponse.json(result);
}
