"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchWorkspaceContext } from "@/lib/workspace/api";

export function useWorkspaceContext(workspaceId?: string | null) {
  return useQuery({
    queryKey: ["workspace-context", workspaceId ?? null],
    queryFn: () => fetchWorkspaceContext(workspaceId),
    staleTime: 30_000
  });
}

export function useWorkspaceList(workspaceId?: string | null) {
  const query = useWorkspaceContext(workspaceId);
  return useMemo(() => ({
    ...query,
    workspaces: query.data?.workspaces ?? []
  }), [query]);
}

export function useCurrentWorkspace(workspaceId?: string | null) {
  const query = useWorkspaceContext(workspaceId);
  return useMemo(() => ({
    ...query,
    workspace: query.data?.currentWorkspace ?? null
  }), [query]);
}

export function useWorkspacePermissions(workspaceId?: string | null) {
  const query = useCurrentWorkspace(workspaceId);
  return useMemo(() => query.workspace?.permissions ?? [], [query.workspace]);
}

export function useCreditWallet(workspaceId?: string | null) {
  const query = useCurrentWorkspace(workspaceId);
  return useMemo(() => query.workspace?.wallet ?? null, [query.workspace]);
}

export function usePlanUsage(workspaceId?: string | null) {
  const query = useCurrentWorkspace(workspaceId);
  return useMemo(() => ({
    subscription: query.workspace?.subscription ?? null,
    plan: query.workspace?.planDetails ?? null
  }), [query.workspace]);
}

export function useJobs(workspaceId?: string | null, status = "all", type = "all") {
  return useQuery({
    queryKey: ["jobs", workspaceId ?? null, status, type],
    queryFn: async () => {
      if (!workspaceId) throw new Error("Workspace nao selecionado.");
      const params = new URLSearchParams({ workspace_id: workspaceId });
      if (status !== "all") params.set("status", status);
      if (type !== "all") params.set("type", type);
      const response = await fetch(`/api/jobs?${params.toString()}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Falha ao carregar jobs.");
      return response.json();
    },
    enabled: Boolean(workspaceId),
    refetchInterval: 5000
  });
}

export function useJobLogs(jobId?: string | null) {
  return useQuery({
    queryKey: ["job-logs", jobId ?? null],
    queryFn: async () => {
      if (!jobId) return null;
      const response = await fetch(`/api/jobs/${jobId}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Falha ao carregar logs do job.");
      return response.json();
    },
    enabled: Boolean(jobId),
    refetchInterval: 5000
  });
}

export function useVideoRenders(workspaceId?: string | null) {
  return useQuery({
    queryKey: ["video-renders", workspaceId ?? null],
    queryFn: async () => {
      if (!workspaceId) throw new Error("Workspace nao selecionado.");
      const response = await fetch(`/api/video-renders?workspace_id=${encodeURIComponent(workspaceId)}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Falha ao carregar renders.");
      return response.json();
    },
    enabled: Boolean(workspaceId)
  });
}

export function useExportPackages(workspaceId?: string | null) {
  return useQuery({
    queryKey: ["export-packages", workspaceId ?? null],
    queryFn: async () => {
      if (!workspaceId) throw new Error("Workspace nao selecionado.");
      const response = await fetch(`/api/export/packages?workspace_id=${encodeURIComponent(workspaceId)}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Falha ao carregar export packages.");
      return response.json();
    },
    enabled: Boolean(workspaceId),
    refetchInterval: 10_000
  });
}
