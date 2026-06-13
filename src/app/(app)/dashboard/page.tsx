import { Activity, BarChart3, Clock3, FolderKanban } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ActivationChecklist } from "@/components/onboarding/activation-checklist";
import { WorkspaceBootstrapBanner } from "@/components/workspace/workspace-bootstrap-banner";

const metrics = [
  { label: "Conteúdos Gerados", value: "0", change: "—" },
  { label: "Projetos Ativos", value: "0", change: "—" },
  { label: "Créditos Disponíveis", value: "0", change: "—" },
  { label: "Publicações", value: "0", change: "—" }
];

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center rounded-md border border-dashed p-8">
      <p className="text-center text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Badge className="w-fit border-primary/20 bg-primary/10 text-primary">Video Flow</Badge>
        <h1 className="text-3xl font-semibold tracking-normal">Dashboard</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Bem-vindo ao Video Flow. Comece criando seu primeiro projeto para ver suas métricas aqui.
        </p>
      </div>

      <WorkspaceBootstrapBanner />

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
          <CardContent>
            <EmptyState message="Nenhum conteúdo ainda. Gere seu primeiro vídeo para vê-lo aqui." />
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
          <CardContent>
            <EmptyState message="Sem atividade registrada por enquanto." />
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
            <CardDescription>Distribuição por categoria de geração.</CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState message="Nenhum crédito consumido ainda." />
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
          <CardContent>
            <EmptyState message="Nenhum projeto criado. Crie um projeto para acompanhar o progresso aqui." />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
