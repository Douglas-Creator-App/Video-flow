import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { ModuleStatusBadge, type ModuleStatus } from "@/components/ui/state";

export function ModuleHeader({
  eyebrow,
  title,
  description,
  actions,
  status
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  status?: ModuleStatus;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <Badge className="w-fit">{eyebrow}</Badge>
          {status ? <ModuleStatusBadge status={status} /> : null}
        </div>
        <h1 className="font-display text-4xl font-semibold tracking-normal text-foreground">{title}</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
