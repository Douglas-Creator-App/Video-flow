"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { getPersistedWorkspaceId, persistWorkspaceId } from "@/lib/workspace/api";
import { useWorkspaceContext } from "@/lib/workspace/hooks";
import type { WorkspaceProviderState } from "@/lib/workspace/types";

const WorkspaceContext = React.createContext<WorkspaceProviderState | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [selectedWorkspaceId, setSelectedWorkspaceId] = React.useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return getPersistedWorkspaceId();
  });
  const workspaceQuery = useWorkspaceContext(selectedWorkspaceId);
  const supabase = React.useMemo(() => createClient(), []);

  React.useEffect(() => {
    persistWorkspaceId(selectedWorkspaceId);
  }, [selectedWorkspaceId]);

  React.useEffect(() => {
    void workspaceQuery.refetch();
    const { data } = supabase.auth.onAuthStateChange(() => {
      void workspaceQuery.refetch();
    });
    return () => data.subscription.unsubscribe();
  }, [supabase, workspaceQuery.refetch]);

  React.useEffect(() => {
    if (!workspaceQuery.data) return;
    const nextSelected = workspaceQuery.data.selectedWorkspaceId;
    if (nextSelected && nextSelected !== selectedWorkspaceId) {
      setSelectedWorkspaceId(nextSelected);
    }
  }, [selectedWorkspaceId, workspaceQuery.data]);

  const value = React.useMemo<WorkspaceProviderState>(() => ({
    loading: workspaceQuery.isLoading,
    error: workspaceQuery.error instanceof Error ? workspaceQuery.error.message : null,
    user: workspaceQuery.data?.user ?? null,
    workspaces: workspaceQuery.data?.workspaces ?? [],
    currentWorkspace: workspaceQuery.data?.currentWorkspace ?? null,
    selectedWorkspaceId: workspaceQuery.data?.selectedWorkspaceId ?? selectedWorkspaceId,
    featureFlags: workspaceQuery.data?.featureFlags ?? [],
    setSelectedWorkspaceId: (workspaceId: string | null) => {
      setSelectedWorkspaceId(workspaceId);
      persistWorkspaceId(workspaceId);
    },
    refetch: async () => {
      await workspaceQuery.refetch();
    }
  }), [selectedWorkspaceId, workspaceQuery.data, workspaceQuery.error, workspaceQuery.isLoading, workspaceQuery.refetch]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspaceProvider() {
  const context = React.useContext(WorkspaceContext);
  if (!context) throw new Error("useWorkspaceProvider deve ser usado dentro de WorkspaceProvider.");
  return context;
}
