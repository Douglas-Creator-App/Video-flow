"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, Bell, CircleDollarSign, Gift, Mail, Megaphone, Send, TrendingUp, Users, type LucideIcon } from "lucide-react";
import { ModuleStatusBadge } from "@/components/ui/state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/state";
import { useWorkspaceProvider } from "@/components/workspace/workspace-provider";
import { cn } from "@/lib/utils";

type Status = "REAL" | "BETA" | "DEMO";

type GrowthData = {
  source: string;
  errors: string[];
  executive: {
    mrr: number;
    arr: number;
    churnRate: number;
    cac: number;
    ltv: number;
    activeUsers: number;
    generatedVideos: number;
    exportedVideos: number;
    providerCost: number;
    grossMargin: number;
  };
  funnel: Array<{ name: string; count: number; conversion: number; note: string }>;
  productAnalytics: {
    timeToFirstVideoHours: number;
    timeToFirstExportHours: number;
    retention: { d1: number; d7: number; d30: number };
    recentVideos: number;
    recentExports: number;
    churnRate: number;
    ltv: number;
  };
  affiliateProgram: {
    status: Status;
    cookieDays: number;
    commissionTiers: Array<{ tier: string; commission: string; condition: string }>;
    trackingPattern: string;
    payoutStatus: string;
  };
  referralProgram: {
    status: Status;
    inviterRewardCredits: number;
    invitedRewardCredits: number;
    discount: string;
    expirationDays: number;
  };
  emailFlows: Array<{ name: string; status: Status; trigger: string }>;
  notifications: Array<{ title?: string; description?: string; type?: string; status?: string; created_at?: string }>;
  campaigns: Array<{ code: string; status: Status; reward: string; guardrail: string }>;
  feedback: { status: Status; storage: string; npsEventsLast30d: number };
  crm: { leads: number; trials: number; activeCustomers: number; canceled: number };
  commercialAudit: Array<{ severity: string; title: string; message: string; action: string }>;
  generatedAt: string;
};

export function GrowthEngineDashboard() {
  const { currentWorkspace } = useWorkspaceProvider();
  const [data, setData] = useState<GrowthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState("suggestion");
  const [feedbackScore, setFeedbackScore] = useState(8);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch("/api/admin/growth", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error(await response.text());
        return response.json() as Promise<GrowthData>;
      })
      .then((payload) => {
        if (!active) return;
        setData(payload);
        setError(payload.errors?.length ? payload.errors.join(" | ") : null);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Falha ao carregar Growth Engine.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const metrics = useMemo(() => data ? [
    { label: "MRR", value: money(data.executive.mrr), detail: `ARR ${money(data.executive.arr)}`, icon: CircleDollarSign, status: "REAL" as Status },
    { label: "Churn", value: percent(data.executive.churnRate), detail: `LTV ${money(data.executive.ltv)}`, icon: TrendingUp, status: "REAL" as Status },
    { label: "Usuarios ativos", value: String(data.executive.activeUsers), detail: `${data.productAnalytics.recentVideos} videos em 7 dias`, icon: Users, status: "REAL" as Status },
    { label: "Videos gerados", value: String(data.executive.generatedVideos), detail: `${data.executive.exportedVideos} exportados`, icon: BarChart3, status: "REAL" as Status },
    { label: "Custo providers", value: money(data.executive.providerCost), detail: `Margem ${percent(data.executive.grossMargin)}`, icon: CircleDollarSign, status: "REAL" as Status },
    { label: "CAC", value: money(data.executive.cac), detail: "pendente de midia paga", icon: Megaphone, status: "BETA" as Status }
  ] : [], [data]);

  async function submitFeedback() {
    if (!currentWorkspace?.id) {
      setFeedbackStatus("Selecione um workspace antes de enviar.");
      return;
    }
    setFeedbackStatus("Enviando...");
    const response = await fetch("/api/growth/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspace_id: currentWorkspace.id,
        type: feedbackType,
        score: feedbackScore,
        message: feedbackMessage
      })
    });
    if (!response.ok) {
      setFeedbackStatus("Nao foi possivel registrar o feedback.");
      return;
    }
    setFeedbackMessage("");
    setFeedbackStatus("Feedback registrado em audit_logs.");
  }

  if (loading) return <LoadingState label="Carregando Growth Engine" />;
  if (!data) return <ErrorState title="Growth Engine indisponivel" description={error ?? "Nao foi possivel carregar os dados."} />;

  return (
    <div className="space-y-6">
      {error ? <ErrorState title="Leitura parcial" description={error} /> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label}>
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <div>
                  <CardDescription>{metric.label}</CardDescription>
                  <CardTitle className="mt-2 text-2xl">{metric.value}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <ModuleStatusBadge status={metric.status} />
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{metric.detail}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Funil de conversao</CardTitle>
            <CardDescription>Visitante, cadastro, trial, primeiro video, primeira exportacao e assinante.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.funnel.length ? data.funnel.map((step) => (
              <div key={step.name} className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-foreground">{step.name}</span>
                  <span className="text-muted-foreground">{step.count} · {step.conversion}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(step.conversion, 100)}%` }} />
                </div>
                <p className="text-xs text-muted-foreground">{step.note}</p>
              </div>
            )) : <EmptyState title="Sem dados de funil" description="Conecte Supabase real e rode os fluxos principais para popular o funil." />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics de produto</CardTitle>
            <CardDescription>Primeiro valor, retencao e uso recente.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <MetricLine label="Tempo ate primeiro video" value={`${data.productAnalytics.timeToFirstVideoHours}h`} />
            <MetricLine label="Tempo ate primeira exportacao" value={`${data.productAnalytics.timeToFirstExportHours}h`} />
            <MetricLine label="Retencao D1" value={`${data.productAnalytics.retention.d1}%`} />
            <MetricLine label="Retencao D7" value={`${data.productAnalytics.retention.d7}%`} />
            <MetricLine label="Retencao D30" value={`${data.productAnalytics.retention.d30}%`} />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <ProgramCard
          icon={Gift}
          title="Afiliados"
          status={data.affiliateProgram.status}
          description={`Cookie ${data.affiliateProgram.cookieDays} dias. ${data.affiliateProgram.payoutStatus}.`}
          lines={data.affiliateProgram.commissionTiers.map((tier) => `${tier.tier}: ${tier.commission} · ${tier.condition}`)}
          footer={data.affiliateProgram.trackingPattern}
        />
        <ProgramCard
          icon={Users}
          title="Referral"
          status={data.referralProgram.status}
          description={`${data.referralProgram.inviterRewardCredits} creditos para quem indica e ${data.referralProgram.invitedRewardCredits} para convidado.`}
          lines={[data.referralProgram.discount, `Expira em ${data.referralProgram.expirationDays} dias`, "Recompensa condicionada a workspace valido"]}
        />
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>CRM basico</CardTitle>
              <ModuleStatusBadge status="REAL" />
            </div>
            <CardDescription>Classificacao comercial a partir de workspaces e subscriptions.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <MetricLine label="Leads" value={String(data.crm.leads)} />
            <MetricLine label="Trials" value={String(data.crm.trials)} />
            <MetricLine label="Clientes ativos" value={String(data.crm.activeCustomers)} />
            <MetricLine label="Cancelados" value={String(data.crm.canceled)} />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>E-mails transacionais</CardTitle>
              <Mail className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <CardDescription>Fluxos prontos para plugar em provedor de e-mail no beta.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.emailFlows.map((flow) => (
              <div key={flow.name} className="flex items-start justify-between gap-3 rounded-md border border-white/5 bg-secondary/30 p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{flow.name}</p>
                  <p className="text-xs text-muted-foreground">{flow.trigger}</p>
                </div>
                <ModuleStatusBadge status={flow.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Notificacoes in-app</CardTitle>
              <Bell className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <CardDescription>Ultimos alertas registrados em operation_notifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.notifications.length ? data.notifications.slice(0, 6).map((notification, index) => (
              <div key={`${notification.title}-${index}`} className="rounded-md border border-white/5 bg-secondary/30 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">{notification.title ?? "Notificacao"}</p>
                  <span className="text-xs text-muted-foreground">{notification.status ?? "unread"}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{notification.description ?? notification.type ?? "Evento operacional"}</p>
              </div>
            )) : <EmptyState title="Sem notificacoes" description="Jobs, billing e exportacoes criarao alertas quando houver eventos reais." />}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Campanhas e feedback</CardTitle>
            <CardDescription>Cupons, bonus e captura de bugs/sugestoes para o beta fechado.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.campaigns.map((campaign) => (
              <div key={campaign.code} className="rounded-md border border-white/5 bg-secondary/30 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">{campaign.code}</p>
                  <ModuleStatusBadge status={campaign.status} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{campaign.reward}</p>
                <p className="mt-1 text-xs text-muted-foreground">{campaign.guardrail}</p>
              </div>
            ))}
            <div className="space-y-3 rounded-md border border-white/5 bg-background/30 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-foreground">Feedback / NPS</p>
                <ModuleStatusBadge status={data.feedback.status} />
              </div>
              <div className="grid gap-3 md:grid-cols-[1fr_120px]">
                <select value={feedbackType} onChange={(event) => setFeedbackType(event.target.value)} className="min-h-11 rounded-md border border-white/10 bg-background px-3 text-sm">
                  <option value="suggestion">Sugestao</option>
                  <option value="bug">Bug</option>
                  <option value="nps">NPS</option>
                  <option value="satisfaction">Satisfacao</option>
                </select>
                <input type="number" min={0} max={10} value={feedbackScore} onChange={(event) => setFeedbackScore(Number(event.target.value))} className="min-h-11 rounded-md border border-white/10 bg-background px-3 text-sm" />
              </div>
              <textarea value={feedbackMessage} onChange={(event) => setFeedbackMessage(event.target.value)} placeholder="Registre bug, sugestao ou motivo de nota..." className="min-h-24 w-full rounded-md border border-white/10 bg-background p-3 text-sm outline-none focus:border-primary" />
              <div className="flex flex-wrap items-center gap-3">
                <Button type="button" onClick={submitFeedback} disabled={!feedbackMessage.trim()} className="gap-2">
                  <Send className="h-4 w-4" aria-hidden="true" />
                  Enviar feedback
                </Button>
                {feedbackStatus ? <p className="text-xs text-muted-foreground">{feedbackStatus}</p> : null}
              </div>
              <p className="text-xs text-muted-foreground">{data.feedback.npsEventsLast30d} eventos em 30 dias · storage: {data.feedback.storage}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Auditoria comercial</CardTitle>
            <CardDescription>Gargalos, oportunidades e prioridades comerciais.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.commercialAudit.map((item) => (
              <div key={item.title} className={cn("rounded-md border p-3", severityClass(item.severity))}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <span className="rounded-md bg-background/50 px-2 py-1 text-xs uppercase text-muted-foreground">{item.severity}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{item.message}</p>
                <p className="mt-2 text-xs text-foreground">{item.action}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function ProgramCard({
  icon: Icon,
  title,
  status,
  description,
  lines,
  footer
}: {
  icon: LucideIcon;
  title: string;
  status: Status;
  description: string;
  lines: string[];
  footer?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
            <CardTitle>{title}</CardTitle>
          </div>
          <ModuleStatusBadge status={status} />
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {lines.map((line) => <p key={line} className="text-sm text-muted-foreground">{line}</p>)}
        {footer ? <p className="break-all rounded-md bg-secondary/40 p-2 text-xs text-muted-foreground">{footer}</p> : null}
      </CardContent>
    </Card>
  );
}

function MetricLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-h-10 items-center justify-between gap-3 rounded-md border border-white/5 bg-secondary/30 px-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value || 0);
}

function percent(value: number) {
  return `${Math.round((value || 0) * 100)}%`;
}

function severityClass(severity: string) {
  if (severity === "critical") return "border-destructive/30 bg-destructive/10";
  if (severity === "high") return "border-amber-400/30 bg-amber-400/10";
  if (severity === "medium") return "border-primary/20 bg-primary/10";
  return "border-white/5 bg-secondary/30";
}
