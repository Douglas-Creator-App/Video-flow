import type { ElementType, ReactNode } from "react";
import { AlertTriangle, Inbox, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export type ModuleStatus = "REAL" | "BETA" | "DEMO";

const statusClass: Record<ModuleStatus, string> = {
  REAL: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  BETA: "border-primary/30 bg-primary/10 text-primary",
  DEMO: "border-amber-400/30 bg-amber-400/10 text-amber-200"
};

export function ModuleStatusBadge({ status }: { status: ModuleStatus }) {
  return <Badge className={statusClass[status]}>{status}</Badge>;
}

export function ErrorState({
  title = "Algo deu errado",
  description,
  actionLabel,
  onAction,
  icon: Icon = AlertTriangle
}: {
  title?: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ElementType;
}) {
  return (
    <Card className="border-destructive/25 bg-destructive/10">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-destructive/25 bg-background/60 text-destructive">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-foreground">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        {actionLabel && onAction ? <Button variant="outline" onClick={onAction}>{actionLabel}</Button> : null}
      </CardContent>
    </Card>
  );
}

export function EmptyState({
  title,
  description,
  children,
  icon: Icon = Inbox
}: {
  title: string;
  description: string;
  children?: ReactNode;
  icon?: ElementType;
}) {
  return (
    <Card className="border-dashed border-white/10 bg-secondary/25">
      <CardContent className="grid place-items-center gap-3 p-8 text-center">
        <span className="grid h-11 w-11 place-items-center rounded-md border border-primary/20 bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="font-semibold">{title}</p>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

export function LoadingState({ label = "Carregando" }: { label?: string }) {
  return (
    <div className="flex min-h-32 items-center justify-center gap-2 rounded-md border border-white/5 bg-secondary/25 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin text-primary" />
      {label}
    </div>
  );
}
