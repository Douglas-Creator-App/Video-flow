import Link from "next/link";
import { Archive, Bell, CalendarDays, Copy, Film, Gauge, Layers3, MoreHorizontal, Play, Plus, Star, Users, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SelectField } from "@/components/ui/select-field";
import {
  bulkJobs,
  channelGoals,
  channelPermissions,
  channels,
  channelTemplates,
  contentCalendarItems,
  exportPackages,
  manualPublications,
  operationNotifications,
  productionPlans,
  queueJobs,
  thumbnailGenerations,
  videoProjects,
  viralClips
} from "@/lib/mock-data";
import { platformLabel } from "@/lib/export-center";
import type { Channel } from "@/lib/types";
import { BulkTemplateIntegrationPanel, ChannelTemplateIntegrationPanel } from "@/components/templates/premium-template-store";

export function ChannelsWorkspace() {
  return (
    <div className="space-y-4">
      <ChannelTemplateIntegrationPanel />
      <div className="grid gap-3 md:grid-cols-4">
        <Metric label="Canais ativos" value={String(channels.filter((item) => item.status === "ativo").length)} />
        <Metric label="Videos criados" value={String(videoProjects.length + bulkJobs.reduce((sum, job) => sum + (job.status === "completed" ? job.quantity : 0), 0))} />
        <Metric label="Cortes criados" value={String(viralClips.length)} />
        <Metric label="Jobs ativos" value={String(queueJobs.filter((job) => job.status !== "completed").length)} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {channels.map((channel) => <ChannelCard key={channel.id} channel={channel} />)}
      </div>
    </div>
  );
}

export function ChannelDashboard({ channelId }: { channelId: string }) {
  const channel = getChannel(channelId);
  const goals = channelGoals.filter((goal) => goal.channelId === channel.id);
  const jobs = queueJobs.filter((job) => job.channelId === channel.id);
  const calendar = contentCalendarItems.filter((item) => item.channelId === channel.id);
  const exports = exportPackages.filter((item) => item.channelId === channel.id);
  const publications = manualPublications.filter((item) => exports.some((pkg) => pkg.id === item.exportPackageId));
  const credits = jobs.reduce((sum, job) => sum + job.creditsConsumed, 0);
  const recent = [
    ...jobs.map((job) => ({ id: job.id, title: job.title, meta: String(job.status) })),
    ...calendar.map((item) => ({ id: item.id, title: item.title, meta: item.status }))
  ].slice(0, 6);
  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-primary/25 bg-[linear-gradient(135deg,rgb(24_24_24/.96),rgb(10_10_10/.98))]">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <Badge>{channel.channelType}</Badge>
              <CardTitle className="mt-3 text-3xl">{channel.name}</CardTitle>
              <CardDescription>{channel.description}</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="gap-2"><Copy className="h-4 w-4" />Clonar canal</Button>
              <Button asChild><Link href={`/app/channels/${channel.id}/library`}>Biblioteca</Link></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-6">
          <Metric label="Videos" value={String(videoProjects.length)} compact />
          <Metric label="Renderizados" value="18" compact />
          <Metric label="Cortes" value={String(viralClips.length)} compact />
          <Metric label="Thumbnails" value={String(thumbnailGenerations.length)} compact />
          <Metric label="Tempo" value="6h 20m" compact />
          <Metric label="Creditos" value={String(credits)} compact />
        </CardContent>
      </Card>
      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader><CardTitle>Producao semanal</CardTitle><CardDescription>Conteudos planejados, em producao e prontos.</CardDescription></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-7">
            {["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"].map((day, index) => <div key={day} className="rounded-md border border-white/5 bg-secondary/40 p-3 text-center"><p className="text-xs text-muted-foreground">{day}</p><p className="mt-2 text-xl font-semibold text-primary">{index + 1}</p></div>)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Metas</CardTitle><CardDescription>Progresso mensal do canal.</CardDescription></CardHeader>
          <CardContent className="space-y-3">{goals.map((goal) => <Progress key={goal.id} label={`${goal.goalType}/${goal.period}`} value={goal.currentValue} target={goal.target} />)}</CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Ultimas geracoes</CardTitle><CardDescription>Fila e calendario conectados ao canal.</CardDescription></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {recent.map((item) => <Row key={item.id} title={item.title} meta={item.meta} />)}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div><CardTitle>Exportacoes</CardTitle><CardDescription>Videos prontos, pacotes criados e publicacoes manuais deste canal.</CardDescription></div>
            <Button asChild variant="outline"><Link href="/app/export-center">Abrir Export Center</Link></Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Metric label="Pacotes" value={String(exports.length)} compact />
          <Metric label="Prontos" value={String(exports.filter((item) => item.status === "ready").length)} compact />
          <Metric label="Publicados" value={String(publications.length)} compact />
          {exports.map((item) => <Row key={item.id} title={item.title} meta={`${platformLabel(item.targetPlatform)} - ${item.status}`} />)}
        </CardContent>
      </Card>
    </div>
  );
}

export function ChannelLibrary({ channelId }: { channelId: string }) {
  const channel = getChannel(channelId);
  const items = [
    ...videoProjects.map((video) => ({ id: video.id, type: "video", title: video.title, status: video.status, date: video.createdAt })),
    ...viralClips.map((clip) => ({ id: clip.id, type: "corte", title: clip.title, status: clip.status, date: clip.createdAt })),
    ...thumbnailGenerations.map((thumb) => ({ id: thumb.id, type: "thumbnail", title: thumb.textOverlay, status: thumb.status, date: thumb.createdAt }))
  ];
  return (
    <div className="space-y-4">
      <Card className="border-primary/20"><CardHeader><CardTitle>{channel.name}</CardTitle><CardDescription>Biblioteca por canal com filtros por videos, shorts, cortes, thumbnails, roteiros, imagens e audios.</CardDescription></CardHeader><CardContent><SelectField><option>Todos os tipos</option><option>Videos</option><option>Cortes</option><option>Thumbnails</option><option>Roteiros</option></SelectField></CardContent></Card>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{items.map((item) => <Card key={item.id}><CardHeader><Badge className="w-fit">{item.type}</Badge><CardTitle className="mt-2">{item.title}</CardTitle><CardDescription>{item.status} - {item.date}</CardDescription></CardHeader><CardContent><Button variant="outline" className="w-full">Abrir item</Button></CardContent></Card>)}</div>
    </div>
  );
}

export function CalendarBoard() {
  const exportItems = exportPackages.map((item) => ({
    id: item.id,
    title: item.title,
    meta: `${channelName(item.channelId)} - ${platformLabel(item.targetPlatform)} - ${item.status}`,
    badge: item.status === "marked_as_published" ? "publicado manualmente" : "pronto para exportar"
  }));
  return <Board title="Calendario editorial" subtitle="Dia, semana e mes para videos, shorts, cortes, thumbnails, roteiros e exportacoes manuais." items={[...contentCalendarItems.map((item) => ({ id: item.id, title: item.title, meta: `${channelName(item.channelId)} - ${item.status}`, badge: item.contentType })), ...exportItems]} actions={<><Button variant="outline">Dia</Button><Button variant="outline">Semana</Button><Button>Mes</Button><Button variant="outline" disabled>Arrastar para datas: pendente</Button></>} />;
}

export function ProductionPlanBoard() {
  return (
    <div className="grid gap-4 md:grid-cols-3">{productionPlans.map((plan) => <Card key={plan.id} className="border-primary/10"><CardHeader><Badge className="w-fit">{channelName(plan.channelId)}</Badge><CardTitle className="mt-2">{plan.notes}</CardTitle><CardDescription>Metas operacionais por canal.</CardDescription></CardHeader><CardContent className="grid gap-2"><Metric label="Videos/dia" value={String(plan.videosPerDay)} compact /><Metric label="Videos/semana" value={String(plan.videosPerWeek)} compact /><Metric label="Shorts/dia" value={String(plan.shortsPerDay)} compact /><Metric label="Longos/semana" value={String(plan.longVideosPerWeek)} compact /></CardContent></Card>)}</div>
  );
}

export function BulkGenerationBoard() {
  return (
    <div className="space-y-4">
      <BulkTemplateIntegrationPanel />
      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <Card className="border-primary/25 bg-primary/5"><CardHeader><CardTitle className="flex items-center gap-2"><Wand2 className="h-4 w-4 text-primary" />Produzir em massa</CardTitle><CardDescription>Selecione canal, template, quantidade, formato, duracao e estilo.</CardDescription></CardHeader><CardContent className="space-y-3"><SelectField>{channels.map((channel) => <option key={channel.id}>{channel.name}</option>)}</SelectField><SelectField>{channelTemplates.map((template) => <option key={template.id}>{template.name}</option>)}</SelectField><SelectField><option>50 shorts</option><option>20 reels</option><option>10 videos longos</option></SelectField><Button className="w-full">Criar bulk job</Button></CardContent></Card>
        <JobList jobs={bulkJobs.map((job) => ({ id: job.id, title: `${job.quantity} ${job.contentType}`, status: job.status, progress: job.progress, meta: channelName(job.channelId) }))} />
      </div>
    </div>
  );
}

export function QueueBoard() {
  return <JobList jobs={queueJobs.map((job) => ({ id: job.id, title: job.title, status: job.status, progress: job.progress, meta: `${channelName(job.channelId)} - ${job.estimatedTime} - ${job.creditsConsumed} creditos` }))} />;
}

export function ChannelTemplatesBoard() {
  return <Board title="Templates de canal" subtitle="Voz, estilo visual, duracao, formato, prompts, legenda e thumbnail." items={channelTemplates.map((item) => ({ id: item.id, title: item.name, meta: `${item.format} - ${item.durationSeconds}s - ${item.visualStyle}`, badge: item.status }))} actions={<Button className="gap-2"><Plus className="h-4 w-4" />Novo template</Button>} />;
}

export function AnalyticsBoard() {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-6"><Metric label="Videos" value="74" compact /><Metric label="Cortes" value={String(viralClips.length)} compact /><Metric label="Thumbnails" value={String(thumbnailGenerations.length)} compact /><Metric label="Horas" value="18.4" compact /><Metric label="Creditos" value="312" compact /><Metric label="Custo" value="$42" compact /></div>
      <Card><CardHeader><CardTitle>Diario, semanal e mensal</CardTitle><CardDescription>Visao mockada por canal para performance operacional.</CardDescription></CardHeader><CardContent className="grid gap-3 md:grid-cols-3">{channels.map((channel, index) => <div key={channel.id} className="rounded-md border border-white/5 bg-secondary/40 p-4"><p className="font-semibold">{channel.name}</p><div className="mt-4 h-24 rounded-md bg-primary/10"><div className="h-full rounded-md bg-primary/30" style={{ width: `${45 + index * 18}%` }} /></div></div>)}</CardContent></Card>
    </div>
  );
}

export function OperationsCenter() {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-5"><Metric label="Canais ativos" value={String(channels.filter((c) => c.status === "ativo").length)} compact /><Metric label="Jobs ativos" value={String(queueJobs.filter((j) => j.status !== "completed").length)} compact /><Metric label="Fila" value={String(queueJobs.length)} compact /><Metric label="Creditos" value="1.284" compact /><Metric label="Erros" value="1" compact /></div>
      <div className="grid gap-4 xl:grid-cols-[1fr_380px]"><QueueBoard /><NotificationsBoard compact /></div>
    </div>
  );
}

export function NotificationsBoard({ compact = false }: { compact?: boolean }) {
  return (
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-4 w-4 text-primary" />Alertas</CardTitle><CardDescription>Jobs, falhas, creditos baixos e fila congestionada.</CardDescription></CardHeader><CardContent className="space-y-2">{operationNotifications.slice(0, compact ? 3 : undefined).map((item) => <div key={item.id} className="rounded-md border border-white/5 bg-secondary/40 p-3"><div className="flex items-start justify-between gap-3"><p className="text-sm font-semibold">{item.title}</p><Badge>{item.status}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{item.description}</p></div>)}</CardContent></Card>
  );
}

function ChannelCard({ channel }: { channel: Channel }) {
  return (
    <Card className="overflow-hidden border-primary/10 bg-card/75 transition hover:border-primary/30">
      <div className="h-24 bg-[linear-gradient(135deg,rgb(201_168_76/.22),rgb(255_255_255/.04))]" />
      <CardHeader><div className="flex items-start justify-between gap-3"><div><Badge>{channel.status}</Badge><CardTitle className="mt-3">{channel.name}</CardTitle><CardDescription>{channel.niche} - {channel.language} - {channel.channelType}</CardDescription></div>{channel.isFavorite ? <Star className="h-5 w-5 fill-primary text-primary" /> : <MoreHorizontal className="h-5 w-5 text-muted-foreground" />}</div></CardHeader>
      <CardContent className="grid gap-2"><Button asChild><Link href={`/app/channels/${channel.id}`}>Abrir dashboard</Link></Button><div className="grid grid-cols-3 gap-2"><Button variant="outline" size="sm"><Copy className="h-4 w-4" /></Button><Button variant="outline" size="sm"><Archive className="h-4 w-4" /></Button><Button variant="outline" size="sm"><Users className="h-4 w-4" /></Button></div></CardContent>
    </Card>
  );
}

function Board({ title, subtitle, items, actions }: { title: string; subtitle: string; items: Array<{ id: string; title: string; meta: string; badge: string }>; actions?: React.ReactNode }) {
  return <Card><CardHeader><div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between"><div><CardTitle>{title}</CardTitle><CardDescription>{subtitle}</CardDescription></div><div className="flex flex-wrap gap-2">{actions}</div></div></CardHeader><CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{items.map((item) => <Card key={item.id} className="bg-secondary/35"><CardHeader><Badge className="w-fit">{item.badge}</Badge><CardTitle className="mt-2 text-base">{item.title}</CardTitle><CardDescription>{item.meta}</CardDescription></CardHeader></Card>)}</CardContent></Card>;
}

function JobList({ jobs }: { jobs: Array<{ id: string; title: string; status: string; progress: number; meta: string }> }) {
  return <Card><CardHeader><CardTitle>Fila de producao</CardTitle><CardDescription>Jobs ativos, concluidos e com erro.</CardDescription></CardHeader><CardContent className="space-y-3">{jobs.map((job) => <div key={job.id} className="rounded-md border border-white/5 bg-secondary/40 p-3"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{job.title}</p><p className="text-sm text-muted-foreground">{job.meta}</p></div><Badge>{job.status}</Badge></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-background"><div className="h-full rounded-full bg-primary" style={{ width: `${job.progress}%` }} /></div><p className="mt-1 text-xs text-muted-foreground">{job.progress}%</p></div>)}</CardContent></Card>;
}

function Metric({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
  return <Card className="border-primary/10 bg-secondary/40"><CardContent className={compact ? "p-3" : "p-4"}><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-display text-2xl font-semibold text-foreground">{value}</p></CardContent></Card>;
}

function Progress({ label, value, target }: { label: string; value: number; target: number }) {
  const pct = Math.min(100, Math.round((value / target) * 100));
  return <div className="rounded-md border border-white/5 bg-secondary/40 p-3"><div className="flex justify-between text-sm"><span>{label}</span><span>{value}/{target}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-background"><div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} /></div></div>;
}

function Row({ title, meta }: { title: string; meta: string }) {
  return <div className="rounded-md border border-white/5 bg-secondary/40 p-3"><p className="font-semibold">{title}</p><p className="text-sm text-muted-foreground">{meta}</p></div>;
}

function getChannel(channelId: string) {
  return channels.find((channel) => channel.id === channelId) ?? channels[0];
}

function channelName(channelId?: string) {
  return channels.find((channel) => channel.id === channelId)?.name ?? "Sem canal";
}
