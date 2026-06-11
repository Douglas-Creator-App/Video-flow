"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronRight, Clock3, Film, Headphones, ImageIcon, Play, Sparkles, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/ui/select-field";
import { assetLibraryItems, demoWorkspace, premiumTemplates, voices } from "@/lib/mock-data";
import { getTemplateScoreAverage } from "@/lib/premium-templates";
import type { OnboardingStep, PremiumTemplate, Voice } from "@/lib/types";

const steps: Array<{ id: OnboardingStep; label: string }> = [
  { id: "objective", label: "Objetivo" },
  { id: "niche", label: "Nicho" },
  { id: "template", label: "Template" },
  { id: "channel", label: "Canal" },
  { id: "voice", label: "Voz" },
  { id: "visual", label: "Visual" },
  { id: "first_video", label: "Tema" },
  { id: "processing", label: "Processar" },
  { id: "result", label: "Resultado" }
];

const objectives = ["Shorts", "Reels", "TikTok", "Videos Longos", "Canal Dark", "Historias Biblicas", "Estoicismo", "Curiosidades", "Documentarios", "Anime", "Outro"];
const niches = ["Religiao", "Historia", "Curiosidades", "Luxo", "Misterio", "Estoicismo", "Anime", "Motivacional", "Tecnologia", "Negocios", "Outro"];
const visualStyles = [
  { label: "Cinematografico", value: "cinematografico", image: "/media/mock-thumbnail-1.jpg" },
  { label: "Anime", value: "anime", image: "/media/mock-thumbnail-5.jpg" },
  { label: "Preto e Branco", value: "preto_e_branco", image: "/media/mock-thumbnail-3.jpg" },
  { label: "Religioso", value: "religioso", image: "/media/mock-thumbnail-4.jpg" },
  { label: "Historico", value: "historico", image: "/media/mock-scene-1.jpg" },
  { label: "Documentario", value: "documentario", image: "/media/mock-thumbnail-2.jpg" },
  { label: "Luxo", value: "luxo", image: "/media/mock-thumbnail-6.jpg" },
  { label: "Sombrio", value: "sombrio", image: "/media/mock-thumbnail-6.jpg" }
];

export function OnboardingWizard() {
  const [stepIndex, setStepIndex] = useState(0);
  const [objective, setObjective] = useState("Shorts");
  const [niche, setNiche] = useState("Curiosidades");
  const [templateId, setTemplateId] = useState(premiumTemplates[0]?.id ?? "");
  const [channelName, setChannelName] = useState("Meu Canal Automatizado");
  const [language, setLanguage] = useState("pt-BR");
  const [country, setCountry] = useState("Brasil");
  const [voiceId, setVoiceId] = useState(voices[0]?.voiceId ?? "alloy");
  const [visualStyle, setVisualStyle] = useState("cinematografico");
  const [theme, setTheme] = useState("O segredo dos estoicos");
  const [legalAccepted, setLegalAccepted] = useState(false);
  const currentStep = steps[stepIndex];
  const selectedTemplate = premiumTemplates.find((item) => item.id === templateId) ?? premiumTemplates[0];
  const selectedVoice = voices.find((item) => item.voiceId === voiceId) ?? voices[0];
  const progress = Math.round(((stepIndex + 1) / steps.length) * 100);

  function next() {
    setStepIndex((index) => Math.min(index + 1, steps.length - 1));
  }

  function previous() {
    setStepIndex((index) => Math.max(index - 1, 0));
  }

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden border-primary/25 bg-[linear-gradient(135deg,rgb(22_22_22/.96),rgb(8_8_8/.98))]">
        <CardHeader className="border-b border-white/5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <Badge className="w-fit">First Video Wizard</Badge>
              <CardTitle className="mt-3 text-2xl md:text-3xl">Crie seu primeiro video em poucos minutos</CardTitle>
              <CardDescription>Canal, template, voz, visual e Magic Job em um fluxo guiado.</CardDescription>
            </div>
            <Button variant="outline" asChild><Link href="/dashboard">Pular onboarding</Link></Button>
          </div>
          <div className="pt-4">
            <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground"><span>{currentStep.label}</span><span>{progress}%</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} /></div>
          </div>
          <div className="grid gap-2 pt-4 md:grid-cols-3 xl:grid-cols-9">
            {steps.map((step, index) => (
              <button key={step.id} onClick={() => setStepIndex(index)} className={`min-h-11 rounded-md border px-2 text-xs transition ${index <= stepIndex ? "border-primary/30 bg-primary/10 text-primary" : "border-white/5 bg-secondary/30 text-muted-foreground"}`}>
                {step.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          {currentStep.id === "objective" ? <ChoiceGrid title="O que voce deseja criar?" items={objectives} value={objective} onSelect={setObjective} /> : null}
          {currentStep.id === "niche" ? <ChoiceGrid title="Selecione o nicho" items={niches} value={niche} onSelect={setNiche} /> : null}
          {currentStep.id === "template" ? <TemplateStep selected={templateId} onSelect={setTemplateId} /> : null}
          {currentStep.id === "channel" ? <ChannelStep channelName={channelName} setChannelName={setChannelName} language={language} setLanguage={setLanguage} country={country} setCountry={setCountry} selectedTemplate={selectedTemplate} /> : null}
          {currentStep.id === "voice" ? <VoiceStep selected={voiceId} onSelect={setVoiceId} selectedVoice={selectedVoice} /> : null}
          {currentStep.id === "visual" ? <VisualStep selected={visualStyle} onSelect={setVisualStyle} /> : null}
          {currentStep.id === "first_video" ? <FirstVideoStep theme={theme} setTheme={setTheme} selectedTemplate={selectedTemplate} /> : null}
          {currentStep.id === "processing" ? <ProcessingStep /> : null}
          {currentStep.id === "result" ? <FirstSuccessExperience theme={theme} template={selectedTemplate} /> : null}

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex min-h-11 items-start gap-3 rounded-md border border-white/5 bg-secondary/30 p-3 text-sm text-muted-foreground sm:max-w-xl">
              <input type="checkbox" checked={legalAccepted} onChange={(event) => setLegalAccepted(event.target.checked)} className="mt-1 h-4 w-4 accent-primary" />
              <span>
                Aceito os <Link href="/terms" className="text-primary">Termos de Uso</Link> e a <Link href="/privacy" className="text-primary">Politica de Privacidade</Link> para continuar o onboarding.
              </span>
            </label>
            <Button variant="outline" onClick={previous} disabled={stepIndex === 0}>Voltar</Button>
            <Button onClick={next} disabled={!legalAccepted || stepIndex === steps.length - 1} className="gap-2">Continuar <ChevronRight className="h-4 w-4" /></Button>
          </div>
        </CardContent>
      </Card>
      <DemoWorkspacePreview />
    </div>
  );
}

export function QuickStartWizard() {
  const [templateId, setTemplateId] = useState(premiumTemplates[2]?.id ?? premiumTemplates[0]?.id ?? "");
  const [theme, setTheme] = useState("O segredo dos estoicos");
  const template = premiumTemplates.find((item) => item.id === templateId) ?? premiumTemplates[0];
  const estimate = useMemo(() => Math.max(12, Math.round(template.score.estimatedCost * 0.45)), [template]);

  return (
    <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
      <Card className="border-primary/25 bg-primary/5">
        <CardHeader><Badge className="w-fit">Quick Start</Badge><CardTitle className="mt-2 text-2xl">Video em menos de 60 segundos</CardTitle><CardDescription>Escolha template e tema. O restante vem do template.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <Field label="Template"><SelectField value={templateId} onChange={(event) => setTemplateId(event.target.value)}>{premiumTemplates.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</SelectField></Field>
          <Field label="Tema"><Input value={theme} onChange={(event) => setTheme(event.target.value)} /></Field>
          <div className="grid gap-2 sm:grid-cols-3">
            <Mini label="Formato" value={template.defaultFormat} />
            <Mini label="Duracao" value={template.defaultDuration} />
            <Mini label="Creditos" value={String(estimate)} />
          </div>
          <Button asChild className="w-full gap-2"><Link href={`/app/magic?template=${template.id}`}><Wand2 className="h-4 w-4" />Gerar video</Link></Button>
        </CardContent>
      </Card>
      <FirstSuccessExperience theme={theme} template={template} compact />
    </div>
  );
}

function ChoiceGrid({ title, items, value, onSelect }: { title: string; items: string[]; value: string; onSelect: (value: string) => void }) {
  return <div className="space-y-4"><h2 className="font-display text-2xl font-semibold">{title}</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{items.map((item) => <button key={item} onClick={() => onSelect(item)} className={`min-h-20 rounded-md border p-4 text-left font-semibold transition ${value === item ? "border-primary/40 bg-primary/10 text-primary" : "border-white/5 bg-secondary/40 hover:border-primary/30"}`}>{item}</button>)}</div></div>;
}

function TemplateStep({ selected, onSelect }: { selected: string; onSelect: (value: string) => void }) {
  return <div className="space-y-4"><h2 className="font-display text-2xl font-semibold">Escolha um template</h2><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{premiumTemplates.slice(0, 9).map((template) => <TemplateOption key={template.id} template={template} selected={selected === template.id} onSelect={onSelect} />)}</div></div>;
}

function TemplateOption({ template, selected, onSelect }: { template: PremiumTemplate; selected: boolean; onSelect: (value: string) => void }) {
  return <button onClick={() => onSelect(template.id)} className={`overflow-hidden rounded-md border text-left transition ${selected ? "border-primary/50 bg-primary/10" : "border-white/5 bg-secondary/40 hover:border-primary/30"}`}><img src={template.previewImageUrl} alt={`Preview ${template.name}`} className="h-36 w-full object-cover opacity-85" /><div className="space-y-2 p-4"><Badge>{template.category}</Badge><p className="font-semibold">{template.name}</p><div className="grid grid-cols-3 gap-2"><Mini label="Score" value={String(getTemplateScoreAverage(template))} /><Mini label="Dific." value={String(template.score.visualComplexity)} /><Mini label="Custo" value={String(template.score.estimatedCost)} /></div></div></button>;
}

function ChannelStep(props: { channelName: string; setChannelName: (value: string) => void; language: string; setLanguage: (value: string) => void; country: string; setCountry: (value: string) => void; selectedTemplate: PremiumTemplate }) {
  return <div className="grid gap-4 lg:grid-cols-[1fr_320px]"><div className="space-y-4"><h2 className="font-display text-2xl font-semibold">Crie seu canal automaticamente</h2><Field label="Nome do canal"><Input value={props.channelName} onChange={(event) => props.setChannelName(event.target.value)} /></Field><div className="grid gap-3 sm:grid-cols-2"><Field label="Idioma"><Input value={props.language} onChange={(event) => props.setLanguage(event.target.value)} /></Field><Field label="Pais"><Input value={props.country} onChange={(event) => props.setCountry(event.target.value)} /></Field></div></div><Card><CardHeader><CardTitle>{props.selectedTemplate.name}</CardTitle><CardDescription>Este canal herdara template, prompts, voz, formato, narrativa e duracao.</CardDescription></CardHeader></Card></div>;
}

function VoiceStep({ selected, onSelect, selectedVoice }: { selected: string; onSelect: (value: string) => void; selectedVoice?: Voice }) {
  return <div className="space-y-4"><h2 className="font-display text-2xl font-semibold">Escolha a voz</h2><div className="grid gap-3 md:grid-cols-3">{voices.slice(0, 6).map((voice) => <button key={voice.id} onClick={() => onSelect(voice.voiceId)} className={`rounded-md border p-4 text-left transition ${selected === voice.voiceId ? "border-primary/40 bg-primary/10" : "border-white/5 bg-secondary/40"}`}><Headphones className="mb-3 h-5 w-5 text-primary" /><p className="font-semibold">{voice.name}</p><p className="text-sm text-muted-foreground">{voice.language} - {voice.gender} - {voice.style}</p><p className="mt-3 text-xs text-primary">Ouvir preview</p></button>)}</div><p className="rounded-md border border-primary/20 bg-primary/5 p-3 text-sm text-muted-foreground">Voz selecionada: {selectedVoice?.name ?? selected}. Preview de audio preparado para providers reais.</p></div>;
}

function VisualStep({ selected, onSelect }: { selected: string; onSelect: (value: string) => void }) {
  return <div className="space-y-4"><h2 className="font-display text-2xl font-semibold">Escolha o visual</h2><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{visualStyles.map((style) => <button key={style.value} onClick={() => onSelect(style.value)} className={`overflow-hidden rounded-md border text-left transition ${selected === style.value ? "border-primary/50 bg-primary/10" : "border-white/5 bg-secondary/40"}`}><img src={style.image} alt={`Exemplo visual ${style.label}`} className="h-32 w-full object-cover opacity-85" /><p className="p-4 font-semibold">{style.label}</p></button>)}</div></div>;
}

function FirstVideoStep({ theme, setTheme, selectedTemplate }: { theme: string; setTheme: (value: string) => void; selectedTemplate: PremiumTemplate }) {
  return <div className="grid gap-4 lg:grid-cols-[1fr_360px]"><div className="space-y-4"><h2 className="font-display text-2xl font-semibold">Qual tema voce quer gerar?</h2><Input value={theme} onChange={(event) => setTheme(event.target.value)} /><div className="grid gap-2 sm:grid-cols-2">{selectedTemplate.topicExamples.slice(0, 4).map((topic) => <button key={topic} onClick={() => setTheme(topic)} className="rounded-md border border-white/5 bg-secondary/40 p-3 text-left text-sm hover:border-primary/30">{topic}</button>)}</div></div><Card><CardHeader><CardTitle>Magic Job automatico</CardTitle><CardDescription>O sistema usara template, voz, visual, legenda, musica e thumbnail escolhidos.</CardDescription></CardHeader></Card></div>;
}

function ProcessingStep() {
  const items = ["Criando roteiro", "Gerando voz", "Gerando imagens", "Criando thumbnail", "Montando video"];
  return <div className="space-y-4"><h2 className="font-display text-2xl font-semibold">Processando primeiro video</h2><div className="space-y-3">{items.map((item, index) => <div key={item} className="rounded-md border border-white/5 bg-secondary/40 p-4"><div className="flex items-center justify-between"><span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" />{item}</span><span className="text-sm text-muted-foreground">{index < 4 ? "concluido" : "finalizando"}</span></div><div className="mt-3 h-2 rounded-full bg-background"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, 35 + index * 16)}%` }} /></div></div>)}</div></div>;
}

function FirstSuccessExperience({ theme, template, compact = false }: { theme: string; template: PremiumTemplate; compact?: boolean }) {
  return <Card className="overflow-hidden border-primary/25 bg-gradient-to-br from-primary/10 to-card"><CardHeader><Badge className="w-fit">Primeiro video criado</Badge><CardTitle className="mt-2 text-2xl">{theme}</CardTitle><CardDescription>{template.name} economizou cerca de 42 minutos de configuracao inicial.</CardDescription></CardHeader><CardContent className={`grid gap-4 ${compact ? "lg:grid-cols-[240px_1fr]" : "lg:grid-cols-[320px_1fr]"}`}><div className="relative aspect-video overflow-hidden rounded-md border border-primary/20 bg-black"><img src={template.previewImageUrl} alt={`Thumbnail do video ${theme}`} className="h-full w-full object-cover opacity-85" /><div className="absolute inset-0 grid place-items-center"><Play className="h-12 w-12 text-primary" /></div></div><div className="space-y-3"><div className="grid gap-2 sm:grid-cols-3"><Mini label="Creditos" value={String(Math.round(template.score.estimatedCost * 0.45))} /><Mini label="Tempo salvo" value="42 min" /><Mini label="Status" value="Pronto" /></div><div className="flex flex-wrap gap-2"><Button asChild><Link href="/app/videos/video_1/editor">Abrir editor</Link></Button><Button variant="outline" asChild><Link href="/app/videos/video_1/editor">Renderizar</Link></Button><Button variant="outline" asChild><Link href="/app/quick-start">Gerar novo video</Link></Button><Button variant="outline" asChild><Link href="/app/assets">Ver biblioteca</Link></Button></div></div></CardContent></Card>;
}

function DemoWorkspacePreview() {
  return <Card><CardHeader><CardTitle>Demo Workspace</CardTitle><CardDescription>Explore canais, videos, templates, thumbnails e assets ficticios antes de configurar tudo.</CardDescription></CardHeader><CardContent className="grid gap-3 md:grid-cols-4"><Mini label="Canais demo" value={String(demoWorkspace.channels.length)} /><Mini label="Videos demo" value={String(demoWorkspace.videos.length)} /><Mini label="Templates" value={String(demoWorkspace.templates.length)} /><Mini label="Assets" value={String(demoWorkspace.assets.length)} /></CardContent></Card>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid gap-2"><Label>{label}</Label>{children}</div>;
}

function Mini({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md border border-white/5 bg-background/40 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="truncate text-sm font-semibold">{value}</p></div>;
}

export function TooltipHint({ icon: Icon = Sparkles, title, description }: { icon?: React.ElementType; title: string; description: string }) {
  return <div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-sm text-muted-foreground"><p className="mb-1 flex items-center gap-2 font-semibold text-foreground"><Icon className="h-4 w-4 text-primary" />{title}</p>{description}</div>;
}

export function EmptyState({ title, description, actionLabel, href }: { title: string; description: string; actionLabel: string; href: string }) {
  return <Card className="border-primary/20 bg-primary/5"><CardContent className="grid gap-4 p-6 text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-md border border-primary/20 bg-primary/10"><ImageIcon className="h-7 w-7 text-primary" /></div><div><p className="font-display text-xl font-semibold">{title}</p><p className="mt-1 text-sm text-muted-foreground">{description}</p></div><Button asChild className="mx-auto"><Link href={href}>{actionLabel}</Link></Button></CardContent></Card>;
}
