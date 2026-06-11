"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, CheckCircle2, CreditCard, Gauge, Package, Receipt, ShieldAlert, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  billingPlans,
  creditPackages,
  creditTransactions,
  creditWallets,
  invoices,
  subscriptions,
  usageSnapshots
} from "@/lib/mock-data";
import { currentBillingEvents, previewCheckoutEvent } from "@/lib/billing";
import { useWorkspaceProvider } from "@/components/workspace/workspace-provider";
import type { BillingEvent, CreditPackage, FeatureUsageDecision, Plan } from "@/lib/types";

export function BillingDashboard() {
  const { currentWorkspace } = useWorkspaceProvider();
  const workspaceId = currentWorkspace?.id ?? "";
  const [events, setEvents] = useState<BillingEvent[]>([]);
  const subscription = currentWorkspace?.subscription ?? subscriptions[0];
  const currentPlan = currentWorkspace?.planDetails ?? billingPlans.find((item) => item.id === subscription.planId) ?? billingPlans[0];
  const wallet = currentWorkspace?.wallet ?? creditWallets[0];
  const usage = usageSnapshots.find((item) => item.workspaceId === workspaceId) ?? usageSnapshots[0];
  const billingFeed = currentBillingEvents(workspaceId, events);

  const checks = useMemo<Array<[string, FeatureUsageDecision]>>(() => [
    ["Roteiro", demoBillingDecision("generate_script", wallet.balance)],
    ["Voz", demoBillingDecision("generate_voice", wallet.balance)],
    ["Imagem", demoBillingDecision("generate_image", wallet.balance)],
    ["Render", demoBillingDecision("render_video", wallet.balance)],
    ["AI Video", demoBillingDecision("ai_video", wallet.balance)],
    ["White label", demoBillingDecision("white_label", wallet.balance)]
  ], [wallet.balance]);

  function createPlanEvent(plan: Plan) {
    setEvents((items) => [previewCheckoutEvent(workspaceId, plan, "plan_checkout_created"), ...items]);
  }

  function createPackageEvent(pkg: CreditPackage) {
    setEvents((items) => [previewCheckoutEvent(workspaceId, pkg, "credit_package_checkout_created"), ...items]);
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-3 md:grid-cols-4">
        <Metric icon={CreditCard} label="Plano atual" value={currentPlan.name} />
        <Metric icon={Gauge} label="Creditos" value={wallet.balance.toLocaleString("pt-BR")} />
        <Metric icon={Package} label="Uso do periodo" value={`${wallet.usedThisPeriod.toLocaleString("pt-BR")} cr`} />
        <Metric icon={Receipt} label="Trial" value={subscription.trialEndsAt ? "7 dias" : subscription.status} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <Card className="border-primary/20 bg-[linear-gradient(135deg,rgb(24_24_24/.96),rgb(10_10_10/.98))]">
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <Badge>{subscription.status}</Badge>
                <CardTitle className="mt-3 text-2xl">{currentPlan.name}</CardTitle>
                <CardDescription>{currentPlan.description}</CardDescription>
              </div>
              <div className="text-right">
                <p className="font-display text-3xl font-semibold">R$ {currentPlan.monthlyPrice}</p>
                <p className="text-sm text-muted-foreground">plano real do workspace</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (wallet.usedThisPeriod / wallet.monthlyAllowance) * 100)}%` }} />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <Limit label="Canais" value={usage.channels} max={currentPlan.maxChannels} />
              <Limit label="Projetos" value={usage.projects} max={currentPlan.maxProjects} />
              <Limit label="Usuarios" value={usage.teamMembers} max={currentPlan.maxTeamMembers} />
              <Limit label="Videos/mes" value={usage.videosThisMonth} max={currentPlan.maxVideosPerMonth} />
              <Limit label="Renders/mes" value={usage.rendersThisMonth} max={currentPlan.maxRendersPerMonth} />
              <Limit label="AI Video" value={usage.aiVideoGenerations} max={currentPlan.maxAiVideoGenerations} />
            </div>
            {currentPlan.watermarkEnabled ? (
              <div className="rounded-md border border-primary/25 bg-primary/5 p-3 text-sm text-muted-foreground">
                <p className="flex items-center gap-2 font-semibold text-foreground"><ShieldAlert className="h-4 w-4 text-primary" />Watermark ativo</p>
                <p className="mt-1">Renders deste plano exibem marca d'agua. Faça upgrade para remover.</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-primary/15">
          <CardHeader>
            <CardTitle>Bloqueios e uso</CardTitle>
            <CardDescription>Previa visual; validacao real roda nas APIs com Supabase.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {checks.map(([label, decision]) => (
              <div key={String(label)} className="rounded-md border border-white/5 bg-secondary/40 p-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">{String(label)}</span>
                  <Badge>{decision.allowed ? "liberado" : "bloqueado"}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{decision.reason}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Planos</CardTitle>
          <CardDescription>Checkout Stripe/Mercado Pago preparado como placeholder. Nenhuma cobranca real e executada.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {billingPlans.map((plan) => (
            <Card key={plan.id} className={plan.id === currentPlan.id ? "border-primary/40" : "border-white/5"}>
              <CardHeader>
                <Badge className="w-fit">{plan.watermarkEnabled ? "watermark" : "sem watermark"}</Badge>
                <CardTitle className="mt-3">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="font-display text-2xl font-semibold">R$ {plan.monthlyPrice}<span className="text-sm text-muted-foreground">/mes</span></p>
                <p className="text-sm text-muted-foreground">{plan.includedCredits.toLocaleString("pt-BR")} creditos inclusos</p>
                <Button className="w-full gap-2" variant={plan.id === currentPlan.id ? "outline" : "default"} onClick={() => createPlanEvent(plan)}>
                  {plan.id === currentPlan.id ? "Alterar ciclo" : "Assinar plano"} <ArrowUpRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <section className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader><CardTitle>Pacotes extras</CardTitle><CardDescription>Compra mockada cria billing_event e credit_transaction futura.</CardDescription></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {creditPackages.map((pkg) => (
              <div key={pkg.id} className="rounded-md border border-white/5 bg-secondary/40 p-4">
                <p className="font-semibold">{pkg.name}</p>
                <p className="text-sm text-muted-foreground">Bonus: {pkg.bonusCredits.toLocaleString("pt-BR")} creditos</p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="font-display text-xl font-semibold">R$ {pkg.price}</span>
                  <Button size="sm" onClick={() => createPackageEvent(pkg)}>Comprar</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Eventos de billing</CardTitle><CardDescription>Placeholder para Stripe e Mercado Pago.</CardDescription></CardHeader>
          <CardContent className="space-y-2">
            {billingFeed.slice(0, 6).map((event) => (
              <div key={event.id} className="rounded-md border border-white/5 bg-secondary/40 p-3 text-sm">
                <div className="flex items-center justify-between gap-2"><span className="font-medium">{event.eventType}</span><Badge>{event.status}</Badge></div>
                <p className="mt-1 text-xs text-muted-foreground">{event.provider} - {event.createdAt}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <History title="Transacoes de creditos" rows={creditTransactions.filter((item) => item.workspaceId === workspaceId).map((item) => [item.type, item.description, `${item.amount} cr`, item.createdAt])} />
        <History title="Invoices" rows={invoices.filter((item) => item.workspaceId === workspaceId).map((item) => [item.status, `${item.currency} ${item.amount}`, item.providerInvoiceId ?? "placeholder", item.createdAt])} />
      </section>
    </div>
  );
}

function demoBillingDecision(feature: string, remainingCredits: number): FeatureUsageDecision {
  return {
    allowed: feature !== "white_label",
    reason: "Previa demo da tela. A validacao real roda server-side nas APIs com Supabase.",
    code: feature === "white_label" ? "feature_not_in_plan" : "ok",
    requiredCredits: 0,
    remainingCredits,
    watermarkEnabled: true
  };
}

function Metric({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return <Card className="border-primary/10 bg-secondary/40"><CardContent className="flex items-center gap-3 p-4"><span className="grid h-10 w-10 place-items-center rounded-md border border-primary/20 bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span><div><p className="text-xs text-muted-foreground">{label}</p><p className="font-display text-xl font-semibold">{value}</p></div></CardContent></Card>;
}

function Limit({ label, value, max }: { label: string; value: number; max: number }) {
  const percent = Math.min(100, (value / max) * 100);
  return <div className="rounded-md border border-white/5 bg-secondary/40 p-3"><div className="flex items-center justify-between text-sm"><span>{label}</span><span className="text-muted-foreground">{value}/{max}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background"><div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} /></div></div>;
}

function History({ title, rows }: { title: string; rows: string[][] }) {
  return <Card><CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" />{title}</CardTitle></CardHeader><CardContent className="space-y-2">{rows.map((row) => <div key={row.join("-")} className="grid grid-cols-4 gap-2 rounded-md border border-white/5 bg-secondary/40 p-3 text-sm"><span className="font-medium">{row[0]}</span><span className="col-span-2 text-muted-foreground">{row[1]}</span><span className="text-right text-muted-foreground">{row[2]}</span></div>)}</CardContent></Card>;
}
