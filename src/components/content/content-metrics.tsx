import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { contentDashboard } from "@/lib/mock-data";

export function ContentMetrics() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Total de conteúdos
          </CardTitle>
          <CardDescription>Visão consolidada da biblioteca central.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-semibold tabular-nums">{contentDashboard.total}</p>
        </CardContent>
      </Card>
      <MetricGroup title="Conteúdos por categoria" data={contentDashboard.byCategory} />
      <MetricGroup title="Conteúdos por status" data={contentDashboard.byStatus} />
      <MetricGroup title="Conteúdos por projeto" data={contentDashboard.byProject} />
      <MetricGroup title="Conteúdos por nicho" data={contentDashboard.byNiche} />
    </div>
  );
}

function MetricGroup({ title, data }: { title: string; data: Record<string, number> }) {
  const max = Math.max(...Object.values(data), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(data).map(([label, value]) => (
          <div key={label} className="space-y-2">
            <div className="flex justify-between gap-4 text-sm">
              <span>{label}</span>
              <span className="tabular-nums text-muted-foreground">{value}</span>
            </div>
            <div className="h-2 rounded-full bg-secondary">
              <div className="h-2 rounded-full bg-primary" style={{ width: `${(value / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
