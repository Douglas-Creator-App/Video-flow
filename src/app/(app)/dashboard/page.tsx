import { Activity, BarChart3, Clock3, FolderKanban } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ActivationChecklist } from "@/components/onboarding/activation-checklist";
import { creditUsage, metrics, recentContent, recentProjects, systemActivity } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Badge className="w-fit border-primary/20 bg-primary/10 text-primary">Workspace Scale</Badge>
        <h1 className="text-3xl font-semibold tracking-normal">Dashboard</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Visão operacional mockada da infraestrutura SaaS multi-tenant.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <ActivationChecklist />

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-primary" />
              Conteúdo recente
            </CardTitle>
            <CardDescription>Itens em diferentes estágios editoriais.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentContent.map((item) => (
              <div key={item.title} className="flex items-center justify-between gap-4 rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.project}</p>
                </div>
                <Badge>{item.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Atividade do sistema
            </CardTitle>
            <CardDescription>Eventos auditáveis recentes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {systemActivity.map((item) => (
              <div key={item.label} className="flex gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <div>
                  <p className="text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.time} atrás</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Consumo de créditos
            </CardTitle>
            <CardDescription>Distribuição mockada por categoria.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {creditUsage.map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{item.label}</span>
                  <span className="tabular-nums text-muted-foreground">{item.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-secondary">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-primary" />
              Projetos recentes
            </CardTitle>
            <CardDescription>Progresso dos fluxos editoriais.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentProjects.map((project) => (
              <div key={project.name} className="rounded-md border p-4">
                <div className="mb-3 flex justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">{project.name}</p>
                    <p className="text-xs text-muted-foreground">{project.owner}</p>
                  </div>
                  <span className="text-sm tabular-nums text-muted-foreground">{project.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-secondary">
                  <div className="h-2 rounded-full bg-accent" style={{ width: `${project.progress}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
