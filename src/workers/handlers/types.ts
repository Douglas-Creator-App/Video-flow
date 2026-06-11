import type { BackgroundJob } from "@/lib/jobs/job-queue";

export interface JobHandlerContext {
  update: (progress: number, currentStep: string) => Promise<void>;
  log: (message: string, metadata?: Record<string, unknown>) => Promise<void>;
  warn: (message: string, metadata?: Record<string, unknown>) => Promise<void>;
  error: (message: string, metadata?: Record<string, unknown>) => Promise<void>;
  shouldCancel: () => Promise<boolean>;
}

export type JobHandler = (job: BackgroundJob, context: JobHandlerContext) => Promise<Record<string, unknown>>;
