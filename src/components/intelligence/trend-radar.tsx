"use client";

import { useMemo, useState } from "react";
import { Eye, Lightbulb, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SelectField } from "@/components/ui/select-field";
import { niches, projects, trends as initialTrends } from "@/lib/mock-data";
import type { Trend, TrendStatus } from "@/lib/types";

const platforms = ["all", "YouTube", "YouTube Shorts", "TikTok", "Instagram Reels", "Facebook Reels", "Google Trends", "Notícias", "Reddit", "X/Twitter", "LinkedIn"];
const statuses: Array<"all" | TrendStatus> = ["all", "nova", "analisada", "aprovada", "descartada", "transformada em ideia"];

export function TrendRadar() {
  const [trends, setTrends] = useState<Trend[]>(initialTrends);
  const [projectId, setProjectId] = useState("all");
  const [niche, setNiche] = useState("all");
  const [platform, setPlatform] = useState("all");
  const [status, setStatus] = useState("all");
  const [potential, setPotential] = useState("all");

  const filtered = useMemo(
    () =>
      trends.filter((trend) => {
        return (
          (projectId === "all" || trend.projectId === projectId) &&
          (niche === "all" || trend.niche === niche) &&
          (platform === "all" || trend.platform === platform) &&
          (status === "all" || trend.status === status) &&
          (potential === "all" || trend.viralPotential >= Number(potential))
        );
      }),
    [niche, platform, potential, projectId, status, trends]
  );

  function updateTrend(id: string, nextStatus: TrendStatus) {
    setTrends((items) => items.map((trend) => (trend.id === id ? { ...trend, status: nextStatus } : trend)));
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-4 xl:grid-cols-7">
          <SelectField value={projectId} onChange={(event) => setProjectId(event.target.value)}>
            <option value="all">Projeto</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </SelectField>
          <SelectField value={niche} onChange={(event) => setNiche(event.target.value)}>
            <option value="all">Nicho</option>
            {niches.map((item) => <option key={item.id}>{item.name}</option>)}
          </SelectField>
          <SelectField>
            <option>Brasil</option>
          </SelectField>
          <SelectField>
            <option>pt-BR</option>
          </SelectField>
          <SelectField value={platform} onChange={(event) => setPlatform(event.target.value)}>
            {platforms.map((item) => <option key={item} value={item}>{item === "all" ? "Plataforma" : item}</option>)}
          </SelectField>
          <SelectField value={status} onChange={(event) => setStatus(event.target.value)}>
            {statuses.map((item) => <option key={item} value={item}>{item === "all" ? "Status" : item}</option>)}
          </SelectField>
          <SelectField value={potential} onChange={(event) => setPotential(event.target.value)}>
            <option value="all">Potencial</option>
            <option value="50">50+</option>
            <option value="70">70+</option>
            <option value="80">80+</option>
          </SelectField>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        {filtered.map((trend) => (
          <Card key={trend.id} className="border-primary/20 bg-gradient-to-br from-card to-secondary">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge>{trend.platform}</Badge>
                  <CardTitle className="mt-3">{trend.title}</CardTitle>
                  <CardDescription>{trend.description}</CardDescription>
                </div>
                <Badge>{trend.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Info label="Nicho" value={trend.niche} />
                <Info label="Potencial" value={`${trend.viralPotential}/100`} />
                <Info label="Crescimento" value={`+${trend.estimatedGrowth}%`} />
                <Info label="Concorrência" value={trend.competitionLevel} />
                <Info label="Volume" value={trend.estimatedVolume.toLocaleString("pt-BR")} />
                <Info label="Fonte" value={trend.source} />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Ver detalhes
                </Button>
                <Button size="sm" className="gap-2" onClick={() => updateTrend(trend.id, "transformada em ideia")}>
                  <Lightbulb className="h-4 w-4" />
                  Transformar em ideia
                </Button>
                <Button size="sm" variant="destructive" className="gap-2" onClick={() => updateTrend(trend.id, "descartada")}>
                  <Trash2 className="h-4 w-4" />
                  Descartar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
