import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function ScoreBar({ label, value, hint }: { label: string; value: number; hint: string }) {
  const color = value >= 80 ? "bg-primary" : value >= 50 ? "bg-accent" : "bg-destructive";

  return (
    <div className="space-y-2" title={hint}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <Badge>{value}</Badge>
      </div>
      <div className="h-2 rounded-full bg-secondary">
        <div className={cn("h-2 rounded-full", color)} style={{ width: `${Math.max(0, Math.min(value, 100))}%` }} />
      </div>
    </div>
  );
}
