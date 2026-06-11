"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ChevronDown, Film, Gauge, Layers3, Loader2, Radio, Sparkles, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/ui/select-field";
import { magicSteps } from "@/lib/magic/magic-pipeline";
import { aiVideoProviders, magicTemplates, premiumTemplates, projects, visualStylePresets, voices } from "@/lib/mock-data";
import type {
  MagicAdvancedSettings,
  MagicCostEstimate,
  MagicDurationTarget,
  MagicNarrativeType,
  MagicVideoFormat,
  MagicVisualSource,
  MagicVisualStyle
} from "@/lib/types";
import { templateToMagicSettings } from "@/lib/premium-templates";
import { TooltipHint } from "@/components/onboarding/onboarding-wizard";
import { useWorkspaceProvider } from "@/components/workspace/workspace-provider";

const formats: Array<{ value: MagicVideoFormat; label: string }> = [
  { value: "shorts", label: "Shorts" },
  { value: "reels", label: "Reels" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube_long", label: "YouTube Longo" },
  { value: "horizontal", label: "Horizontal 16:9" },
  { value: "vertical", label: "Vertical 9:16" },
  { value: "square", label: "Quadrado 1:1" }
];

const durations: Array<{ value: MagicDurationTarget; label: string }> = [
  { value: "30s", label: "30 segundos" },
  { value: "60s", label: "60 segundos" },
  { value: "90s", label: "90 segundos" },
  { value: "3m", label: "3 minutos" },
  { value: "5m", label: "5 minutos" },
  { value: "8m", label: "8 minutos" },
  { value: "10m", label: "10 minutos" },
  { value: "custom", label: "Personalizado" }
];

const narrativeTypes: Array<{ value: MagicNarrativeType; label: string }> = [
  { value: "historia_real", label: "Historia real" },
  { value: "historia_religiosa", label: "Historia religiosa" },
  { value: "curiosidade", label: "Curiosidade" },
  { value: "documentario", label: "Documentario" },
  { value: "misterio", label: "Misterio" },
  { value: "top_5", label: "Top 5" },
  { value: "top_10", label: "Top 10" },
  { value: "comparativo", label: "Comparativo" },
  { value: "motivacional", label: "Motivacional" },
  { value: "educacional", label: "Educacional" },
  { value: "canal_dark", label: "Canal dark" },
  { value: "biografia", label: "Biografia" },
  { value: "noticias", label: "Noticias" },
  { value: "roteiro_personalizado", label: "Roteiro personalizado" }
];

const visualSources: Array<{ value: MagicVisualSource; label: string }> = [
  { value: "ai_images", label: "IA" },
  { value: "media_library", label: "Biblioteca" },
  { value: "pexels", label: "Pexels" },
  { value: "pixabay", label: "Pixabay" },
  { value: "unsplash", label: "Unsplash" },
  { value: "manual_upload", label: "Upload" },
  { value: "mixed", label: "Misto" },
  { value: "stock_videos", label: "Stock Video Mode" }
];

const visualStyles: Array<{ value: MagicVisualStyle; label: string }> = [
  { value: "realista", label: "Realista" },
  { value: "cinematografico", label: "Cinematografico" },
  { value: "preto_e_branco", label: "Preto e branco" },
  { value: "vintage", label: "Vintage" },
  { value: "anime", label: "Anime" },
  { value: "manga", label: "Manga" },
  { value: "documentario", label: "Documentario" },
  { value: "religioso", label: "Religioso" },
  { value: "historico", label: "Historico" },
  { value: "luxo", label: "Luxo" },
  { value: "sombrio", label: "Sombrio" },
  { value: "futurista", label: "Futurista" },
  { value: "infantil", label: "Infantil" },
  { value: "minimalista", label: "Minimalista" }
];

type MagicQueuedResult = {
  status: "queued";
  job_id: string;
  polling_url: string;
  magic_url: string;
  cost_estimate: MagicCostEstimate;
  warning?: string;
};

export function MagicMode() {
  const { currentWorkspace } = useWorkspaceProvider();
  const workspaceId = currentWorkspace?.id ?? "";
  const searchParams = useSearchParams();
  const initialPremiumTemplate = premiumTemplates.find((item) => item.id === searchParams.get("template"));
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "project_1");
  const [theme, setTheme] = useState(initialPremiumTemplate?.topicExamples[0] ?? "Como transformar uma ideia simples em um video completo");
  const [format, setFormat] = useState<MagicVideoFormat>(initialPremiumTemplate?.defaultFormat ?? "reels");
  const [durationTarget, setDurationTarget] = useState<MagicDurationTarget>(initialPremiumTemplate?.defaultDuration ?? "60s");
  const [narrativeType, setNarrativeType] = useState<MagicNarrativeType>(initialPremiumTemplate?.narrativeType ?? "educacional");
  const [voiceId, setVoiceId] = useState(initialPremiumTemplate?.defaultVoiceId ?? voices[0]?.voiceId ?? "alloy");
  const [visualStyle, setVisualStyle] = useState<MagicVisualStyle>(initialPremiumTemplate?.visualStyle ?? "cinematografico");
  const [visualSource, setVisualSource] = useState<MagicVisualSource>("mixed");
  const [premiumTemplateId, setPremiumTemplateId] = useState(initialPremiumTemplate?.id ?? "");
  const [subtitleEnabled, setSubtitleEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [autoThumbnail, setAutoThumbnail] = useState(true);
  const [aiVideoEnabled, setAiVideoEnabled] = useState(false);
  const [stockVideoMode, setStockVideoMode] = useState(false);
  const [aiVideoMode, setAiVideoMode] = useState("animar_cenas_principais");
  const [aiVideoProvider, setAiVideoProvider] = useState("mock");
  const [aiVideoBudget, setAiVideoBudget] = useState(25);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<MagicQueuedResult | null>(null);
  const [estimate, setEstimate] = useState<MagicCostEstimate | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [advanced, setAdvanced] = useState<MagicAdvancedSettings>({
    scriptInstructions: initialPremiumTemplate?.prompts.script ?? "",
    imageInstructions: initialPremiumTemplate?.imagePromptStyle ?? "",
    forbiddenWords: "",
    targetAudience: "Criadores, marcas e canais de conteudo",
    language: "pt-BR",
    narrationTone: initialPremiumTemplate?.narrativeType ?? "confiante",
    cta: "Abra no editor e ajuste para seu canal.",
    sceneCount: initialPremiumTemplate?.defaultDuration === "30s" ? 5 : initialPremiumTemplate?.defaultDuration === "60s" ? 8 : 12,
    customDurationSeconds: 60,
    customScript: "",
    useZoom: true,
    useOrganicMotion: true,
    autoThumbnail: true,
    autoMusic: true,
    autoSubtitles: true
  });

  const selectedProject = projects.find((project) => project.id === projectId) ?? projects[0];
  const selectedVoice = voices.find((voice) => voice.voiceId === voiceId) ?? voices[0];
  const visualPresetNames = useMemo(() => visualStylePresets.map((item) => item.name).join(", "), []);
  const availableCredits = currentWorkspace?.wallet?.balance ?? 0;

  function applyTemplate(templateId: string) {
    const template = magicTemplates.find((item) => item.id === templateId);
    if (!template) return;
    setNarrativeType(template.narrativeType);
    setFormat(template.format);
    setDurationTarget(template.durationTarget);
    setVisualStyle(template.visualStyle);
    setVoiceId(template.voicePreset);
    setAdvanced((current) => ({ ...current, ...template.advancedSettings }));
  }

  function applyPremiumTemplate(templateId: string) {
    const template = premiumTemplates.find((item) => item.id === templateId);
    if (!template) return;
    setPremiumTemplateId(template.id);
    setTheme(template.topicExamples[0] ?? theme);
    setNarrativeType(template.narrativeType);
    setFormat(template.defaultFormat);
    setDurationTarget(template.defaultDuration);
    setVisualStyle(template.visualStyle);
    setVoiceId(template.defaultVoiceId);
    setAdvanced((current) => ({ ...current, ...templateToMagicSettings(template) }));
  }

  async function openReview() {
    setErrorMessage("");
    try {
      const response = await fetch("/api/magic/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload(true))
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Nao foi possivel calcular o custo.");
      setEstimate(data.cost_estimate);
      setReviewOpen(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Nao foi possivel calcular o custo.");
    }
  }

  async function generateVideo() {
    setIsGenerating(true);
    setResult(null);
    setErrorMessage("");
    try {
      const response = await fetch("/api/magic/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload(false))
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Falha ao gerar o Magic Job.");
      setResult(data);
      setEstimate(data.cost_estimate);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Falha ao gerar o Magic Job.");
    } finally {
      setIsGenerating(false);
    }
  }

  function cancelGeneration() {
    setIsGenerating(false);
    setErrorMessage("A criacao local foi interrompida antes do envio. Jobs ja enfileirados devem ser cancelados pela fila.");
  }

  function payload(preview: boolean) {
    return {
      preview,
      workspace_id: workspaceId,
      project_id: projectId,
      theme,
      format,
      duration_target: durationTarget,
      narrative_type: narrativeType,
      voice_id: voiceId,
      visual_style: visualStyle,
      visual_source: visualSource,
      subtitle_enabled: subtitleEnabled,
      music_enabled: musicEnabled,
      auto_thumbnail: autoThumbnail,
      premium_template_id: premiumTemplateId || undefined,
      advanced_settings: {
        ...advanced,
        autoThumbnail,
        autoMusic: musicEnabled,
        autoSubtitles: subtitleEnabled
      },
      stock_video_mode: stockVideoMode,
      available_credits: availableCredits
    };
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-3 md:grid-cols-5">
        <MagicStat icon={Wand2} label="Entrada" value="Tema ou roteiro" />
        <MagicStat icon={Layers3} label="Pipeline" value="9 etapas" />
        <MagicStat icon={Gauge} label="Estimativa" value={estimate ? `${estimate.totalCredits} creditos` : "sob demanda"} />
        <MagicStat icon={Gauge} label="Creditos disponiveis" value={`${availableCredits} creditos`} />
        <MagicStat icon={Radio} label="Status" value={result ? "pronto" : isGenerating ? "gerando" : "configurando"} />
      </section>

      <TooltipHint title="Escolha um tema e o sistema cria o video" description="Magic Mode usa template, voz, visual, assets, thumbnail e render base para transformar uma ideia em um projeto editavel." />

      <div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">Pipeline real por worker</p>
        <p className="mt-1">O Magic cria um job real, reserva creditos e so conclui quando TTS, imagens e persistencia no Supabase terminarem sem fallback mockado.</p>
      </div>

      <section className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <Card className="overflow-hidden border-primary/25 bg-[linear-gradient(135deg,rgb(24_24_24/.96),rgb(10_10_10/.96))] shadow-[0_24px_80px_rgb(0_0_0/.35)]">
          <CardHeader className="border-b border-white/5 bg-primary/[0.03]">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Wand2 className="h-5 w-5 text-primary" />
                  Magic Video Mode
                </CardTitle>
                <CardDescription>Do tema ao projeto editavel: roteiro, voz, cenas, imagens, legendas, musica e thumbnail.</CardDescription>
              </div>
              <Button asChild variant="outline">
                <Link href="/app/magic/history">Historico</Link>
              </Button>
            </div>
            <div className="grid gap-2 pt-4 md:grid-cols-4">
              {["Configurar", "Revisar", "Gerar", "Editar"].map((step, index) => (
                <div key={step} className="flex items-center gap-2 rounded-md border border-white/5 bg-background/50 px-3 py-2 text-xs text-muted-foreground">
                  <span className="grid h-6 w-6 place-items-center rounded-md bg-primary/10 text-primary">{index + 1}</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
            <div className="grid gap-2 pt-4 lg:grid-cols-[240px_1fr_auto]">
              <SelectField value={premiumTemplateId} onChange={(event) => applyPremiumTemplate(event.target.value)}>
                <option value="">Comecar com Template</option>
                {premiumTemplates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
              </SelectField>
              <div className="rounded-md border border-white/5 bg-secondary/40 px-3 py-2 text-sm text-muted-foreground">
                {premiumTemplateId ? premiumTemplates.find((item) => item.id === premiumTemplateId)?.description : "Escolha um template premium para preencher nicho, formato, duracao, narrativa, voz, visual, legenda, musica e thumbnail."}
              </div>
              <Button variant="outline" asChild><Link href="/app/templates">Store</Link></Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-5 pt-5 lg:grid-cols-2">
            <Field label="Projeto"><SelectField value={projectId} onChange={(event) => setProjectId(event.target.value)}>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</SelectField></Field>
            <Field label="Tema do video"><Input value={theme} onChange={(event) => setTheme(event.target.value)} /></Field>
            <Field label="Formato"><SelectField value={format} onChange={(event) => setFormat(event.target.value as MagicVideoFormat)}>{formats.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</SelectField></Field>
            <Field label="Duracao"><SelectField value={durationTarget} onChange={(event) => setDurationTarget(event.target.value as MagicDurationTarget)}>{durations.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</SelectField></Field>
            <Field label="Tipo narrativo"><SelectField value={narrativeType} onChange={(event) => setNarrativeType(event.target.value as MagicNarrativeType)}>{narrativeTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</SelectField></Field>
            <Field label="Voz"><SelectField value={voiceId} onChange={(event) => setVoiceId(event.target.value)}>{voices.map((voice) => <option key={voice.id} value={voice.voiceId}>{voice.name} - {voice.provider}</option>)}</SelectField></Field>
            <Field label="Estilo visual"><SelectField value={visualStyle} onChange={(event) => setVisualStyle(event.target.value as MagicVisualStyle)}>{visualStyles.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</SelectField></Field>
            <Field label="Fonte visual"><SelectField value={visualSource} onChange={(event) => setVisualSource(event.target.value as MagicVisualSource)}>{visualSources.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</SelectField></Field>
            <Toggle checked={subtitleEnabled} setChecked={setSubtitleEnabled} label="Criar legenda automaticamente" />
            <Toggle checked={musicEnabled} setChecked={setMusicEnabled} label="Gerar musica placeholder" />
            <Toggle checked={autoThumbnail} setChecked={setAutoThumbnail} label="Gerar thumbnail automaticamente" />
            <Toggle checked={aiVideoEnabled} setChecked={setAiVideoEnabled} label="Usar video IA em vez de imagens estaticas" />
            <Toggle checked={stockVideoMode} setChecked={(value) => { setStockVideoMode(value); if (value) setVisualSource("stock_videos"); }} label="Stock Video Mode: priorizar biblioteca e bancos gratuitos" />
            <Field label="Modo de video IA"><SelectField value={aiVideoMode} onChange={(event) => setAiVideoMode(event.target.value)}><option value="gerar_abertura">Gerar abertura com IA</option><option value="gerar_encerramento">Gerar encerramento com IA</option><option value="animar_primeiras">Animar primeiras cenas</option><option value="animar_todas">Animar todas as cenas</option><option value="animar_cenas_principais">Animar cenas principais</option><option value="personagem_abertura">Personagem falando como abertura</option></SelectField></Field>
            <Field label="Provider de video"><SelectField value={aiVideoProvider} onChange={(event) => setAiVideoProvider(event.target.value)}>{aiVideoProviders.map((provider) => <option key={provider.id} value={provider.provider}>{provider.name}</option>)}</SelectField></Field>
            <Field label="Orcamento maximo de creditos"><Input type="number" value={aiVideoBudget} onChange={(event) => setAiVideoBudget(Number(event.target.value))} /></Field>
            <div className="rounded-lg border border-primary/15 bg-primary/5 p-4 text-sm text-muted-foreground lg:col-span-2">
              <p className="font-medium text-foreground">Presets da Fase 6 ativos</p>
              <p className="mt-1">{visualPresetNames}</p>
            </div>
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <Card className="border-primary/15 bg-card/90">
            <CardHeader>
              <CardTitle>Templates</CardTitle>
              <CardDescription>Use um ponto de partida e ajuste em segundos.</CardDescription>
            </CardHeader>
            <CardContent className="grid max-h-[560px] gap-2 overflow-y-auto pr-2">
              {magicTemplates.slice(0, 6).map((template) => (
                <button key={template.id} onClick={() => applyTemplate(template.id)} className="group w-full rounded-md border border-white/5 bg-secondary/50 p-3 text-left transition hover:border-primary/40 hover:bg-primary/10">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">{template.name}</p>
                    <span className="rounded-md border border-primary/20 px-2 py-0.5 text-[10px] uppercase text-primary">{template.durationTarget}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{template.description}</p>
                  <p className="mt-2 text-[11px] text-primary opacity-0 transition group-hover:opacity-100">Aplicar template</p>
                </button>
              ))}
            </CardContent>
          </Card>
          <Card className="border-primary/20 bg-primary/5 shadow-[inset_0_1px_0_rgb(255_255_255/.06)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" />Execucao real</CardTitle>
              <CardDescription>Sem provider ou storage configurado, o worker falha com erro claro e os creditos reservados sao estornados.</CardDescription>
            </CardHeader>
          </Card>
        </aside>
      </section>

      <Card className="border-white/10">
        <button onClick={() => setAdvancedOpen((value) => !value)} className="flex w-full items-center justify-between gap-4 p-5 text-left">
          <div>
            <p className="font-display text-lg font-semibold">Configuracoes avancadas</p>
            <p className="text-sm text-muted-foreground">Controle roteiro, imagens, idioma, tom, cenas, zoom, motion e roteiro personalizado.</p>
          </div>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-primary/20 bg-primary/10">
            <ChevronDown className={`h-5 w-5 text-primary transition ${advancedOpen ? "rotate-180" : ""}`} />
          </span>
        </button>
        {advancedOpen ? (
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Textarea label="Instrucoes extras para roteiro" value={advanced.scriptInstructions} onChange={(value) => setAdvanced({ ...advanced, scriptInstructions: value })} />
            <Textarea label="Instrucoes extras para imagens" value={advanced.imageInstructions} onChange={(value) => setAdvanced({ ...advanced, imageInstructions: value })} />
            <Textarea label="Palavras proibidas" value={advanced.forbiddenWords} onChange={(value) => setAdvanced({ ...advanced, forbiddenWords: value })} />
            <Textarea label="Roteiro personalizado" value={advanced.customScript ?? ""} onChange={(value) => setAdvanced({ ...advanced, customScript: value })} />
            <Field label="Publico-alvo"><Input value={advanced.targetAudience} onChange={(event) => setAdvanced({ ...advanced, targetAudience: event.target.value })} /></Field>
            <Field label="Idioma"><Input value={advanced.language} onChange={(event) => setAdvanced({ ...advanced, language: event.target.value })} /></Field>
            <Field label="Tom da narracao"><Input value={advanced.narrationTone} onChange={(event) => setAdvanced({ ...advanced, narrationTone: event.target.value })} /></Field>
            <Field label="CTA"><Input value={advanced.cta} onChange={(event) => setAdvanced({ ...advanced, cta: event.target.value })} /></Field>
            <Field label="Quantidade aproximada de cenas"><Input type="number" value={advanced.sceneCount} onChange={(event) => setAdvanced({ ...advanced, sceneCount: Number(event.target.value) })} /></Field>
            <Field label="Duracao personalizada em segundos"><Input type="number" value={advanced.customDurationSeconds ?? 60} onChange={(event) => setAdvanced({ ...advanced, customDurationSeconds: Number(event.target.value) })} /></Field>
            <Toggle checked={advanced.useZoom} setChecked={(value) => setAdvanced({ ...advanced, useZoom: value })} label="Usar zoom em todas as imagens" />
            <Toggle checked={advanced.useOrganicMotion} setChecked={(value) => setAdvanced({ ...advanced, useOrganicMotion: value })} label="Usar organic motion" />
          </CardContent>
        ) : null}
      </Card>

      <section className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <Card className="border-primary/15">
          <CardHeader>
            <CardTitle>Revisao antes de gerar</CardTitle>
            <CardDescription>Confira escopo, custo estimado e creditos antes de iniciar o Magic Job.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <ReviewItem label="Tema" value={theme} />
              <ReviewItem label="Projeto" value={selectedProject?.name ?? "Projeto"} />
              <ReviewItem label="Voz" value={selectedVoice?.name ?? voiceId} />
              <ReviewItem label="Formato" value={formats.find((item) => item.value === format)?.label ?? format} />
              <ReviewItem label="Estilo" value={visualStyles.find((item) => item.value === visualStyle)?.label ?? visualStyle} />
              <ReviewItem label="Fonte visual" value={visualSources.find((item) => item.value === visualSource)?.label ?? visualSource} />
            </div>
            {reviewOpen && estimate ? <CostEstimate estimate={estimate} /> : null}
            {errorMessage ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <p className="font-semibold">Ver detalhes do erro</p>
                <p className="mt-1">{errorMessage}</p>
              </div>
            ) : null}
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={openReview} variant="outline" className="gap-2"><Gauge className="h-4 w-4" />Calcular custo</Button>
              <Button onClick={generateVideo} disabled={isGenerating || !reviewOpen || Boolean(estimate && estimate.totalCredits > availableCredits)} className="gap-2 sm:flex-1">
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Confirmar e gerar video
              </Button>
            </div>
          </CardContent>
        </Card>

        <ProgressCard isGenerating={isGenerating} result={result} onCancel={cancelGeneration} />
      </section>

      {result ? <ResultPanel result={result} /> : null}
    </div>
  );
}

function MagicStat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <Card className="border-primary/10 bg-card/70">
      <CardContent className="flex items-center gap-3 p-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-primary/20 bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="truncate text-sm font-semibold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid gap-2"><Label>{label}</Label>{children}</div>;
}

function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <Field label={label}>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} className="min-h-28 rounded-md border border-input bg-secondary/70 px-3 py-2 text-sm text-foreground outline-none focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring" />
    </Field>
  );
}

function Toggle({ checked, setChecked, label }: { checked: boolean; setChecked: (value: boolean) => void; label: string }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-white/5 bg-secondary/40 px-3 text-sm">
      <input type="checkbox" checked={checked} onChange={(event) => setChecked(event.target.checked)} className="h-4 w-4 accent-primary" />
      <span>{label}</span>
    </label>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/5 bg-secondary/40 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function CostEstimate({ estimate }: { estimate: MagicCostEstimate }) {
  const rows = [
    ["Texto", estimate.textCost],
    ["Voz", estimate.voiceCost],
    ["Imagens", estimate.imageCost],
    ["Thumbnail", estimate.thumbnailCost],
    ["Render", estimate.renderCost]
  ];
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
      <div className="grid gap-2 sm:grid-cols-5">
        {rows.map(([label, value]) => <ReviewItem key={label} label={String(label)} value={`${value} creditos`} />)}
      </div>
      <p className="mt-3 text-sm font-semibold text-primary">Total estimado: {estimate.totalCredits} creditos</p>
    </div>
  );
}

function ProgressCard({ isGenerating, result, onCancel }: { isGenerating: boolean; result: MagicQueuedResult | null; onCancel: () => void }) {
  const activeProgress = result ? 5 : (isGenerating ? 3 : 0);
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Film className="h-4 w-4 text-primary" />Progresso em tempo real</CardTitle>
        <CardDescription>O Magic cria um job real. O processamento acontece no worker e os logs aparecem no acompanhamento.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-2 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${activeProgress}%` }} />
        </div>
        <div className="space-y-2">
          {magicSteps.map((step) => {
            const done = activeProgress >= step.progress;
            return (
              <div key={step.status} className="flex items-center justify-between rounded-md border border-white/5 bg-secondary/30 px-3 py-2 text-sm">
                <span className="flex items-center gap-2">{done ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <span className="h-2 w-2 rounded-full bg-muted" />}{step.label}</span>
                <span className="text-xs text-muted-foreground">{step.progress}%</span>
              </div>
            );
          })}
        </div>
        {result ? <Button asChild className="w-full"><Link href={result.magic_url}>Acompanhar job real</Link></Button> : null}
        {isGenerating ? <Button variant="outline" className="w-full" onClick={onCancel}>Interromper envio</Button> : null}
      </CardContent>
    </Card>
  );
}

function ResultPanel({ result }: { result: MagicQueuedResult }) {
  return (
    <Card className="border-primary/25 bg-gradient-to-br from-primary/10 to-card">
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <Badge>{result.status}</Badge>
            <CardTitle className="mt-3 text-2xl">Magic Job enfileirado</CardTitle>
            <CardDescription>{result.cost_estimate.totalCredits} creditos reservados. O editor sera liberado quando o worker persistir o video_project real.</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild><Link href={result.magic_url}>Acompanhar Magic Job</Link></Button>
            <Button variant="outline" asChild><Link href="/app/queue">Abrir fila</Link></Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-4">
        <ReviewItem label="Job" value={result.job_id} />
        <ReviewItem label="Texto" value={`${result.cost_estimate.textCost} cr`} />
        <ReviewItem label="Voz" value={`${result.cost_estimate.voiceCost} cr`} />
        <ReviewItem label="Imagens" value={`${result.cost_estimate.imageCost} cr`} />
        {result.warning ? <p className="rounded-md border border-amber-400/20 bg-amber-400/10 p-3 text-sm text-amber-100 md:col-span-4">{result.warning}</p> : null}
      </CardContent>
    </Card>
  );
}
