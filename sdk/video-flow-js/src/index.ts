export type VideoFlowOptions = {
  apiKey: string;
  baseUrl?: string;
};

export type CreateProjectInput = {
  name: string;
  description?: string;
  main_niche?: string;
  language?: string;
  country?: string;
  primary_color?: string;
};

export type RenderInput = {
  video_project_id: string;
  quality?: "preview" | "final";
  duration_seconds?: number;
};

export type ExportInput = {
  video_project_id?: string;
  video_project_ids?: string[];
  target_platform?: "youtube" | "youtube_shorts" | "tiktok" | "instagram_reels" | "facebook_reels";
};

export class VideoFlowClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(options: VideoFlowOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl?.replace(/\/$/, "") ?? "https://app.videoflow.ai";
  }

  createProject(input: CreateProjectInput) {
    return this.request("/api/public/v1/projects", { method: "POST", body: input });
  }

  startRender(input: RenderInput) {
    return this.request("/api/public/v1/render", { method: "POST", body: input });
  }

  createExport(input: ExportInput) {
    return this.request("/api/public/v1/exports", { method: "POST", body: input });
  }

  listJobs(params: { status?: string; type?: string } = {}) {
    const search = new URLSearchParams();
    if (params.status) search.set("status", params.status);
    if (params.type) search.set("type", params.type);
    return this.request(`/api/public/v1/jobs${search.size ? `?${search}` : ""}`);
  }

  getJob(id: string) {
    return this.request(`/api/public/v1/jobs/${id}`);
  }

  getCredits() {
    return this.request("/api/public/v1/credits");
  }

  private async request(path: string, init: { method?: string; body?: unknown } = {}) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: init.method ?? "GET",
      headers: {
        "authorization": `Bearer ${this.apiKey}`,
        "content-type": "application/json"
      },
      body: init.body ? JSON.stringify(init.body) : undefined
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new VideoFlowError(payload.error ?? "Video Flow API error", response.status, payload);
    return payload;
  }
}

export class VideoFlowError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}
