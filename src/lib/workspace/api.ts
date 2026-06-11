import { createClient } from "@/lib/supabase/client";
import type { WorkspaceContextResponse } from "@/lib/workspace/types";

const workspaceStorageKey = "video-flow:selected-workspace-id";

export function getPersistedWorkspaceId() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(workspaceStorageKey);
}

export function persistWorkspaceId(workspaceId: string | null) {
  if (typeof window === "undefined") return;
  if (!workspaceId) {
    window.localStorage.removeItem(workspaceStorageKey);
    return;
  }
  window.localStorage.setItem(workspaceStorageKey, workspaceId);
}

export async function fetchWorkspaceContext(workspaceId?: string | null): Promise<WorkspaceContextResponse> {
  const params = new URLSearchParams();
  if (workspaceId) params.set("workspace_id", workspaceId);
  const response = await fetch(`/api/workspaces/context${params.toString() ? `?${params.toString()}` : ""}`, { cache: "no-store" });
  if (!response.ok) {
    const error = await readJsonError(response);
    throw new Error(error ?? "Falha ao carregar contexto do workspace.");
  }
  return response.json() as Promise<WorkspaceContextResponse>;
}

export async function fetchAuthenticatedUser() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  return data.user ?? null;
}

async function readJsonError(response: Response) {
  try {
    const data = await response.json();
    return String(data.error ?? data.message ?? "");
  } catch {
    return "";
  }
}
