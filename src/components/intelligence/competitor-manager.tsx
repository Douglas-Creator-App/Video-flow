"use client";

import { useMemo, useState } from "react";
import { PenLine, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/ui/select-field";
import { competitorInsights, competitors as initialCompetitors, projects } from "@/lib/mock-data";
import type { Competitor } from "@/lib/types";

export function CompetitorManager() {
  const [competitors, setCompetitors] = useState<Competitor[]>(initialCompetitors);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState<Competitor["platform"]>("LinkedIn");

  const filtered = useMemo(
    () =>
      competitors.filter((competitor) => {
        const text = [competitor.name, competitor.niche, competitor.platform, competitor.notes].join(" ").toLowerCase();
        return text.includes(query.toLowerCase()) && (status === "all" || competitor.status === status);
      }),
    [competitors, query, status]
  );

  function addCompetitor() {
    if (!name.trim()) return;
    setCompetitors((items) => [
      {
        id: `competitor_${Date.now()}`,
        workspaceId: "ws_1",
        projectId: projects[0]?.id ?? "project_1",
        name,
        platform,
        url,
        niche: "Marketing",
        country: "Brasil",
        language: "pt-BR",
        notes: "Referência cadastrada manualmente.",
        status: "monitorando"
      },
      ...items
    ]);
    setName("");
    setUrl("");
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Cadastrar referência</CardTitle>
          <CardDescription>Monitore concorrentes e fontes de inspiração sem APIs externas nesta fase.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="competitor-name">Nome</Label>
            <Input id="competitor-name" value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="competitor-url">URL</Label>
            <Input id="competitor-url" value={url} onChange={(event) => setUrl(event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="competitor-platform">Plataforma</Label>
            <SelectField id="competitor-platform" value={platform} onChange={(event) => setPlatform(event.target.value as Competitor["platform"])}>
              {["LinkedIn", "YouTube", "TikTok", "Instagram Reels", "X/Twitter"].map((item) => <option key={item}>{item}</option>)}
            </SelectField>
          </div>
          <Button className="w-full gap-2" onClick={addCompetitor}>
            <Plus className="h-4 w-4" />
            Cadastrar
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_220px]">
            <Input placeholder="Buscar concorrentes, nichos ou observações" value={query} onChange={(event) => setQuery(event.target.value)} />
            <SelectField value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="all">Todos os status</option>
              <option value="ativo">ativo</option>
              <option value="monitorando">monitorando</option>
              <option value="pausado">pausado</option>
              <option value="arquivado">arquivado</option>
            </SelectField>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {filtered.map((competitor) => {
            const insight = competitorInsights.find((item) => item.competitorId === competitor.id);
            return (
              <Card key={competitor.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle>{competitor.name}</CardTitle>
                      <CardDescription>{competitor.platform} · {competitor.niche} · {competitor.country}</CardDescription>
                    </div>
                    <Badge>{competitor.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{competitor.notes}</p>
                  {insight ? (
                    <div className="grid gap-3 md:grid-cols-3">
                      <Metric label="Conteúdos" value={insight.contentCount.toString()} />
                      <Metric label="Média views" value={insight.averageViews.toLocaleString("pt-BR")} />
                      <Metric label="Frequência" value={insight.postingFrequency} />
                      <Tags label="Temas" values={insight.topThemes} />
                      <Tags label="Formatos" values={insight.topFormats} />
                      <Tags label="CTAs" values={insight.ctas} />
                    </div>
                  ) : null}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-2"><PenLine className="h-4 w-4" />Editar</Button>
                    <Button size="sm" variant="destructive" className="gap-2" onClick={() => setCompetitors((items) => items.filter((item) => item.id !== competitor.id))}>
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs text-muted-foreground">{label}</p><p className="text-sm font-medium">{value}</p></div>;
}

function Tags({ label, values }: { label: string; values: string[] }) {
  return (
    <div>
      <p className="mb-2 text-xs text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">{values.map((value) => <Badge key={value}>{value}</Badge>)}</div>
    </div>
  );
}
