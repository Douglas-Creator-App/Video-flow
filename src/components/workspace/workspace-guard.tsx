"use client";

import type { ElementType } from "react";
import Link from "next/link";
import { AlertTriangle, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkspaceProvider } from "@/components/workspace/workspace-provider";
import type { WorkspaceGuardProps } from "@/lib/workspace/types";

export function WorkspaceGuard({
  children,
  requirePermission,
  emptyTitle = "Workspace necessario",
  emptyDescription = "Selecione um workspace valido para acessar esta area.",
  loadingTitle = "Carregando workspace..."
}: WorkspaceGuardProps) {
  const { loading, error, currentWorkspace, user } = useWorkspaceProvider();

  if (loading) {
    return (
      <Card className="border-primary/20 bg-card/70">
        <CardContent className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          {loadingTitle}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return <GuardCard icon={AlertTriangle} title="Nao foi possivel carregar o workspace" description={error} actionHref="/auth/login" actionLabel="Entrar novamente" />;
  }

  if (!user) {
    return <GuardCard icon={Shield} title="Autenticacao obrigatoria" description="Entre para acessar esta area." actionHref="/auth/login" actionLabel="Fazer login" />;
  }

  if (!currentWorkspace) {
    return <GuardCard icon={AlertTriangle} title={emptyTitle} description={emptyDescription} actionHref="/app/onboarding" actionLabel="Abrir onboarding" />;
  }

  if (requirePermission && !currentWorkspace.permissions.includes(requirePermission) && !currentWorkspace.isOwner) {
    return <GuardCard icon={AlertTriangle} title="Permissao insuficiente" description={`Voce precisa da permissao ${requirePermission} para continuar.`} actionHref="/app/settings/usuarios" actionLabel="Ver acesso" />;
  }

  return <>{children}</>;
}

function GuardCard({ icon: Icon, title, description, actionHref, actionLabel }: { icon: ElementType; title: string; description: string; actionHref: string; actionLabel: string }) {
  return (
    <Card className="border-primary/20 bg-card/70">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Icon className="h-4 w-4 text-primary" />{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
