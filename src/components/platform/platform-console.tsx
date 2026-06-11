"use client";

import { useEffect, useState } from "react";
import { Code2, KeyRound, PlugZap, RefreshCw, Send, Store, Webhook, type LucideIcon } from "lucide-react";
import { ModuleStatusBadge } from "@/components/ui/state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/state";
import { useWorkspaceProvider } from "@/components/workspace/workspace-provider";

type ApiKeyRow = { id: string; name: string; key_prefix: string; scopes: string[]; status: string; rate_limit_per_minute: number; last_used_at?: string | null; created_at: string };
type WebhookRow = { id: string; url: string; events: string[]; status: string; failure_count: number; last_delivery_at?: string | null };
type ListingRow = { id: string; type: string; name: string; pricing_type: string; status: string; usage_count: number; revenue: number };
type Analytics = { totals?: Record<string, number>; marketplace?: Record<string, { total: number; published: number; usage: number; revenue: number }>; usageByEvent?: Array<{ name: string; count: number }>; webhookEvents?: Array<{ name: string; count: number }> };

const defaultScopes = ["projects.write", "render.write", "jobs.read", "exports.write", "credits.read"];
const webhookEvents = ["job_completed", "render_completed", "export_ready", "credits_low", "subscription_updated"];

export function PlatformConsole() {
  const { currentWorkspace } = useWorkspaceProvider();
  const workspaceId = currentWorkspace?.id ?? "";
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [secret, setSecret] = useState("");
  const [webhooks, setWebhooks] = useState<WebhookRow[]>([]);
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keyName, setKeyName] = useState("Integracao externa");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [listingName, setListingName] = useState("Workflow YouTube Shorts");
  const [listingType, setListingType] = useState("workflow");

  useEffect(() => {
    if (!workspaceId) return;
    void load();
  }, [workspaceId]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [keysResponse, webhooksResponse, marketplaceResponse, analyticsResponse] = await Promise.all([
        fetch(`/api/platform/api-keys?workspace_id=${workspaceId}`, { cache: "no-store" }),
        fetch(`/api/platform/webhooks?workspace_id=${workspaceId}`, { cache: "no-store" }),
        fetch("/api/platform/marketplace?status=published", { cache: "no-store" }),
        fetch("/api/admin/platform-analytics", { cache: "no-store" })
      ]);
      const [keysPayload, webhooksPayload, marketplacePayload, analyticsPayload] = await Promise.all([
        keysResponse.json(),
        webhooksResponse.json(),
        marketplaceResponse.json(),
        analyticsResponse.json()
      ]);
      if (!keysResponse.ok) throw new Error(keysPayload.error ?? "Falha ao carregar API keys.");
      setKeys(keysPayload.keys ?? []);
      setWebhooks(webhooksPayload.endpoints ?? []);
      setListings(marketplacePayload.listings ?? []);
      setAnalytics(analyticsPayload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar plataforma.");
    } finally {
      setLoading(false);
    }
  }

  async function createKey() {
    const response = await fetch("/api/platform/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspace_id: workspaceId, name: keyName, scopes: defaultScopes, rate_limit_per_minute: 120 })
    });
    const payload = await response.json();
    if (!response.ok) return setError(payload.error ?? "Falha ao gerar key.");
    setSecret(payload.secret);
    await load();
  }

  async function revokeKey(id: string) {
    await fetch(`/api/platform/api-keys/${id}`, { method: "DELETE" });
    await load();
  }

  async function createWebhook() {
    const response = await fetch("/api/platform/webhooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspace_id: workspaceId, url: webhookUrl, events: webhookEvents })
    });
    const payload = await response.json();
    if (!response.ok) return setError(payload.error ?? "Falha ao criar webhook.");
    setWebhookUrl("");
    setSecret(payload.secret);
    await load();
  }

  async function submitListing() {
    const response = await fetch("/api/platform/marketplace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspace_id: workspaceId, type: listingType, name: listingName, pricing_type: "community", category: "Video", description: "Item enviado para revisao pelo console da plataforma." })
    });
    const payload = await response.json();
    if (!response.ok) return setError(payload.error ?? "Falha ao enviar marketplace.");
    setListingName("");
    await load();
  }

  if (!workspaceId) return <EmptyState title="Sem workspace" description="Selecione um workspace para operar a plataforma." />;
  if (loading) return <LoadingState label="Carregando console da plataforma" />;

  return (
    <div className="space-y-6">
      {error ? <ErrorState title="Leitura parcial" description={error} actionLabel="Recarregar" onAction={load} /> : null}
      {secret ? (
        <Card className="border-amber-400/25 bg-amber-400/10">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-foreground">Segredo gerado. Copie agora.</p>
            <p className="mt-2 break-all rounded-md bg-background/70 p-3 text-xs text-muted-foreground">{secret}</p>
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat title="API keys ativas" value={analytics?.totals?.activeApiKeys ?? keys.filter((item) => item.status === "active").length} icon={KeyRound} />
        <Stat title="Webhooks" value={analytics?.totals?.webhooks ?? webhooks.length} icon={Webhook} />
        <Stat title="Listings marketplace" value={analytics?.totals?.marketplaceListings ?? listings.length} icon={Store} />
        <Stat title="Eventos plataforma" value={analytics?.totals?.platformEventsThisMonth ?? 0} icon={PlugZap} />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>API publica</CardTitle>
              <ModuleStatusBadge status="REAL" />
            </div>
            <CardDescription>Gere chaves com escopos e limite por minuto. O segredo aparece apenas uma vez.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-[1fr_130px]">
              <input value={keyName} onChange={(event) => setKeyName(event.target.value)} className="min-h-11 rounded-md border border-white/10 bg-background px-3 text-sm" />
              <Button onClick={createKey} className="gap-2"><KeyRound className="h-4 w-4" />Gerar key</Button>
            </div>
            {keys.map((key) => (
              <div key={key.id} className="grid gap-3 rounded-md border border-white/5 bg-secondary/30 p-3 text-sm md:grid-cols-[1fr_120px_120px] md:items-center">
                <div>
                  <p className="font-medium text-foreground">{key.name}</p>
                  <p className="text-xs text-muted-foreground">{key.key_prefix}... · {key.scopes.join(", ")}</p>
                </div>
                <span className="text-muted-foreground">{key.rate_limit_per_minute}/min</span>
                <Button variant="outline" size="sm" onClick={() => revokeKey(key.id)}>Revogar</Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Webhooks</CardTitle>
              <ModuleStatusBadge status="REAL" />
            </div>
            <CardDescription>Eventos assinados para jobs, render, export, creditos e subscription.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-[1fr_130px]">
              <input value={webhookUrl} onChange={(event) => setWebhookUrl(event.target.value)} placeholder="https://seuapp.com/webhooks/video-flow" className="min-h-11 rounded-md border border-white/10 bg-background px-3 text-sm" />
              <Button onClick={createWebhook} disabled={!webhookUrl} className="gap-2"><Send className="h-4 w-4" />Criar</Button>
            </div>
            {webhooks.map((webhook) => (
              <div key={webhook.id} className="rounded-md border border-white/5 bg-secondary/30 p-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate font-medium text-foreground">{webhook.url}</p>
                  <span className="text-xs text-muted-foreground">{webhook.status}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{webhook.events.join(", ")} · falhas {webhook.failure_count}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Marketplace</CardTitle>
              <ModuleStatusBadge status="BETA" />
            </div>
            <CardDescription>Templates, agentes e workflows enviados para revisao.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-[130px_1fr]">
              <select value={listingType} onChange={(event) => setListingType(event.target.value)} className="min-h-11 rounded-md border border-white/10 bg-background px-3 text-sm">
                <option value="template">Template</option>
                <option value="agent">Agente</option>
                <option value="workflow">Workflow</option>
              </select>
              <input value={listingName} onChange={(event) => setListingName(event.target.value)} className="min-h-11 rounded-md border border-white/10 bg-background px-3 text-sm" />
            </div>
            <Button onClick={submitListing} disabled={!listingName} className="w-full gap-2"><Store className="h-4 w-4" />Enviar para revisao</Button>
            {listings.slice(0, 5).map((listing) => (
              <div key={listing.id} className="flex items-center justify-between gap-3 rounded-md border border-white/5 bg-secondary/30 p-3 text-sm">
                <div>
                  <p className="font-medium text-foreground">{listing.name}</p>
                  <p className="text-xs text-muted-foreground">{listing.type} · {listing.pricing_type} · uso {listing.usage_count}</p>
                </div>
                <span className="text-xs text-muted-foreground">{listing.status}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Analytics de plataforma</CardTitle>
              <Button variant="outline" size="sm" onClick={load} className="gap-2"><RefreshCw className="h-4 w-4" />Atualizar</Button>
            </div>
            <CardDescription>Uso por API, webhooks, marketplace, organizacoes e pools corporativos.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <MiniList title="Eventos API" rows={analytics?.usageByEvent ?? []} />
            <MiniList title="Eventos webhook" rows={analytics?.webhookEvents ?? []} />
            {Object.entries(analytics?.marketplace ?? {}).map(([name, item]) => (
              <div key={name} className="rounded-md border border-white/5 bg-secondary/30 p-3 text-sm">
                <p className="font-medium capitalize text-foreground">{name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.published}/{item.total} publicados · uso {item.usage} · R$ {item.revenue}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-primary" />
            <CardTitle>SDK JavaScript</CardTitle>
          </div>
          <CardDescription>Cliente em `sdk/video-flow-js` para criar projetos, renderizar, exportar, consultar jobs e creditos.</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-md border border-white/5 bg-background p-4 text-xs text-muted-foreground">{`import { VideoFlowClient } from "@videoflow/sdk";

const client = new VideoFlowClient({ apiKey: process.env.VIDEO_FLOW_API_KEY });
const project = await client.createProject({ name: "Canal Biblical", main_niche: "Biblical" });
const render = await client.startRender({ video_project_id: "video-id", quality: "final" });`}</pre>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ title, value, icon: Icon }: { title: string; value: number; icon: LucideIcon }) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardDescription>{title}</CardDescription>
          <CardTitle className="mt-2 text-2xl">{Number(value ?? 0).toLocaleString("pt-BR")}</CardTitle>
        </div>
        <Icon className="h-5 w-5 text-primary" />
      </CardHeader>
    </Card>
  );
}

function MiniList({ title, rows }: { title: string; rows: Array<{ name: string; count: number }> }) {
  return (
    <div className="rounded-md border border-white/5 bg-secondary/30 p-3">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <div className="mt-3 space-y-2">
        {rows.length ? rows.slice(0, 5).map((row) => (
          <div key={row.name} className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>{row.name}</span>
            <span>{row.count}</span>
          </div>
        )) : <p className="text-xs text-muted-foreground">Sem eventos no periodo.</p>}
      </div>
    </div>
  );
}
