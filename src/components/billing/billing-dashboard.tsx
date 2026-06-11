"use client";

import { useEffect, useMemo, useState, type ElementType } from "react";
import { AlertTriangle, CheckCircle2, CreditCard, Gauge, Lock, Package, Receipt, RefreshCw, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkspaceProvider } from "@/components/workspace/workspace-provider";
import type { FeatureUsageDecision, Plan, Subscription, UsageSnapshot } from "@/lib/types";

type BillingOverview = {
  realMode: boolean;
  subscription: Subscription | null;
  currentPlan: Plan | null;
  plans: Plan[];
  wallet: {
    id: string;
    workspaceId: string;
    balance: number;
    reservedBalance: number;
    monthlyAllowance: number;
    purchasedCredits: number;
    usedThisPeriod: number;
    resetAt: string;
  } | null;
  usage: UsageSnapshot;
  featureChecks: Array<{
    label: string;
    feature: string;
    decision: FeatureUsageDecision;
  }>;
  transactions: Array<{
    id: string;
    type: string;
    amount: number;
    balanceAfter: number;
    description: string;
    createdAt: string;
  }>;
  invoices: Array<{
    id: string;
    status: string;
    amount: number;
    currency: string;
    providerInvoiceId?: string;
    createdAt: string;
  }>;
  events: Array<{
    id: string;
    provider: string;
    eventType: string;
    status: string;
    createdAt: string;
  }>;
};

export function BillingDashboard() {
  const { currentWorkspace, loading: workspaceLoading, error: workspaceError } = useWorkspaceProvider();
  const workspaceId = currentWorkspace?.id ?? "";
  const [overview, setOverview] = useState<BillingOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadOverview(signal?: AbortSignal) {
    if (!workspaceId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/billing/overview?workspace_id=${encodeURIComponent(workspaceId)}`, { signal });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Falha ao carregar billing real.");
      setOverview(payload);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Falha ao carregar billing real.");
      setOverview(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    void loadOverview(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  const currentPlan = overview?.currentPlan ?? currentWorkspace?.planDetails ?? null;
  const subscription = overview?.subscription ?? currentWorkspace?.subscription ?? null;
  const wallet = overview?.wallet ?? (currentWorkspace?.wallet ? {
    ...currentWorkspace.wallet,
    reservedBalance: currentWorkspace.wallet.reserved_balance
  } : null);
  const usage = overview?.usage;

  const availableCredits = useMemo(() => {
    if (!wallet) return 0;
    return Math.max(0, wallet.balance - wallet.reservedBalance);
  }, [wallet]);

  if (workspaceLoading) {
    return <BillingState title="Carregando workspace" description="Buscando contexto real antes de exibir plano e creditos." />;
  }

  if (workspaceError) {
    return <BillingState title="Erro no contexto do workspace" description={workspaceError} tone="critical" />;
  }

  if (!currentWorkspace) {
    return <BillingState title="Nenhum workspace ativo" description="Crie ou selecione um workspace para visualizar billing real." tone="warning" />;
  }

  if (loading && !overview) {
    return <BillingState title="Carregando billing real" description="Consultando Supabase para plano, wallet, limites e transacoes." />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <BillingState title="Billing real indisponivel" description={error} tone="critical" />
        <Button variant="outline" className="gap-2" onClick={() => void loadOverview()} disabled={loading}>
          <RefreshCw className="h-4 w-4" /> Tentar novamente
        </Button>
      </div>
    );
  }

  if (!currentPlan || !subscription || !wallet) {
    return (
      <div className="space-y-4">
        <BillingState
          title="Billing incompleto"
          description="Este workspace ainda nao possui plano, assinatura ou wallet real no Supabase. O uso pago deve permanecer bloqueado ate o seed/migration criar esses registros."
          tone="warning"
        />
        <Button variant="outline" className="gap-2" onClick={() => void loadOverview()} disabled={loading}>
          <RefreshCw className="h-4 w-4" /> Recarregar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-3 md:grid-cols-4">
        <Metric icon={CreditCard} label="Plano atual" value={currentPlan.name} />
        <Metric icon={Gauge} label="Creditos livres" value={formatNumber(availableCredits)} />
        <Metric icon={Package} label="Reservados" value={`${formatNumber(wallet.reservedBalance)} cr`} />
        <Metric icon={Receipt} label="Assinatura" value={subscription.status} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <Card className="border-primary/20 bg-[linear-gradient(135deg,rgb(24_24_24/.96),rgb(10_10_10/.98))]">
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <Badge>{overview?.realMode ? "REAL" : "BETA"}</Badge>
                <CardTitle className="mt-3 text-2xl">{currentPlan.name}</CardTitle>
                <CardDescription>{currentPlan.description}</CardDescription>
              </div>
              <div className="text-left md:text-right">
                <p className="font-display text-3xl font-semibold">R$ {formatCurrencyNumber(currentPlan.monthlyPrice)}</p>
                <p className="text-sm text-muted-foreground">assinatura {subscription.billingCycle}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-primary" style={{ width: `${percent(wallet.usedThisPeriod, wallet.monthlyAllowance)}%` }} />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <Limit label="Canais" value={usage?.channels ?? 0} max={currentPlan.maxChannels} />
              <Limit label="Projetos" value={usage?.projects ?? 0} max={currentPlan.maxProjects} />
              <Limit label="Usuarios" value={usage?.teamMembers ?? 0} max={currentPlan.maxTeamMembers} />
              <Limit label="Videos/mes" value={usage?.videosThisMonth ?? 0} max={currentPlan.maxVideosPerMonth} />
              <Limit label="Renders/mes" value={usage?.rendersThisMonth ?? 0} max={currentPlan.maxRendersPerMonth} />
              <Limit label="AI Video" value={usage?.aiVideoGenerations ?? 0} max={currentPlan.maxAiVideoGenerations} />
            </div>
            {currentPlan.watermarkEnabled ? (
              <div className="rounded-md border border-primary/25 bg-primary/5 p-3 text-sm text-muted-foreground">
                <p className="flex items-center gap-2 font-semibold text-foreground"><ShieldAlert className="h-4 w-4 text-primary" />Watermark ativo</p>
                <p className="mt-1">Renders deste plano exibem marca d'agua. Upgrade/checkout ainda nao esta habilitado nesta etapa.</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-primary/15">
          <CardHeader>
            <CardTitle>Bloqueios e uso</CardTitle>
            <CardDescription>Validacao real feita no backend com plano, feature flags e saldo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {(overview?.featureChecks ?? []).map((item) => (
              <div key={item.feature} className="rounded-md border border-white/5 bg-secondary/40 p-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">{item.label}</span>
                  <Badge className={item.decision.allowed ? "" : "border-destructive/30 bg-destructive/10 text-destructive"}>{item.decision.allowed ? "liberado" : "bloqueado"}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{item.decision.reason}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Planos ativos</CardTitle>
          <CardDescription>Planos vindos do Supabase. Checkout real ainda nao foi conectado.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {(overview?.plans ?? [currentPlan]).map((plan) => (
            <Card key={plan.id} className={plan.id === currentPlan.id ? "border-primary/40" : "border-white/5"}>
              <CardHeader>
                <Badge className="w-fit">{plan.watermarkEnabled ? "watermark" : "sem watermark"}</Badge>
                <CardTitle className="mt-3">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="font-display text-2xl font-semibold">R$ {formatCurrencyNumber(plan.monthlyPrice)}<span className="text-sm text-muted-foreground">/mes</span></p>
                <p className="text-sm text-muted-foreground">{formatNumber(plan.includedCredits)} creditos inclusos</p>
                <Button className="w-full gap-2" variant={plan.id === currentPlan.id ? "outline" : "secondary"} disabled>
                  <Lock className="h-4 w-4" /> Checkout pendente
                </Button>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <section className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <History
          title="Transacoes de creditos"
          empty="Nenhuma transacao real registrada para este workspace."
          rows={(overview?.transactions ?? []).map((item) => [item.type, item.description, `${formatNumber(item.amount)} cr`, formatDate(item.createdAt)])}
        />
        <History
          title="Eventos de billing"
          empty="Nenhum evento real de billing registrado."
          rows={(overview?.events ?? []).map((item) => [item.eventType, item.provider, item.status, formatDate(item.createdAt)])}
        />
      </section>

      <History
        title="Invoices"
        empty="Nenhuma invoice real registrada."
        rows={(overview?.invoices ?? []).map((item) => [item.status, `${item.currency} ${formatCurrencyNumber(item.amount)}`, item.providerInvoiceId ?? "sem provider id", formatDate(item.createdAt)])}
      />
    </div>
  );
}

function BillingState({ title, description, tone = "neutral" }: { title: string; description: string; tone?: "neutral" | "warning" | "critical" }) {
  const Icon = tone === "critical" ? AlertTriangle : tone === "warning" ? ShieldAlert : RefreshCw;
  return (
    <Card className={tone === "critical" ? "border-destructive/40" : "border-primary/15"}>
      <CardContent className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md border border-primary/20 bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="font-display text-lg font-semibold">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ icon: Icon, label, value }: { icon: ElementType; label: string; value: string }) {
  return <Card className="border-primary/10 bg-secondary/40"><CardContent className="flex items-center gap-3 p-4"><span className="grid h-10 w-10 place-items-center rounded-md border border-primary/20 bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span><div><p className="text-xs text-muted-foreground">{label}</p><p className="font-display text-xl font-semibold">{value}</p></div></CardContent></Card>;
}

function Limit({ label, value, max }: { label: string; value: number; max: number }) {
  return <div className="rounded-md border border-white/5 bg-secondary/40 p-3"><div className="flex items-center justify-between gap-2 text-sm"><span>{label}</span><span className="text-muted-foreground">{value}/{max}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background"><div className="h-full rounded-full bg-primary" style={{ width: `${percent(value, max)}%` }} /></div></div>;
}

function History({ title, rows, empty }: { title: string; rows: string[][]; empty: string }) {
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" />{title}</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {rows.length ? rows.map((row) => (
          <div key={row.join("-")} className="grid gap-2 rounded-md border border-white/5 bg-secondary/40 p-3 text-sm sm:grid-cols-4">
            <span className="font-medium">{row[0]}</span>
            <span className="sm:col-span-2 text-muted-foreground">{row[1]}</span>
            <span className="text-muted-foreground sm:text-right">{row[2]}</span>
          </div>
        )) : <p className="rounded-md border border-white/5 bg-secondary/40 p-3 text-sm text-muted-foreground">{empty}</p>}
      </CardContent>
    </Card>
  );
}

function percent(value: number, max: number) {
  if (!max || max <= 0) return 0;
  return Math.min(100, Math.max(0, (value / max) * 100));
}

function formatNumber(value: number) {
  return value.toLocaleString("pt-BR");
}

function formatCurrencyNumber(value: number) {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(value: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}
