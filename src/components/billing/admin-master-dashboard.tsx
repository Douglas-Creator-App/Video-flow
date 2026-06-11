"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, Ban, Coins, DollarSign, Gauge, RotateCcw, Shield, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SelectField } from "@/components/ui/select-field";
import { EmptyState, ErrorState, LoadingState, ModuleStatusBadge } from "@/components/ui/state";
import {
  adminWorkspaceSummaries,
  billingPlans,
  featureFlags,
  onboardingEvents,
  onboardingProgressItems,
  platformAdmins,
  providerCostSummaries
} from "@/lib/mock-data";
import { createMockBillingEvent } from "@/lib/billing";
import type { AdminWorkspaceSummary, BillingEvent } from "@/lib/types";
import { AdminTemplatePanel } from "@/components/templates/premium-template-store";
import { AdminStudioInsightsPanel } from "@/components/studio/youtube-studio-ai-panels";
import { AdminFactoryPanel } from "@/components/factories/content-factory-panels";

export function AdminMasterDashboard() {
  const [workspaces, setWorkspaces] = useState(adminWorkspaceSummaries);
  const [events, setEvents] = useState<BillingEvent[]>([]);

  const totals = useMemo(() => ({
    workspaces: workspaces.length,
    users: workspaces.reduce((total, item) => total + (item.planName === "Agency" ? 12 : 4), 0),
    activeSubscriptions: workspaces.filter((item) => ["active", "trialing"].includes(item.subscriptionStatus)).length,
    revenue: workspaces.reduce((total, item) => total + (billingPlans.find((plan) => plan.name === item.planName)?.monthlyPrice ?? 0), 0),
    credits: workspaces.reduce((total, item) => total + item.usedThisPeriod, 0),
    videos: workspaces.reduce((total, item) => total + item.videosGenerated, 0),
    renders: workspaces.reduce((total, item) => total + item.renders, 0),
    errors: workspaces.reduce((total, item) => total + item.failedJobs, 0),
    providerCost: providerCostSummaries.reduce((total, item) => total + item.estimatedCost, 0)
  }), [workspaces]);

  function addEvent(workspace: AdminWorkspaceSummary, eventType: string, payload: Record<string, unknown>) {
    setEvents((items) => [createMockBillingEvent({ workspaceId: workspace.workspaceId, eventType, payload }), ...items]);
  }

  function updateWorkspace(workspaceId: string, patch: Partial<AdminWorkspaceSummary>, eventType: string) {
    const workspace = workspaces.find((item) => item.workspaceId === workspaceId);
    if (!workspace) return;
    setWorkspaces((items) => items.map((item) => item.workspaceId === workspaceId ? { ...item, ...patch } : item));
    addEvent(workspace, eventType, patch);
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
        <Metric icon={Shield} label="Workspaces" value={String(totals.workspaces)} />
        <Metric icon={Users} label="Usuarios" value={String(totals.users)} />
        <Metric icon={DollarSign} label="Receita estimada" value={`R$ ${totals.revenue}`} />
        <Metric icon={Coins} label="Creditos usados" value={totals.credits.toLocaleString("pt-BR")} />
        <Metric icon={Activity} label="Erros" value={String(totals.errors)} />
      </section>

      <AdminTemplatePanel />

      <AdminStudioInsightsPanel />

      <AdminFactoryPanel />

      <OnboardingAdminAnalytics />

      <section className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Workspace Management</CardTitle>
            <CardDescription>Ajustes simulados criam billing_events mockados. Acesso real deve ser protegido por platform_admin.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {workspaces.map((workspace) => (
              <div key={workspace.workspaceId} className="rounded-md border border-white/5 bg-secondary/40 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>{workspace.status}</Badge>
                      <Badge>{workspace.subscriptionStatus}</Badge>
                    </div>
                    <p className="mt-2 font-semibold">{workspace.name}</p>
                    <p className="text-sm text-muted-foreground">{workspace.ownerEmail} - {workspace.planName} - {workspace.creditsBalance.toLocaleString("pt-BR")} creditos</p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <SelectField value={workspace.planName} onChange={(event) => updateWorkspace(workspace.workspaceId, { planName: event.target.value }, "plan_changed")}>
                      {billingPlans.map((plan) => <option key={plan.id} value={plan.name}>{plan.name}</option>)}
                    </SelectField>
                    <Button variant="outline" onClick={() => updateWorkspace(workspace.workspaceId, { creditsBalance: workspace.creditsBalance + 1000 }, "manual_credit_adjustment")}>+1000 creditos</Button>
                    {workspace.status === "active" ? (
                      <Button variant="destructive" className="gap-2" onClick={() => updateWorkspace(workspace.workspaceId, { status: "suspended" }, "workspace_suspended")}><Ban className="h-4 w-4" />Pausar</Button>
                    ) : (
                      <Button className="gap-2" onClick={() => updateWorkspace(workspace.workspaceId, { status: "active" }, "workspace_reactivated")}><RotateCcw className="h-4 w-4" />Reativar</Button>
                    )}
                    <Button variant="outline" disabled>Ver logs reais pendente</Button>
                  </div>
                </div>
                <div className="mt-4 grid gap-2 md:grid-cols-5">
                  <Mini label="Videos" value={workspace.videosGenerated} />
                  <Mini label="Renders" value={workspace.renders} />
                  <Mini label="Usados" value={workspace.usedThisPeriod} />
                  <Mini label="Falhas" value={workspace.failedJobs} />
                  <Mini label="Custo" value={workspace.estimatedProviderCost} prefix="R$ " />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Platform Admins</CardTitle><CardDescription>Roles: owner, admin, support, finance.</CardDescription></CardHeader>
            <CardContent className="space-y-2">
              {platformAdmins.map((admin) => <div key={admin.id} className="flex items-center justify-between rounded-md border border-white/5 bg-secondary/40 p-3 text-sm"><span>{admin.userId}</span><Badge>{admin.role}</Badge></div>)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Feature Flags</CardTitle><CardDescription>Controle por workspace.</CardDescription></CardHeader>
            <CardContent className="space-y-2">
              {featureFlags.map((flag) => <div key={flag.id} className="flex items-center justify-between rounded-md border border-white/5 bg-secondary/40 p-3 text-sm"><span>{flag.featureKey}</span><Badge>{flag.enabled ? "on" : "off"}</Badge></div>)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Eventos mockados</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {events.length ? events.map((event) => <p key={event.id} className="rounded-md border border-white/5 bg-secondary/40 p-3 text-sm text-muted-foreground">{event.eventType} - {event.createdAt}</p>) : <p className="rounded-md border border-white/5 bg-secondary/40 p-3 text-sm text-muted-foreground">Nenhum ajuste nesta sessao.</p>}
            </CardContent>
          </Card>
        </aside>
      </section>
    </div>
  );
}

function OnboardingAdminAnalytics() {
  const completed = onboardingProgressItems.filter((item) => item.completed || item.currentStep === "result").length;
  const completionRate = onboardingProgressItems.length ? Math.round((completed / onboardingProgressItems.length) * 100) : 0;
  const eventsByStep = onboardingEvents.reduce<Record<string, number>>((acc, event) => {
    acc[event.step] = (acc[event.step] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle>Onboarding Analytics</CardTitle>
        <CardDescription>Taxa de conclusao, abandono por etapa e tempo ate primeiro video/render.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-4">
        <Mini label="Conclusao" value={completionRate} prefix="" />
        <Mini label="Primeiro video" value={7} prefix="" />
        <Mini label="Primeiro render" value={14} prefix="" />
        <Mini label="Eventos" value={onboardingEvents.length} prefix="" />
        {Object.entries(eventsByStep).map(([step, count]) => <Mini key={step} label={step} value={count} prefix="" />)}
      </CardContent>
    </Card>
  );
}

export function CostAnalyticsDashboard() {
  const [runtime, setRuntime] = useState<CostCenterResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const totalCost = providerCostSummaries.reduce((total, item) => total + item.estimatedCost, 0);
  const totalCredits = providerCostSummaries.reduce((total, item) => total + item.creditsCharged, 0);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/cost-center", { cache: "no-store" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "Falha ao carregar cost center.");
      setRuntime(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar cost center.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  if (loading) return <LoadingState label="Carregando custos reais" />;
  if (error) return <ErrorState description={error} actionLabel="Tentar novamente" onAction={load} />;

  const realRows = runtime?.byProvider ?? [];
  const sourceIsReal = runtime?.source === "supabase";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-primary/20 bg-card/70 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <ModuleStatusBadge status={sourceIsReal ? "REAL" : "DEMO"} />
          <Badge>{runtime?.source ?? "mock"}</Badge>
          <span className="text-sm text-muted-foreground">Provider Cost Center, margem por plano e alertas operacionais.</span>
        </div>
        <Button variant="outline" onClick={load}>Atualizar</Button>
      </div>
      <section className="grid gap-3 md:grid-cols-4">
        <Metric icon={DollarSign} label="Custo diario" value={`R$ ${(runtime?.totals.dailyCost ?? 0).toFixed(2)}`} />
        <Metric icon={DollarSign} label="Custo mensal" value={`R$ ${(runtime?.totals.monthlyCost ?? totalCost).toFixed(2)}`} />
        <Metric icon={Coins} label="Creditos cobrados" value={(runtime?.totals.monthlyCredits ?? totalCredits).toLocaleString("pt-BR")} />
        <Metric icon={Activity} label="Workers" value={`${runtime?.operations.workerCount ?? 0}`} />
      </section>
      {runtime?.alerts.length ? (
        <Card className="border-amber-400/20 bg-amber-400/5">
          <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-300" />Alertas operacionais</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {runtime.alerts.map((alert) => <div key={alert.title} className="rounded-md border border-white/5 bg-background/45 p-3 text-sm"><Badge>{alert.severity}</Badge><p className="mt-2 font-semibold">{alert.title}</p><p className="text-muted-foreground">{alert.message}</p></div>)}
          </CardContent>
        </Card>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>Provider Cost Center</CardTitle>
          <CardDescription>Consumo por provider, workspace, usuario e video. Usa `provider_usage_logs` e `media_usage_logs` quando disponivel.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {realRows.length ? realRows.map((row) => (
            <div key={row.key} className="grid gap-3 rounded-md border border-white/5 bg-secondary/40 p-4 md:grid-cols-[1fr_160px_160px_160px] md:items-center">
              <div>
                <p className="font-semibold">{row.label}</p>
                <p className="text-sm text-muted-foreground">Provider real</p>
              </div>
              <Mini label="Usos" value={row.usage} />
              <Mini label="Creditos" value={row.credits} />
              <Mini label="Custo" value={row.cost} prefix="R$ " />
            </div>
          )) : sourceIsReal ? <EmptyState title="Sem custos no periodo" description="Nenhum uso de provider ou midia foi registrado neste mes." /> : providerCostSummaries.map((row) => (
            <div key={`${row.provider}-${row.category}-${row.workspaceId}`} className="grid gap-3 rounded-md border border-white/5 bg-secondary/40 p-4 md:grid-cols-[1fr_160px_160px_160px] md:items-center">
              <div><p className="font-semibold">{row.provider}</p><p className="text-sm text-muted-foreground">{row.workspaceName} - {row.category}</p></div>
              <Mini label="Usos" value={row.usageCount} />
              <Mini label="Creditos" value={row.creditsCharged} />
              <Mini label="Custo" value={row.estimatedCost} prefix="R$ " />
            </div>
          ))}
        </CardContent>
      </Card>

      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader><CardTitle>Margem por cliente</CardTitle><CardDescription>Receita menos provider, storage e infraestrutura estimada.</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            {runtime?.margins.length ? runtime.margins.map((row) => (
              <div key={row.workspaceId} className="grid gap-3 rounded-md border border-white/5 bg-secondary/40 p-4 md:grid-cols-[1fr_120px_120px_120px_120px] md:items-center">
                <div><p className="font-semibold">{row.workspaceName}</p><p className="text-sm text-muted-foreground">{row.planName}</p></div>
                <Mini label="Receita" value={row.revenue} prefix="R$ " />
                <Mini label="Providers" value={row.providerCost} prefix="R$ " />
                <Mini label="Infra" value={row.infraCost + row.storageCost} prefix="R$ " />
                <Mini label="Margem" value={row.margin} prefix="R$ " />
              </div>
            )) : <EmptyState title="Sem margem calculada" description="Conecte subscriptions/plans reais para calcular margem por cliente." />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Operacao</CardTitle><CardDescription>Fila, falhas, renders e exports no periodo.</CardDescription></CardHeader>
          <CardContent className="grid gap-3">
            <Mini label="Fila" value={runtime?.operations.queueSize ?? 0} />
            <Mini label="Falhas" value={runtime?.operations.failedJobs ?? 0} />
            <Mini label="Renders" value={runtime?.operations.rendersThisMonth ?? 0} />
            <Mini label="Exports" value={runtime?.operations.exportsThisMonth ?? 0} />
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader><CardTitle>Retencao e cleanup</CardTitle><CardDescription>Politicas operacionais para conter custo e volume de dados.</CardDescription></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <Mini label="Jobs completos" value={45} />
          <Mini label="Jobs falhos" value={90} />
          <Mini label="Logs" value={180} />
          <Mini label="Exports baixados" value={30} />
        </CardContent>
      </Card>
    </div>
  );
}

type CostCenterResponse = {
  source: string;
  totals: { dailyCost: number; monthlyCost: number; monthlyCredits: number };
  byProvider: Array<{ key: string; label: string; cost: number; credits: number; usage: number }>;
  margins: Array<{ workspaceId: string; workspaceName: string; planName: string; revenue: number; providerCost: number; storageCost: number; infraCost: number; margin: number; marginPercent: number }>;
  operations: { queueSize: number; failedJobs: number; activeWorker: boolean; workerCount: number; rendersThisMonth: number; exportsThisMonth: number };
  alerts: Array<{ severity: string; title: string; message: string }>;
};

function Metric({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return <Card className="border-primary/10 bg-secondary/40"><CardContent className="flex items-center gap-3 p-4"><span className="grid h-10 w-10 place-items-center rounded-md border border-primary/20 bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span><div><p className="text-xs text-muted-foreground">{label}</p><p className="font-display text-xl font-semibold">{value}</p></div></CardContent></Card>;
}

function Mini({ label, value, prefix = "" }: { label: string; value: number; prefix?: string }) {
  return <div className="rounded-md border border-white/5 bg-background/40 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="font-semibold">{prefix}{typeof value === "number" && value % 1 ? value.toFixed(2) : value.toLocaleString("pt-BR")}</p></div>;
}
