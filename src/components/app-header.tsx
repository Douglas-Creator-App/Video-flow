"use client";

import { Bell, Search, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { useWorkspaceProvider } from "@/components/workspace/workspace-provider";

export function AppHeader() {
  const { user, currentWorkspace } = useWorkspaceProvider();
  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-background/80 backdrop-blur-md">
      <div className="flex min-h-16 items-center gap-3 px-4 lg:px-8">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
          <Input className="max-w-xl border-white/10 bg-card/70 pl-9" placeholder="Busca global" aria-label="Busca global" />
        </div>
        <WorkspaceSwitcher />
        <div className="hidden min-w-0 items-end gap-1 text-right sm:flex sm:flex-col">
          <p className="max-w-48 truncate text-sm font-medium">{user?.email ?? "Sessao pendente"}</p>
          <p className="text-xs text-muted-foreground">
            {currentWorkspace ? `${currentWorkspace.name} · ${currentWorkspace.plan}` : "Nenhum workspace selecionado"}
          </p>
        </div>
        <Button variant="ghost" size="icon" aria-label="Notificações">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Perfil">
          <UserCircle className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
