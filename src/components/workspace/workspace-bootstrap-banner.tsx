"use client";

import { CreateWorkspaceCard } from "@/components/workspace/create-workspace-card";
import { useWorkspaceProvider } from "@/components/workspace/workspace-provider";

export function WorkspaceBootstrapBanner() {
  const { loading, user, currentWorkspace } = useWorkspaceProvider();
  if (loading || !user || currentWorkspace) return null;
  return <CreateWorkspaceCard />;
}
