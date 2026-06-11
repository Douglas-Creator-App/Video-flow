"use client";

import { useMemo, useState } from "react";
import { Archive, CalendarDays, Copy, FileText, Lightbulb, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/ui/select-field";
import { ScoreBar } from "@/components/intelligence/score-bar";
import { contentIdeas as initialIdeas, ideaEvents, ideaSources, niches, personas, projects, trends } from "@/lib/mock-data";
import type { ContentIdea, IdeaFormat, IdeaObjective, IdeaStatus, TrendPlatform } from "@/lib/types";

const statuses: IdeaStatus[] = ["rascunho", "em_análise", "aprovada", "em_produção", "produzida", "publicada", "arquivada", "descartada"];
const formats: IdeaFormat[] = ["short_video", "long_video", "carousel", "post", "article", "email", "ad", "whatsapp_message"];
const objectives: IdeaObjective[] = ["awareness", "engagement", "lead_generation", "sales", "authority", "education", "retention"];

export function IdeasWorkspace() {
  const [ideas, setIdeas] = useState<ContentIdea[]>(initialIdeas);
  const [selectedId, setSelectedId] = useState(initialIdeas[0]?.id ?? "");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [niche, setNiche] = useState("Marketing");
  const [format, setFormat] = useState<IdeaFormat>("short_video");
  const [objective, setObjective] = useState<IdeaObjective>("lead_generation");
  const [quantity, setQuantity] = useState(3);
  const [tone, setTone] = useState("consultivo");
  const [platform, setPlatform] = useState<TrendPlatform>("LinkedIn");
  const [manualTitle, setManualTitle] = useState("");

  const selectedIdea = ideas.find((idea) => idea.id === selectedId) ?? ideas[0];
  const reports = useMemo(() => buildReports(ideas), [ideas]);

  function makeIdea(title: string, index = 0): ContentIdea {
    const viralScore = 62 + ((index * 11) % 31);
    const commercialScore = 58 + ((index * 13) % 34);
    const difficultyScore = 18 + ((index * 9) % 42);

    return {
      id: `idea_${Date.now()}_${index}`,
      workspaceId: "ws_1",
      projectId,
      title,
      description: `Ideia mockada para ${niche}, formato ${format}, objetivo ${objective} e tom ${tone}.`,
      niche,
      personaId: personas.find((persona) => persona.projectId === projectId)?.id,
      sourceType: "manual",
      platformOrigin: platform,
      formatSuggestion: format,
      hook: `E se você resolvesse um problema de ${niche.toLowerCase()} em menos de 60 segundos?`,
      angle: "Transformar uma dor comum em checklist prático e acionável.",
      objective,
      funnelStage: objective === "sales" ? "fundo" : objective === "lead_generation" ? "meio" : "topo",
      viralScore,
      commercialScore,
      difficultyScore,
      priorityScore: viralScore + commercialScore - difficultyScore,
      status: "rascunho",
      tags: [niche.toLowerCase(), format, objective],
      notes: "Gerada localmente sem IA externa.",
      createdBy: "Video Flow",
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10)
    };
  }

  function generateIdeas() {
    const base = [
      `O erro invisível que trava sua estratégia de ${niche}`,
      `Como organizar ${niche} sem depender de planilhas soltas`,
      `3 sinais de que seu processo de ${niche} precisa de uma biblioteca`,
      `O checklist rápido para transformar tendência em pauta`,
      `Antes de publicar sobre ${niche}, responda essas perguntas`
    ];
    const created = base.slice(0, quantity).map((title, index) => makeIdea(title, index));
    setIdeas((items) => [...created, ...items]);
    setSelectedId(created[0]?.id ?? selectedId);
  }

  function createManualIdea() {
    if (!manualTitle.trim()) return;
    const idea = makeIdea(manualTitle, ideas.length + 1);
    setIdeas((items) => [idea, ...items]);
    setSelectedId(idea.id);
    setManualTitle("");
  }

  function updateStatus(id: string, status: IdeaStatus) {
    setIdeas((items) => items.map((idea) => (idea.id === id ? { ...idea, status, updatedAt: new Date().toISOString().slice(0, 10) } : idea)));
  }

  function duplicateIdea(idea: ContentIdea) {
    const copy = { ...idea, id: `idea_${Date.now()}`, title: `${idea.title} cópia`, status: "rascunho" as IdeaStatus };
    setIdeas((items) => [copy, ...items]);
    setSelectedId(copy.id);
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <Card className="border-primary/20 bg-gradient-to-br from-card to-secondary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Lightbulb className="h-4 w-4 text-primary" />Gerar ideias</CardTitle>
            <CardDescription>Geração local mockada, sem IA externa.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field label="Projeto"><SelectField value={projectId} onChange={(event) => setProjectId(event.target.value)}>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</SelectField></Field>
            <Field label="Nicho"><SelectField value={niche} onChange={(event) => setNiche(event.target.value)}>{niches.map((item) => <option key={item.id}>{item.name}</option>)}</SelectField></Field>
            <Field label="Formato"><SelectField value={format} onChange={(event) => setFormat(event.target.value as IdeaFormat)}>{formats.map((item) => <option key={item}>{item}</option>)}</SelectField></Field>
            <Field label="Objetivo"><SelectField value={objective} onChange={(event) => setObjective(event.target.value as IdeaObjective)}>{objectives.map((item) => <option key={item}>{item}</option>)}</SelectField></Field>
            <Field label="Quantidade"><Input type="number" min={1} max={5} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} /></Field>
            <Field label="Tom"><Input value={tone} onChange={(event) => setTone(event.target.value)} /></Field>
            <Field label="Plataforma"><SelectField value={platform} onChange={(event) => setPlatform(event.target.value as TrendPlatform)}>{["LinkedIn", "Instagram Reels", "TikTok", "YouTube Shorts"].map((item) => <option key={item}>{item}</option>)}</SelectField></Field>
            <Button className="w-full gap-2" onClick={generateIdeas}><Plus className="h-4 w-4" />Gerar ideias</Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_auto]">
              <Input placeholder="Criar ideia manual" value={manualTitle} onChange={(event) => setManualTitle(event.target.value)} />
              <Button className="gap-2" onClick={createManualIdea}><Plus className="h-4 w-4" />Criar manualmente</Button>
            </CardContent>
          </Card>
          <IdeaList ideas={ideas} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
      </section>

      <Kanban ideas={ideas} onSelect={setSelectedId} />
      <Calendar ideas={ideas} />
      {selectedIdea ? <IdeaDetail idea={selectedIdea} onStatus={updateStatus} onDuplicate={duplicateIdea} /> : null}
      <Reports reports={reports} />
      <Sources />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid gap-2"><Label>{label}</Label>{children}</div>;
}

function IdeaList({ ideas, selectedId, onSelect }: { ideas: ContentIdea[]; selectedId: string; onSelect: (id: string) => void }) {
  return (
    <div className="grid gap-3 xl:grid-cols-2">
      {ideas.map((idea) => (
        <Card key={idea.id} className={idea.id === selectedId ? "border-primary/40" : undefined}>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <button className="text-left text-sm font-semibold hover:text-primary" onClick={() => onSelect(idea.id)}>{idea.title}</button>
              <Badge>{idea.status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{idea.description}</p>
            <div className="grid grid-cols-2 gap-3">
              <ScoreBar label="Viral" value={idea.viralScore} hint="Potencial de alcance e compartilhamento." />
              <ScoreBar label="Comercial" value={idea.commercialScore} hint="Aderência a geração de demanda ou venda." />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Kanban({ ideas, onSelect }: { ideas: ContentIdea[]; onSelect: (id: string) => void }) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-2xl font-semibold">Kanban por status</h2>
      <div className="grid gap-3 overflow-x-auto xl:grid-cols-4">
        {statuses.slice(0, 4).map((status) => (
          <Card key={status}>
            <CardHeader><CardTitle>{status}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {ideas.filter((idea) => idea.status === status).map((idea) => (
                <button key={idea.id} className="w-full rounded-md border border-white/5 bg-secondary/70 p-3 text-left text-sm hover:border-primary/30" onClick={() => onSelect(idea.id)}>
                  {idea.title}
                </button>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Calendar({ ideas }: { ideas: ContentIdea[] }) {
  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 font-display text-2xl font-semibold"><CalendarDays className="h-5 w-5 text-primary" />Calendário de ideias</h2>
      <div className="grid gap-3 md:grid-cols-3">
        {ideas.slice(0, 6).map((idea) => (
          <Card key={`calendar-${idea.id}`}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{idea.createdAt}</p><p className="mt-2 text-sm font-medium">{idea.title}</p></CardContent></Card>
        ))}
      </div>
    </section>
  );
}

function IdeaDetail({ idea, onStatus, onDuplicate }: { idea: ContentIdea; onStatus: (id: string, status: IdeaStatus) => void; onDuplicate: (idea: ContentIdea) => void }) {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-secondary">
      <CardHeader>
        <CardTitle>Detalhe da ideia</CardTitle>
        <CardDescription>{idea.title}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-2">
          <Text label="Descrição" value={idea.description} />
          <Text label="Gancho" value={idea.hook} />
          <Text label="Ângulo" value={idea.angle} />
          <Text label="Origem" value={`${idea.sourceType} · ${idea.platformOrigin}`} />
          <Text label="Objetivo" value={idea.objective} />
          <Text label="Funil" value={idea.funnelStage} />
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <ScoreBar label="Viral Score" value={idea.viralScore} hint="Chance de alcance orgânico." />
          <ScoreBar label="Commercial Score" value={idea.commercialScore} hint="Potencial comercial." />
          <ScoreBar label="Difficulty Score" value={idea.difficultyScore} hint="Complexidade de produção." />
          <ScoreBar label="Priority Score" value={idea.priorityScore} hint="viral + comercial - dificuldade." />
        </div>
        <div className="flex flex-wrap gap-2">{idea.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}</div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => onStatus(idea.id, "aprovada")}>Aprovar</Button>
          <Button size="sm" variant="destructive" onClick={() => onStatus(idea.id, "descartada")}><Trash2 className="mr-2 h-4 w-4" />Descartar</Button>
          {["roteiro", "carrossel", "anúncio", "WhatsApp"].map((target) => <Button key={target} size="sm" variant="outline"><FileText className="mr-2 h-4 w-4" />Transformar em {target}</Button>)}
          <Button size="sm" variant="outline" onClick={() => onDuplicate(idea)}><Copy className="mr-2 h-4 w-4" />Duplicar</Button>
          <Button size="sm" variant="outline" onClick={() => onStatus(idea.id, "arquivada")}><Archive className="mr-2 h-4 w-4" />Arquivar</Button>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">Histórico</p>
          <div className="space-y-2">
            {ideaEvents.filter((event) => event.ideaId === idea.id).map((event) => (
              <div key={event.id} className="rounded-md border border-white/5 p-3 text-sm text-muted-foreground">{event.event} · {event.actor} · {event.createdAt}</div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Reports({ reports }: { reports: ReturnType<typeof buildReports> }) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-2xl font-semibold">Relatórios de inteligência</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Report title="Ideias por nicho" data={reports.byNiche} />
        <Report title="Ideias por origem" data={reports.bySource} />
        <Report title="Ideias por status" data={reports.byStatus} />
        <Card><CardHeader><CardTitle>Médias</CardTitle></CardHeader><CardContent><p className="text-sm">Viral: {reports.avgViral}</p><p className="text-sm">Comercial: {reports.avgCommercial}</p></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Melhores ideias e tendências promissoras</CardTitle></CardHeader><CardContent className="grid gap-3 md:grid-cols-2">{reports.bestIdeas.map((idea) => <Badge key={idea.id}>{idea.title}</Badge>)}{trends.slice(0, 2).map((trend) => <Badge key={trend.id}>{trend.title}</Badge>)}</CardContent></Card>
    </section>
  );
}

function Sources() {
  return (
    <Card>
      <CardHeader><CardTitle>Importação manual</CardTitle><CardDescription>Links e textos salvos como fonte de inspiração.</CardDescription></CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        {ideaSources.map((source) => <div key={source.id} className="rounded-md border border-white/5 p-4"><p className="font-medium">{source.title}</p><p className="text-sm text-muted-foreground">{source.notes}</p><Badge className="mt-3">{source.platform}</Badge></div>)}
      </CardContent>
    </Card>
  );
}

function Text({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs text-muted-foreground">{label}</p><p className="text-sm font-medium">{value}</p></div>;
}

function Report({ title, data }: { title: string; data: Record<string, number> }) {
  return <Card><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent className="space-y-2">{Object.entries(data).map(([key, value]) => <div key={key} className="flex justify-between text-sm"><span>{key}</span><span className="text-primary">{value}</span></div>)}</CardContent></Card>;
}

function buildReports(ideas: ContentIdea[]) {
  const by = (key: keyof ContentIdea) => ideas.reduce<Record<string, number>>((acc, idea) => {
    const value = String(idea[key]);
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
  const avg = (key: "viralScore" | "commercialScore") => Math.round(ideas.reduce((sum, idea) => sum + idea[key], 0) / Math.max(ideas.length, 1));

  return {
    byNiche: by("niche"),
    byProject: by("projectId"),
    bySource: by("sourceType"),
    byStatus: by("status"),
    avgViral: avg("viralScore"),
    avgCommercial: avg("commercialScore"),
    bestIdeas: [...ideas].sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 3)
  };
}
