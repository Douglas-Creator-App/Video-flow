"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BarChart3, Bot, CalendarDays, Download, FileSpreadsheet, FileText, Gauge, Lightbulb, Search, Sparkles, Target, TrendingUp, Users, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/ui/select-field";
import {
  calendarAiSuggestions,
  channelHealthScores,
  channels,
  contentGapRecommendations,
  ideaBankItems,
  premiumTemplates,
  strategyRecommendations,
  thumbLabIdeas,
  titleLabResults,
  topicSuggestions,
  trackedChannels,
  trendTopics,
  videoOpportunities
} from "@/lib/mock-data";
import {
  answerStrategistQuestion,
  getAdminMasterInsights,
  getChannelInsights,
  getExecutiveOverview,
  getInsightsMetrics,
  getReportRows
} from "@/lib/youtube-studio-ai";

export function ChannelInsightsDashboard() {
  const [channelId, setChannelId] = useState(channels[0]?.id ?? "");
  const [period, setPeriod] = useState("30d");
  const insights = getChannelInsights(channelId, period);

  return (
    <div className="space-y-5">
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_180px_180px]">
          <Field label="Canal"><SelectField value={channelId} onChange={(event) => setChannelId(event.target.value)}>{channels.map((channel) => <option key={channel.id} value={channel.id}>{channel.name}</option>)}</SelectField></Field>
          <Field label="Periodo"><SelectField value={period} onChange={(event) => setPeriod(event.target.value)}><option value="7d">7 dias</option><option value="30d">30 dias</option><option value="90d">90 dias</option></SelectField></Field>
          <div className="flex items-end"><Button className="w-full">Atualizar</Button></div>
        </CardContent>
      </Card>
      <section className="grid gap-3 md:grid-cols-4">
        <Metric icon={Wand2} label="Videos gerados" value={String(insights.generated)} />
        <Metric icon={Download} label="Exportados" value={String(insights.exported)} />
        <Metric icon={Target} label="Publicados" value={String(insights.published)} />
        <Metric icon={Gauge} label="Tempo medio" value={insights.averageProductionTime} />
      </section>
      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card><CardHeader><CardTitle>Producao</CardTitle><CardDescription>Semanal, mensal e templates utilizados.</CardDescription></CardHeader><CardContent className="grid gap-3 md:grid-cols-2"><Mini label="Producao semanal" value={String(insights.weeklyProduction)} /><Mini label="Producao mensal" value={String(insights.monthlyProduction)} />{insights.templatesUsed.map((template) => <Mini key={template.id} label="Template" value={template.name} />)}</CardContent></Card>
        <ChannelHealthCard channelId={channelId} />
      </section>
      <ContentGapPanel channelId={channelId} />
      <VideoOpportunitiesPanel />
    </div>
  );
}

export function TopicsEngineDashboard() {
  const [niche, setNiche] = useState("Estoicismo");
  const [channelId, setChannelId] = useState(channels[0]?.id ?? "");
  const [language, setLanguage] = useState("pt-BR");
  const [audience, setAudience] = useState("Criadores e publico de shorts");
  const rows = topicSuggestions.filter((item) => item.niche === niche || channelId === item.channelId);

  return (
    <div className="space-y-5">
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader><CardTitle>Topics Engine</CardTitle><CardDescription>Gere temas, titulos, ganchos, thumbnails sugeridas e score de potencial.</CardDescription></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-5">
          <Field label="Nicho"><Input value={niche} onChange={(event) => setNiche(event.target.value)} /></Field>
          <Field label="Canal"><SelectField value={channelId} onChange={(event) => setChannelId(event.target.value)}>{channels.map((channel) => <option key={channel.id} value={channel.id}>{channel.name}</option>)}</SelectField></Field>
          <Field label="Idioma"><Input value={language} onChange={(event) => setLanguage(event.target.value)} /></Field>
          <Field label="Publico"><Input value={audience} onChange={(event) => setAudience(event.target.value)} /></Field>
          <div className="flex items-end"><Button className="w-full gap-2"><Sparkles className="h-4 w-4" />Gerar ideias</Button></div>
        </CardContent>
      </Card>
      <div className="grid gap-4 xl:grid-cols-3">{rows.map((item) => <IdeaCard key={item.id} title={item.title} badge={item.niche} description={item.theme} score={item.potentialScore} details={[item.hook, item.thumbnailIdea]} />)}</div>
      <IdeaBankPanel />
    </div>
  );
}

export function TrendDiscoveryDashboard() {
  return (
    <div className="space-y-5">
      <Card><CardContent className="grid gap-3 p-4 md:grid-cols-4"><SelectField><option>Todos os nichos</option><option>Historia</option><option>Estoicismo</option></SelectField><SelectField><option>pt-BR</option><option>en-US</option></SelectField><SelectField><option>Todas categorias</option><option>Shorts</option><option>Longos</option></SelectField><Button>Buscar tendencias</Button></CardContent></Card>
      <div className="grid gap-4 xl:grid-cols-4">{trendTopics.map((trend) => <IdeaCard key={trend.id} title={trend.title} badge={trend.category} description={trend.description} score={trend.trendScore} details={[trend.source, trend.language]} />)}</div>
    </div>
  );
}

export function TitleLabDashboard() {
  return <LabGrid title="Title Lab" description="20 titulos, 20 ganchos, versoes emocionais, curiosas e virais." rows={titleLabResults.map((item) => ({ id: item.id, title: item.title, badge: item.niche, score: item.score, details: [item.hook, item.emotionalVersion, item.curiousVersion, item.viralVersion] }))} />;
}

export function ThumbLabDashboard() {
  return <LabGrid title="Thumb Lab" description="Ideias de thumbnail, textos, emocoes e estilos integrados ao Thumbnail AI." rows={thumbLabIdeas.map((item) => ({ id: item.id, title: item.title, badge: item.emotion, score: item.score, details: [item.thumbnailText, item.style] }))} />;
}

export function StrategistDashboard() {
  const [question, setQuestion] = useState("Qual canal devo focar?");
  const answer = useMemo(() => answerStrategistQuestion(question), [question]);
  const questions = ["Qual canal devo focar?", "Qual template gera mais conteudo?", "Onde estou gastando mais creditos?", "Quais nichos estou ignorando?"];
  return (
    <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
      <Card className="border-primary/20 bg-primary/5"><CardHeader><CardTitle className="flex items-center gap-2"><Bot className="h-4 w-4 text-primary" />AI Strategist</CardTitle><CardDescription>Responde usando dados internos do workspace.</CardDescription></CardHeader><CardContent className="space-y-3"><Field label="Pergunta"><Input value={question} onChange={(event) => setQuestion(event.target.value)} /></Field>{questions.map((item) => <Button key={item} variant="outline" className="w-full justify-start" onClick={() => setQuestion(item)}>{item}</Button>)}</CardContent></Card>
      <Card><CardHeader><CardTitle>Resposta estrategica</CardTitle></CardHeader><CardContent className="space-y-4"><p className="rounded-md border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">{answer}</p>{strategyRecommendations.map((item) => <div key={item.id} className="rounded-md border border-white/5 bg-secondary/40 p-3"><Badge>{item.severity}</Badge><p className="mt-2 font-semibold">{item.title}</p><p className="text-sm text-muted-foreground">{item.description}</p></div>)}</CardContent></Card>
    </div>
  );
}

export function ExecutiveDashboard() {
  const overview = getExecutiveOverview();
  return (
    <div className="space-y-5">
      <section className="grid gap-3 md:grid-cols-4 xl:grid-cols-7">
        <Metric icon={Users} label="Canais ativos" value={String(overview.activeChannels)} />
        <Metric icon={CalendarDays} label="Producao" value={String(overview.production)} />
        <Metric icon={Wand2} label="Videos" value={String(overview.generatedVideos)} />
        <Metric icon={Gauge} label="Creditos" value={overview.credits.toLocaleString("pt-BR")} />
        <Metric icon={Sparkles} label="Templates" value={String(overview.templates)} />
        <Metric icon={Lightbulb} label="Ideias" value={String(overview.ideas)} />
        <Metric icon={TrendingUp} label="Tendencias" value={String(overview.trends)} />
      </section>
      <ChannelInsightsDashboard />
    </div>
  );
}

export function InsightsAnalyticsDashboard() {
  const metrics = getInsightsMetrics();
  return <div className="space-y-5"><section className="grid gap-3 md:grid-cols-5"><Metric icon={Lightbulb} label="Ideias geradas" value={String(metrics.ideasGenerated)} /><Metric icon={CheckIcon} label="Ideias usadas" value={String(metrics.ideasUsed)} /><Metric icon={Wand2} label="Videos produzidos" value={String(metrics.videosProduced)} /><Metric icon={Gauge} label="Conclusao" value={`${metrics.completionRate}%`} /><Metric icon={BarChart3} label="Score medio" value={`${metrics.averageScore}/100`} /></section><RecommendationEnginePanel /><ReportsPanel /></div>;
}

export function ReportsPanel() {
  const reports = getReportRows();
  return (
    <Card><CardHeader><CardTitle>Relatorios</CardTitle><CardDescription>Exportacao simulada PDF, CSV e XLSX com producao, templates, videos, qualidade e canais.</CardDescription></CardHeader><CardContent className="grid gap-3 md:grid-cols-3"><Button className="gap-2"><FileText className="h-4 w-4" />Exportar PDF</Button><Button variant="outline" className="gap-2"><Download className="h-4 w-4" />Exportar CSV</Button><Button variant="outline" className="gap-2"><FileSpreadsheet className="h-4 w-4" />Exportar XLSX</Button><Mini label="Producao" value={String(reports.production.length)} /><Mini label="Templates" value={String(reports.templates.length)} /><Mini label="Qualidade" value={String(reports.videos.length)} /></CardContent></Card>
  );
}

export function CompetitorTrackerPanel() {
  return <Card><CardHeader><CardTitle>Competitor Tracker</CardTitle><CardDescription>Estrutura para registrar concorrentes. Sem APIs externas nesta fase.</CardDescription></CardHeader><CardContent className="grid gap-3 md:grid-cols-3">{trackedChannels.map((item) => <div key={item.id} className="rounded-md border border-white/5 bg-secondary/40 p-4"><Badge>{item.platform}</Badge><p className="mt-2 font-semibold">{item.name}</p><p className="text-sm text-muted-foreground">{item.niche} - {item.notes}</p></div>)}</CardContent></Card>;
}

export function AdminStudioInsightsPanel() {
  const insights = getAdminMasterInsights();
  return <Card className="border-primary/20"><CardHeader><CardTitle>Studio AI Insights</CardTitle><CardDescription>Templates mais usados, canais ativos, recursos utilizados e custos por modulo.</CardDescription></CardHeader><CardContent className="grid gap-4 xl:grid-cols-4"><div className="space-y-2"><p className="font-semibold">Templates</p>{insights.templatesMostUsed.map((item) => <Mini key={item.id} label={item.name} value={`${item.usageCount} usos`} />)}</div><div className="space-y-2"><p className="font-semibold">Canais</p>{insights.channelsMostActive.map((item) => <Mini key={item.id} label={item.name} value={item.status} />)}</div><div className="space-y-2"><p className="font-semibold">Recursos</p>{insights.resourcesMostUsed.map((item) => <Mini key={item} label={item} value="ativo" />)}</div><div className="space-y-2"><p className="font-semibold">Custos</p>{insights.moduleCosts.slice(0, 4).map((item) => <Mini key={`${item.provider}-${item.category}`} label={item.category} value={`R$ ${item.estimatedCost}`} />)}</div></CardContent></Card>;
}

function ContentGapPanel({ channelId }: { channelId: string }) {
  const gaps = contentGapRecommendations.filter((item) => item.channelId === channelId);
  return <Card><CardHeader><CardTitle>Content Gap Analysis</CardTitle><CardDescription>Temas repetidos, nichos pouco explorados e excesso/falta de formatos.</CardDescription></CardHeader><CardContent className="grid gap-3 md:grid-cols-3">{gaps.map((gap) => <div key={gap.id} className="rounded-md border border-white/5 bg-secondary/40 p-4"><Badge>{gap.severity}</Badge><p className="mt-2 font-semibold">{gap.message}</p><p className="text-sm text-muted-foreground">{gap.recommendation}</p></div>)}</CardContent></Card>;
}

function VideoOpportunitiesPanel() {
  return <Card><CardHeader><CardTitle>Video Opportunities</CardTitle><CardDescription>Criar versoes curtas, series, continuacoes, compilacoes e longos derivados.</CardDescription></CardHeader><CardContent className="grid gap-3 md:grid-cols-3">{videoOpportunities.map((item) => <IdeaCard key={item.id} title={item.title} badge={item.type} description={item.reason} score={item.score} details={[item.videoProjectId]} />)}</CardContent></Card>;
}

function RecommendationEnginePanel() {
  return <Card><CardHeader><CardTitle>Recommendation Engine</CardTitle><CardDescription>Recomendacoes automaticas da operacao.</CardDescription></CardHeader><CardContent className="grid gap-3 md:grid-cols-2">{strategyRecommendations.map((item) => <div key={item.id} className="rounded-md border border-white/5 bg-secondary/40 p-4"><Badge>{item.module}</Badge><p className="mt-2 font-semibold">{item.title}</p><p className="text-sm text-muted-foreground">{item.description}</p></div>)}</CardContent></Card>;
}

function IdeaBankPanel() {
  return <Card><CardHeader><CardTitle>Idea Bank</CardTitle><CardDescription>Ideias salvas, aprovadas, gerando, produzidas e arquivadas.</CardDescription></CardHeader><CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{ideaBankItems.map((item) => <IdeaCard key={item.id} title={item.title} badge={item.status} description={item.description} score={item.score} details={[item.niche]} />)}</CardContent></Card>;
}

function ChannelHealthCard({ channelId }: { channelId: string }) {
  const score = useMemo(() => {
    return channelHealthScores.find((item) => item.channelId === channelId) ?? channelHealthScores[0];
  }, [channelId]);
  return <Card><CardHeader><CardTitle>Channel Health Score</CardTitle><CardDescription>Consistencia, frequencia, diversidade, qualidade e uso de templates.</CardDescription></CardHeader><CardContent className="space-y-2"><Score label="Geral" value={score.overallScore} /><Score label="Consistencia" value={score.consistency} /><Score label="Frequencia" value={score.frequency} /><Score label="Diversidade" value={score.diversity} /><Score label="Qualidade" value={score.quality} /></CardContent></Card>;
}

function LabGrid({ title, description, rows }: { title: string; description: string; rows: Array<{ id: string; title: string; badge: string; score: number; details: string[] }> }) {
  return <div className="space-y-5"><Card className="border-primary/20 bg-primary/5"><CardHeader><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader><CardContent><Button className="gap-2"><Sparkles className="h-4 w-4" />Gerar novas versoes</Button></CardContent></Card><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{rows.map((item) => <IdeaCard key={item.id} title={item.title} badge={item.badge} description={item.details[0]} score={item.score} details={item.details.slice(1)} />)}</div></div>;
}

function IdeaCard({ title, badge, description, score, details }: { title: string; badge: string; description: string; score: number; details: string[] }) {
  return <Card className="border-primary/10 bg-card/80"><CardHeader><div className="flex items-start justify-between gap-3"><Badge>{badge}</Badge><Badge>{score}/100</Badge></div><CardTitle className="mt-2 text-base">{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader><CardContent className="space-y-2">{details.map((detail) => <p key={detail} className="rounded-md border border-white/5 bg-secondary/40 p-2 text-sm text-muted-foreground">{detail}</p>)}<Button variant="outline" className="w-full" asChild><Link href="/app/quick-start">Gerar video</Link></Button></CardContent></Card>;
}

function Metric({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return <Card className="border-primary/10 bg-secondary/40"><CardContent className="flex items-center gap-3 p-4"><span className="grid h-10 w-10 place-items-center rounded-md border border-primary/20 bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span><div><p className="text-xs text-muted-foreground">{label}</p><p className="font-display text-xl font-semibold">{value}</p></div></CardContent></Card>;
}

function Score({ label, value }: { label: string; value: number }) {
  return <div><div className="mb-1 flex justify-between text-sm"><span>{label}</span><span>{value}/100</span></div><div className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} /></div></div>;
}

function Mini({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md border border-white/5 bg-background/40 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="truncate text-sm font-semibold">{value}</p></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid gap-2"><Label>{label}</Label>{children}</div>;
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return <Target {...props} />;
}
