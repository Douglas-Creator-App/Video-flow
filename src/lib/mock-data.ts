import type {
  ContentFolder,
  ContentItem,
  ContentTag,
  AiVideoAsset,
  AiVideoProviderConfig,
  BulkJob,
  Channel,
  ChannelGoal,
  ChannelPermission,
  ChannelTemplate,
  Competitor,
  CompetitorInsight,
  ContentCalendarItem,
  Favorite,
  IdeaEvent,
  IdeaSource,
  ImageProviderConfig,
  ImageAnimation,
  ImageToVideoJob,
  IntroOutroGeneration,
  Keyword,
  MediaAsset,
  MagicTemplate,
  MagicVideoJob,
  MusicTrack,
  Niche,
  OperationNotification,
  Persona,
  ProductionPlan,
  Project,
  QueueJob,
  SubtitleSegment,
  Trend,
  VideoProject,
  VideoRender,
  VideoScene,
  Voice,
  VoiceProviderConfig,
  AdvancedSubtitleStyle,
  AudioSettings,
  Workspace,
  WorkspaceUser,
  ContentIdea,
  ThumbnailGeneration,
  TalkingCharacterJob,
  TextToVideoJob,
  SourceVideo,
  VideoTranscript,
  ViralClip,
  ViralClipJob,
  ViralMoment,
  VideoAiProvider,
  VideoEffect,
  VideoVersion,
  VisualStylePreset,
  Plan,
  Subscription,
  CreditWallet,
  CreditTransaction,
  CreditPackage,
  BillingEvent,
  Invoice,
  PlatformAdmin,
  FeatureFlag,
  UsageSnapshot,
  AdminWorkspaceSummary,
  ProviderCostSummary,
  ExportPackage,
  VideoMetadata,
  BulkExportJob,
  ManualPublication,
  AssetSourceConfig,
  AssetLibraryItem,
  AssetCollection,
  AssetCollectionItem,
  AssetUsage,
  AssetSearchCacheEntry,
  PremiumTemplate,
  TemplatePack,
  TemplatePackItem,
  OnboardingProgress,
  OnboardingEvent,
  ActivationChecklistItem,
  VideoQualityScore,
  VideoRecommendation,
  RetentionAnalysis,
  HookAnalysis,
  ScriptImprovement,
  ScenePacingItem,
  ThumbnailAnalysis,
  SubtitleReadabilityAnalysis,
  PlatformOptimization,
  VideoVersionComparison,
  TrendTopic,
  IdeaBankItem,
  TopicSuggestion,
  ContentGapRecommendation,
  VideoOpportunity,
  TitleLabResult,
  ThumbLabIdea,
  CalendarAiSuggestion,
  ChannelHealthScore,
  TrackedChannel,
  StrategyRecommendation,
  ContentFactory,
  ProductionRule,
  FactorySchedule,
  ContentSeries,
  FactoryQueueJob,
  ReviewQueueItem,
  FactoryTemplate,
  FactoryAlert,
  LaunchChecklistItem,
  EnvironmentVariableStatus,
  ProviderHealthCheck,
  StorageBucketCheck,
  BackupJob,
  DataRetentionPolicy,
  SecurityEvent,
  RateLimitRule,
  ErrorLog,
  SystemHealthCheck,
  UserLegalAcceptance,
  DataRequest,
  SmokeTestStep,
  DemoModeSetting,
  SmokeTestVideoResult,
  SmokeTestIssue,
  SmokeModuleValidation
} from "@/lib/types";

export const workspaces: Workspace[] = [
  { id: "ws_1", name: "Video Flow HQ", slug: "video-flow-hq", plan: "Scale" },
  { id: "ws_2", name: "Growth Lab", slug: "growth-lab", plan: "Growth" }
];

export const defaultNiches = [
  "Marketing",
  "Vendas",
  "Finanças",
  "Investimentos",
  "Saúde",
  "Emagrecimento",
  "Fitness",
  "Desenvolvimento Pessoal",
  "Relacionamentos",
  "Educação",
  "Tecnologia",
  "Inteligência Artificial",
  "E-commerce",
  "Imóveis",
  "Seguros",
  "Proteção Veicular",
  "Jurídico",
  "Turismo"
];

export const niches: Niche[] = [
  ...defaultNiches.map<Niche>((name, index) => ({
  id: `niche_${index + 1}`,
  name,
  isDefault: true,
  active: true
  })),
  { id: "niche_custom_1", workspaceId: "ws_1", name: "CRM para pequenas empresas", isDefault: false, active: true }
];

export const projects: Project[] = [
  {
    id: "project_1",
    workspaceId: "ws_1",
    name: "Proteção Veicular Pro",
    description: "Conteúdo para aquisição, educação e conversão de associados.",
    mainNiche: "Proteção Veicular",
    logo: "PV",
    primaryColor: "#0f9f7a",
    language: "pt-BR",
    country: "Brasil",
    status: "ativo",
    createdAt: "2026-05-12",
    updatedAt: "2026-06-05"
  },
  {
    id: "project_2",
    workspaceId: "ws_1",
    name: "Growth CRM",
    description: "Biblioteca editorial para vendas, WhatsApp e automação comercial.",
    mainNiche: "Vendas",
    logo: "GC",
    primaryColor: "#2563eb",
    language: "pt-BR",
    country: "Brasil",
    status: "ativo",
    createdAt: "2026-04-21",
    updatedAt: "2026-06-03"
  },
  {
    id: "project_3",
    workspaceId: "ws_1",
    name: "Educação Financeira",
    description: "Conteúdo para investimentos iniciais e finanças pessoais.",
    mainNiche: "Investimentos",
    logo: "EF",
    primaryColor: "#d97706",
    language: "pt-BR",
    country: "Brasil",
    status: "arquivado",
    createdAt: "2026-03-10",
    updatedAt: "2026-05-01"
  }
];

export const personas: Persona[] = [
  {
    id: "persona_1",
    workspaceId: "ws_1",
    projectId: "project_1",
    name: "Carlos, gestor de associação",
    age: 42,
    gender: "Masculino",
    profession: "Diretor comercial",
    pains: ["Baixa previsibilidade de leads", "Dificuldade para explicar benefícios"],
    goals: ["Aumentar conversões", "Reduzir dúvidas no atendimento"],
    objections: ["Medo de parecer seguro tradicional", "Receio de prometer demais"],
    desires: ["Autoridade local", "Processo comercial simples"],
    interests: ["WhatsApp", "Tráfego pago", "CRM"]
  },
  {
    id: "persona_2",
    workspaceId: "ws_1",
    projectId: "project_2",
    name: "Marina, head de vendas",
    age: 34,
    gender: "Feminino",
    profession: "Head de vendas",
    pains: ["Time sem cadência", "Follow-up inconsistente"],
    goals: ["Padronizar prospecção", "Aumentar taxa de resposta"],
    objections: ["Não quer ferramenta complexa"],
    desires: ["Clareza operacional", "Métricas confiáveis"],
    interests: ["CRM", "Prospecção", "Playbooks"]
  }
];

export const keywords: Keyword[] = [
  {
    id: "kw_1",
    workspaceId: "ws_1",
    projectId: "project_1",
    nicheId: "niche_16",
    word: "proteção veicular vale a pena",
    volume: 5400,
    difficulty: 42,
    intent: "comercial",
    category: "Consideração"
  },
  {
    id: "kw_2",
    workspaceId: "ws_1",
    projectId: "project_2",
    nicheId: "niche_2",
    word: "crm para whatsapp",
    volume: 8100,
    difficulty: 58,
    intent: "transacional",
    category: "Aquisição"
  },
  {
    id: "kw_3",
    workspaceId: "ws_1",
    projectId: "project_3",
    nicheId: "niche_4",
    word: "como começar a investir",
    volume: 14800,
    difficulty: 63,
    intent: "informacional",
    category: "Topo de funil"
  }
];

export const tags: ContentTag[] = [
  { id: "tag_1", workspaceId: "ws_1", name: "vendas", color: "#0f9f7a", active: true },
  { id: "tag_2", workspaceId: "ws_1", name: "whatsapp", color: "#16a34a", active: true },
  { id: "tag_3", workspaceId: "ws_1", name: "crm", color: "#2563eb", active: true },
  { id: "tag_4", workspaceId: "ws_1", name: "proteção veicular", color: "#d97706", active: true },
  { id: "tag_5", workspaceId: "ws_1", name: "prospecção", color: "#7c3aed", active: true },
  { id: "tag_6", workspaceId: "ws_1", name: "tráfego pago", color: "#dc2626", active: true },
  { id: "tag_7", workspaceId: "ws_1", name: "marketing", color: "#0891b2", active: true }
];

export const folders: ContentFolder[] = [
  "Ideias",
  "Roteiros",
  "Vídeos",
  "Carrosséis",
  "Anúncios",
  "Publicados"
].flatMap((name, index) =>
  projects.map((project) => ({
    id: `folder_${project.id}_${index + 1}`,
    workspaceId: project.workspaceId,
    projectId: project.id,
    name,
    type: ["ideias", "roteiros", "videos", "carrosseis", "anuncios", "publicados"][index] as ContentFolder["type"],
    archived: false
  }))
);

export const contentItems: ContentItem[] = [
  {
    id: "content_1",
    workspaceId: "ws_1",
    projectId: "project_1",
    folderId: "folder_project_1_1",
    type: "Ideia",
    title: "Checklist antes de contratar proteção veicular",
    description: "Conteúdo educativo para reduzir objeções de confiança.",
    category: "Educação",
    status: "aprovado",
    tags: ["proteção veicular", "marketing"],
    author: "Marina Costa",
    createdAt: "2026-06-01"
  },
  {
    id: "content_2",
    workspaceId: "ws_1",
    projectId: "project_2",
    folderId: "folder_project_2_2",
    type: "Roteiro",
    title: "Script de follow-up no WhatsApp",
    description: "Roteiro para SDRs retomarem conversas paradas.",
    category: "Vendas",
    status: "rascunho",
    tags: ["vendas", "whatsapp", "crm"],
    author: "Daniel Mota",
    createdAt: "2026-06-03"
  },
  {
    id: "content_3",
    workspaceId: "ws_1",
    projectId: "project_2",
    folderId: "folder_project_2_4",
    type: "Carrossel",
    title: "7 erros na prospecção outbound",
    description: "Post para LinkedIn com foco em awareness.",
    category: "Aquisição",
    status: "publicado",
    tags: ["prospecção", "vendas"],
    author: "Rafa Lima",
    createdAt: "2026-05-29"
  },
  {
    id: "content_4",
    workspaceId: "ws_1",
    projectId: "project_1",
    folderId: "folder_project_1_5",
    type: "Anúncio",
    title: "Anúncio benefício contra colisão",
    description: "Copy curta para campanha de tráfego pago.",
    category: "Performance",
    status: "arquivado",
    tags: ["tráfego pago", "proteção veicular"],
    author: "Marina Costa",
    createdAt: "2026-05-18"
  }
];

export const favorites: Favorite[] = [
  { id: "fav_1", workspaceId: "ws_1", entityType: "project", entityId: "project_1" },
  { id: "fav_2", workspaceId: "ws_1", entityType: "content", entityId: "content_3" },
  { id: "fav_3", workspaceId: "ws_1", entityType: "keyword", entityId: "kw_2" },
  { id: "fav_4", workspaceId: "ws_1", entityType: "persona", entityId: "persona_1" }
];

export const metrics = [
  { label: "Conteúdos Gerados", value: "1.284", change: "+18,2%" },
  { label: "Projetos Ativos", value: projects.filter((project) => project.status === "ativo").length.toString(), change: "+2" },
  { label: "Créditos Disponíveis", value: "48.750", change: "-12,4%" },
  { label: "Publicações", value: contentItems.filter((item) => item.status === "publicado").length.toString(), change: "+1" }
];

export const recentContent = contentItems.map((item) => ({
  title: item.title,
  project: projects.find((project) => project.id === item.projectId)?.name ?? "Sem projeto",
  status: item.status
}));

export const systemActivity = [
  { action: "login", label: "Marina entrou no workspace", time: "2 min" },
  { action: "update", label: "Projeto Growth CRM atualizado", time: "18 min" },
  { action: "create", label: "Nova persona criada em Proteção Veicular Pro", time: "1 h" },
  { action: "delete", label: "Conteúdo duplicado arquivado", time: "3 h" }
];

export const creditUsage = [
  { label: "Ideias", value: 28 },
  { label: "Roteiros", value: 24 },
  { label: "Carrosséis", value: 21 },
  { label: "Anúncios", value: 15 },
  { label: "Outros", value: 12 }
];

export const recentProjects = projects.map((project, index) => ({
  name: project.name,
  owner: ["Marina Costa", "Daniel Mota", "Rafa Lima"][index] ?? "Content Team",
  progress: [78, 44, 62][index] ?? 30
}));

export const users: WorkspaceUser[] = [
  { id: "usr_1", name: "Daniel Mota", email: "daniel@contentengine.ai", role: "Owner", status: "Ativo" },
  { id: "usr_2", name: "Marina Costa", email: "marina@contentengine.ai", role: "Admin", status: "Ativo" },
  { id: "usr_3", name: "Rafa Lima", email: "rafa@contentengine.ai", role: "Editor", status: "Ativo" },
  { id: "usr_4", name: "Julia Alves", email: "julia@contentengine.ai", role: "Viewer", status: "Pendente" }
];

export const contentDashboard = {
  total: contentItems.length,
  byCategory: countBy(contentItems, "category"),
  byStatus: countBy(contentItems, "status"),
  byProject: contentItems.reduce<Record<string, number>>((acc, item) => {
    const name = projects.find((project) => project.id === item.projectId)?.name ?? "Sem projeto";
    acc[name] = (acc[name] ?? 0) + 1;
    return acc;
  }, {}),
  byNiche: contentItems.reduce<Record<string, number>>((acc, item) => {
    const niche = projects.find((project) => project.id === item.projectId)?.mainNiche ?? "Sem nicho";
    acc[niche] = (acc[niche] ?? 0) + 1;
    return acc;
  }, {})
};

export const trends: Trend[] = [
  {
    id: "trend_1",
    workspaceId: "ws_1",
    projectId: "project_2",
    title: "Playbooks de vendas em vídeo curto",
    description: "Criadores B2B estão transformando processos comerciais em listas rápidas e exemplos práticos.",
    platform: "LinkedIn",
    niche: "Vendas",
    country: "Brasil",
    language: "pt-BR",
    mainKeyword: "playbook de vendas",
    estimatedVolume: 12800,
    estimatedGrowth: 41,
    competitionLevel: "média",
    viralPotential: 78,
    discoveredAt: "2026-06-06",
    status: "nova",
    source: "Radar mockado",
    externalUrl: "https://example.com/trends/playbook-vendas"
  },
  {
    id: "trend_2",
    workspaceId: "ws_1",
    projectId: "project_1",
    title: "Checklists operacionais para criadores",
    description: "Conteúdos em formato checklist ganham tração por reduzir complexidade e acelerar execução.",
    platform: "Instagram Reels",
    niche: "Marketing",
    country: "Brasil",
    language: "pt-BR",
    mainKeyword: "checklist de conteúdo",
    estimatedVolume: 9200,
    estimatedGrowth: 36,
    competitionLevel: "baixa",
    viralPotential: 84,
    discoveredAt: "2026-06-05",
    status: "analisada",
    source: "Radar mockado"
  },
  {
    id: "trend_3",
    workspaceId: "ws_1",
    projectId: "project_2",
    title: "Automação simples para times pequenos",
    description: "Posts que mostram automações pequenas e aplicáveis estão performando bem em SaaS e vendas.",
    platform: "YouTube Shorts",
    niche: "Tecnologia",
    country: "Brasil",
    language: "pt-BR",
    mainKeyword: "automação simples",
    estimatedVolume: 17600,
    estimatedGrowth: 52,
    competitionLevel: "alta",
    viralPotential: 72,
    discoveredAt: "2026-06-04",
    status: "aprovada",
    source: "Radar mockado"
  }
];

export const competitors: Competitor[] = [
  {
    id: "competitor_1",
    workspaceId: "ws_1",
    projectId: "project_2",
    name: "Referência SaaS Editorial",
    platform: "LinkedIn",
    url: "https://example.com/reference/editorial-saas",
    niche: "Vendas",
    country: "Brasil",
    language: "pt-BR",
    notes: "Usa posts curtos com frameworks, comparativos e CTAs para diagnóstico.",
    status: "monitorando"
  },
  {
    id: "competitor_2",
    workspaceId: "ws_1",
    projectId: "project_1",
    name: "Canal Conteúdo Operacional",
    platform: "YouTube",
    url: "https://example.com/reference/operational-content",
    niche: "Marketing",
    country: "Brasil",
    language: "pt-BR",
    notes: "Publica tutoriais semanais e listas de ferramentas.",
    status: "ativo"
  }
];

export const competitorInsights: CompetitorInsight[] = [
  {
    id: "insight_1",
    competitorId: "competitor_1",
    contentCount: 186,
    averageViews: 12400,
    topThemes: ["processo comercial", "follow-up", "CRM", "métricas"],
    topFormats: ["post", "carousel", "short_video"],
    postingFrequency: "4 vezes por semana",
    recurringHooks: ["Pare de perder leads", "O erro que trava seu pipeline"],
    ctas: ["Comente diagnóstico", "Baixe o checklist", "Envie para o time"]
  },
  {
    id: "insight_2",
    competitorId: "competitor_2",
    contentCount: 94,
    averageViews: 8700,
    topThemes: ["planejamento editorial", "rotina de conteúdo", "biblioteca"],
    topFormats: ["long_video", "short_video", "article"],
    postingFrequency: "2 vezes por semana",
    recurringHooks: ["Faça isso antes de publicar", "Como organizar sua semana"],
    ctas: ["Salvar para depois", "Testar o template"]
  }
];

export const contentIdeas: ContentIdea[] = [
  {
    id: "idea_1",
    workspaceId: "ws_1",
    projectId: "project_2",
    title: "O checklist de 10 minutos antes de publicar",
    description: "Ideia para mostrar uma rotina simples de validação antes de um conteúdo sair.",
    niche: "Marketing",
    personaId: "persona_2",
    sourceType: "trend",
    sourceUrl: "https://example.com/trends/checklist",
    platformOrigin: "Instagram Reels",
    formatSuggestion: "short_video",
    hook: "Antes de publicar qualquer conteúdo, passe por esses 5 pontos.",
    angle: "Organização prática para reduzir retrabalho.",
    objective: "education",
    funnelStage: "topo",
    viralScore: 82,
    commercialScore: 68,
    difficultyScore: 24,
    priorityScore: 126,
    status: "aprovada",
    tags: ["marketing", "planejamento", "checklist"],
    notes: "Pode virar carrossel e vídeo curto.",
    createdBy: "Daniel Mota",
    createdAt: "2026-06-06",
    updatedAt: "2026-06-06"
  },
  {
    id: "idea_2",
    workspaceId: "ws_1",
    projectId: "project_2",
    title: "3 sinais de que sua biblioteca de conteúdo virou bagunça",
    description: "Conteúdo de dor para times que já produzem, mas perderam rastreabilidade.",
    niche: "Vendas",
    personaId: "persona_2",
    sourceType: "manual",
    platformOrigin: "Manual",
    formatSuggestion: "carousel",
    hook: "Se você não encontra um conteúdo antigo em 30 segundos, isso custa dinheiro.",
    angle: "Custo operacional da desorganização.",
    objective: "lead_generation",
    funnelStage: "meio",
    viralScore: 74,
    commercialScore: 86,
    difficultyScore: 32,
    priorityScore: 128,
    status: "em_análise",
    tags: ["biblioteca", "operações", "conteúdo"],
    notes: "Adicionar CTA para diagnóstico editorial.",
    createdBy: "Marina Costa",
    createdAt: "2026-06-05",
    updatedAt: "2026-06-05"
  },
  {
    id: "idea_3",
    workspaceId: "ws_1",
    projectId: "project_1",
    title: "Como transformar uma tendência em pauta sem copiar ninguém",
    description: "Explicar um framework simples: tendência, ângulo, persona, objetivo e formato.",
    niche: "Marketing",
    sourceType: "competitor",
    platformOrigin: "LinkedIn",
    formatSuggestion: "post",
    hook: "Tendência não é pauta. Pauta nasce quando você escolhe um ângulo.",
    angle: "Posicionamento estratégico para conteúdo original.",
    objective: "authority",
    funnelStage: "topo",
    viralScore: 69,
    commercialScore: 71,
    difficultyScore: 28,
    priorityScore: 112,
    status: "rascunho",
    tags: ["tendências", "estratégia", "conteúdo"],
    notes: "Boa candidata para artigo.",
    createdBy: "Rafa Lima",
    createdAt: "2026-06-04",
    updatedAt: "2026-06-04"
  }
];

export const ideaSources: IdeaSource[] = [
  {
    id: "source_1",
    workspaceId: "ws_1",
    projectId: "project_2",
    url: "https://example.com/reference/content-ops",
    title: "Thread sobre operações de conteúdo",
    notes: "Referência colada manualmente para inspirar pautas.",
    platform: "X/Twitter",
    niche: "Marketing"
  }
];

export const ideaEvents: IdeaEvent[] = [
  { id: "event_1", ideaId: "idea_1", event: "ideia criada", actor: "Daniel Mota", createdAt: "2026-06-06 09:30" },
  { id: "event_2", ideaId: "idea_1", event: "ideia aprovada", actor: "Marina Costa", createdAt: "2026-06-06 11:12" },
  { id: "event_3", ideaId: "idea_2", event: "ideia editada", actor: "Marina Costa", createdAt: "2026-06-05 16:40" }
];

export const voiceProviders: VoiceProviderConfig[] = [
  { id: "voice_provider_1", workspaceId: "ws_1", name: "OpenAI TTS", provider: "openai_tts", status: "active", defaultVoiceId: "alloy", defaultModel: "gpt-4o-mini-tts", costPerCharacter: 0.000015 },
  { id: "voice_provider_2", workspaceId: "ws_1", name: "ElevenLabs", provider: "elevenlabs", status: "inactive", defaultVoiceId: "voice_demo", defaultModel: "eleven_multilingual_v2", costPerCharacter: 0.00002 },
  { id: "voice_provider_3", workspaceId: "ws_1", name: "Mock Voice", provider: "mock", status: "active", defaultVoiceId: "mock_narrator", defaultModel: "mock-tts", costPerCharacter: 0 }
];

export const voices: Voice[] = [
  { id: "voice_1", workspaceId: "ws_1", provider: "openai_tts", voiceId: "alloy", name: "Alloy", gender: "neutro", language: "pt-BR", accent: "brasileiro", style: "narrativo", isFavorite: true, status: "active" },
  { id: "voice_2", workspaceId: "ws_1", provider: "openai_tts", voiceId: "nova", name: "Nova", gender: "feminino", language: "pt-BR", accent: "brasileiro", style: "energético", isFavorite: false, status: "active" },
  { id: "voice_3", workspaceId: "ws_1", provider: "mock", voiceId: "mock_deep", name: "Mock Deep", gender: "masculino", language: "pt-BR", accent: "brasileiro", style: "documentary", isFavorite: true, status: "active" }
];

export const imageProviders: ImageProviderConfig[] = [
  { id: "image_provider_1", workspaceId: "ws_1", name: "OpenAI Images", provider: "openai_images", status: "active", defaultModel: "gpt-image-1", costPerImage: 0.04 },
  { id: "image_provider_2", workspaceId: "ws_1", name: "Flux", provider: "flux", status: "inactive", defaultModel: "flux-placeholder", costPerImage: 0.03 },
  { id: "image_provider_3", workspaceId: "ws_1", name: "Mock Images", provider: "mock", status: "active", defaultModel: "mock-image", costPerImage: 0 }
];

export const mediaAssets: MediaAsset[] = [
  { id: "asset_1", workspaceId: "ws_1", projectId: "project_1", type: "image", source: "ai_generated", fileUrl: "/media/mock-scene-1.jpg", thumbnailUrl: "/media/mock-scene-1.jpg", title: "Cena abstrata dourada", description: "Imagem mockada para cena inicial.", tags: ["intro", "luxo"], width: 1080, height: 1920, sizeBytes: 420000, createdBy: "Video Flow", createdAt: "2026-06-07" },
  { id: "asset_2", workspaceId: "ws_1", projectId: "project_1", type: "audio", source: "ai_generated", fileUrl: "/media/mock-narration.mp3", title: "Narração demo", description: "Áudio mockado de narração.", tags: ["narração"], durationSeconds: 42, sizeBytes: 980000, createdBy: "Video Flow", createdAt: "2026-06-07" },
  { id: "asset_3", workspaceId: "ws_1", type: "music", source: "upload", fileUrl: "/media/mock-music.mp3", title: "Trilha cinematic calm", description: "Música de fundo demonstrativa.", tags: ["cinematic", "calm"], durationSeconds: 120, createdBy: "Daniel Mota", createdAt: "2026-06-07" }
];

export const videoProjects: VideoProject[] = [
  {
    id: "video_1",
    workspaceId: "ws_1",
    projectId: "project_1",
    contentId: "content_2",
    title: "Checklist de publicação em 60 segundos",
    format: "reels",
    aspectRatio: "9:16",
    durationTarget: 60,
    narrationAudioUrl: "/media/mock-narration.mp3",
    backgroundMusicUrl: "/media/mock-music.mp3",
    subtitleEnabled: true,
    subtitleStyle: "tiktok",
    visualStyle: "cinematográfico",
    status: "editing",
    thumbnailUrl: "/media/mock-scene-1.jpg",
    createdAt: "2026-06-07",
    updatedAt: "2026-06-07"
  }
];

export const videoScenes: VideoScene[] = [
  { id: "scene_1", workspaceId: "ws_1", videoProjectId: "video_1", orderIndex: 1, scriptText: "Antes de publicar qualquer conteúdo, passe por esses cinco pontos.", narrationStart: 0, narrationEnd: 8, mediaAssetId: "asset_1", imagePrompt: "creator desk, premium dark gold, vertical video, cinematic", durationSeconds: 8, motionType: "zoom_in", transitionType: "fade", zoomEnabled: true, organicMotionEnabled: true, status: "completed" },
  { id: "scene_2", workspaceId: "ws_1", videoProjectId: "video_1", orderIndex: 2, scriptText: "Primeiro: clareza de objetivo. Segundo: formato certo para a plataforma.", narrationStart: 8, narrationEnd: 18, mediaAssetId: "asset_1", imagePrompt: "content workflow board, cinematic dark, gold highlights", durationSeconds: 10, motionType: "pan_left", transitionType: "cinematic", zoomEnabled: false, organicMotionEnabled: true, status: "completed" },
  { id: "scene_3", workspaceId: "ws_1", videoProjectId: "video_1", orderIndex: 3, scriptText: "Se você não consegue revisar rápido, sua operação precisa de um fluxo melhor.", narrationStart: 18, narrationEnd: 30, mediaAssetId: "asset_1", imagePrompt: "video timeline interface, premium SaaS, vertical", durationSeconds: 12, motionType: "zoom_out", transitionType: "fade", zoomEnabled: true, organicMotionEnabled: false, status: "completed" }
];

export const subtitleSegments: SubtitleSegment[] = [
  { id: "sub_1", workspaceId: "ws_1", videoProjectId: "video_1", startTime: 0, endTime: 4, text: "Antes de publicar...", style: "tiktok", position: "bottom" },
  { id: "sub_2", workspaceId: "ws_1", videoProjectId: "video_1", startTime: 4, endTime: 8, text: "passe por estes 5 pontos", style: "tiktok", position: "bottom" },
  { id: "sub_3", workspaceId: "ws_1", videoProjectId: "video_1", startTime: 8, endTime: 14, text: "Objetivo claro. Formato certo.", style: "bold", position: "bottom" }
];

export const musicTracks: MusicTrack[] = [
  { id: "music_1", workspaceId: "ws_1", title: "Cinematic Calm", source: "upload", fileUrl: "/media/mock-music.mp3", mood: "cinematic", durationSeconds: 120, isFavorite: true, createdAt: "2026-06-07" },
  { id: "music_2", workspaceId: "ws_1", title: "Energetic Pulse", source: "stock", fileUrl: "/media/mock-music-2.mp3", mood: "energetic", durationSeconds: 90, isFavorite: false, createdAt: "2026-06-07" }
];

export const videoRenders: VideoRender[] = [
  { id: "render_1", workspaceId: "ws_1", videoProjectId: "video_1", renderUrl: "/media/mock-render.mp4", status: "completed", durationSeconds: 30, fileSize: 6800000, logs: ["Job criado", "Cenas processadas", "Legendas aplicadas", "Render finalizado"], createdAt: "2026-06-07" }
];

export const visualStylePresets: VisualStylePreset[] = [
  { id: "preset_1", workspaceId: "ws_1", name: "Cinematográfico", description: "Contraste alto, luz dramática e profundidade.", promptPrefix: "cinematic lighting, premium composition,", promptSuffix: "high detail, professional video frame", negativePrompt: "low quality, distorted, blurry", defaultAspectRatio: "9:16", status: "active", createdAt: "2026-06-07" },
  { id: "preset_2", workspaceId: "ws_1", name: "Documentário", description: "Visual realista e editorial.", promptPrefix: "documentary style, realistic,", promptSuffix: "natural light, authentic scene", negativePrompt: "cartoon, overprocessed", defaultAspectRatio: "16:9", status: "active", createdAt: "2026-06-07" },
  { id: "preset_3", workspaceId: "ws_1", name: "Luxo", description: "Dark gold, premium e sofisticado.", promptPrefix: "luxury dark gold aesthetic,", promptSuffix: "elegant shadows, premium brand look", negativePrompt: "cheap, noisy, cluttered", defaultAspectRatio: "9:16", status: "active", createdAt: "2026-06-07" },
  { id: "preset_4", workspaceId: "ws_1", name: "Anime", description: "Estética anime/mangá.", promptPrefix: "anime style,", promptSuffix: "clean line art, expressive lighting", negativePrompt: "realistic photo", defaultAspectRatio: "9:16", status: "active", createdAt: "2026-06-07" }
];

export const videoEffects: VideoEffect[] = [
  { id: "effect_1", workspaceId: "ws_1", videoProjectId: "video_1", effectType: "cinematic", intensity: 70, appliesTo: "video", createdAt: "2026-06-07" },
  { id: "effect_2", workspaceId: "ws_1", videoProjectId: "video_1", sceneId: "scene_2", effectType: "vignette", intensity: 35, appliesTo: "scene", createdAt: "2026-06-07" }
];

export const videoAiProviders: VideoAiProvider[] = [
  { id: "video_ai_1", workspaceId: "ws_1", name: "Runway", provider: "runway", status: "inactive", defaultModel: "gen-placeholder", costPerGeneration: 0.12, createdAt: "2026-06-07" },
  { id: "video_ai_2", workspaceId: "ws_1", name: "Kling", provider: "kling", status: "inactive", defaultModel: "kling-placeholder", costPerGeneration: 0.1, createdAt: "2026-06-07" },
  { id: "video_ai_3", workspaceId: "ws_1", name: "Mock Animation", provider: "mock", status: "active", defaultModel: "mock-animation", costPerGeneration: 0, createdAt: "2026-06-07" }
];

export const imageAnimations: ImageAnimation[] = [
  { id: "anim_1", workspaceId: "ws_1", videoProjectId: "video_1", sceneId: "scene_1", provider: "mock", inputImageUrl: "/media/mock-scene-1.jpg", prompt: "slow cinematic zoom with subtle parallax", outputVideoUrl: "/media/mock-animation.mp4", durationSeconds: 5, cost: 0, status: "completed", createdAt: "2026-06-07" }
];

export const advancedSubtitleStyles: AdvancedSubtitleStyle[] = [
  { id: "sub_style_1", workspaceId: "ws_1", name: "TikTok Bold", fontFamily: "Inter", fontSize: 42, fontWeight: "800", textColor: "#F5F0E8", backgroundColor: "#00000099", outlineColor: "#C9A84C", shadow: true, position: "bottom", animation: "popup", createdAt: "2026-06-07" },
  { id: "sub_style_2", workspaceId: "ws_1", name: "Documentário", fontFamily: "Inter", fontSize: 30, fontWeight: "600", textColor: "#FFFFFF", backgroundColor: "#000000CC", outlineColor: "#000000", shadow: false, position: "bottom", animation: "fade", createdAt: "2026-06-07" }
];

export const audioSettings: AudioSettings[] = [
  { id: "audio_settings_1", workspaceId: "ws_1", videoProjectId: "video_1", narrationVolume: 92, musicVolume: 24, fadeInSeconds: 1.2, fadeOutSeconds: 1.8, loopMusic: true, createdAt: "2026-06-07" }
];

export const thumbnailGenerations: ThumbnailGeneration[] = [
  {
    id: "thumb_gen_1",
    workspaceId: "ws_1",
    videoProjectId: "video_1",
    provider: "mock",
    prompt: "premium dark thumbnail with gold accents",
    style: "YouTube viral",
    textOverlay: "5 pontos antes de publicar",
    quantity: 6,
    imageUrls: [1, 2, 3, 4, 5, 6].map((index) => `/media/mock-thumbnail-${index}.jpg`),
    selectedImageUrl: "/media/mock-thumbnail-1.jpg",
    status: "completed",
    cost: 0,
    createdAt: "2026-06-07"
  }
];

export const videoVersions: VideoVersion[] = [
  { id: "version_1", workspaceId: "ws_1", videoProjectId: "video_1", versionNumber: 1, renderUrl: "/media/mock-render.mp4", thumbnailUrl: "/media/mock-thumbnail-1.jpg", settingsSnapshot: { subtitleStyle: "TikTok Bold", effects: ["cinematic", "vignette"] }, createdAt: "2026-06-07" }
];

export const videoQualityScores: VideoQualityScore[] = [
  { id: "quality_1", workspaceId: "ws_1", videoProjectId: "video_1", overallScore: 78, hookScore: 74, scriptScore: 82, visualScore: 76, subtitleScore: 88, thumbnailScore: 69, retentionScore: 72, ctaScore: 81, recommendations: ["Melhore o gancho inicial", "A thumbnail precisa de mais contraste", "Reduza a duracao da cena 4"], createdAt: "2026-06-08 16:00" },
  { id: "quality_2", workspaceId: "ws_1", videoProjectId: "video_2", overallScore: 64, hookScore: 58, scriptScore: 70, visualScore: 62, subtitleScore: 74, thumbnailScore: 55, retentionScore: 61, ctaScore: 68, recommendations: ["Adicione variacao visual", "Legenda esta pequena para Shorts", "CTA muito tarde"], createdAt: "2026-06-08 16:10" },
  { id: "quality_3", workspaceId: "ws_1", videoProjectId: "video_3", overallScore: 91, hookScore: 93, scriptScore: 89, visualScore: 92, subtitleScore: 90, thumbnailScore: 88, retentionScore: 94, ctaScore: 86, recommendations: ["Manter ritmo atual", "Teste uma segunda thumbnail"], createdAt: "2026-06-08 16:20" }
];

export const videoRecommendations: VideoRecommendation[] = [
  { id: "recommendation_1", workspaceId: "ws_1", videoProjectId: "video_1", type: "hook", severity: "high", message: "Gancho inicial demora para criar curiosidade.", suggestion: "Abra com uma pergunta direta nos primeiros 3 segundos.", applied: false, ignored: false, createdAt: "2026-06-08 16:00" },
  { id: "recommendation_2", workspaceId: "ws_1", videoProjectId: "video_1", type: "thumbnail", severity: "medium", message: "Thumbnail com pouco contraste.", suggestion: "Aumente contraste entre texto e fundo e reduza para 3 palavras.", applied: false, ignored: false, createdAt: "2026-06-08 16:01" },
  { id: "recommendation_3", workspaceId: "ws_1", videoProjectId: "video_1", type: "pacing", severity: "medium", message: "Cena 4 longa demais para video curto.", suggestion: "Divida a cena 4 em duas cenas de 4 segundos.", applied: false, ignored: true, createdAt: "2026-06-08 16:02" },
  { id: "recommendation_4", workspaceId: "ws_1", videoProjectId: "video_2", type: "subtitle", severity: "high", message: "Legenda pequena para Shorts/Reels.", suggestion: "Use estilo bold ou popup e aumente o tempo minimo na tela.", applied: false, ignored: false, createdAt: "2026-06-08 16:10" },
  { id: "recommendation_5", workspaceId: "ws_1", videoProjectId: "video_2", type: "visual", severity: "critical", message: "Pouca variacao visual entre cenas.", suggestion: "Troque midias repetidas e aplique movimento organico.", applied: false, ignored: false, createdAt: "2026-06-08 16:11" }
];

export const retentionAnalyses: RetentionAnalysis[] = [
  { videoProjectId: "video_1", first3Seconds: 72, first10Seconds: 76, sceneChangeScore: 79, textDensityScore: 84, visualVariationScore: 71, ctaTimingScore: 80, recommendations: ["Melhore o gancho inicial", "Adicione variacao visual antes dos 10s", "Mantenha CTA apos a entrega principal"] },
  { videoProjectId: "video_2", first3Seconds: 55, first10Seconds: 62, sceneChangeScore: 58, textDensityScore: 70, visualVariationScore: 50, ctaTimingScore: 66, recommendations: ["Abra com promessa mais forte", "Encurte cenas longas", "Aumente cortes nos primeiros 10s"] }
];

export const hookAnalyses: HookAnalysis[] = [
  { videoProjectId: "video_1", strength: "forte", score: 74, improvedVersions: ["Voce esta perdendo retencao nos primeiros 3 segundos sem perceber.", "Antes de postar outro video, corrija este erro de abertura.", "O detalhe que faz as pessoas abandonarem seu video cedo.", "Se seu video nao prende no inicio, tente isso.", "A primeira frase decide se o publico fica ou vai embora."] },
  { videoProjectId: "video_2", strength: "medio", score: 58, improvedVersions: ["A queda de um imperio comecou por um detalhe ignorado.", "Roma nao caiu em um dia, mas este erro acelerou tudo.", "O momento em que um imperio comecou a perder o controle.", "A decisao que deixou Roma vulneravel.", "Antes da queda, havia um sinal claro."] }
];

export const scriptImprovements: ScriptImprovement[] = [
  { videoProjectId: "video_1", shorter: "Corte a introducao e comece direto com o erro principal.", emotional: "Mostre a frustracao de perder audiencia depois de horas editando.", curious: "Abra com uma pergunta e revele a resposta apenas na metade.", viral: "Transforme cada cena em uma promessa visual de 5 segundos.", documentary: "Contextualize o problema, mostre evidencias e feche com checklist." }
];

export const scenePacingItems: ScenePacingItem[] = videoScenes.map((scene) => ({
  sceneId: scene.id,
  orderIndex: scene.orderIndex,
  durationSeconds: scene.durationSeconds,
  textLength: scene.scriptText.length,
  mediaType: scene.mediaAssetId ? "asset" : "imagem IA",
  motionType: scene.motionType,
  risk: scene.durationSeconds > 7 ? "alto" : scene.scriptText.length > 130 ? "medio" : "baixo",
  suggestion: scene.durationSeconds > 7 ? "Encurtar ou dividir cena" : scene.motionType === "none" ? "Animar imagem" : "Ritmo adequado"
}));

export const thumbnailAnalyses: ThumbnailAnalysis[] = [
  { videoProjectId: "video_1", contrast: 68, clarity: 76, shortText: 82, emotion: 64, curiosity: 73, youtubeCompatibility: 70, suggestions: ["Aumentar contraste do texto", "Adicionar expressao visual mais forte", "Testar fundo com menos elementos"] }
];

export const subtitleReadabilityAnalyses: SubtitleReadabilityAnalysis[] = [
  { videoProjectId: "video_1", fontSize: 86, contrast: 90, timeOnScreen: 78, textAmount: 72, position: 88, suggestions: ["Reduza linhas longas em cenas densas", "Mantenha legenda longe da interface da plataforma"] }
];

export const platformOptimizations: PlatformOptimization[] = [
  { videoProjectId: "video_1", platform: "youtube_shorts", score: 79, checklist: [{ label: "Gancho rapido", done: true }, { label: "Cenas curtas", done: true }, { label: "Legenda grande", done: true }, { label: "Ritmo rapido", done: false }], suggestions: ["Aumente cortes nos primeiros 10 segundos"] },
  { videoProjectId: "video_1", platform: "youtube", score: 74, checklist: [{ label: "Titulo forte", done: true }, { label: "Thumbnail selecionada", done: false }, { label: "Descricao completa", done: true }, { label: "Retencao inicial", done: true }], suggestions: ["Melhore thumbnail antes de publicar no YouTube longo"] }
];

export const videoVersionComparisons: VideoVersionComparison[] = [
  { videoProjectId: "video_1", versionA: "Versao 1", versionB: "Versao 2", scoreA: 71, scoreB: 78, improvements: ["Gancho mais direto", "Legenda mais legivel", "Cena 4 encurtada"], differences: ["Versao 2 usa thumbnail com contraste maior", "Versao 2 aplica movimento organico em todas as cenas"] }
];

export const trendTopics: TrendTopic[] = [
  { id: "trend_topic_1", category: "Estoicismo", language: "pt-BR", title: "Disciplina silenciosa", description: "Temas de autocontrole e foco sem motivacao estao performando bem em shorts.", trendScore: 91, source: "mock_youtube", createdAt: "2026-06-09" },
  { id: "trend_topic_2", category: "Historias Biblicas", language: "pt-BR", title: "Personagens biblicos antes da virada", description: "Narrativas de coragem antes do milagre geram alta retencao inicial.", trendScore: 88, source: "mock_social", createdAt: "2026-06-09" },
  { id: "trend_topic_3", category: "Luxo", language: "pt-BR", title: "Dinheiro antigo vs novos ricos", description: "Comparativos de comportamento e estetica premium atraem audiencia comercial.", trendScore: 82, source: "mock_google_trends", createdAt: "2026-06-09" },
  { id: "trend_topic_4", category: "Historia", language: "pt-BR", title: "Erros que derrubaram imperios", description: "Conteudos historicos com gancho de erro e consequencia seguem fortes.", trendScore: 86, source: "internal", createdAt: "2026-06-09" }
];

export const ideaBankItems: IdeaBankItem[] = [
  { id: "idea_bank_1", workspaceId: "ws_1", channelId: "channel_1", title: "5 sinais de que um video vai flopar", description: "Checklist curto para criadores revisarem antes de publicar.", niche: "Curiosidades", status: "approved", score: 84, createdAt: "2026-06-09" },
  { id: "idea_bank_2", workspaceId: "ws_1", channelId: "channel_2", title: "A decisao que acelerou a queda de Roma", description: "Video longo com cortes derivados para Shorts.", niche: "Historia", status: "generating", score: 89, createdAt: "2026-06-09" },
  { id: "idea_bank_3", workspaceId: "ws_1", channelId: "channel_3", title: "O habito estoico que elimina ansiedade", description: "Reels de 60s com visual anime minimalista.", niche: "Estoicismo", status: "idea", score: 91, createdAt: "2026-06-09" },
  { id: "idea_bank_4", workspaceId: "ws_1", channelId: "channel_1", title: "A ilha que ninguem pode visitar", description: "Canal dark de curiosidades com thumbnail misteriosa.", niche: "Misterio", status: "produced", score: 78, createdAt: "2026-06-09" }
];

export const topicSuggestions: TopicSuggestion[] = [
  { id: "topic_suggestion_1", channelId: "channel_3", niche: "Estoicismo", language: "pt-BR", audience: "Homens jovens buscando disciplina", theme: "Disciplina sem motivacao", title: "Voce nao precisa de motivacao para vencer", hook: "O segredo dos estoicos era agir mesmo sem vontade.", thumbnailIdea: "Rosto serio em anime, texto: SEM DESCULPAS", potentialScore: 92 },
  { id: "topic_suggestion_2", channelId: "channel_2", niche: "Historia", language: "pt-BR", audience: "Curiosos por historia mundial", theme: "Queda de Roma", title: "Roma caiu por um erro que parece pequeno", hook: "Antes da queda, havia um sinal que todos ignoraram.", thumbnailIdea: "Imperador em sombra, texto: O ERRO", potentialScore: 87 },
  { id: "topic_suggestion_3", channelId: "channel_1", niche: "Curiosidades", language: "pt-BR", audience: "Publico de shorts dark", theme: "Cidade desaparecida", title: "A cidade que sumiu dos mapas oficiais", hook: "Existe uma cidade que desapareceu sem sair do lugar.", thumbnailIdea: "Mapa rasgado, texto: APAGADA", potentialScore: 85 }
];

export const contentGapRecommendations: ContentGapRecommendation[] = [
  { id: "gap_1", channelId: "channel_1", type: "missing_long", severity: "medium", message: "Canal depende demais de shorts.", recommendation: "Crie um video longo semanal compilando os melhores temas." },
  { id: "gap_2", channelId: "channel_2", type: "missing_shorts", severity: "high", message: "Poucos cortes derivados dos videos longos.", recommendation: "Transforme cada video historico em 5 shorts." },
  { id: "gap_3", channelId: "channel_3", type: "underexplored_niche", severity: "medium", message: "Pouca exploracao de anime filosofico.", recommendation: "Use o template Estoicismo com Anime por 10 dias." }
];

export const videoOpportunities: VideoOpportunity[] = [
  { id: "opportunity_1", workspaceId: "ws_1", channelId: "channel_1", videoProjectId: "video_1", type: "short_version", title: "Criar versao curta", reason: "Video tem gancho bom e pode virar Shorts/Reels.", score: 88 },
  { id: "opportunity_2", workspaceId: "ws_1", channelId: "channel_2", videoProjectId: "video_1", type: "series", title: "Transformar em serie", reason: "Tema historico permite episodios semanais.", score: 82 },
  { id: "opportunity_3", workspaceId: "ws_1", channelId: "channel_3", videoProjectId: "video_1", type: "continuation", title: "Criar continuacao", reason: "Retencao alta sugere interesse em parte 2.", score: 79 }
];

export const titleLabResults: TitleLabResult[] = Array.from({ length: 20 }, (_, index) => ({
  id: `title_lab_${index + 1}`,
  niche: index % 2 ? "Historia" : "Estoicismo",
  title: index % 2 ? `O erro historico que mudou tudo #${index + 1}` : `A regra estoica que poucos aplicam #${index + 1}`,
  hook: index % 2 ? "Antes da queda, o sinal ja estava claro." : "Voce perde energia tentando controlar o impossivel.",
  emotionalVersion: `Versao emocional ${index + 1}: uma decisao mudou uma vida inteira`,
  curiousVersion: `Versao curiosa ${index + 1}: o detalhe escondido que explica tudo`,
  viralVersion: `Versao viral ${index + 1}: nao ignore este sinal`,
  score: 70 + (index % 10) * 3
}));

export const thumbLabIdeas: ThumbLabIdea[] = [
  { id: "thumb_lab_1", title: "Roma em chamas", thumbnailText: "O ERRO", emotion: "choque", style: "preto e branco dramatico", score: 88 },
  { id: "thumb_lab_2", title: "Samurai estoico", thumbnailText: "SEM MEDO", emotion: "determinacao", style: "anime filosofico", score: 91 },
  { id: "thumb_lab_3", title: "Mapa apagado", thumbnailText: "SUMIU", emotion: "misterio", style: "canal dark", score: 84 },
  { id: "thumb_lab_4", title: "Luxo discreto", thumbnailText: "RICO?", emotion: "curiosidade", style: "luxo editorial", score: 79 }
];

export const calendarAiSuggestions: CalendarAiSuggestion[] = [
  { id: "calendar_ai_1", channelId: "channel_1", weekday: "Segunda", contentType: "short", title: "Short dark de curiosidade", templateId: "premium_template_1", priority: 90 },
  { id: "calendar_ai_2", channelId: "channel_2", weekday: "Terca", contentType: "video", title: "Video longo historico", templateId: "premium_template_4", priority: 84 },
  { id: "calendar_ai_3", channelId: "channel_3", weekday: "Quarta", contentType: "short", title: "Reels estoico com anime", templateId: "premium_template_3", priority: 92 },
  { id: "calendar_ai_4", channelId: "channel_1", weekday: "Quinta", contentType: "clip", title: "Corte de melhor retencao", templateId: "premium_template_7", priority: 77 },
  { id: "calendar_ai_5", channelId: "channel_2", weekday: "Sexta", contentType: "video", title: "Documentario curto", templateId: "premium_template_10", priority: 81 }
];

export const channelHealthScores: ChannelHealthScore[] = [
  { channelId: "channel_1", overallScore: 82, consistency: 88, frequency: 86, diversity: 70, quality: 78, templateUsage: 90, recommendations: ["Produza mais videos longos", "Transforme top shorts em series"] },
  { channelId: "channel_2", overallScore: 74, consistency: 72, frequency: 68, diversity: 82, quality: 84, templateUsage: 69, recommendations: ["Aumente shorts derivados", "Use templates documentais com mais frequencia"] },
  { channelId: "channel_3", overallScore: 79, consistency: 76, frequency: 74, diversity: 80, quality: 83, templateUsage: 88, recommendations: ["Explore mais anime filosofico", "Publique duas sequencias por semana"] }
];

export const trackedChannels: TrackedChannel[] = [
  { id: "tracked_channel_1", workspaceId: "ws_1", name: "Historia Oculta", niche: "Historia", platform: "YouTube", notes: "Concorrente forte em mini docs historicos.", createdAt: "2026-06-09" },
  { id: "tracked_channel_2", workspaceId: "ws_1", name: "Filosofia em Cortes", niche: "Estoicismo", platform: "YouTube Shorts", notes: "Alta frequencia de shorts motivacionais.", createdAt: "2026-06-09" },
  { id: "tracked_channel_3", workspaceId: "ws_1", name: "Dark Facts BR", niche: "Curiosidades", platform: "TikTok", notes: "Gancho forte e thumbnails simples.", createdAt: "2026-06-09" }
];

export const strategyRecommendations: StrategyRecommendation[] = [
  { id: "strategy_1", workspaceId: "ws_1", title: "Produza mais shorts", description: "O canal Historia em Minutos gera poucos cortes derivados.", severity: "high", module: "channels", createdAt: "2026-06-09" },
  { id: "strategy_2", workspaceId: "ws_1", title: "Use mais Estoicismo com Anime", description: "Template tem alto score e baixa complexidade operacional.", severity: "medium", module: "templates", createdAt: "2026-06-09" },
  { id: "strategy_3", workspaceId: "ws_1", title: "Revise consumo de creditos", description: "Imagens e voz concentram a maior parte do custo estimado.", severity: "medium", module: "credits", createdAt: "2026-06-09" },
  { id: "strategy_4", workspaceId: "ws_1", title: "Nicho Luxo esta subutilizado", description: "Poucas ideias aprovadas apesar de alto potencial comercial.", severity: "low", module: "ideas", createdAt: "2026-06-09" }
];

export const contentFactories: ContentFactory[] = [
  { id: "factory_1", workspaceId: "ws_1", name: "Canal Dark Diario", description: "Produz shorts dark diarios usando ideias de tendencias e banco interno.", channelId: "channel_1", templateId: "premium_template_1", status: "active", language: "pt-BR", defaultVoiceId: "mock_deep", visualStyle: "sombrio", defaultFormat: "shorts", defaultDuration: "60s", productionFrequency: "5 shorts por dia", qualityGateThreshold: 70, requireReview: true, resourcePriority: ["Biblioteca propria", "Pexels", "Pixabay", "IA"], createdAt: "2026-06-09", updatedAt: "2026-06-09" },
  { id: "factory_2", workspaceId: "ws_1", name: "Historia Semanal", description: "Gera videos longos historicos e cria derivados para shorts.", channelId: "channel_2", templateId: "premium_template_4", status: "active", language: "pt-BR", defaultVoiceId: "alloy", visualStyle: "historico", defaultFormat: "youtube_long", defaultDuration: "5m", productionFrequency: "1 video longo por semana", qualityGateThreshold: 76, requireReview: true, resourcePriority: ["Biblioteca propria", "Stock videos", "IA"], createdAt: "2026-06-09", updatedAt: "2026-06-09" },
  { id: "factory_3", workspaceId: "ws_1", name: "Estoicismo Diario", description: "Automacao de reels estoicos com anime filosofico.", channelId: "channel_3", templateId: "premium_template_3", status: "paused", language: "pt-BR", defaultVoiceId: "nova", visualStyle: "anime", defaultFormat: "reels", defaultDuration: "60s", productionFrequency: "2 reels por dia", qualityGateThreshold: 72, requireReview: false, resourcePriority: ["Biblioteca propria", "Pexels", "IA"], createdAt: "2026-06-09", updatedAt: "2026-06-09" }
];

export const productionRules: ProductionRule[] = [
  { id: "rule_1", factoryId: "factory_1", ruleType: "volume", value: "5 shorts por dia", createdAt: "2026-06-09" },
  { id: "rule_2", factoryId: "factory_1", ruleType: "thumbnail", value: "gerar thumbnail automatica", createdAt: "2026-06-09" },
  { id: "rule_3", factoryId: "factory_1", ruleType: "assets", value: "usar apenas assets da biblioteca quando creditos baixos", createdAt: "2026-06-09" },
  { id: "rule_4", factoryId: "factory_2", ruleType: "volume", value: "1 video longo por semana", createdAt: "2026-06-09" },
  { id: "rule_5", factoryId: "factory_2", ruleType: "quality_gate", value: "reter se score menor que 76", createdAt: "2026-06-09" },
  { id: "rule_6", factoryId: "factory_3", ruleType: "assets", value: "usar IA para imagens anime", createdAt: "2026-06-09" }
];

export const factorySchedules: FactorySchedule[] = [
  { id: "schedule_1", factoryId: "factory_1", frequency: "daily", runTime: "08:00", timezone: "America/Sao_Paulo", enabled: true, createdAt: "2026-06-09" },
  { id: "schedule_2", factoryId: "factory_2", frequency: "weekly", runTime: "10:00", timezone: "America/Sao_Paulo", enabled: true, createdAt: "2026-06-09" },
  { id: "schedule_3", factoryId: "factory_3", frequency: "daily", runTime: "07:30", timezone: "America/Sao_Paulo", enabled: false, createdAt: "2026-06-09" }
];

export const contentSeries: ContentSeries[] = [
  { id: "series_1", workspaceId: "ws_1", channelId: "channel_2", name: "100 Curiosidades do Imperio Romano", description: "Serie numerada de 100 videos sobre Roma antiga.", status: "active", createdAt: "2026-06-09" },
  { id: "series_2", workspaceId: "ws_1", channelId: "channel_3", name: "30 Dias de Estoicismo", description: "Sequencia diaria de licoes estoicas em reels.", status: "paused", createdAt: "2026-06-09" }
];

export const factoryQueueJobs: FactoryQueueJob[] = [
  { id: "factory_job_1", workspaceId: "ws_1", factoryId: "factory_1", title: "A cidade que sumiu dos mapas oficiais", status: "generating", currentStep: "Gerando cenas", progress: 48, estimatedTime: "14 min", creditsConsumed: 18, qualityScore: 0, createdAt: "2026-06-09 08:00" },
  { id: "factory_job_2", workspaceId: "ws_1", factoryId: "factory_1", title: "O arquivo escondido por decadas", status: "review", currentStep: "Quality gate", progress: 82, estimatedTime: "aguardando aprovacao", creditsConsumed: 22, qualityScore: 64, createdAt: "2026-06-09 08:20" },
  { id: "factory_job_3", workspaceId: "ws_1", factoryId: "factory_2", title: "A decisao que acelerou a queda de Roma", status: "completed", currentStep: "Concluido", progress: 100, estimatedTime: "0 min", creditsConsumed: 74, qualityScore: 82, createdAt: "2026-06-09 09:00" },
  { id: "factory_job_4", workspaceId: "ws_1", factoryId: "factory_3", title: "Voce nao precisa de motivacao para vencer", status: "failed", currentStep: "Gerando imagem", progress: 36, estimatedTime: "reprocessar", creditsConsumed: 9, qualityScore: 0, createdAt: "2026-06-09 09:30" }
];

export const reviewQueueItems: ReviewQueueItem[] = [
  { id: "review_1", workspaceId: "ws_1", factoryId: "factory_1", videoProjectId: "video_1", title: "O arquivo escondido por decadas", reason: "Quality Score abaixo do limite definido", qualityScore: 64, status: "pending", createdAt: "2026-06-09 08:50" },
  { id: "review_2", workspaceId: "ws_1", factoryId: "factory_2", title: "Roma caiu por este erro", reason: "Revisao obrigatoria para videos longos", qualityScore: 79, status: "pending", createdAt: "2026-06-09 09:20" }
];

export const factoryTemplates: FactoryTemplate[] = [
  { id: "factory_template_1", name: "Canal Dark Diario", description: "Shorts dark com tendencias e review por quality gate.", templateId: "premium_template_1", defaultRules: ["5 shorts por dia", "thumbnail automatica", "assets gratuitos primeiro"], defaultFrequency: "daily" },
  { id: "factory_template_2", name: "Shorts Religiosos", description: "Narrativas religiosas curtas com revisao leve.", templateId: "premium_template_13", defaultRules: ["3 shorts por dia", "voz emocional", "quality gate 72"], defaultFrequency: "daily" },
  { id: "factory_template_3", name: "Estoicismo Diario", description: "Reels estoicos com anime e custo controlado.", templateId: "premium_template_3", defaultRules: ["2 reels por dia", "IA para imagens", "auto thumbnail"], defaultFrequency: "daily" },
  { id: "factory_template_4", name: "Curiosidades Automaticas", description: "Lista top 10 e curiosidades com Topics Engine.", templateId: "premium_template_7", defaultRules: ["5 shorts por dia", "usar idea bank", "series"], defaultFrequency: "daily" },
  { id: "factory_template_5", name: "Historia Semanal", description: "Longos historicos com derivados em shorts.", templateId: "premium_template_4", defaultRules: ["1 longo por semana", "5 shorts derivados", "review obrigatorio"], defaultFrequency: "weekly" },
  { id: "factory_template_6", name: "Luxo Diario", description: "Videos aspiracionais e comerciais de luxo.", templateId: "premium_template_5", defaultRules: ["2 shorts por dia", "visual luxo", "thumbnail minimal"], defaultFrequency: "daily" }
];

export const factoryAlerts: FactoryAlert[] = [
  { id: "factory_alert_1", workspaceId: "ws_1", factoryId: "factory_1", type: "review_pending", title: "Revisao pendente", description: "1 conteudo aguardando aprovacao antes de render.", severity: "high", createdAt: "2026-06-09 09:00" },
  { id: "factory_alert_2", workspaceId: "ws_1", type: "low_credits", title: "Creditos baixos", description: "Resource manager priorizara biblioteca propria e bancos gratuitos.", severity: "medium", createdAt: "2026-06-09 09:10" },
  { id: "factory_alert_3", workspaceId: "ws_1", factoryId: "factory_3", type: "generation_failed", title: "Falha de geracao", description: "Job falhou ao gerar imagem. Regeneracao automatica disponivel.", severity: "critical", createdAt: "2026-06-09 09:35" }
];

export const launchChecklistItems: LaunchChecklistItem[] = [
  { id: "launch_1", label: "Ambiente configurado", status: "completed", owner: "Platform", observation: "Base Next.js, Supabase e rotas principais prontas.", href: "/app/admin-master/environment" },
  { id: "launch_2", label: "Banco configurado", status: "completed", owner: "Backend", observation: "Schema multi-tenant com RLS, indices e realtime preparado.", href: "/app/system-audit" },
  { id: "launch_3", label: "RLS validado", status: "in_progress", owner: "Security", observation: "Politicas criadas; falta teste automatizado por role.", href: "/app/admin-master/security" },
  { id: "launch_4", label: "Storage configurado", status: "in_progress", owner: "Media", observation: "Buckets mapeados; policies reais dependem do projeto Supabase.", href: "/app/admin-master/health" },
  { id: "launch_5", label: "Variaveis de ambiente", status: "error", owner: "DevOps", observation: "Algumas chaves externas ainda ausentes.", href: "/app/admin-master/environment" },
  { id: "launch_6", label: "Providers configurados", status: "in_progress", owner: "AI", observation: "OpenAI previsto; voz/assets/video ainda mockados.", href: "/app/admin-master/providers-health" },
  { id: "launch_7", label: "Dominio", status: "pending", owner: "Brand", observation: "APP_URL preparado; dominio final pendente.", href: "/app/admin-master/branding-check" },
  { id: "launch_8", label: "SSL", status: "pending", owner: "DevOps", observation: "Depende do provedor de deploy/dominio.", href: "/app/admin-master/branding-check" },
  { id: "launch_9", label: "Backups", status: "in_progress", owner: "Ops", observation: "Estrutura e painel criados; automacao agendada fica futura.", href: "/app/admin-master/backups" },
  { id: "launch_10", label: "Logs", status: "completed", owner: "Platform", observation: "Audit logs, security events e error logs preparados.", href: "/app/admin-master/errors" },
  { id: "launch_11", label: "Billing", status: "in_progress", owner: "Finance", observation: "Controle mockado; cobranca real nao habilitada.", href: "/app/billing" },
  { id: "launch_12", label: "Creditos", status: "completed", owner: "Finance", observation: "Carteiras e consumo mockados prontos para provider real.", href: "/app/admin-master/costs" },
  { id: "launch_13", label: "Admin master", status: "completed", owner: "Platform", observation: "Operacao, custos, factories e health disponiveis.", href: "/app/admin-master" },
  { id: "launch_14", label: "Termos", status: "completed", owner: "Legal", observation: "Pagina publica e aceite no onboarding.", href: "/terms" },
  { id: "launch_15", label: "Privacidade", status: "completed", owner: "Legal", observation: "Pagina publica e base LGPD criada.", href: "/privacy" }
];

export const environmentVariableStatuses: EnvironmentVariableStatus[] = [
  { key: "NEXT_PUBLIC_SUPABASE_URL", status: "configured", required: true, scope: "public", observation: "URL publica configurada." },
  { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", status: "configured", required: true, scope: "public", observation: "Anon key publica configurada." },
  { key: "SUPABASE_SERVICE_ROLE_KEY", status: "missing", required: true, scope: "server", observation: "Obrigatoria para jobs administrativos server-side." },
  { key: "OPENAI_API_KEY", status: "missing", required: true, scope: "server", observation: "Necessaria para providers reais de IA." },
  { key: "ELEVENLABS_API_KEY", status: "missing", required: false, scope: "server", observation: "Provider de voz opcional." },
  { key: "PEXELS_API_KEY", status: "missing", required: false, scope: "server", observation: "Assets externos opcionais." },
  { key: "PIXABAY_API_KEY", status: "missing", required: false, scope: "server", observation: "Assets externos opcionais." },
  { key: "UNSPLASH_ACCESS_KEY", status: "missing", required: false, scope: "server", observation: "Assets externos opcionais." },
  { key: "STORAGE_BUCKET", status: "configured", required: true, scope: "server", observation: "Bucket padrao mapeado." },
  { key: "APP_URL", status: "invalid", required: true, scope: "server", observation: "Precisa apontar para dominio final antes do lancamento." }
];

export const providerHealthChecks: ProviderHealthCheck[] = [
  { id: "provider_health_1", provider: "OpenAI", category: "ai", status: "missing_key", lastCheckedAt: "2026-06-09 10:00", message: "Chave ausente no ambiente." },
  { id: "provider_health_2", provider: "ElevenLabs", category: "voice", status: "missing_key", lastCheckedAt: "2026-06-09 10:00", message: "Provider opcional nao configurado." },
  { id: "provider_health_3", provider: "Pexels", category: "assets", status: "missing_key", lastCheckedAt: "2026-06-09 10:00", message: "Fallback para biblioteca propria ativo." },
  { id: "provider_health_4", provider: "Pixabay", category: "assets", status: "missing_key", lastCheckedAt: "2026-06-09 10:00", message: "Fallback para biblioteca propria ativo." },
  { id: "provider_health_5", provider: "Unsplash", category: "assets", status: "missing_key", lastCheckedAt: "2026-06-09 10:00", message: "Fallback para biblioteca propria ativo." },
  { id: "provider_health_6", provider: "Supabase", category: "database", status: "online", latencyMs: 42, lastCheckedAt: "2026-06-09 10:00", message: "Cliente configurado para ambiente." },
  { id: "provider_health_7", provider: "Storage", category: "storage", status: "online", latencyMs: 55, lastCheckedAt: "2026-06-09 10:00", message: "Buckets esperados mapeados." },
  { id: "provider_health_8", provider: "Runway/Kling/Pika/Veo", category: "video", status: "offline", lastCheckedAt: "2026-06-09 10:00", message: "Providers de video seguem mockados." }
];

export const storageBucketChecks: StorageBucketCheck[] = [
  { id: "bucket_1", bucket: "videos", exists: true, policyStatus: "warning", uploadAllowed: true, readAuthorized: true, maxSizeMb: 512 },
  { id: "bucket_2", bucket: "thumbnails", exists: true, policyStatus: "healthy", uploadAllowed: true, readAuthorized: true, maxSizeMb: 25 },
  { id: "bucket_3", bucket: "audio", exists: true, policyStatus: "warning", uploadAllowed: true, readAuthorized: true, maxSizeMb: 100 },
  { id: "bucket_4", bucket: "images", exists: true, policyStatus: "healthy", uploadAllowed: true, readAuthorized: true, maxSizeMb: 50 },
  { id: "bucket_5", bucket: "assets", exists: true, policyStatus: "healthy", uploadAllowed: true, readAuthorized: true, maxSizeMb: 250 },
  { id: "bucket_6", bucket: "exports", exists: false, policyStatus: "critical", uploadAllowed: false, readAuthorized: false, maxSizeMb: 1024 },
  { id: "bucket_7", bucket: "temp", exists: true, policyStatus: "warning", uploadAllowed: true, readAuthorized: false, maxSizeMb: 250 }
];

export const backupJobs: BackupJob[] = [
  { id: "backup_1", workspaceId: "ws_1", type: "database_export", status: "completed", fileUrl: "/backups/ws_1_database_2026-06-09.zip", startedAt: "2026-06-09 04:00", completedAt: "2026-06-09 04:02" },
  { id: "backup_2", workspaceId: "ws_1", type: "assets_export", status: "running", startedAt: "2026-06-09 10:00" },
  { id: "backup_3", workspaceId: "ws_2", type: "full_backup", status: "failed", startedAt: "2026-06-08 04:00", completedAt: "2026-06-08 04:01", errorMessage: "Storage exports bucket ausente." }
];

export const dataRetentionPolicies: DataRetentionPolicy[] = [
  { id: "retention_1", workspaceId: "ws_1", tempFilesDays: 7, failedJobsDays: 30, logsDays: 180, deletedAssetsDays: 30, createdAt: "2026-06-09" },
  { id: "retention_2", workspaceId: "ws_2", tempFilesDays: 3, failedJobsDays: 15, logsDays: 90, deletedAssetsDays: 15, createdAt: "2026-06-09" }
];

export const securityEvents: SecurityEvent[] = [
  { id: "security_1", workspaceId: "ws_1", userId: "user_1", eventType: "login", severity: "low", ipAddress: "189.0.0.10", userAgent: "Chrome", metadata: { provider: "password" }, createdAt: "2026-06-09 09:04" },
  { id: "security_2", workspaceId: "ws_1", userId: "user_3", eventType: "permission_denied", severity: "medium", ipAddress: "189.0.0.11", userAgent: "Edge", metadata: { permission: "ai.manage" }, createdAt: "2026-06-09 09:31" },
  { id: "security_3", workspaceId: "ws_1", eventType: "provider_error", severity: "high", ipAddress: "server", userAgent: "worker", metadata: { provider: "OpenAI", reason: "missing_key" }, createdAt: "2026-06-09 09:45" }
];

export const rateLimitRules: RateLimitRule[] = [
  { id: "rate_1", workspaceId: "ws_1", feature: "script_generation", limitCount: 120, windowSeconds: 3600, createdAt: "2026-06-09" },
  { id: "rate_2", workspaceId: "ws_1", feature: "image_generation", limitCount: 60, windowSeconds: 3600, createdAt: "2026-06-09" },
  { id: "rate_3", workspaceId: "ws_1", feature: "voice_generation", limitCount: 80, windowSeconds: 3600, createdAt: "2026-06-09" },
  { id: "rate_4", workspaceId: "ws_1", feature: "render", limitCount: 25, windowSeconds: 3600, createdAt: "2026-06-09" },
  { id: "rate_5", workspaceId: "ws_1", feature: "ai_video", limitCount: 10, windowSeconds: 3600, createdAt: "2026-06-09" },
  { id: "rate_6", workspaceId: "ws_1", feature: "viral_clips", limitCount: 20, windowSeconds: 3600, createdAt: "2026-06-09" },
  { id: "rate_7", workspaceId: "ws_1", feature: "export", limitCount: 40, windowSeconds: 3600, createdAt: "2026-06-09" }
];

export const errorLogs: ErrorLog[] = [
  { id: "error_1", workspaceId: "ws_1", userId: "user_1", module: "ai_provider", message: "OPENAI_API_KEY ausente", severity: "high", metadata: { provider: "OpenAI" }, resolved: false, createdAt: "2026-06-09 09:44" },
  { id: "error_2", workspaceId: "ws_1", module: "storage", message: "Bucket exports nao encontrado", severity: "critical", metadata: { bucket: "exports" }, resolved: false, createdAt: "2026-06-09 09:52" },
  { id: "error_3", workspaceId: "ws_2", module: "render", message: "Render mockado excedeu timeout", severity: "medium", metadata: { jobId: "render_2" }, resolved: true, createdAt: "2026-06-08 21:10" }
];

export const systemHealthChecks: SystemHealthCheck[] = [
  { id: "health_1", name: "Banco", status: "healthy", latencyMs: 42, message: "Schema carregado e queries mockadas estaveis." },
  { id: "health_2", name: "Auth", status: "healthy", latencyMs: 38, message: "Fluxos de login/confirmacao preparados." },
  { id: "health_3", name: "Storage", status: "warning", latencyMs: 55, message: "Bucket exports pendente." },
  { id: "health_4", name: "Providers", status: "warning", message: "Chaves reais ausentes." },
  { id: "health_5", name: "Filas", status: "healthy", latencyMs: 31, message: "Jobs mockados monitorados." },
  { id: "health_6", name: "Render engine", status: "critical", latencyMs: 0, message: "FFmpeg nao encontrado neste ambiente. Configure FFMPEG_PATH para habilitar MP4 real." },
  { id: "health_7", name: "Uso de disco", status: "healthy", message: "Sem alerta de armazenamento local." },
  { id: "health_8", name: "Erros recentes", status: "critical", message: "2 erros abertos exigem correcao antes do lancamento." }
];

export const userLegalAcceptances: UserLegalAcceptance[] = [
  { id: "legal_1", userId: "user_1", termsVersion: "2026-06-09", privacyVersion: "2026-06-09", acceptedAt: "2026-06-09 09:00" }
];

export const dataRequests: DataRequest[] = [
  { id: "data_request_1", workspaceId: "ws_1", userId: "user_1", type: "workspace_export", status: "ready", createdAt: "2026-06-09 08:00" },
  { id: "data_request_2", workspaceId: "ws_1", userId: "user_1", type: "delete_request", status: "requested", createdAt: "2026-06-09 09:40" }
];

export const smokeTestSteps: SmokeTestStep[] = [
  { id: "smoke_1", label: "Criar projeto", status: "completed", durationMs: 210 },
  { id: "smoke_2", label: "Criar canal", status: "completed", durationMs: 190 },
  { id: "smoke_3", label: "Gerar roteiro", status: "completed", durationMs: 840 },
  { id: "smoke_4", label: "Gerar voz", status: "in_progress", durationMs: 1200 },
  { id: "smoke_5", label: "Gerar imagem", status: "error", durationMs: 0, error: "OPENAI_API_KEY ausente" },
  { id: "smoke_6", label: "Criar video", status: "pending", durationMs: 0 },
  { id: "smoke_7", label: "Renderizar", status: "pending", durationMs: 0 },
  { id: "smoke_8", label: "Exportar pacote", status: "pending", durationMs: 0 }
];

export const demoModeSettings: DemoModeSetting[] = [
  { workspaceId: "ws_1", enabled: true, creditsPolicy: "enabled", exportPolicy: "requires_confirmation", providerPolicy: "requires_confirmation" },
  { workspaceId: "ws_2", enabled: false, creditsPolicy: "disabled", exportPolicy: "disabled", providerPolicy: "disabled" }
];

const smokeChannels = [
  {
    channel: "Historias Biblicas" as const,
    titles: [
      "A decisao silenciosa de Jose no Egito",
      "O detalhe esquecido na coragem de Ester",
      "Davi antes do gigante",
      "A noite em que Daniel nao negociou sua fe",
      "O erro de Saul que mudou tudo",
      "A paciencia de Jo que poucos entendem",
      "Moises diante do impossivel",
      "O contexto historico do exilio babilonico",
      "Como Neemias reconstruiu uma cidade quebrada",
      "A jornada de Paulo antes de Roma"
    ]
  },
  {
    channel: "Estoicismo com Anime" as const,
    titles: [
      "Voce nao precisa de motivacao para agir",
      "O habito estoico que corta ansiedade",
      "Pare de discutir com o que voce nao controla",
      "A disciplina silenciosa vence no fim",
      "Como Marco Aurelio lidaria com rejeicao",
      "A regra dos 10 segundos para recuperar foco",
      "Quando perder tambem e treinamento",
      "A filosofia por tras de um guerreiro calmo",
      "Como transformar dor em direcao",
      "O metodo estoico para dias caoticos"
    ]
  },
  {
    channel: "Curiosidades Historicas" as const,
    titles: [
      "A cidade que sumiu dos mapas oficiais",
      "O erro pequeno que derrubou um imperio",
      "O banquete que virou crise politica",
      "A carta perdida que mudou uma guerra",
      "A invencao que ninguem levou a serio",
      "O navio que desapareceu sem explicacao",
      "A ponte impossivel da Roma antiga",
      "Por que alguns imperios ruiram por logistica",
      "A batalha vencida antes do primeiro ataque",
      "O segredo comercial das rotas antigas"
    ]
  }
];

export const smokeTestVideoResults: SmokeTestVideoResult[] = smokeChannels.flatMap((group, groupIndex) =>
  group.titles.map((title, index) => {
    const horizontal = index >= 7;
    const failed = (groupIndex === 0 && index === 5) || (groupIndex === 2 && index === 1);
    const needsReview = index === 3 || index === 8;
    const blocked = groupIndex === 1 && index === 6;
    const qualityScore = failed ? 41 : needsReview ? 66 : 74 + ((index + groupIndex) % 18);
    const status = failed ? "failed" : blocked ? "blocked" : needsReview ? "rendered" : "ready_manual_publish";

    return {
      id: `smoke_video_${groupIndex + 1}_${index + 1}`,
      channel: group.channel,
      title,
      format: horizontal ? "youtube_horizontal" : index % 2 ? "reel_vertical" : "short_vertical",
      aspectRatio: horizontal ? "16:9" : "9:16",
      durationSeconds: horizontal ? 180 + (index - 7) * 45 : 30 + (index % 4) * 10,
      status,
      executionMode: failed || blocked ? "mocked" : "hybrid",
      generationTimeSeconds: failed ? 0 : horizontal ? 290 + index * 18 : 78 + index * 9,
      creditsConsumed: failed ? 12 : horizontal ? 82 + index * 4 : 24 + index * 3,
      errorsFound: failed
        ? ["Provider real ausente; render ficou apenas mockado", "Nao houve MP4 real validavel"]
        : blocked
          ? ["Bloqueio de credito insuficiente simulado corretamente"]
          : needsReview
            ? ["Quality gate enviou para revisao humana"]
            : [],
      qualityScore,
      thumbnailScore: failed ? 38 : Math.min(94, qualityScore + 4),
      retentionScore: failed ? 44 : Math.min(92, qualityScore + (horizontal ? -2 : 5)),
      subtitleScore: failed ? 52 : Math.min(95, qualityScore + 2),
      qualityDecision: failed ? "rejected" : qualityScore >= 70 ? "approved" : "needs_review",
      renderUrl: failed ? undefined : `/renders/${group.channel.toLowerCase().replaceAll(" ", "-")}-${index + 1}.mp4`,
      exportPackageUrl: failed || blocked ? undefined : `/exports/${group.channel.toLowerCase().replaceAll(" ", "-")}-${index + 1}.zip`
    };
  })
);

export const smokeTestIssues: SmokeTestIssue[] = [
  { id: "smoke_issue_1", videoId: "smoke_video_1_6", module: "Render", severity: "critical", title: "Render real nao validado", description: "O fluxo chega ao render mockado, mas nao existe MP4 real gerado por engine de producao.", recommendation: "Conectar render engine real ou marcar render como simulacao em toda UI." },
  { id: "smoke_issue_2", videoId: "smoke_video_3_2", module: "Providers", severity: "critical", title: "Chaves reais ausentes", description: "Geracao de imagem/voz depende de provider real, mas ambiente ainda esta sem keys.", recommendation: "Configurar OpenAI/voz/assets no servidor e bloquear chamada real quando key estiver ausente." },
  { id: "smoke_issue_3", module: "Creditos", severity: "high", title: "Consumo ainda estimado", description: "Creditos sao debitados em mocks e nao reconciliados com custo real de provider.", recommendation: "Persistir media_usage_logs por etapa e comparar provider_cost com creditos cobrados." },
  { id: "smoke_issue_4", module: "Export Center", severity: "high", title: "ZIP exportado e simulado", description: "Pacote exibe URL mockada, sem verificacao de arquivo ZIP real.", recommendation: "Implementar geracao fisica de pacote e checar download antes de marcar pronto." },
  { id: "smoke_issue_5", module: "Editor", severity: "medium", title: "Preview pesado para videos longos", description: "Fluxo horizontal de 3 a 5 minutos tende a concentrar muitas cenas e pode ficar lento.", recommendation: "Criar loading states e paginacao/virtualizacao de cenas no editor." },
  { id: "smoke_issue_6", module: "UX", severity: "medium", title: "Estados mockados precisam de aviso", description: "Algumas telas parecem reais mesmo quando o resultado e simulado.", recommendation: "Adicionar badge persistente de modo demo/mock em jobs, renders e exports." },
  { id: "smoke_issue_7", module: "Thumbnail", severity: "low", title: "Texto de thumbnail inconsistente", description: "Alguns temas longos geram thumbnails com texto grande demais.", recommendation: "Aplicar regra de 3 a 5 palavras por thumbnail e pre-check visual." }
];

export const smokeModuleValidations: SmokeModuleValidation[] = [
  { module: "Magic Mode", status: "partial", observation: "Fluxo principal existe, mas geracao real depende de providers." },
  { module: "Templates", status: "approved", observation: "Templates suportam os 3 canais e formatos do teste." },
  { module: "Canais", status: "approved", observation: "Estrutura de canais atende segmentacao." },
  { module: "Biblioteca de assets", status: "partial", observation: "Assets mockados funcionam; storage real ainda precisa validacao." },
  { module: "Voz", status: "mocked", observation: "Narração segue mock/provider placeholder." },
  { module: "Imagens", status: "mocked", observation: "Geração/busca externa ainda depende de keys." },
  { module: "Editor", status: "partial", observation: "Editor abre, mas preview/render real de longa duracao precisa teste visual." },
  { module: "Legendas", status: "approved", observation: "Scores e estrutura de legenda existem." },
  { module: "Thumbnail", status: "partial", observation: "Thumbnail AI existe, mas precisa validação visual real." },
  { module: "Render", status: "failed", observation: "Render de producao real nao comprovado." },
  { module: "Export Center", status: "partial", observation: "Pacotes e manifests existem, ZIP real nao comprovado." },
  { module: "Creditos", status: "partial", observation: "Consumo estimado existe, reconciliacao real pendente." },
  { module: "Logs", status: "approved", observation: "Audit/error/security logs preparados." },
  { module: "Filas", status: "partial", observation: "Filas mockadas existem, worker real pendente." },
  { module: "Quality Score", status: "approved", observation: "Scores por video e recomendações funcionam em modo interno." },
  { module: "Onboarding/Quick Start", status: "approved", observation: "Fluxo inicial existe com aceite legal." }
];

export const magicTemplates: MagicTemplate[] = [
  {
    id: "magic_template_1",
    workspaceId: "ws_1",
    name: "Canal Dark de Curiosidades",
    description: "Narrativa misteriosa, cortes rapidos e imagens cinematicas para curiosidades.",
    narrativeType: "canal_dark",
    format: "shorts",
    durationTarget: "60s",
    visualStyle: "sombrio",
    voicePreset: "mock_deep",
    advancedSettings: { sceneCount: 8, narrationTone: "grave e intrigante", useOrganicMotion: true, autoThumbnail: true },
    status: "active",
    createdAt: "2026-06-07"
  },
  {
    id: "magic_template_2",
    workspaceId: "ws_1",
    name: "Historias Biblicas",
    description: "Roteiros espirituais com tom documental, visual historico e ritmo contemplativo.",
    narrativeType: "historia_religiosa",
    format: "youtube_long",
    durationTarget: "5m",
    visualStyle: "religioso",
    voicePreset: "alloy",
    advancedSettings: { sceneCount: 14, narrationTone: "calmo e reverente", useZoom: true, autoMusic: true },
    status: "active",
    createdAt: "2026-06-07"
  },
  {
    id: "magic_template_3",
    workspaceId: "ws_1",
    name: "Motivacional Estoico",
    description: "Video curto com gancho forte, reflexao e CTA para salvar.",
    narrativeType: "motivacional",
    format: "reels",
    durationTarget: "90s",
    visualStyle: "minimalista",
    voicePreset: "nova",
    advancedSettings: { sceneCount: 9, narrationTone: "firme e inspirador", cta: "Salve para rever quando precisar." },
    status: "active",
    createdAt: "2026-06-07"
  },
  {
    id: "magic_template_4",
    workspaceId: "ws_1",
    name: "Biografias",
    description: "Linha narrativa cronologica para contar trajetorias de pessoas e marcas.",
    narrativeType: "biografia",
    format: "horizontal",
    durationTarget: "3m",
    visualStyle: "documentario",
    voicePreset: "alloy",
    advancedSettings: { sceneCount: 12, narrationTone: "editorial e humano" },
    status: "active",
    createdAt: "2026-06-07"
  },
  {
    id: "magic_template_5",
    workspaceId: "ws_1",
    name: "Crimes e Misterios",
    description: "Estrutura investigativa com suspense progressivo e cenas escuras.",
    narrativeType: "misterio",
    format: "youtube_long",
    durationTarget: "8m",
    visualStyle: "sombrio",
    voicePreset: "mock_deep",
    advancedSettings: { sceneCount: 18, narrationTone: "suspense controlado", forbiddenWords: "acusacoes sem fonte" },
    status: "active",
    createdAt: "2026-06-07"
  },
  {
    id: "magic_template_6",
    workspaceId: "ws_1",
    name: "Top 10 Curiosidades",
    description: "Lista com ritmo alto, cenas numeradas e thumbnail chamativa.",
    narrativeType: "top_10",
    format: "tiktok",
    durationTarget: "60s",
    visualStyle: "futurista",
    voicePreset: "nova",
    advancedSettings: { sceneCount: 10, autoThumbnail: true, useOrganicMotion: true },
    status: "active",
    createdAt: "2026-06-07"
  },
  {
    id: "magic_template_7",
    workspaceId: "ws_1",
    name: "Historias de Luxo",
    description: "Visual premium, contraste alto e narrativa aspiracional.",
    narrativeType: "historia_real",
    format: "reels",
    durationTarget: "90s",
    visualStyle: "luxo",
    voicePreset: "alloy",
    advancedSettings: { sceneCount: 9, narrationTone: "sofisticado e curioso" },
    status: "active",
    createdAt: "2026-06-07"
  },
  {
    id: "magic_template_8",
    workspaceId: "ws_1",
    name: "Comparativo de Marcas",
    description: "Comparacao estruturada com criterios, pontos fortes e veredito.",
    narrativeType: "comparativo",
    format: "horizontal",
    durationTarget: "3m",
    visualStyle: "realista",
    voicePreset: "alloy",
    advancedSettings: { sceneCount: 8, narrationTone: "analitico e direto" },
    status: "active",
    createdAt: "2026-06-07"
  },
  {
    id: "magic_template_9",
    workspaceId: "ws_1",
    name: "Noticias Narradas",
    description: "Resumo objetivo com contexto, impacto e fechamento.",
    narrativeType: "noticias",
    format: "horizontal",
    durationTarget: "3m",
    visualStyle: "documentario",
    voicePreset: "alloy",
    advancedSettings: { sceneCount: 7, narrationTone: "neutro e jornalistico" },
    status: "active",
    createdAt: "2026-06-07"
  },
  {
    id: "magic_template_10",
    workspaceId: "ws_1",
    name: "Anime Filosofico",
    description: "Reflexoes curtas com estetica anime, ritmo emocional e final memoravel.",
    narrativeType: "educacional",
    format: "shorts",
    durationTarget: "60s",
    visualStyle: "anime",
    voicePreset: "nova",
    advancedSettings: { sceneCount: 8, narrationTone: "introspectivo", cta: "Comente sua leitura dessa ideia." },
    status: "active",
    createdAt: "2026-06-07"
  }
];

export const magicVideoJobs: MagicVideoJob[] = [
  {
    id: "magic_job_1",
    workspaceId: "ws_1",
    projectId: "project_1",
    userId: "user_1",
    theme: "Como organizar uma rotina de conteudo em 30 minutos",
    format: "reels",
    aspectRatio: "9:16",
    durationTarget: 60,
    narrativeType: "educacional",
    voiceId: "alloy",
    visualStyle: "cinematografico",
    visualSource: "mixed",
    subtitleEnabled: true,
    musicEnabled: true,
    autoThumbnail: true,
    advancedSettings: {
      scriptInstructions: "Comecar com uma dor operacional clara.",
      imageInstructions: "Usar cenas de escritorio premium e timeline visual.",
      forbiddenWords: "",
      targetAudience: "Criadores e equipes de marketing",
      language: "pt-BR",
      narrationTone: "direto e confiante",
      cta: "Abra no editor e adapte para seu canal.",
      sceneCount: 6,
      useZoom: true,
      useOrganicMotion: true,
      autoThumbnail: true,
      autoMusic: true,
      autoSubtitles: true
    },
    status: "ready_for_editor",
    progress: 100,
    currentStep: "Pronto para editar",
    videoProjectId: "video_1",
    costCredits: 7.8,
    createdAt: "2026-06-07 10:40",
    updatedAt: "2026-06-07 10:42"
  },
  {
    id: "magic_job_2",
    workspaceId: "ws_1",
    projectId: "project_2",
    userId: "user_1",
    theme: "3 erros que deixam um video com cara amadora",
    format: "shorts",
    aspectRatio: "9:16",
    durationTarget: 30,
    narrativeType: "top_5",
    voiceId: "nova",
    visualStyle: "luxo",
    visualSource: "ai_images",
    subtitleEnabled: true,
    musicEnabled: true,
    autoThumbnail: true,
    advancedSettings: {
      scriptInstructions: "",
      imageInstructions: "",
      forbiddenWords: "",
      targetAudience: "criadores iniciantes",
      language: "pt-BR",
      narrationTone: "energetico",
      cta: "Salve para revisar antes de publicar.",
      sceneCount: 5,
      useZoom: true,
      useOrganicMotion: true,
      autoThumbnail: true,
      autoMusic: true,
      autoSubtitles: true
    },
    status: "failed",
    progress: 46,
    currentStep: "Gerando imagens",
    errorMessage: "Provider real nao configurado. Fluxo mock disponivel.",
    costCredits: 2.1,
    createdAt: "2026-06-07 09:10",
    updatedAt: "2026-06-07 09:11"
  }
];

export const viralClipJobs: ViralClipJob[] = [
  {
    id: "viral_job_1",
    workspaceId: "ws_1",
    projectId: "project_1",
    userId: "user_1",
    sourceUrl: "https://www.youtube.com/watch?v=video-flow-demo",
    sourceType: "youtube",
    outputFormat: "shorts",
    aspectRatio: "9:16",
    clipDurationMode: "30s",
    clipDurationSeconds: 30,
    clipsQuantity: 5,
    subtitleStyle: "tiktok",
    removeSilence: true,
    reframeVertical: true,
    reframeMode: "blurred_background",
    rightsConfirmed: true,
    status: "completed",
    progress: 100,
    currentStep: "Cortes renderizados",
    estimatedCost: 11.6,
    finalCost: 10.9,
    createdAt: "2026-06-07 11:20",
    updatedAt: "2026-06-07 11:24"
  },
  {
    id: "viral_job_2",
    workspaceId: "ws_1",
    projectId: "project_2",
    userId: "user_1",
    sourceUrl: "https://youtu.be/video-flow-review",
    sourceType: "youtube",
    outputFormat: "reels",
    aspectRatio: "9:16",
    clipDurationMode: "auto",
    clipsQuantity: 3,
    subtitleStyle: "popup",
    removeSilence: false,
    reframeVertical: true,
    reframeMode: "center_crop",
    rightsConfirmed: true,
    status: "analyzing_moments",
    progress: 64,
    currentStep: "Analisando melhores momentos",
    estimatedCost: 8.4,
    createdAt: "2026-06-07 10:50",
    updatedAt: "2026-06-07 10:52"
  }
];

export const sourceVideos: SourceVideo[] = [
  {
    id: "source_video_1",
    workspaceId: "ws_1",
    projectId: "project_1",
    sourceUrl: "https://www.youtube.com/watch?v=video-flow-demo",
    sourceType: "youtube",
    title: "Aula longa sobre rotina de conteudo",
    durationSeconds: 1840,
    thumbnailUrl: "/media/mock-thumbnail-1.jpg",
    localVideoUrl: "/media/mock-source-video.mp4",
    localAudioUrl: "/media/mock-narration.mp3",
    transcriptId: "transcript_1",
    status: "ready",
    createdAt: "2026-06-07 11:20"
  }
];

export const videoTranscripts: VideoTranscript[] = [
  {
    id: "transcript_1",
    workspaceId: "ws_1",
    sourceVideoId: "source_video_1",
    provider: "mock",
    language: "pt-BR",
    fullText: "O erro mais comum e tentar publicar todos os dias sem um sistema. Quando voce cria um fluxo, a equipe para de depender de inspiracao e passa a operar com clareza. O melhor corte comeca quando existe uma promessa simples e visual.",
    segments: [
      { start: 12, end: 20, text: "O erro mais comum e tentar publicar todos os dias sem um sistema." },
      { start: 42, end: 55, text: "Quando voce cria um fluxo, a equipe para de depender de inspiracao." },
      { start: 78, end: 96, text: "O melhor corte comeca quando existe uma promessa simples e visual." },
      { start: 121, end: 146, text: "Se a primeira frase nao segura, o resto do video vira detalhe invisivel." },
      { start: 188, end: 218, text: "Transforme uma explicacao longa em uma promessa, um exemplo e uma acao." }
    ],
    durationSeconds: 1840,
    status: "completed",
    createdAt: "2026-06-07 11:21"
  }
];

export const viralMoments: ViralMoment[] = [
  {
    id: "viral_moment_1",
    workspaceId: "ws_1",
    viralClipJobId: "viral_job_1",
    sourceVideoId: "source_video_1",
    startTime: 12,
    endTime: 42,
    title: "O erro de publicar sem sistema",
    hook: "Voce nao precisa postar mais. Precisa postar com sistema.",
    reason: "Dor clara, promessa direta e aplicacao imediata para criadores.",
    viralScore: 91,
    retentionScore: 86,
    clarityScore: 94,
    transcriptExcerpt: "O erro mais comum e tentar publicar todos os dias sem um sistema.",
    status: "rendered",
    createdAt: "2026-06-07 11:22"
  },
  {
    id: "viral_moment_2",
    workspaceId: "ws_1",
    viralClipJobId: "viral_job_1",
    sourceVideoId: "source_video_1",
    startTime: 78,
    endTime: 108,
    title: "A promessa que segura o corte",
    hook: "O melhor corte nasce de uma promessa simples.",
    reason: "Ensinamento curto, facil de legendar e com potencial de salvamento.",
    viralScore: 87,
    retentionScore: 82,
    clarityScore: 90,
    transcriptExcerpt: "O melhor corte comeca quando existe uma promessa simples e visual.",
    status: "approved",
    createdAt: "2026-06-07 11:22"
  },
  {
    id: "viral_moment_3",
    workspaceId: "ws_1",
    viralClipJobId: "viral_job_1",
    sourceVideoId: "source_video_1",
    startTime: 121,
    endTime: 151,
    title: "A primeira frase decide tudo",
    hook: "Se a primeira frase nao segura, o resto some.",
    reason: "Frase forte, contraste e alta clareza para Shorts/Reels.",
    viralScore: 89,
    retentionScore: 88,
    clarityScore: 87,
    transcriptExcerpt: "Se a primeira frase nao segura, o resto do video vira detalhe invisivel.",
    status: "suggested",
    createdAt: "2026-06-07 11:23"
  }
];

export const viralClips: ViralClip[] = [
  {
    id: "viral_clip_1",
    workspaceId: "ws_1",
    viralClipJobId: "viral_job_1",
    sourceVideoId: "source_video_1",
    viralMomentId: "viral_moment_1",
    title: "O erro de publicar sem sistema",
    startTime: 12,
    endTime: 42,
    durationSeconds: 30,
    aspectRatio: "9:16",
    subtitleStyle: "tiktok",
    reframeMode: "blurred_background",
    renderUrl: "/media/mock-render.mp4",
    thumbnailUrl: "/media/mock-thumbnail-1.jpg",
    status: "completed",
    createdAt: "2026-06-07 11:24"
  },
  {
    id: "viral_clip_2",
    workspaceId: "ws_1",
    viralClipJobId: "viral_job_1",
    sourceVideoId: "source_video_1",
    viralMomentId: "viral_moment_2",
    title: "A promessa que segura o corte",
    startTime: 78,
    endTime: 108,
    durationSeconds: 30,
    aspectRatio: "9:16",
    subtitleStyle: "popup",
    reframeMode: "center_crop",
    renderUrl: "/media/mock-render.mp4",
    thumbnailUrl: "/media/mock-thumbnail-2.jpg",
    status: "completed",
    createdAt: "2026-06-07 11:24"
  }
];

export const channels: Channel[] = [
  {
    id: "channel_1",
    workspaceId: "ws_1",
    name: "Curiosidades Sem Filtro",
    description: "Shorts diarios com fatos surpreendentes, storytelling rapido e visual dark.",
    niche: "Curiosidades",
    language: "pt-BR",
    country: "Brasil",
    logoUrl: "/media/mock-thumbnail-1.jpg",
    bannerUrl: "/media/mock-thumbnail-2.jpg",
    channelType: "curiosidades",
    visualStyle: "sombrio",
    defaultVoiceId: "mock_deep",
    defaultTemplateId: "channel_template_1",
    defaultVideoFormat: "short",
    status: "ativo",
    isFavorite: true,
    createdAt: "2026-06-07",
    updatedAt: "2026-06-07"
  },
  {
    id: "channel_2",
    workspaceId: "ws_1",
    name: "Historia em Minutos",
    description: "Videos historicos narrados com visual documental e cortes para Reels.",
    niche: "Historia",
    language: "pt-BR",
    country: "Brasil",
    logoUrl: "/media/mock-thumbnail-3.jpg",
    bannerUrl: "/media/mock-thumbnail-4.jpg",
    channelType: "historia",
    visualStyle: "documentario",
    defaultVoiceId: "alloy",
    defaultTemplateId: "channel_template_2",
    defaultVideoFormat: "youtube_long",
    status: "ativo",
    isFavorite: false,
    createdAt: "2026-06-07",
    updatedAt: "2026-06-07"
  },
  {
    id: "channel_3",
    workspaceId: "ws_1",
    name: "Estoico Diario",
    description: "Conteudo motivacional estoico em videos curtos com visual minimalista.",
    niche: "Desenvolvimento Pessoal",
    language: "pt-BR",
    country: "Brasil",
    logoUrl: "/media/mock-thumbnail-5.jpg",
    bannerUrl: "/media/mock-thumbnail-6.jpg",
    channelType: "estoicismo",
    visualStyle: "minimalista",
    defaultVoiceId: "nova",
    defaultTemplateId: "channel_template_3",
    defaultVideoFormat: "reels",
    status: "pausado",
    isFavorite: true,
    createdAt: "2026-06-07",
    updatedAt: "2026-06-07"
  }
];

export const channelTemplates: ChannelTemplate[] = [
  {
    id: "channel_template_1",
    workspaceId: "ws_1",
    channelId: "channel_1",
    name: "Curiosidades Dark 60s",
    description: "Voz grave, legenda TikTok, estilo sombrio e ritmo rapido.",
    voiceId: "mock_deep",
    visualStyle: "sombrio",
    durationSeconds: 60,
    format: "short",
    promptSystem: "Crie roteiro curto com curiosidade, surpresa e fechamento forte.",
    promptUser: "Tema: {{tema}}. Gere 8 cenas curtas.",
    subtitleStyle: "tiktok",
    thumbnailStyle: "alto contraste com texto curto",
    status: "active",
    createdAt: "2026-06-07"
  },
  {
    id: "channel_template_2",
    workspaceId: "ws_1",
    channelId: "channel_2",
    name: "Documentario Historico",
    description: "Narrativa editorial, visual historico e cortes derivados.",
    voiceId: "alloy",
    visualStyle: "documentario",
    durationSeconds: 300,
    format: "youtube_long",
    promptSystem: "Crie roteiro documental com contexto, conflito e consequencia.",
    promptUser: "Tema: {{tema}}. Estruture em abertura, corpo e conclusao.",
    subtitleStyle: "documentary",
    thumbnailStyle: "cinematico documental",
    status: "active",
    createdAt: "2026-06-07"
  },
  {
    id: "channel_template_3",
    workspaceId: "ws_1",
    channelId: "channel_3",
    name: "Estoico Reels 60s",
    description: "Voz firme, visual minimalista e CTA para salvar.",
    voiceId: "nova",
    visualStyle: "minimalista",
    durationSeconds: 60,
    format: "reels",
    promptSystem: "Crie roteiro motivacional estoico com uma ideia central.",
    promptUser: "Tema: {{tema}}. Feche com acao pratica.",
    subtitleStyle: "popup",
    thumbnailStyle: "minimalista premium",
    status: "active",
    createdAt: "2026-06-07"
  }
];

export const contentCalendarItems: ContentCalendarItem[] = [
  { id: "calendar_1", workspaceId: "ws_1", channelId: "channel_1", contentType: "short", contentId: "video_1", title: "5 fatos que parecem mentira", scheduledDate: "2026-06-08T09:00:00", status: "planejado", notes: "Gerar pelo Magic Mode", createdAt: "2026-06-07" },
  { id: "calendar_2", workspaceId: "ws_1", channelId: "channel_2", contentType: "video", title: "A queda de um imperio em 7 minutos", scheduledDate: "2026-06-09T18:00:00", status: "em_producao", notes: "Precisa thumbnail documental", createdAt: "2026-06-07" },
  { id: "calendar_3", workspaceId: "ws_1", channelId: "channel_3", contentType: "script", title: "Disciplina sem motivacao", scheduledDate: "2026-06-10T07:30:00", status: "pronto", notes: "Roteiro aprovado", createdAt: "2026-06-07" }
];

export const productionPlans: ProductionPlan[] = [
  { id: "plan_1", workspaceId: "ws_1", channelId: "channel_1", videosPerDay: 0, videosPerWeek: 0, shortsPerDay: 3, longVideosPerWeek: 0, notes: "3 shorts por dia", createdAt: "2026-06-07", updatedAt: "2026-06-07" },
  { id: "plan_2", workspaceId: "ws_1", channelId: "channel_2", videosPerDay: 0, videosPerWeek: 3, shortsPerDay: 1, longVideosPerWeek: 3, notes: "1 video longo a cada 2 dias", createdAt: "2026-06-07", updatedAt: "2026-06-07" },
  { id: "plan_3", workspaceId: "ws_1", channelId: "channel_3", videosPerDay: 0, videosPerWeek: 0, shortsPerDay: 2, longVideosPerWeek: 0, notes: "2 videos por dia", createdAt: "2026-06-07", updatedAt: "2026-06-07" }
];

export const bulkJobs: BulkJob[] = [
  { id: "bulk_1", workspaceId: "ws_1", channelId: "channel_1", quantity: 50, contentType: "short", templateId: "channel_template_1", format: "short", durationSeconds: 60, visualStyle: "sombrio", status: "generating", progress: 42, currentStep: "Gerando roteiros", creditsConsumed: 86, createdAt: "2026-06-07 12:00" },
  { id: "bulk_2", workspaceId: "ws_1", channelId: "channel_2", quantity: 10, contentType: "video", templateId: "channel_template_2", format: "youtube_long", durationSeconds: 300, visualStyle: "documentario", status: "queued", progress: 0, currentStep: "Na fila", creditsConsumed: 0, createdAt: "2026-06-07 12:15" },
  { id: "bulk_3", workspaceId: "ws_1", channelId: "channel_3", quantity: 20, contentType: "short", templateId: "channel_template_3", format: "reels", durationSeconds: 60, visualStyle: "minimalista", status: "completed", progress: 100, currentStep: "Concluido", creditsConsumed: 41, createdAt: "2026-06-07 09:40" }
];

export const queueJobs: QueueJob[] = [
  { id: "queue_1", workspaceId: "ws_1", channelId: "channel_1", userId: "user_1", jobType: "bulk", title: "50 shorts de curiosidades", status: "generating", progress: 42, currentStep: "Gerando roteiros", estimatedTime: "28 min", creditsConsumed: 86, createdAt: "2026-06-07 12:00" },
  { id: "queue_2", workspaceId: "ws_1", channelId: "channel_2", userId: "user_1", jobType: "magic_video", title: "Video documental historico", status: "rendering", progress: 78, currentStep: "Renderizando", estimatedTime: "9 min", creditsConsumed: 18, createdAt: "2026-06-07 11:40" },
  { id: "queue_3", workspaceId: "ws_1", channelId: "channel_3", userId: "user_1", jobType: "thumbnail", title: "Thumbnails estoicas", status: "completed", progress: 100, currentStep: "Concluido", estimatedTime: "0 min", creditsConsumed: 6, createdAt: "2026-06-07 10:15" }
];

export const channelGoals: ChannelGoal[] = [
  { id: "goal_1", workspaceId: "ws_1", channelId: "channel_1", goalType: "shorts", target: 300, period: "monthly", currentValue: 86, createdAt: "2026-06-07" },
  { id: "goal_2", workspaceId: "ws_1", channelId: "channel_2", goalType: "videos", target: 100, period: "monthly", currentValue: 24, createdAt: "2026-06-07" },
  { id: "goal_3", workspaceId: "ws_1", channelId: "channel_3", goalType: "thumbnails", target: 100, period: "monthly", currentValue: 41, createdAt: "2026-06-07" }
];

export const channelPermissions: ChannelPermission[] = [
  { id: "channel_perm_1", workspaceId: "ws_1", channelId: "channel_1", userId: "user_1", role: "administrador", createdAt: "2026-06-07" },
  { id: "channel_perm_2", workspaceId: "ws_1", channelId: "channel_2", userId: "user_2", role: "editor", createdAt: "2026-06-07" },
  { id: "channel_perm_3", workspaceId: "ws_1", channelId: "channel_3", userId: "user_3", role: "operador", createdAt: "2026-06-07" }
];

export const operationNotifications: OperationNotification[] = [
  { id: "notification_1", workspaceId: "ws_1", channelId: "channel_1", title: "Bulk job em andamento", description: "50 shorts estao em geracao para Curiosidades Sem Filtro.", type: "queue_congested", status: "unread", createdAt: "2026-06-07 12:05" },
  { id: "notification_2", workspaceId: "ws_1", channelId: "channel_2", title: "Render concluido", description: "Video documental pronto para revisao.", type: "job_completed", status: "unread", createdAt: "2026-06-07 11:58" },
  { id: "notification_3", workspaceId: "ws_1", title: "Creditos baixos", description: "Consumo previsto pode ultrapassar o saldo semanal.", type: "low_credits", status: "read", createdAt: "2026-06-07 10:30" }
];

export const aiVideoProviders: AiVideoProviderConfig[] = [
  { id: "ai_video_provider_1", workspaceId: "ws_1", name: "Runway", provider: "runway", defaultModel: "gen-placeholder", status: "inactive", costPerSecond: 0.18, costPerGeneration: 1.2, maxDurationSeconds: 10, supportedAspectRatios: ["9:16", "16:9"], supportsImageToVideo: true, supportsTextToVideo: true, supportsTalkingCharacter: false, isDefault: false, createdAt: "2026-06-07", updatedAt: "2026-06-07" },
  { id: "ai_video_provider_2", workspaceId: "ws_1", name: "Kling", provider: "kling", defaultModel: "kling-placeholder", status: "inactive", costPerSecond: 0.16, costPerGeneration: 1, maxDurationSeconds: 10, supportedAspectRatios: ["9:16", "16:9", "1:1"], supportsImageToVideo: true, supportsTextToVideo: true, supportsTalkingCharacter: false, isDefault: false, createdAt: "2026-06-07", updatedAt: "2026-06-07" },
  { id: "ai_video_provider_3", workspaceId: "ws_1", name: "Mock Video", provider: "mock", defaultModel: "mock-video-v1", status: "active", costPerSecond: 0, costPerGeneration: 0, maxDurationSeconds: 10, supportedAspectRatios: ["9:16", "16:9", "1:1"], supportsImageToVideo: true, supportsTextToVideo: true, supportsTalkingCharacter: true, isDefault: true, createdAt: "2026-06-07", updatedAt: "2026-06-07" }
];

export const textToVideoJobs: TextToVideoJob[] = [
  { id: "text_video_1", workspaceId: "ws_1", projectId: "project_1", provider: "mock", prompt: "Soldados romanos marchando em preto e branco cinematografico", negativePrompt: "low quality, distorted", visualStyle: "historico", durationSeconds: 5, aspectRatio: "9:16", cameraMotion: "push_in", quality: "standard", outputVideoUrl: "/media/mock-render.mp4", thumbnailUrl: "/media/mock-thumbnail-3.jpg", status: "completed", progress: 100, cost: 0, createdAt: "2026-06-07", updatedAt: "2026-06-07" }
];

export const imageToVideoJobs: ImageToVideoJob[] = [
  { id: "image_video_1", workspaceId: "ws_1", videoProjectId: "video_1", sceneId: "scene_1", provider: "mock", inputImageUrl: "/media/mock-scene-1.jpg", motionPrompt: "Movimento cinematografico suave", durationSeconds: 5, aspectRatio: "9:16", outputVideoUrl: "/media/mock-render.mp4", status: "completed", progress: 100, cost: 0, createdAt: "2026-06-07", updatedAt: "2026-06-07" }
];

export const introOutroGenerations: IntroOutroGeneration[] = [
  { id: "intro_1", workspaceId: "ws_1", videoProjectId: "video_1", type: "intro", provider: "mock", prompt: "Um castelo medieval sendo revelado pela camera", durationSeconds: 5, aspectRatio: "16:9", outputVideoUrl: "/media/mock-render.mp4", status: "completed", cost: 0, createdAt: "2026-06-07" }
];

export const talkingCharacterJobs: TalkingCharacterJob[] = [
  { id: "talking_1", workspaceId: "ws_1", projectId: "project_1", inputImageUrl: "/media/mock-thumbnail-4.jpg", characterDescription: "Narrador documental com expressao seria", speechText: "A primeira frase decide se o publico fica ou vai embora.", voiceId: "alloy", provider: "mock", durationSeconds: 8, outputVideoUrl: "/media/mock-render.mp4", status: "completed", progress: 100, cost: 0, createdAt: "2026-06-07" }
];

export const aiVideoAssets: AiVideoAsset[] = [
  { id: "ai_video_asset_1", workspaceId: "ws_1", projectId: "project_1", videoProjectId: "video_1", source: "image_to_video", title: "Cena animada de abertura", provider: "mock", thumbnailUrl: "/media/mock-thumbnail-1.jpg", videoUrl: "/media/mock-render.mp4", durationSeconds: 5, aspectRatio: "9:16", cost: 0, createdAt: "2026-06-07" },
  { id: "ai_video_asset_2", workspaceId: "ws_1", projectId: "project_1", source: "text_to_video", title: "Soldados romanos cinematicos", provider: "mock", thumbnailUrl: "/media/mock-thumbnail-3.jpg", videoUrl: "/media/mock-render.mp4", durationSeconds: 5, aspectRatio: "9:16", cost: 0, createdAt: "2026-06-07" },
  { id: "ai_video_asset_3", workspaceId: "ws_1", projectId: "project_1", source: "talking_character", title: "Personagem narrador", provider: "mock", thumbnailUrl: "/media/mock-thumbnail-4.jpg", videoUrl: "/media/mock-render.mp4", durationSeconds: 8, aspectRatio: "9:16", cost: 0, createdAt: "2026-06-07" }
];

export const billingPlans: Plan[] = [
  { id: "plan_starter", name: "Starter", slug: "starter", description: "Para validar canais e gerar os primeiros videos com watermark.", monthlyPrice: 97, yearlyPrice: 970, includedCredits: 1000, maxWorkspaces: 1, maxChannels: 1, maxProjects: 3, maxTeamMembers: 2, maxVideosPerMonth: 20, maxRendersPerMonth: 20, maxAiVideoGenerations: 5, maxViralClips: 10, watermarkEnabled: true, priorityQueue: false, whiteLabelEnabled: false, status: "active", createdAt: "2026-06-08", updatedAt: "2026-06-08" },
  { id: "plan_pro", name: "Pro", slug: "pro", description: "Para criadores e pequenas equipes com producao semanal.", monthlyPrice: 197, yearlyPrice: 1970, includedCredits: 5000, maxWorkspaces: 2, maxChannels: 5, maxProjects: 15, maxTeamMembers: 5, maxVideosPerMonth: 100, maxRendersPerMonth: 100, maxAiVideoGenerations: 25, maxViralClips: 50, watermarkEnabled: false, priorityQueue: true, whiteLabelEnabled: false, status: "active", createdAt: "2026-06-08", updatedAt: "2026-06-08" },
  { id: "plan_agency", name: "Agency", slug: "agency", description: "Para operacoes multi-canal e clientes recorrentes.", monthlyPrice: 497, yearlyPrice: 4970, includedCredits: 18000, maxWorkspaces: 10, maxChannels: 30, maxProjects: 80, maxTeamMembers: 20, maxVideosPerMonth: 500, maxRendersPerMonth: 500, maxAiVideoGenerations: 120, maxViralClips: 250, watermarkEnabled: false, priorityQueue: true, whiteLabelEnabled: true, status: "active", createdAt: "2026-06-08", updatedAt: "2026-06-08" },
  { id: "plan_enterprise", name: "Enterprise", slug: "enterprise", description: "Limites customizados, suporte dedicado e white label completo.", monthlyPrice: 1497, yearlyPrice: 14970, includedCredits: 75000, maxWorkspaces: 50, maxChannels: 200, maxProjects: 500, maxTeamMembers: 100, maxVideosPerMonth: 2500, maxRendersPerMonth: 2500, maxAiVideoGenerations: 750, maxViralClips: 1500, watermarkEnabled: false, priorityQueue: true, whiteLabelEnabled: true, status: "active", createdAt: "2026-06-08", updatedAt: "2026-06-08" }
];

export const subscriptions: Subscription[] = [
  { id: "sub_1", workspaceId: "ws_1", planId: "plan_pro", status: "trialing", billingCycle: "monthly", currentPeriodStart: "2026-06-08", currentPeriodEnd: "2026-07-08", trialEndsAt: "2026-06-15", cancelAtPeriodEnd: false, provider: "placeholder", providerSubscriptionId: "mock_sub_pro_1", createdAt: "2026-06-08", updatedAt: "2026-06-08" },
  { id: "sub_2", workspaceId: "ws_2", planId: "plan_starter", status: "active", billingCycle: "monthly", currentPeriodStart: "2026-06-01", currentPeriodEnd: "2026-07-01", cancelAtPeriodEnd: false, provider: "placeholder", providerSubscriptionId: "mock_sub_starter_2", createdAt: "2026-06-01", updatedAt: "2026-06-08" }
];

export const creditWallets: CreditWallet[] = [
  { id: "wallet_1", workspaceId: "ws_1", balance: 3420, monthlyAllowance: 5000, purchasedCredits: 1000, usedThisPeriod: 2580, resetAt: "2026-07-08", createdAt: "2026-06-08", updatedAt: "2026-06-08" },
  { id: "wallet_2", workspaceId: "ws_2", balance: 380, monthlyAllowance: 1000, purchasedCredits: 0, usedThisPeriod: 620, resetAt: "2026-07-01", createdAt: "2026-06-01", updatedAt: "2026-06-08" }
];

export const creditTransactions: CreditTransaction[] = [
  { id: "credit_tx_1", workspaceId: "ws_1", userId: "user_1", type: "monthly_grant", amount: 5000, balanceAfter: 5000, description: "Credito mensal Pro liberado", referenceType: "subscription", createdAt: "2026-06-08 08:00" },
  { id: "credit_tx_2", workspaceId: "ws_1", userId: "user_1", type: "usage", amount: -18, balanceAfter: 4982, description: "Magic Mode - roteiro, voz, imagens e thumbnail", referenceType: "magic_video_job", createdAt: "2026-06-08 09:14" },
  { id: "credit_tx_3", workspaceId: "ws_1", userId: "user_1", type: "usage", amount: -42, balanceAfter: 4940, description: "Render demonstrativo com watermark off", referenceType: "video_render", createdAt: "2026-06-08 10:02" },
  { id: "credit_tx_4", workspaceId: "ws_1", userId: "user_1", type: "purchase", amount: 1000, balanceAfter: 5940, description: "Compra mockada de pacote 1.000 creditos", referenceType: "credit_package", createdAt: "2026-06-08 10:20" },
  { id: "credit_tx_5", workspaceId: "ws_2", userId: "user_2", type: "usage", amount: -60, balanceAfter: 380, description: "Cortes virais em modo demo", referenceType: "viral_clip_job", createdAt: "2026-06-08 11:05" }
];

export const creditPackages: CreditPackage[] = [
  { id: "package_1k", name: "1.000 creditos", credits: 1000, price: 49, bonusCredits: 0, status: "active", createdAt: "2026-06-08" },
  { id: "package_5k", name: "5.000 creditos", credits: 5000, price: 199, bonusCredits: 500, status: "active", createdAt: "2026-06-08" },
  { id: "package_10k", name: "10.000 creditos", credits: 10000, price: 349, bonusCredits: 1500, status: "active", createdAt: "2026-06-08" },
  { id: "package_50k", name: "50.000 creditos", credits: 50000, price: 1497, bonusCredits: 10000, status: "active", createdAt: "2026-06-08" }
];

export const billingEvents: BillingEvent[] = [
  { id: "billing_event_1", workspaceId: "ws_1", provider: "placeholder", eventType: "trial_started", payload: { plan: "Pro", days: 7 }, status: "mocked", createdAt: "2026-06-08 08:00" },
  { id: "billing_event_2", workspaceId: "ws_1", provider: "placeholder", eventType: "credit_package_checkout_created", payload: { package: "1.000 creditos", amount: 49 }, status: "mocked", createdAt: "2026-06-08 10:20" },
  { id: "billing_event_3", workspaceId: "ws_2", provider: "placeholder", eventType: "usage_block_warning", payload: { feature: "ai_video", reason: "credits_low" }, status: "mocked", createdAt: "2026-06-08 11:05" }
];

export const invoices: Invoice[] = [
  { id: "invoice_1", workspaceId: "ws_1", subscriptionId: "sub_1", providerInvoiceId: "mock_invoice_trial", amount: 0, currency: "BRL", status: "draft", invoiceUrl: "#", createdAt: "2026-06-08" },
  { id: "invoice_2", workspaceId: "ws_2", subscriptionId: "sub_2", providerInvoiceId: "mock_invoice_starter", amount: 97, currency: "BRL", status: "paid", invoiceUrl: "#", paidAt: "2026-06-01", createdAt: "2026-06-01" }
];

export const platformAdmins: PlatformAdmin[] = [
  { id: "platform_admin_1", userId: "user_1", role: "owner", status: "active", createdAt: "2026-06-08" },
  { id: "platform_admin_2", userId: "user_2", role: "finance", status: "active", createdAt: "2026-06-08" }
];

export const featureFlags: FeatureFlag[] = [
  { id: "flag_1", workspaceId: "ws_1", featureKey: "ai_video", enabled: true, limitValue: 25, createdAt: "2026-06-08" },
  { id: "flag_2", workspaceId: "ws_1", featureKey: "white_label", enabled: false, createdAt: "2026-06-08" },
  { id: "flag_3", workspaceId: "ws_2", featureKey: "viral_clips", enabled: true, limitValue: 10, createdAt: "2026-06-08" }
];

export const usageSnapshots: UsageSnapshot[] = [
  { workspaceId: "ws_1", videosThisMonth: 38, rendersThisMonth: 31, aiVideoGenerations: 7, viralClips: 14, channels: 3, projects: 9, teamMembers: 4, workspaceSuspended: false },
  { workspaceId: "ws_2", videosThisMonth: 18, rendersThisMonth: 19, aiVideoGenerations: 5, viralClips: 9, channels: 1, projects: 3, teamMembers: 2, workspaceSuspended: false }
];

export const adminWorkspaceSummaries: AdminWorkspaceSummary[] = [
  { workspaceId: "ws_1", name: "Video Flow HQ", ownerEmail: "daniel@contentengine.ai", planName: "Pro", subscriptionStatus: "trialing", creditsBalance: 3420, usedThisPeriod: 2580, videosGenerated: 38, renders: 31, failedJobs: 2, estimatedProviderCost: 87.42, status: "active" },
  { workspaceId: "ws_2", name: "Growth Lab", ownerEmail: "marina@contentengine.ai", planName: "Starter", subscriptionStatus: "active", creditsBalance: 380, usedThisPeriod: 620, videosGenerated: 18, renders: 19, failedJobs: 4, estimatedProviderCost: 22.8, status: "active" }
];

export const providerCostSummaries: ProviderCostSummary[] = [
  { provider: "OpenAI", category: "text", workspaceId: "ws_1", workspaceName: "Video Flow HQ", usageCount: 142, creditsCharged: 612, estimatedCost: 14.62 },
  { provider: "OpenAI TTS", category: "voice", workspaceId: "ws_1", workspaceName: "Video Flow HQ", usageCount: 38, creditsCharged: 486, estimatedCost: 18.4 },
  { provider: "OpenAI Images", category: "image", workspaceId: "ws_1", workspaceName: "Video Flow HQ", usageCount: 96, creditsCharged: 1180, estimatedCost: 41.2 },
  { provider: "Render Base", category: "render", workspaceId: "ws_1", workspaceName: "Video Flow HQ", usageCount: 31, creditsCharged: 302, estimatedCost: 9.6 },
  { provider: "Mock Video", category: "ai_video", workspaceId: "ws_1", workspaceName: "Video Flow HQ", usageCount: 7, creditsCharged: 0, estimatedCost: 0 },
  { provider: "Viral Pipeline", category: "viral", workspaceId: "ws_2", workspaceName: "Growth Lab", usageCount: 9, creditsCharged: 220, estimatedCost: 6.1 }
];

export const exportPackages: ExportPackage[] = [
  { id: "export_package_1", workspaceId: "ws_1", channelId: "channel_1", videoProjectId: "video_1", title: "Checklist de publicacao em 60 segundos", targetPlatform: "youtube_shorts", packageUrl: "/exports/curiosidades-2026-06-08-checklist-youtube-shorts.zip", status: "ready", createdAt: "2026-06-08 12:30", updatedAt: "2026-06-08 12:30" },
  { id: "export_package_2", workspaceId: "ws_1", channelId: "channel_1", videoProjectId: "video_1", title: "Checklist de publicacao para Reels", targetPlatform: "instagram_reels", packageUrl: "/exports/curiosidades-2026-06-08-checklist-instagram-reels.zip", status: "downloaded", createdAt: "2026-06-08 13:10", updatedAt: "2026-06-08 13:18" }
];

export const videoMetadataItems: VideoMetadata[] = [
  {
    id: "metadata_1",
    workspaceId: "ws_1",
    videoProjectId: "video_1",
    platform: "youtube_shorts",
    title: "Checklist rapido antes de publicar qualquer video",
    titleVariations: [
      "Antes de postar, confira estes 5 pontos",
      "O checklist que evita videos fracos",
      "5 detalhes antes de publicar seu video",
      "Nao poste antes de revisar isso",
      "Como publicar videos com mais consistencia"
    ],
    description: "Use este checklist antes de publicar seus videos e evite erros simples que reduzem retencao, clareza e resultado.",
    hashtags: ["#shorts", "#criacaodeconteudo", "#videomarketing", "#produtividade"],
    tags: ["video marketing", "publicacao", "checklist", "conteudo", "youtube shorts"],
    pinnedComment: "Qual desses pontos voce mais esquece antes de publicar?",
    communityText: "Novo short no ar com um checklist simples para publicar videos melhores.",
    cta: "Salve para revisar antes do proximo post.",
    seoScore: 86,
    status: "generated",
    createdAt: "2026-06-08 12:25"
  },
  {
    id: "metadata_2",
    workspaceId: "ws_1",
    videoProjectId: "video_1",
    platform: "instagram_reels",
    title: "Nao publique sem revisar isso",
    titleVariations: ["Checklist para Reels", "Antes de postar seu proximo video", "Publique com mais clareza", "Seu video precisa destes pontos", "Revisao rapida para criadores"],
    description: "Antes de postar, revise objetivo, formato, clareza, thumbnail e CTA.\n\nEsse fluxo simples evita muito retrabalho.",
    hashtags: ["#reels", "#conteudo", "#criadores", "#marketingdigital"],
    tags: ["reels", "conteudo", "criadores"],
    pinnedComment: "Quer um checklist completo para seu canal?",
    communityText: "Checklist rapido para quem cria conteudo toda semana.",
    cta: "Siga para mais sistemas de conteudo.",
    seoScore: 78,
    status: "approved",
    createdAt: "2026-06-08 13:05"
  }
];

export const bulkExportJobs: BulkExportJob[] = [
  { id: "bulk_export_1", workspaceId: "ws_1", userId: "user_1", selectedVideoIds: ["video_1"], targetPlatform: "youtube_shorts", status: "ready", packageUrl: "/exports/lote-youtube-shorts-2026-06-08.zip", createdAt: "2026-06-08 13:30" }
];

export const manualPublications: ManualPublication[] = [
  { id: "manual_publication_1", workspaceId: "ws_1", videoProjectId: "video_1", exportPackageId: "export_package_2", platform: "instagram_reels", publishedUrl: "https://instagram.com/reel/mock", publishedAt: "2026-06-08 14:00", notes: "Publicado manualmente com legenda revisada.", createdAt: "2026-06-08 14:02" }
];

export const assetSources: AssetSourceConfig[] = [
  { id: "asset_source_upload", workspaceId: "ws_1", name: "Upload", provider: "upload", status: "active", createdAt: "2026-06-08" },
  { id: "asset_source_pexels", workspaceId: "ws_1", name: "Pexels", provider: "pexels", status: "active", createdAt: "2026-06-08" },
  { id: "asset_source_pixabay", workspaceId: "ws_1", name: "Pixabay", provider: "pixabay", status: "active", createdAt: "2026-06-08" },
  { id: "asset_source_unsplash", workspaceId: "ws_1", name: "Unsplash", provider: "unsplash", status: "active", createdAt: "2026-06-08" },
  { id: "asset_source_ai", workspaceId: "ws_1", name: "IA Interna", provider: "internal_ai", status: "active", createdAt: "2026-06-08" },
  { id: "asset_source_library", workspaceId: "ws_1", name: "Biblioteca Propria", provider: "owned_library", status: "active", createdAt: "2026-06-08" }
];

export const assetLibraryItems: AssetLibraryItem[] = [
  { id: "asset_lib_1", workspaceId: "ws_1", projectId: "project_1", channelId: "channel_1", type: "image", source: "ai_image", title: "Ruinas imperiais douradas", description: "Cena cinematografica com ruinas, luz quente e atmosfera historica.", tags: ["imperio romano", "historia", "ruinas"], fileUrl: "/media/mock-scene-1.jpg", thumbnailUrl: "/media/mock-scene-1.jpg", width: 1080, height: 1920, fileSize: 420000, mimeType: "image/jpeg", favorite: true, usageCount: 17, qualityScore: 92, hash: "hash_ruinas_1", createdBy: "Video Flow", createdAt: "2026-06-08 09:00" },
  { id: "asset_lib_2", workspaceId: "ws_1", projectId: "project_1", channelId: "channel_2", type: "video", source: "pexels", title: "Soldados caminhando em sombras", description: "Video vertical para narrativas historicas e batalhas.", tags: ["soldados", "historico", "batalha"], fileUrl: "/media/mock-render.mp4", thumbnailUrl: "/media/mock-thumbnail-3.jpg", previewUrl: "/media/mock-render.mp4", durationSeconds: 8, width: 1080, height: 1920, fileSize: 8200000, mimeType: "video/mp4", favorite: false, usageCount: 9, qualityScore: 84, hash: "hash_soldados_1", createdBy: "Pexels", createdAt: "2026-06-08 10:00" },
  { id: "asset_lib_3", workspaceId: "ws_1", type: "music", source: "upload", title: "Cinematic Calm", description: "Trilha calma para videos documentais.", tags: ["cinematic", "calm", "documentario"], fileUrl: "/media/mock-music.mp3", durationSeconds: 120, fileSize: 3200000, mimeType: "audio/mpeg", favorite: true, usageCount: 24, qualityScore: 78, hash: "hash_music_1", createdBy: "Daniel Mota", createdAt: "2026-06-08 10:20" },
  { id: "asset_lib_4", workspaceId: "ws_1", projectId: "project_1", type: "thumbnail", source: "generated", title: "Thumbnail alto contraste", description: "Thumbnail para checklist de publicacao.", tags: ["thumbnail", "youtube", "contraste"], fileUrl: "/media/mock-thumbnail-1.jpg", thumbnailUrl: "/media/mock-thumbnail-1.jpg", width: 1280, height: 720, fileSize: 360000, mimeType: "image/jpeg", favorite: false, usageCount: 6, qualityScore: 88, hash: "hash_thumb_1", createdBy: "Video Flow", createdAt: "2026-06-08 11:00" },
  { id: "asset_lib_5", workspaceId: "ws_1", channelId: "channel_3", type: "image", source: "unsplash", title: "Estatua estoica minimalista", description: "Imagem horizontal clara para conteudos de filosofia e estoicismo.", tags: ["estoicismo", "minimalista", "filosofia"], fileUrl: "/media/mock-thumbnail-5.jpg", thumbnailUrl: "/media/mock-thumbnail-5.jpg", width: 1600, height: 900, fileSize: 580000, mimeType: "image/jpeg", favorite: true, usageCount: 11, qualityScore: 81, hash: "hash_estatua_1", createdBy: "Unsplash", createdAt: "2026-06-08 12:00" },
  { id: "asset_lib_6", workspaceId: "ws_1", projectId: "project_1", type: "video", source: "ai_video", title: "Cena animada de abertura", description: "Asset AI video para abertura de video vertical.", tags: ["ai video", "abertura", "vertical"], fileUrl: "/media/mock-render.mp4", thumbnailUrl: "/media/mock-thumbnail-2.jpg", previewUrl: "/media/mock-render.mp4", durationSeconds: 5, width: 1080, height: 1920, fileSize: 6100000, mimeType: "video/mp4", favorite: false, usageCount: 3, qualityScore: 74, hash: "hash_ai_video_1", createdBy: "Mock Video", createdAt: "2026-06-08 12:30" }
];

export const assetCollections: AssetCollection[] = [
  { id: "collection_1", workspaceId: "ws_1", name: "Imperio Romano", description: "Ruinas, soldados, mapas e cenas historicas.", thumbnailUrl: "/media/mock-thumbnail-3.jpg", createdAt: "2026-06-08" },
  { id: "collection_2", workspaceId: "ws_1", name: "Historias Biblicas", description: "Cenas religiosas, desertos, templos e personagens.", thumbnailUrl: "/media/mock-thumbnail-4.jpg", createdAt: "2026-06-08" },
  { id: "collection_3", workspaceId: "ws_1", name: "Estoicismo", description: "Estatuas, texturas, ambientes minimalistas e fundos sobrios.", thumbnailUrl: "/media/mock-thumbnail-5.jpg", createdAt: "2026-06-08" },
  { id: "collection_4", workspaceId: "ws_1", name: "Misterio", description: "Sombras, neblina, cenas escuras e thumbnails dramaticas.", thumbnailUrl: "/media/mock-thumbnail-6.jpg", createdAt: "2026-06-08" }
];

export const assetCollectionItems: AssetCollectionItem[] = [
  { id: "collection_item_1", workspaceId: "ws_1", collectionId: "collection_1", assetId: "asset_lib_1", createdAt: "2026-06-08" },
  { id: "collection_item_2", workspaceId: "ws_1", collectionId: "collection_1", assetId: "asset_lib_2", createdAt: "2026-06-08" },
  { id: "collection_item_3", workspaceId: "ws_1", collectionId: "collection_3", assetId: "asset_lib_5", createdAt: "2026-06-08" }
];

export const assetUsageItems: AssetUsage[] = [
  { id: "asset_usage_1", workspaceId: "ws_1", assetId: "asset_lib_1", videoProjectId: "video_1", sceneId: "scene_1", usedAt: "2026-06-08 12:00" },
  { id: "asset_usage_2", workspaceId: "ws_1", assetId: "asset_lib_2", videoProjectId: "video_1", sceneId: "scene_2", usedAt: "2026-06-08 12:10" },
  { id: "asset_usage_3", workspaceId: "ws_1", assetId: "asset_lib_3", videoProjectId: "video_1", usedAt: "2026-06-08 12:20" }
];

export const assetSearchCache: AssetSearchCacheEntry[] = [
  { id: "asset_cache_1", workspaceId: "ws_1", provider: "pexels", query: "jesus caminhando vertical", results: [], createdAt: "2026-06-08 12:00" },
  { id: "asset_cache_2", workspaceId: "ws_1", provider: "unsplash", query: "roman empire ruins", results: [], createdAt: "2026-06-08 12:10" }
];

const templateTopicSets: Record<string, string[]> = {
  dark_curiosities: [
    "O lugar mais proibido que quase ninguem conhece",
    "A descoberta que mudou uma cidade inteira",
    "O sinal que aparece antes de grandes acidentes",
    "O misterio por tras dos objetos perdidos no mar",
    "A regra secreta usada por aeroportos",
    "A cidade que sumiu dos mapas oficiais",
    "O experimento que nunca deveria ter sido aprovado",
    "A senha visual que protege grandes museus",
    "O som que assusta pilotos experientes",
    "O arquivo que ficou escondido por decadas",
    "A ponte que desafia engenheiros ate hoje",
    "O numero que aparece em acidentes famosos",
    "A ilha que ninguem pode visitar",
    "O ritual silencioso antes de uma missao",
    "A mensagem deixada em uma capsula do tempo",
    "O segredo das portas sem macaneta",
    "A foto que revelou um detalhe impossivel",
    "O codigo usado por investigadores de campo",
    "A sala sem janelas que guarda uma fortuna",
    "A decisao de segundos que salvou centenas"
  ],
  biblical: [
    "A coragem de Davi antes da batalha",
    "O silencio de Jose no Egito",
    "A travessia do Mar Vermelho",
    "A forca de Daniel na cova dos leoes",
    "A paciencia de Jo diante da perda",
    "A noite em que Jacó lutou ate amanhecer",
    "O chamado de Samuel no templo",
    "A rainha Ester diante do imperio",
    "O arrependimento de Jonas em Ninive",
    "A fe de Abraao na montanha",
    "O menino que entregou cinco paes",
    "A tempestade acalmada no mar",
    "A decisao de Ruth no caminho",
    "O choro de Pedro depois da negacao",
    "A promessa feita a Moises no deserto",
    "O azeite que nao acabou",
    "A muralha de Jerico antes da queda",
    "O encontro no caminho de Emaus",
    "A sabedoria de Salomao diante do conflito",
    "O perdao que mudou a casa de Zaqueu"
  ],
  stoic_anime: [
    "O samurai que aprendeu a perder em silencio",
    "A disciplina que vence a raiva",
    "Como agir quando ninguem reconhece seu esforco",
    "A diferenca entre orgulho e honra",
    "O treino mental antes da batalha",
    "A virtude de continuar quando tudo parece parado",
    "O mestre que ensinou controle emocional",
    "Por que o desconforto cria liberdade",
    "A escolha de falar menos e fazer mais",
    "O dia em que a paciencia venceu a forca",
    "A licao estoica por tras de uma derrota",
    "A mente calma em uma cidade em caos",
    "O habito que separa homens fortes dos impulsivos",
    "A arte de nao reagir a provocacoes",
    "O guerreiro que dominou o proprio medo",
    "A rotina simples de uma mente imbatível",
    "O que Marco Aurelio diria a um jovem ansioso",
    "A coragem de fazer o necessario",
    "O preco de viver buscando aprovacao",
    "A liberdade de aceitar o que nao controla"
  ],
  roman_bw: [
    "A ultima marcha de uma legiao romana",
    "O dia em que Roma perdeu a paciencia",
    "A estrategia que salvou o imperio por uma noite",
    "A queda silenciosa de um general",
    "Como uma estrada mudou o destino da Europa",
    "O senado antes da traicao",
    "A vida real de um soldado romano",
    "A cidade que Roma tentou apagar",
    "O erro que abriu as portas do imperio",
    "O julgamento que assustou patricios",
    "A noite mais longa no Coliseu",
    "A mensagem enviada antes da revolta",
    "A disciplina brutal das legioes",
    "O imperador que temia o proprio povo",
    "A fronteira esquecida do imperio",
    "O imposto que causou uma rebeliao",
    "O segredo dos acampamentos romanos",
    "A batalha que ninguem queria contar",
    "A sombra de Julio Cesar em Roma",
    "O ultimo sinal antes da queda"
  ],
  luxury: [
    "O habito discreto dos bilionarios antes das 6h",
    "A estrategia por tras de marcas de luxo",
    "Como familias ricas preservam patrimonio",
    "O objeto simples que revela status real",
    "Por que bilionarios compram tempo, nao coisas",
    "A rotina de decisao de grandes investidores",
    "O erro financeiro que ricos evitam cedo",
    "Como o luxo vende silencio e escassez",
    "A diferenca entre parecer rico e construir riqueza",
    "O networking invisivel dos ultra ricos",
    "A regra de compra usada por milionarios",
    "Como marcas criam desejo sem explicar demais",
    "A mansao que virou simbolo de poder",
    "O que carros de luxo comunicam de verdade",
    "A estetica do dinheiro antigo",
    "Por que ricos investem em arte",
    "O poder dos clubes privados",
    "A mentalidade de propriedade versus consumo",
    "Como bilionarios protegem sua imagem",
    "O detalhe que transforma produto em objeto premium"
  ],
  mystery: [
    "O caso que confundiu investigadores por 30 anos",
    "A ligacao feita minutos antes do desaparecimento",
    "O quarto fechado sem explicacao",
    "A pista pequena que mudou uma investigacao",
    "O mapa encontrado tarde demais",
    "A testemunha que sumiu depois do depoimento",
    "A cidade que viveu uma noite de panico",
    "O arquivo policial que nunca foi encerrado",
    "A carta anonima recebida no dia errado",
    "O objeto encontrado no local impossivel",
    "A camera que gravou apenas uma sombra",
    "O codigo deixado na parede",
    "A chamada de emergencia sem voz",
    "O diario que revelou uma segunda versao",
    "O trem que chegou sem passageiro",
    "A mala esquecida em uma estacao",
    "O suspeito que sabia detalhes demais",
    "A luz vista antes do desaparecimento",
    "O retrato que nao deveria existir",
    "A verdade por tras do ultimo bilhete"
  ],
  top10: [
    "10 lugares que parecem de outro planeta",
    "10 fatos historicos que parecem inventados",
    "10 animais extintos que assustam cientistas",
    "10 tecnologias que chegaram cedo demais",
    "10 cidades abandonadas com historias estranhas",
    "10 erros caros cometidos por grandes empresas",
    "10 reis que mudaram o mundo",
    "10 descobertas feitas por acidente",
    "10 regras bizarras de aeroportos",
    "10 objetos antigos sem explicacao",
    "10 habitos que aumentam produtividade",
    "10 filmes baseados em casos reais",
    "10 marcas que quase faliram",
    "10 curiosidades sobre o espaco",
    "10 segredos de obras famosas",
    "10 paises com leis inesperadas",
    "10 invenções que salvaram vidas",
    "10 estrategias militares geniais",
    "10 historias de sobrevivencia extrema",
    "10 misterios que ainda intrigam especialistas"
  ]
};

const defaultTemplateTopics = [
  "A origem escondida deste fenomeno",
  "O erro que mudou tudo",
  "A decisao que ninguem percebeu",
  "O detalhe ignorado por especialistas",
  "A historia completa em poucos minutos",
  "O antes e depois que surpreende",
  "A pessoa que viu tudo acontecer",
  "O plano que quase deu errado",
  "A verdade por tras do mito",
  "O episodio que virou lenda",
  "A regra simples que explica o caso",
  "O momento exato da virada",
  "A comparacao que revela o segredo",
  "A consequencia que ninguem esperava",
  "O bastidor que muda a leitura",
  "A falha que criou uma oportunidade",
  "O simbolo que aparece em toda historia",
  "A cena final que explica o inicio",
  "O caminho mais rapido para entender",
  "A licao pratica para aplicar hoje"
];

function topics(key: string) {
  return templateTopicSets[key] ?? defaultTemplateTopics;
}

function promptsFor(name: string, tone: string): PremiumTemplate["prompts"] {
  return {
    script: `Crie um roteiro para ${name} com abertura forte, desenvolvimento claro e CTA final. Tom: ${tone}.`,
    visual: `Gere prompts visuais consistentes para ${name}, mantendo estilo, composicao e paleta premium.`,
    thumbnail: `Crie uma thumbnail de alto impacto para ${name}, com contraste, foco visual e texto curto.`,
    title: `Gere 12 titulos virais e comerciais para ${name}, evitando clickbait vazio.`,
    description: `Escreva uma descricao SEO para ${name}, com resumo, CTA e hashtags contextuais.`,
    caption: `Crie legenda curta para redes sociais com CTA e variacoes para Shorts, Reels e TikTok.`,
    opening: `Crie uma abertura de 3 segundos para ${name}, com promessa clara e tensao inicial.`,
    closing: `Crie um encerramento para ${name}, conectando a licao final com uma acao do publico.`
  };
}

function titleExamples(name: string) {
  return [
    `O detalhe de ${name} que quase ninguem percebe`,
    `A verdade por tras de ${name}`,
    `Antes de julgar ${name}, entenda isso`,
    `O erro que mudou ${name} para sempre`,
    `Por que ${name} ainda impressiona especialistas`
  ];
}

export const premiumTemplates: PremiumTemplate[] = [
  { id: "premium_template_1", workspaceId: "ws_1", name: "Canal Dark de Curiosidades", description: "Shorts escuros, ritmo rapido, fatos raros e narracao grave para retencao alta.", category: "Canal Dark", niche: "Curiosidades", language: "pt-BR", visualStyle: "sombrio", narrativeType: "curiosidade", defaultVoiceId: "mock_deep", defaultDuration: "60s", defaultFormat: "shorts", scriptPrompt: "Curiosidade com misterio, prova e virada final.", imagePromptStyle: "dark cinematic, high contrast, dramatic shadows", thumbnailPrompt: "fundo escuro, objeto central, texto curto amarelo", subtitleStyle: "tiktok", musicMood: "suspense", tags: ["dark", "curiosidades", "shorts"], status: "active", prompts: promptsFor("Canal Dark de Curiosidades", "misterioso e direto"), topicExamples: topics("dark_curiosities"), titleExamples: titleExamples("curiosidades sombrias"), previewImageUrl: "/media/mock-thumbnail-6.jpg", score: { ease: 88, estimatedCost: 34, viralPotential: 92, monetizationPotential: 71, visualComplexity: 42 }, favorite: true, usageCount: 128, videosGenerated: 286, creditsConsumed: 4820, channelsCreated: 18, completionRate: 91, isGlobal: true, isFeatured: true, createdAt: "2026-06-08", updatedAt: "2026-06-08" },
  { id: "premium_template_2", workspaceId: "ws_1", name: "Historias Biblicas Cinematograficas", description: "Narrativas biblicas emocionais com cenas epicas, trilha religiosa e thumbnails solenes.", category: "Historias Biblicas", niche: "Religiao", language: "pt-BR", visualStyle: "religioso", narrativeType: "historia_religiosa", defaultVoiceId: "alloy", defaultDuration: "3m", defaultFormat: "youtube_long", scriptPrompt: "Conte a passagem com contexto, conflito, emocao e aplicacao moderna.", imagePromptStyle: "biblical cinematic, desert light, ancient robes, sacred atmosphere", thumbnailPrompt: "personagem biblico central, luz divina, texto reverente", subtitleStyle: "documentary", musicMood: "religious", tags: ["biblia", "religiao", "documentario"], status: "active", prompts: promptsFor("Historias Biblicas Cinematograficas", "emocional e reverente"), topicExamples: topics("biblical"), titleExamples: titleExamples("historias biblicas"), previewImageUrl: "/media/mock-thumbnail-4.jpg", score: { ease: 72, estimatedCost: 62, viralPotential: 84, monetizationPotential: 88, visualComplexity: 74 }, favorite: true, usageCount: 96, videosGenerated: 144, creditsConsumed: 6120, channelsCreated: 14, completionRate: 87, isGlobal: true, isFeatured: true, createdAt: "2026-06-08", updatedAt: "2026-06-08" },
  { id: "premium_template_3", workspaceId: "ws_1", name: "Estoicismo com Anime", description: "Licoes estoicas com visual anime, tom disciplinado e estrutura curta para Reels e TikTok.", category: "Anime Filosofico", niche: "Estoicismo", language: "pt-BR", visualStyle: "anime", narrativeType: "motivacional", defaultVoiceId: "nova", defaultDuration: "60s", defaultFormat: "reels", scriptPrompt: "Transforme uma licao estoica em narrativa anime com conflito interno e decisao final.", imagePromptStyle: "anime cinematic, disciplined warrior, minimal color accents", thumbnailPrompt: "personagem anime serio, fundo limpo, frase curta", subtitleStyle: "popup", musicMood: "emotional", tags: ["estoicismo", "anime", "motivacional"], status: "active", prompts: promptsFor("Estoicismo com Anime", "firme e inspirador"), topicExamples: topics("stoic_anime"), titleExamples: titleExamples("estoicismo com anime"), previewImageUrl: "/media/mock-thumbnail-5.jpg", score: { ease: 82, estimatedCost: 48, viralPotential: 89, monetizationPotential: 79, visualComplexity: 58 }, favorite: true, usageCount: 111, videosGenerated: 221, creditsConsumed: 3890, channelsCreated: 16, completionRate: 93, isGlobal: true, isFeatured: true, createdAt: "2026-06-08", updatedAt: "2026-06-08" },
  { id: "premium_template_4", workspaceId: "ws_1", name: "Imperio Romano Preto e Branco", description: "Historia antiga com estetica monocromatica, textura de filme e narracao documental.", category: "Historia", niche: "Historia", language: "pt-BR", visualStyle: "preto_e_branco", narrativeType: "documentario", defaultVoiceId: "alloy", defaultDuration: "5m", defaultFormat: "youtube_long", scriptPrompt: "Explique um evento romano com contexto, personagens, tensao politica e consequencia.", imagePromptStyle: "black and white roman empire, film grain, marble, legionary atmosphere", thumbnailPrompt: "imperador romano em preto e branco, alto contraste", subtitleStyle: "documentary", musicMood: "documentary", tags: ["roma", "historia", "documentario"], status: "active", prompts: promptsFor("Imperio Romano Preto e Branco", "historico e dramatico"), topicExamples: topics("roman_bw"), titleExamples: titleExamples("Imperio Romano"), previewImageUrl: "/media/mock-thumbnail-3.jpg", score: { ease: 67, estimatedCost: 70, viralPotential: 76, monetizationPotential: 81, visualComplexity: 82 }, favorite: false, usageCount: 54, videosGenerated: 92, creditsConsumed: 2940, channelsCreated: 6, completionRate: 79, isGlobal: true, isFeatured: false, createdAt: "2026-06-08", updatedAt: "2026-06-08" },
  { id: "premium_template_5", workspaceId: "ws_1", name: "Luxo e Bilionarios", description: "Conteudos sobre riqueza, status, marcas premium e mentalidade financeira com visual elegante.", category: "Luxo", niche: "Financas", language: "pt-BR", visualStyle: "luxo", narrativeType: "educacional", defaultVoiceId: "echo", defaultDuration: "90s", defaultFormat: "shorts", scriptPrompt: "Mostre um habito, objeto ou decisao de alto valor com explicacao simples e aspiracional.", imagePromptStyle: "luxury editorial, black glass, gold detail, premium lifestyle", thumbnailPrompt: "objeto de luxo central, luz precisa, texto minimo", subtitleStyle: "minimal", musicMood: "calm", tags: ["luxo", "bilionarios", "riqueza"], status: "active", prompts: promptsFor("Luxo e Bilionarios", "elegante e objetivo"), topicExamples: topics("luxury"), titleExamples: titleExamples("luxo e bilionarios"), previewImageUrl: "/media/mock-thumbnail-2.jpg", score: { ease: 79, estimatedCost: 44, viralPotential: 82, monetizationPotential: 94, visualComplexity: 52 }, favorite: false, usageCount: 77, videosGenerated: 168, creditsConsumed: 3604, channelsCreated: 9, completionRate: 86, isGlobal: true, isFeatured: true, createdAt: "2026-06-08", updatedAt: "2026-06-08" },
  { id: "premium_template_6", workspaceId: "ws_1", name: "Crimes e Misterios", description: "Casos narrados com suspense, pistas, linha do tempo e visual investigativo.", category: "Misterios", niche: "Misterios", language: "pt-BR", visualStyle: "sombrio", narrativeType: "misterio", defaultVoiceId: "mock_deep", defaultDuration: "3m", defaultFormat: "youtube_long", scriptPrompt: "Monte uma historia investigativa com caso, linha do tempo, pistas e fechamento responsavel.", imagePromptStyle: "noir investigation, rain, evidence board, dark cinematic", thumbnailPrompt: "silhueta, fita policial, pergunta curta", subtitleStyle: "documentary", musicMood: "suspense", tags: ["crime", "misterio", "investigacao"], status: "active", prompts: promptsFor("Crimes e Misterios", "tenso e responsavel"), topicExamples: topics("mystery"), titleExamples: titleExamples("crimes e misterios"), previewImageUrl: "/media/mock-thumbnail-6.jpg", score: { ease: 65, estimatedCost: 58, viralPotential: 91, monetizationPotential: 76, visualComplexity: 68 }, favorite: false, usageCount: 83, videosGenerated: 134, creditsConsumed: 4202, channelsCreated: 10, completionRate: 80, isGlobal: true, isFeatured: true, createdAt: "2026-06-08", updatedAt: "2026-06-08" },
  { id: "premium_template_7", workspaceId: "ws_1", name: "Top 10 Curiosidades", description: "Formato escalavel para listas, rankings e curiosidades com alta producao em massa.", category: "Top 10", niche: "Curiosidades", language: "pt-BR", visualStyle: "cinematografico", narrativeType: "top_10", defaultVoiceId: "alloy", defaultDuration: "90s", defaultFormat: "shorts", scriptPrompt: "Crie lista numerada com ritmo, surpresa progressiva e item final mais forte.", imagePromptStyle: "fast editorial montage, clear subject per item, dynamic lighting", thumbnailPrompt: "numero grande, tres elementos visuais, contraste alto", subtitleStyle: "tiktok", musicMood: "energetic", tags: ["top10", "curiosidades", "listas"], status: "active", prompts: promptsFor("Top 10 Curiosidades", "rapido e surpreendente"), topicExamples: topics("top10"), titleExamples: titleExamples("Top 10 Curiosidades"), previewImageUrl: "/media/mock-thumbnail-1.jpg", score: { ease: 94, estimatedCost: 30, viralPotential: 87, monetizationPotential: 72, visualComplexity: 36 }, favorite: true, usageCount: 142, videosGenerated: 402, creditsConsumed: 5180, channelsCreated: 19, completionRate: 95, isGlobal: true, isFeatured: true, createdAt: "2026-06-08", updatedAt: "2026-06-08" },
  { id: "premium_template_8", workspaceId: "ws_1", name: "Biografias Inspiradoras", description: "Historia de pessoas, viradas de vida, fracasso, resiliencia e legado.", category: "Biografias", niche: "Biografias", language: "pt-BR", visualStyle: "documentario", narrativeType: "biografia", defaultVoiceId: "nova", defaultDuration: "5m", defaultFormat: "youtube_long", scriptPrompt: "Construa biografia com infancia, conflito, ponto de virada, conquista e licao.", imagePromptStyle: "documentary portrait, archival mood, soft cinematic lighting", thumbnailPrompt: "rosto central, contraste emocional, texto de impacto", subtitleStyle: "documentary", musicMood: "emotional", tags: ["biografia", "inspiracao", "historia"], status: "active", prompts: promptsFor("Biografias Inspiradoras", "humano e emocional"), topicExamples: defaultTemplateTopics, titleExamples: titleExamples("biografias inspiradoras"), previewImageUrl: "/media/mock-thumbnail-4.jpg", score: { ease: 70, estimatedCost: 66, viralPotential: 79, monetizationPotential: 83, visualComplexity: 64 }, favorite: false, usageCount: 49, videosGenerated: 77, creditsConsumed: 2520, channelsCreated: 5, completionRate: 78, isGlobal: true, isFeatured: false, createdAt: "2026-06-08", updatedAt: "2026-06-08" },
  { id: "premium_template_9", workspaceId: "ws_1", name: "Comparativo de Marcas", description: "Analises lado a lado de marcas, produtos e estrategias comerciais.", category: "Comparativo de Marcas", niche: "Marketing", language: "pt-BR", visualStyle: "minimalista", narrativeType: "comparativo", defaultVoiceId: "alloy", defaultDuration: "3m", defaultFormat: "horizontal", scriptPrompt: "Compare duas marcas por proposta, produto, estrategia, publico, erro e vencedor por criterio.", imagePromptStyle: "clean brand comparison, editorial layout, neutral premium background", thumbnailPrompt: "duas marcas separadas, versus central, texto curto", subtitleStyle: "clean", musicMood: "calm", tags: ["marcas", "comparativo", "negocios"], status: "active", prompts: promptsFor("Comparativo de Marcas", "analitico e comercial"), topicExamples: defaultTemplateTopics, titleExamples: titleExamples("comparativo de marcas"), previewImageUrl: "/media/mock-thumbnail-2.jpg", score: { ease: 76, estimatedCost: 38, viralPotential: 73, monetizationPotential: 89, visualComplexity: 46 }, favorite: false, usageCount: 58, videosGenerated: 104, creditsConsumed: 2410, channelsCreated: 7, completionRate: 84, isGlobal: true, isFeatured: false, createdAt: "2026-06-08", updatedAt: "2026-06-08" },
  { id: "premium_template_10", workspaceId: "ws_1", name: "Documentarios Curtos", description: "Mini-documentarios com arco claro, imagens documentais e narrativa densa.", category: "Documentario", niche: "Documentario", language: "pt-BR", visualStyle: "documentario", narrativeType: "documentario", defaultVoiceId: "echo", defaultDuration: "5m", defaultFormat: "youtube_long", scriptPrompt: "Crie mini-doc com problema, contexto, evidencias, impacto e conclusao memoravel.", imagePromptStyle: "documentary cinematic, realistic texture, natural light", thumbnailPrompt: "cena realista central, contraste moderado, texto editorial", subtitleStyle: "documentary", musicMood: "documentary", tags: ["documentario", "mini-doc", "youtube"], status: "active", prompts: promptsFor("Documentarios Curtos", "editorial e envolvente"), topicExamples: defaultTemplateTopics, titleExamples: titleExamples("documentarios curtos"), previewImageUrl: "/media/mock-thumbnail-3.jpg", score: { ease: 61, estimatedCost: 74, viralPotential: 75, monetizationPotential: 86, visualComplexity: 78 }, favorite: false, usageCount: 44, videosGenerated: 68, creditsConsumed: 3300, channelsCreated: 4, completionRate: 74, isGlobal: true, isFeatured: false, createdAt: "2026-06-08", updatedAt: "2026-06-08" },
  { id: "premium_template_11", workspaceId: "ws_1", name: "Motivacional Masculino", description: "Mensagens de disciplina, responsabilidade e rotina com visual forte e direto.", category: "Motivacional", niche: "Desenvolvimento Pessoal", language: "pt-BR", visualStyle: "minimalista", narrativeType: "motivacional", defaultVoiceId: "mock_deep", defaultDuration: "60s", defaultFormat: "reels", scriptPrompt: "Crie roteiro motivacional com chamada dura, exemplo cotidiano e acao concreta.", imagePromptStyle: "masculine discipline, gym shadow, city night, minimal contrast", thumbnailPrompt: "homem em sombra, palavra curta, contraste forte", subtitleStyle: "bold", musicMood: "energetic", tags: ["motivacional", "disciplina", "masculino"], status: "active", prompts: promptsFor("Motivacional Masculino", "intenso e pratico"), topicExamples: defaultTemplateTopics, titleExamples: titleExamples("motivacional masculino"), previewImageUrl: "/media/mock-thumbnail-5.jpg", score: { ease: 91, estimatedCost: 28, viralPotential: 80, monetizationPotential: 77, visualComplexity: 34 }, favorite: false, usageCount: 73, videosGenerated: 210, creditsConsumed: 2100, channelsCreated: 8, completionRate: 90, isGlobal: true, isFeatured: false, createdAt: "2026-06-08", updatedAt: "2026-06-08" },
  { id: "premium_template_12", workspaceId: "ws_1", name: "Historia Mundial", description: "Eventos historicos mundiais em narrativa clara para videos longos e shorts derivados.", category: "Historia", niche: "Historia Mundial", language: "pt-BR", visualStyle: "historico", narrativeType: "historia_real", defaultVoiceId: "alloy", defaultDuration: "5m", defaultFormat: "youtube_long", scriptPrompt: "Explique evento historico com causas, personagens, conflito e consequencias modernas.", imagePromptStyle: "historical documentary, maps, archival light, realistic scenes", thumbnailPrompt: "mapa ou personagem historico, texto forte", subtitleStyle: "documentary", musicMood: "documentary", tags: ["historia", "mundo", "documentario"], status: "active", prompts: promptsFor("Historia Mundial", "didatico e dramatico"), topicExamples: defaultTemplateTopics, titleExamples: titleExamples("historia mundial"), previewImageUrl: "/media/mock-thumbnail-3.jpg", score: { ease: 68, estimatedCost: 64, viralPotential: 78, monetizationPotential: 84, visualComplexity: 70 }, favorite: false, usageCount: 61, videosGenerated: 119, creditsConsumed: 3090, channelsCreated: 7, completionRate: 82, isGlobal: true, isFeatured: false, createdAt: "2026-06-08", updatedAt: "2026-06-08" },
  { id: "premium_template_13", workspaceId: "ws_1", name: "Religiao Narrativa", description: "Conteudos religiosos reflexivos com narracao serena, aplicacao moral e visual sobrio.", category: "Historias Biblicas", niche: "Religiao", language: "pt-BR", visualStyle: "religioso", narrativeType: "historia_religiosa", defaultVoiceId: "nova", defaultDuration: "90s", defaultFormat: "shorts", scriptPrompt: "Crie narrativa religiosa curta com passagem, emocao e reflexao final.", imagePromptStyle: "sacred calm, warm light, respectful religious atmosphere", thumbnailPrompt: "luz suave, personagem reverente, texto curto", subtitleStyle: "clean", musicMood: "religious", tags: ["religiao", "reflexao", "fe"], status: "active", prompts: promptsFor("Religiao Narrativa", "sereno e reflexivo"), topicExamples: topics("biblical"), titleExamples: titleExamples("religiao narrativa"), previewImageUrl: "/media/mock-thumbnail-4.jpg", score: { ease: 82, estimatedCost: 36, viralPotential: 77, monetizationPotential: 82, visualComplexity: 48 }, favorite: false, usageCount: 66, videosGenerated: 151, creditsConsumed: 2780, channelsCreated: 8, completionRate: 88, isGlobal: true, isFeatured: false, createdAt: "2026-06-08", updatedAt: "2026-06-08" },
  { id: "premium_template_14", workspaceId: "ws_1", name: "Fatos Assustadores", description: "Fatos reais, clima tenso, som suspense e cortes rapidos para canais dark.", category: "Misterios", niche: "Terror Leve", language: "pt-BR", visualStyle: "sombrio", narrativeType: "misterio", defaultVoiceId: "mock_deep", defaultDuration: "60s", defaultFormat: "shorts", scriptPrompt: "Apresente fato assustador com prova, contexto e virada final sem gore.", imagePromptStyle: "eerie cinematic, fog, empty hallway, dark but readable", thumbnailPrompt: "cena escura, detalhe estranho, pergunta curta", subtitleStyle: "tiktok", musicMood: "suspense", tags: ["assustador", "dark", "fatos"], status: "active", prompts: promptsFor("Fatos Assustadores", "tenso e controlado"), topicExamples: topics("mystery"), titleExamples: titleExamples("fatos assustadores"), previewImageUrl: "/media/mock-thumbnail-6.jpg", score: { ease: 87, estimatedCost: 32, viralPotential: 90, monetizationPotential: 69, visualComplexity: 44 }, favorite: true, usageCount: 102, videosGenerated: 263, creditsConsumed: 3410, channelsCreated: 13, completionRate: 92, isGlobal: true, isFeatured: true, createdAt: "2026-06-08", updatedAt: "2026-06-08" },
  { id: "premium_template_15", workspaceId: "ws_1", name: "Tecnologia Futurista", description: "IA, gadgets, ciencia e futuro com visual neon premium e explicacao simples.", category: "Curiosidades", niche: "Tecnologia", language: "pt-BR", visualStyle: "futurista", narrativeType: "educacional", defaultVoiceId: "alloy", defaultDuration: "90s", defaultFormat: "shorts", scriptPrompt: "Explique tecnologia futura com problema, solucao, impacto e risco.", imagePromptStyle: "futuristic technology, clean neon, glass interface, premium sci-fi", thumbnailPrompt: "objeto tecnologico central, neon discreto, texto claro", subtitleStyle: "clean", musicMood: "energetic", tags: ["tecnologia", "futuro", "ia"], status: "active", prompts: promptsFor("Tecnologia Futurista", "claro e visionario"), topicExamples: defaultTemplateTopics, titleExamples: titleExamples("tecnologia futurista"), previewImageUrl: "/media/mock-thumbnail-1.jpg", score: { ease: 84, estimatedCost: 40, viralPotential: 85, monetizationPotential: 87, visualComplexity: 54 }, favorite: false, usageCount: 90, videosGenerated: 198, creditsConsumed: 3908, channelsCreated: 11, completionRate: 89, isGlobal: true, isFeatured: true, createdAt: "2026-06-08", updatedAt: "2026-06-08" }
];

export const templatePacks: TemplatePack[] = [
  { id: "template_pack_shorts", workspaceId: "ws_1", name: "Pack YouTube Shorts", description: "Templates de alta velocidade para videos verticais em escala.", category: "Shorts", templatesCount: 5, status: "active", createdAt: "2026-06-08" },
  { id: "template_pack_long", workspaceId: "ws_1", name: "Pack Videos Longos", description: "Roteiros densos para documentarios, historia e biografias.", category: "Longos", templatesCount: 4, status: "active", createdAt: "2026-06-08" },
  { id: "template_pack_biblical", workspaceId: "ws_1", name: "Pack Historias Biblicas", description: "Narrativas religiosas, reflexoes e passagens cinematograficas.", category: "Religiao", templatesCount: 2, status: "active", createdAt: "2026-06-08" },
  { id: "template_pack_stoic", workspaceId: "ws_1", name: "Pack Estoicismo", description: "Templates para disciplina, filosofia e anime filosofico.", category: "Estoicismo", templatesCount: 2, status: "active", createdAt: "2026-06-08" },
  { id: "template_pack_luxury", workspaceId: "ws_1", name: "Pack Luxo", description: "Conteudos premium sobre marcas, bilionarios e riqueza.", category: "Luxo", templatesCount: 2, status: "active", createdAt: "2026-06-08" },
  { id: "template_pack_mystery", workspaceId: "ws_1", name: "Pack Misterio", description: "Suspense, fatos assustadores, casos e curiosidades dark.", category: "Misterio", templatesCount: 3, status: "active", createdAt: "2026-06-08" },
  { id: "template_pack_documentary", workspaceId: "ws_1", name: "Pack Documentario", description: "Mini-docs, historia mundial e narrativas editoriais.", category: "Documentario", templatesCount: 3, status: "active", createdAt: "2026-06-08" }
];

export const templatePackItems: TemplatePackItem[] = [
  { id: "template_pack_item_1", workspaceId: "ws_1", templatePackId: "template_pack_shorts", templateId: "premium_template_1", createdAt: "2026-06-08" },
  { id: "template_pack_item_2", workspaceId: "ws_1", templatePackId: "template_pack_shorts", templateId: "premium_template_3", createdAt: "2026-06-08" },
  { id: "template_pack_item_3", workspaceId: "ws_1", templatePackId: "template_pack_shorts", templateId: "premium_template_7", createdAt: "2026-06-08" },
  { id: "template_pack_item_4", workspaceId: "ws_1", templatePackId: "template_pack_long", templateId: "premium_template_2", createdAt: "2026-06-08" },
  { id: "template_pack_item_5", workspaceId: "ws_1", templatePackId: "template_pack_long", templateId: "premium_template_4", createdAt: "2026-06-08" },
  { id: "template_pack_item_6", workspaceId: "ws_1", templatePackId: "template_pack_biblical", templateId: "premium_template_2", createdAt: "2026-06-08" },
  { id: "template_pack_item_7", workspaceId: "ws_1", templatePackId: "template_pack_stoic", templateId: "premium_template_3", createdAt: "2026-06-08" },
  { id: "template_pack_item_8", workspaceId: "ws_1", templatePackId: "template_pack_luxury", templateId: "premium_template_5", createdAt: "2026-06-08" },
  { id: "template_pack_item_9", workspaceId: "ws_1", templatePackId: "template_pack_mystery", templateId: "premium_template_6", createdAt: "2026-06-08" },
  { id: "template_pack_item_10", workspaceId: "ws_1", templatePackId: "template_pack_documentary", templateId: "premium_template_10", createdAt: "2026-06-08" }
];

export const onboardingProgressItems: OnboardingProgress[] = [
  {
    id: "onboarding_progress_1",
    workspaceId: "ws_1",
    userId: "user_1",
    currentStep: "result",
    completedSteps: ["objective", "niche", "template", "channel", "voice", "visual", "first_video", "processing"],
    completed: false,
    createdAt: "2026-06-08 15:00",
    updatedAt: "2026-06-08 15:07"
  }
];

export const onboardingEvents: OnboardingEvent[] = [
  { id: "onboarding_event_1", workspaceId: "ws_1", userId: "user_1", eventName: "onboarding_started", step: "objective", createdAt: "2026-06-08 15:00" },
  { id: "onboarding_event_2", workspaceId: "ws_1", userId: "user_1", eventName: "template_selected", step: "template", createdAt: "2026-06-08 15:02" },
  { id: "onboarding_event_3", workspaceId: "ws_1", userId: "user_1", eventName: "channel_created", step: "channel", createdAt: "2026-06-08 15:03" },
  { id: "onboarding_event_4", workspaceId: "ws_1", userId: "user_1", eventName: "first_video_generated", step: "processing", createdAt: "2026-06-08 15:06" },
  { id: "onboarding_event_5", workspaceId: "ws_1", userId: "user_1", eventName: "onboarding_completed", step: "result", createdAt: "2026-06-08 15:08" }
];

export const activationChecklist: ActivationChecklistItem[] = [
  { id: "activation_1", label: "Criou canal", completed: true, href: "/app/channels" },
  { id: "activation_2", label: "Escolheu template", completed: true, href: "/app/templates" },
  { id: "activation_3", label: "Gerou primeiro video", completed: true, href: "/app/magic" },
  { id: "activation_4", label: "Renderizou video", completed: false, href: "/app/videos/video_1/editor" },
  { id: "activation_5", label: "Gerou thumbnail", completed: true, href: "/app/videos/video_1/thumbnails" },
  { id: "activation_6", label: "Baixou video", completed: false, href: "/app/export-center" }
];

export const demoWorkspace = {
  id: "demo_workspace",
  name: "Demo Workspace",
  channels: channels.slice(0, 3),
  videos: videoProjects.slice(0, 3),
  templates: premiumTemplates.slice(0, 6),
  thumbnails: ["/media/mock-thumbnail-1.jpg", "/media/mock-thumbnail-2.jpg", "/media/mock-thumbnail-3.jpg"],
  assets: assetLibraryItems.slice(0, 4)
};

function countBy<T, K extends keyof T>(items: T[], key: K) {
  return items.reduce<Record<string, number>>((acc, item) => {
    const value = String(item[key]);
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
}
