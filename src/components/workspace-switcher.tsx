"use client";

import { ChevronsUpDown, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SelectField } from "@/components/ui/select-field";
import { useWorkspaceProvider } from "@/components/workspace/workspace-provider";

export function WorkspaceSwitcher() {
  const { loading, workspaces, currentWorkspace, selectedWorkspaceId, setSelectedWorkspaceId } = useWorkspaceProvider();

  if (loading) {
    return <div className="hidden items-center gap-2 rounded-md border border-white/10 bg-card/60 px-3 py-2 text-sm text-muted-foreground sm:flex"><Loader2 className="h-4 w-4 animate-spin text-primary" />Carregando workspaces...</div>;
  }

  if (!workspaces.length) {
    return <div className="hidden rounded-md border border-dashed border-amber-400/30 bg-amber-400/10 px-3 py-2 text-sm text-amber-200 sm:flex">Sem workspace selecionado</div>;
  }

  return (
    <div className="hidden items-center gap-3 sm:flex">
      <div className="grid gap-1">
        <label className="text-[11px] uppercase tracking-wide text-muted-foreground">Workspace</label>
        <SelectField
          value={selectedWorkspaceId ?? currentWorkspace?.id ?? workspaces[0]?.id ?? ""}
          onChange={(event) => setSelectedWorkspaceId(event.target.value)}
          className="min-w-64 border-primary/25 bg-card/70"
        >
          {workspaces.map((workspace) => (
            <option key={workspace.id} value={workspace.id}>
              {workspace.name}
            </option>
          ))}
        </SelectField>
      </div>
      {currentWorkspace ? (
        <Badge className="border-primary/20 bg-primary/10 text-primary">
          {currentWorkspace.role}
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5" />
        </Badge>
      ) : null}
    </div>
  );
}
