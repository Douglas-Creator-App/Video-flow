"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BarChart3, Copy, Crown, Film, Heart, Layers3, Play, Search, Settings2, Sparkles, Star, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/ui/select-field";
import { channels, premiumTemplates, templatePacks } from "@/lib/mock-data";
import { TooltipHint } from "@/components/onboarding/onboarding-wizard";
import {
  createTemplateUsageSummary,
  getPremiumTemplate,
  getTemplatePacks,
  getTemplateScoreAverage,
  searchPremiumTemplates,
  templateCategories
} from "@/lib/premium-templates";
import type { PremiumTemplate, PremiumTemplateCategory } from "@/lib/types";

export function PremiumTemplateStore({ favoritesOnly = false }: { favoritesOnly?: boolean }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<PremiumTemplateCategory | "Todos">("Todos");
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const templates = useMemo(() => searchPremiumTemplates({ query, category, favoritesOnly, featuredOnly }), [query, category, favoritesOnly, featuredOnly]);
  const featured = premiumTemplates.filter((template) => template.isFeatured).slice(0, 4);

  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Crown} label="Templates premium" value={String(premiumTemplates.length)} />
        <Metric icon={Layers3} label="Packs ativos" value={String(templatePacks.length)} />
        <Metric icon={Film} label="Videos gerados" value={premiumTemplates.reduce((sum, item) => sum + item.videosGenerated, 0).toLocaleString("pt-BR")} />
        <Metric icon={Star} label="Favoritos" value={String(premiumTemplates.filter((item) => item.favorite).length)} />
      </section>

      <Card className="overflow-hidden border-primary/25 bg-[linear-gradient(135deg,rgb(22_22_22/.96),rgb(8_8_8/.98))]">
        <CardHeader className="border-b border-white/5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <Badge className="w-fit">Template Store</Badge>
              <CardTitle className="mt-3 text-2xl md:text-3xl">Biblioteca premium de nichos</CardTitle>
              <CardDescription>Escolha um template pronto para canal, video, prompts, voz, estilo visual, thumbnail, legenda e fluxo de producao.</CardDescription>
            </div>
            <div className="grid gap-2 sm:grid-cols-3 lg:flex lg:flex-wrap">
              <Button variant="outline" asChild><Link href="/app/templates/favorites">Favoritos</Link></Button>
              <Button variant="outline" asChild><Link href="/app/templates/analytics">Analytics</Link></Button>
              <Button asChild className="gap-2"><Link href="/app/templates/personal"><Sparkles className="h-4 w-4" />Novo template</Link></Button>
            </div>
          </div>
          <div className="grid gap-3 pt-4 md:grid-cols-[1fr_220px] xl:grid-cols-[1fr_240px_180px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" placeholder="Buscar por nicho, estilo ou template" />
            </div>
            <SelectField value={category} onChange={(event) => setCategory(event.target.value as PremiumTemplateCategory | "Todos")}>
              {templateCategories.map((item) => <option key={item} value={item}>{item}</option>)}
            </SelectField>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-white/5 bg-secondary/40 px-3 text-sm">
              <input type="checkbox" checked={featuredOnly} onChange={(event) => setFeaturedOnly(event.target.checked)} className="h-4 w-4 accent-primary" />
              <span>Destaques</span>
            </label>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-5">
          {!favoritesOnly ? (
            <div className="grid gap-3 xl:grid-cols-4">
              {featured.map((template) => <FeaturedTemplate key={template.id} template={template} />)}
            </div>
          ) : null}

          {templates.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {templates.map((template) => <TemplateCard key={template.id} template={template} />)}
            </div>
          ) : (
            <div className="rounded-md border border-white/5 bg-secondary/40 p-6 text-sm text-muted-foreground">
              Nenhum template encontrado com os filtros atuais.
            </div>
          )}
        </CardContent>
      </Card>

      {!favoritesOnly ? <TooltipHint title="Templates aceleram a producao" description="Escolha um template premium para preencher prompts, voz, visual, legenda, thumbnail e configuracoes do Magic Mode." /> : null}

      {!favoritesOnly ? <TemplatePacksPanel /> : null}
    </div>
  );
}

export function TemplateDetail({ templateId }: { templateId: string }) {
  const [actionMessage, setActionMessage] = useState("");
  const template = getPremiumTemplate(templateId);
  const usage = createTemplateUsageSummary(template);
  const scoreAverage = getTemplateScoreAverage(template);

  async function runTemplateAction(action: string) {
    setActionMessage("Processando acao do template...");
    const response = await fetch("/api/templates/use", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ template_id: template.id, action })
    });
    const data = await response.json();
    setActionMessage(data.message ?? "Acao concluida.");
  }

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden border-primary/25 bg-card/90">
        <div className="grid gap-0 xl:grid-cols-[420px_1fr]">
          <div className="relative min-h-[360px] bg-black">
            <img src={template.previewImageUrl} alt={`Preview ${template.name}`} className="h-full min-h-[360px] w-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <Badge>{template.category}</Badge>
              <p className="mt-3 font-display text-3xl font-semibold text-white">{template.name}</p>
            </div>
          </div>
          <CardHeader className="space-y-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <CardTitle className="text-3xl">{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </div>
              <Badge className="w-fit">{scoreAverage}/100</Badge>
            </div>
            <div className="grid gap-2 md:grid-cols-4">
              <Mini label="Nicho" value={template.niche} />
              <Mini label="Formato" value={template.defaultFormat} />
              <Mini label="Duracao" value={template.defaultDuration} />
              <Mini label="Voz" value={template.defaultVoiceId} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild className="gap-2"><Link href={`/app/magic?template=${template.id}`}><Wand2 className="h-4 w-4" />Usar no Magic</Link></Button>
              <Button variant="outline" className="gap-2" onClick={() => runTemplateAction("create_channel")}><Film className="h-4 w-4" />Criar canal</Button>
              <Button variant="outline" className="gap-2" onClick={() => runTemplateAction("duplicate")}><Copy className="h-4 w-4" />Duplicar</Button>
              <Button variant="outline" className="gap-2" onClick={() => runTemplateAction("save_personal")}><Settings2 className="h-4 w-4" />Salvar personalizado</Button>
            </div>
            {actionMessage ? <div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-sm text-muted-foreground">{actionMessage}</div> : null}
          </CardHeader>
        </div>
      </Card>

      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Prompts por template</CardTitle><CardDescription>Roteiro, visual, thumbnail, titulo, descricao, legenda, abertura e encerramento.</CardDescription></CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {Object.entries(template.prompts).map(([key, value]) => <PromptBlock key={key} title={key} value={value} />)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Exemplos de temas</CardTitle><CardDescription>20 temas prontos para iniciar producao sem tela em branco.</CardDescription></CardHeader>
            <CardContent className="grid gap-2 md:grid-cols-2">
              {template.topicExamples.map((topic, index) => <div key={topic} className="rounded-md border border-white/5 bg-secondary/40 p-3 text-sm"><span className="text-primary">{index + 1}.</span> {topic}</div>)}
            </CardContent>
          </Card>
        </div>
        <aside className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Template Score</CardTitle><CardDescription>Avaliacao operacional para custo, facilidade e potencial.</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <Score label="Facilidade" value={template.score.ease} />
              <Score label="Custo estimado" value={template.score.estimatedCost} invert />
              <Score label="Potencial viral" value={template.score.viralPotential} />
              <Score label="Monetizacao" value={template.score.monetizationPotential} />
              <Score label="Complexidade visual" value={template.score.visualComplexity} invert />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Configuracao herdada</CardTitle><CardDescription>O que canal, Magic Mode e bulk generation recebem ao usar este template.</CardDescription></CardHeader>
            <CardContent className="space-y-2">
              {usage.inheritedSettings.map((item) => <div key={item} className="rounded-md border border-white/5 bg-secondary/40 p-3 text-sm">{item}</div>)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Exemplos de titulos</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {template.titleExamples.map((title) => <div key={title} className="rounded-md border border-white/5 bg-secondary/40 p-3 text-sm">{title}</div>)}
            </CardContent>
          </Card>
        </aside>
      </section>
    </div>
  );
}

export function PersonalTemplatesPanel() {
  return (
    <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader><CardTitle>Criar template personalizado</CardTitle><CardDescription>Campos essenciais para salvar um fluxo proprio de canal e video.</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          <Field label="Nome"><Input defaultValue="Meu template dark premium" /></Field>
          <Field label="Nicho"><Input defaultValue="Curiosidades" /></Field>
          <Field label="Voz"><SelectField><option>mock_deep</option><option>alloy</option><option>nova</option></SelectField></Field>
          <Field label="Estilo visual"><SelectField><option>sombrio</option><option>cinematografico</option><option>anime</option><option>luxo</option></SelectField></Field>
          <Field label="Duracao"><SelectField><option>60s</option><option>90s</option><option>3m</option><option>5m</option></SelectField></Field>
          <Button className="w-full">Salvar template</Button>
        </CardContent>
      </Card>
      <PremiumTemplateStore favoritesOnly />
    </div>
  );
}

export function TemplateAnalyticsDashboard() {
  const totals = {
    generated: premiumTemplates.reduce((sum, item) => sum + item.videosGenerated, 0),
    credits: premiumTemplates.reduce((sum, item) => sum + item.creditsConsumed, 0),
    channels: premiumTemplates.reduce((sum, item) => sum + item.channelsCreated, 0),
    averageCompletion: Math.round(premiumTemplates.reduce((sum, item) => sum + item.completionRate, 0) / premiumTemplates.length)
  };
  const topTemplates = [...premiumTemplates].sort((a, b) => b.usageCount - a.usageCount).slice(0, 8);

  return (
    <div className="space-y-5">
      <section className="grid gap-3 md:grid-cols-4">
        <Metric icon={Play} label="Videos gerados" value={totals.generated.toLocaleString("pt-BR")} />
        <Metric icon={BarChart3} label="Creditos consumidos" value={totals.credits.toLocaleString("pt-BR")} />
        <Metric icon={Film} label="Canais criados" value={String(totals.channels)} />
        <Metric icon={GaugeIcon} label="Conclusao media" value={`${totals.averageCompletion}%`} />
      </section>
      <Card>
        <CardHeader><CardTitle>Templates mais usados</CardTitle><CardDescription>Uso, videos gerados, creditos e taxa de conclusao por template.</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          {topTemplates.map((template) => (
            <div key={template.id} className="grid gap-3 rounded-md border border-white/5 bg-secondary/40 p-4 lg:grid-cols-[1fr_120px_120px_120px_120px] lg:items-center">
              <div>
                <p className="font-semibold">{template.name}</p>
                <p className="text-sm text-muted-foreground">{template.category} - {template.niche}</p>
              </div>
              <Mini label="Usos" value={String(template.usageCount)} />
              <Mini label="Videos" value={String(template.videosGenerated)} />
              <Mini label="Creditos" value={String(template.creditsConsumed)} />
              <Mini label="Conclusao" value={`${template.completionRate}%`} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function AdminTemplatePanel() {
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle>Global Template Management</CardTitle>
            <CardDescription>Criar, editar, destacar, ativar/desativar e organizar packs globais.</CardDescription>
          </div>
          <Button className="gap-2"><Crown className="h-4 w-4" />Novo global</Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 xl:grid-cols-2">
        {premiumTemplates.slice(0, 8).map((template) => (
          <div key={template.id} className="rounded-md border border-white/5 bg-secondary/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge>{template.status}</Badge>
                <p className="mt-2 font-semibold">{template.name}</p>
                <p className="text-sm text-muted-foreground">{template.category} - {template.usageCount} usos</p>
              </div>
              <Badge>{template.isFeatured ? "featured" : "global"}</Badge>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <Button variant="outline" size="sm">Editar</Button>
              <Button variant="outline" size="sm">{template.status === "active" ? "Desativar" : "Ativar"}</Button>
              <Button variant="outline" size="sm">Destacar</Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function ChannelTemplateIntegrationPanel() {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader><CardTitle>Template base do canal</CardTitle><CardDescription>Ao criar canal, o template herda estilo visual, voz, formato, prompts, narrativa e duracao.</CardDescription></CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-3">
        <SelectField>{premiumTemplates.slice(0, 8).map((template) => <option key={template.id}>{template.name}</option>)}</SelectField>
        <SelectField>{channels.map((channel) => <option key={channel.id}>{channel.name}</option>)}</SelectField>
        <Button>Criar canal com template</Button>
      </CardContent>
    </Card>
  );
}

export function BulkTemplateIntegrationPanel() {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader><CardTitle>Template premium para lote</CardTitle><CardDescription>Exemplo: gerar 50 videos usando "Estoicismo com Anime".</CardDescription></CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-4">
        <SelectField>{premiumTemplates.map((template) => <option key={template.id}>{template.name}</option>)}</SelectField>
        <SelectField><option>50 videos</option><option>20 reels</option><option>10 videos longos</option></SelectField>
        <SelectField><option>Usar prompts do template</option><option>Permitir ajustes manuais</option></SelectField>
        <Button className="gap-2"><Wand2 className="h-4 w-4" />Criar job</Button>
      </CardContent>
    </Card>
  );
}

function TemplatePacksPanel() {
  const packs = getTemplatePacks();
  return (
    <Card>
      <CardHeader><CardTitle>Packs de templates</CardTitle><CardDescription>Pacotes prontos para canal, shorts, videos longos, Biblia, estoicismo, luxo, misterio e documentario.</CardDescription></CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {packs.map((pack) => (
          <div key={pack.id} className="rounded-md border border-white/5 bg-secondary/40 p-4">
            <Badge>{pack.category}</Badge>
            <p className="mt-3 font-semibold">{pack.name}</p>
            <p className="mt-1 min-h-10 text-sm text-muted-foreground">{pack.description}</p>
            <p className="mt-3 text-sm text-primary">{pack.templates.length || pack.templatesCount} templates</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function FeaturedTemplate({ template }: { template: PremiumTemplate }) {
  return (
    <Link href={`/app/templates/${template.id}`} className="group block overflow-hidden rounded-md border border-primary/15 bg-secondary/40 transition hover:border-primary/40">
      <div className="relative h-36">
        <img src={template.previewImageUrl} alt={`Preview ${template.name}`} className="h-full w-full object-cover opacity-80 transition group-hover:scale-[1.03]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
        <Badge className="absolute left-3 top-3">Destaque</Badge>
      </div>
      <div className="p-4">
        <p className="font-semibold">{template.name}</p>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{template.description}</p>
      </div>
    </Link>
  );
}

function TemplateCard({ template }: { template: PremiumTemplate }) {
  return (
    <Card className="overflow-hidden border-primary/10 bg-card/80 transition hover:border-primary/35">
      <div className="relative aspect-[16/9] bg-black">
        <img src={template.previewImageUrl} alt={`Preview ${template.name}`} className="h-full w-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
          <Badge>{template.category}</Badge>
          {template.favorite ? <Heart className="h-5 w-5 fill-primary text-primary" /> : null}
        </div>
      </div>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{template.name}</CardTitle>
            <CardDescription>{template.niche} - {template.defaultFormat} - {template.defaultDuration}</CardDescription>
          </div>
          <Badge>{getTemplateScoreAverage(template)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="line-clamp-2 text-sm text-muted-foreground">{template.description}</p>
        <div className="grid grid-cols-3 gap-2">
          <Mini label="Viral" value={String(template.score.viralPotential)} />
          <Mini label="Custo" value={String(template.score.estimatedCost)} />
          <Mini label="Uso" value={String(template.usageCount)} />
        </div>
        <div className="flex gap-2">
          <Button asChild className="flex-1"><Link href={`/app/templates/${template.id}`}>Ver detalhes</Link></Button>
          <Button variant="outline" size="icon" aria-label="Usar template" asChild><Link href={`/app/magic?template=${template.id}`}><ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PromptBlock({ title, value }: { title: string; value: string }) {
  return <div className="rounded-md border border-white/5 bg-secondary/40 p-4"><p className="text-xs uppercase text-primary">{title}</p><p className="mt-2 text-sm text-muted-foreground">{value}</p></div>;
}

function Score({ label, value, invert = false }: { label: string; value: number; invert?: boolean }) {
  const visual = invert ? 100 - value : value;
  return <div><div className="mb-1 flex justify-between text-sm"><span>{label}</span><span>{value}/100</span></div><div className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: `${visual}%` }} /></div></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid gap-2"><Label>{label}</Label>{children}</div>;
}

function Metric({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return <Card className="border-primary/10 bg-secondary/40"><CardContent className="flex items-center gap-3 p-4"><span className="grid h-10 w-10 place-items-center rounded-md border border-primary/20 bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span><div><p className="text-xs text-muted-foreground">{label}</p><p className="font-display text-xl font-semibold">{value}</p></div></CardContent></Card>;
}

function Mini({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md border border-white/5 bg-background/40 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="truncate text-sm font-semibold">{value}</p></div>;
}

function GaugeIcon(props: React.SVGProps<SVGSVGElement>) {
  return <BarChart3 {...props} />;
}
