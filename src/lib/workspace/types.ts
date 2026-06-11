import type { ReactNode } from "react";
import type { CreditWallet, Plan, Subscription } from "@/lib/types";

export type WorkspaceContextUser = {
  id: string;
  email: string | null;
  profile: { full_name: string | null; avatar_url: string | null } | null;
};

export type WorkspaceSummary = {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  role: string;
  isOwner: boolean;
  permissions: string[];
  subscription: Subscription | null;
  planDetails: Plan | null;
  wallet: (CreditWallet & { reserved_balance: number }) | null;
};

export type WorkspaceContextResponse = {
  user: WorkspaceContextUser;
  workspaces: WorkspaceSummary[];
  currentWorkspace: WorkspaceSummary | null;
  featureFlags: Array<{ workspace_id: string | null; feature_key: string; enabled: boolean; limit_value: number | null }>;
  selectedWorkspaceId: string | null;
};

export type WorkspaceProviderState = {
  loading: boolean;
  error: string | null;
  user: WorkspaceContextUser | null;
  workspaces: WorkspaceSummary[];
  currentWorkspace: WorkspaceSummary | null;
  selectedWorkspaceId: string | null;
  featureFlags: WorkspaceContextResponse["featureFlags"];
  setSelectedWorkspaceId: (workspaceId: string | null) => void;
  refetch: () => Promise<void>;
};

export type WorkspaceGuardProps = {
  children: ReactNode;
  requirePermission?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  loadingTitle?: string;
};
