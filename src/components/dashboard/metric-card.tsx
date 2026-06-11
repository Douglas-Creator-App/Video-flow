import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MetricCard({ label, value, change }: { label: string; value: string; change: string }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-4">
          <p className="text-3xl font-semibold tabular-nums tracking-normal">{value}</p>
          <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">{change}</span>
        </div>
      </CardContent>
    </Card>
  );
}
