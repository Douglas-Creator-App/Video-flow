"use client";

import { useEffect, useState } from "react";
import { Activity, AlertTriangle, Lock, RefreshCw, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/state";

type LogRow = Record<string, unknown>;

type LogsResponse = {
  source: string;
  errors?: string[];
  jobs: LogRow[];
  audit: LogRow[];
  security: LogRow[];
  rateLimits: LogRow[];
};

export function OperationalLogsPanel() {
  const [data, setData] = useState<LogsResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/logs", { cache: "no-store" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "Falha ao carregar logs operacionais.");
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar logs operacionais.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  if (loading) return <LoadingState label="Carregando logs operacionais" />;
  if (error) return <ErrorState description={error} actionLabel="Tentar novamente" onAction={load} />;
  if (!data) return <EmptyState title="Sem logs carregados" description="Nenhum dado operacional foi retornado pela API." />;

  return (
    <div className="space-y-4">
      {data.errors?.length ? <ErrorState title="Algumas fontes falharam" description={data.errors.join(" | ")} /> : null}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-primary/20 bg-card/70 p-4">
        <div>
          <Badge>{data.source}</Badge>
          <p className="mt-2 text-sm text-muted-foreground">Jobs, auditoria, seguranca e rate limit para suporte beta.</p>
        </div>
        <Button onClick={load} variant="outline" className="gap-2"><RefreshCw className="h-4 w-4" />Atualizar</Button>
      </div>
      <section className="grid gap-4 xl:grid-cols-2">
        <LogTable icon={Activity} title="Job logs" rows={data.jobs} columns={["level", "message", "job_id", "created_at"]} />
        <LogTable icon={ShieldCheck} title="Audit logs" rows={data.audit} columns={["action", "entity_type", "user_id", "created_at"]} />
        <LogTable icon={Lock} title="Security events" rows={data.security} columns={["event_type", "severity", "user_id", "created_at"]} />
        <LogTable icon={AlertTriangle} title="Rate limits" rows={data.rateLimits} columns={["feature", "route", "user_id", "created_at"]} />
      </section>
    </div>
  );
}

function LogTable({ icon: Icon, title, rows, columns }: { icon: typeof Activity; title: string; rows: LogRow[]; columns: string[] }) {
  return (
    <Card className="border-primary/10 bg-card/75">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><Icon className="h-4 w-4 text-primary" />{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.length ? rows.slice(0, 20).map((row, index) => (
          <div key={`${title}-${index}`} className="grid gap-2 rounded-md border border-white/5 bg-secondary/35 p-3 text-xs md:grid-cols-4">
            {columns.map((column) => <span key={column} className="truncate"><span className="text-muted-foreground">{column}: </span>{String(row[column] ?? "-")}</span>)}
          </div>
        )) : <EmptyState title="Sem registros" description={`Nenhum registro em ${title}.`} />}
      </CardContent>
    </Card>
  );
}
