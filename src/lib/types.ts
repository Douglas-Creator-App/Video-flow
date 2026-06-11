export type RoleName = "Owner" | "Admin" | "Manager" | "Editor" | "Viewer";

export type PermissionAction =
  | "workspace.manage"
  | "admin.manage"
  | "users.invite"
  | "users.remove"
  | "roles.manage"
  | "projects.create"
  | "projects.update"
  | "content.create"
  | "content.publish"
  | "content.organize"
  | "library.manage"
  | "keywords.manage"
  | "personas.manage"
  | "ai.generate"
  | "ai.manage"
  | "media.generate"
  | "media.manage"
  | "billing.manage"
  | "export_video"
  | "download_package"
  | "mark_as_published"
  | "edit_metadata"
  | "upload_asset"
  | "delete_asset"
  | "edit_asset"
  | "favorite_asset"
  | "create_collection"
  | "import_external_asset"
  | "view_templates"
  | "create_template"
  | "edit_template"
  | "delete_template"
  | "use_template"
  | "manage_template_packs"
  | "audit.read";

export type AuditAction = "login" | "logout" | "create" | "delete" | "update";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: "Starter" | "Growth" | "Scale";
}

export interface WorkspaceUser {
  id: string;
  name: string;
  email: string;
  role: RoleName;
  status: "Ativo" | "Pendente";
}

export type ProjectStatus = "ativo" | "arquivado";
export type ContentStatus = "rascunho" | "aprovado" | "publicado" | "arquivado";
export type ContentType =
  | "Ideia"
  | "Roteiro"
  | "Artigo"
  | "Carrossel"
  | "Vídeo"
  | "Shorts"
  | "Reels"
  | "Email"
  | "Copy"
  | "Anúncio";

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  mainNiche: string;
  logo: string;
  primaryColor: string;
  language: string;
  country: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Niche {
  id: string;
  workspaceId?: string;
  name: string;
  isDefault: boolean;
  active: boolean;
}

export interface Persona {
  id: string;
  workspaceId: string;
  projectId: string;
  name: string;
  age: number;
  gender: string;
  profession: string;
  pains: string[];
  goals: string[];
  objections: string[];
  desires: string[];
  interests: string[];
}

export interface Keyword {
  id: string;
  workspaceId: string;
  projectId: string;
  nicheId: string;
  word: string;
  volume: number;
  difficulty: number;
  intent: "informacional" | "comercial" | "transacional" | "navegacional";
  category: string;
}

export interface ContentTag {
  id: string;
  workspaceId: string;
  name: string;
  color: string;
  active: boolean;
}

export interface ContentItem {
  id: string;
  workspaceId: string;
  projectId: string;
  folderId: string;
  type: ContentType;
  title: string;
  description: string;
  category: string;
  status: ContentStatus;
  tags: string[];
  author: string;
  createdAt: string;
}

export interface ContentFolder {
  id: string;
  workspaceId: string;
  projectId: string;
  name: string;
  type: "ideias" | "roteiros" | "videos" | "carrosseis" | "anuncios" | "publicados";
  archived: boolean;
}

export interface Favorite {
  id: string;
  workspaceId: string;
  entityType: "content" | "project" | "keyword" | "persona";
  entityId: string;
}

export type TrendPlatform =
  | "YouTube"
  | "YouTube Shorts"
  | "TikTok"
  | "Instagram Reels"
  | "Facebook Reels"
  | "Google Trends"
  | "Notícias"
  | "Reddit"
  | "X/Twitter"
  | "LinkedIn";

export type TrendStatus = "nova" | "analisada" | "aprovada" | "descartada" | "transformada em ideia";
export type CompetitorStatus = "ativo" | "monitorando" | "pausado" | "arquivado";
export type IdeaSourceType = "manual" | "trend" | "competitor" | "keyword" | "ai_suggestion" | "imported";
export type IdeaFormat = "short_video" | "long_video" | "carousel" | "post" | "article" | "email" | "ad" | "whatsapp_message";
export type IdeaObjective = "awareness" | "engagement" | "lead_generation" | "sales" | "authority" | "education" | "retention";
export type FunnelStage = "topo" | "meio" | "fundo" | "pós-venda";
export type IdeaStatus =
  | "rascunho"
  | "em_análise"
  | "aprovada"
  | "em_produção"
  | "produzida"
  | "publicada"
  | "arquivada"
  | "descartada";

export interface Trend {
  id: string;
  workspaceId: string;
  projectId: string;
  title: string;
  description: string;
  platform: TrendPlatform;
  niche: string;
  country: string;
  language: string;
  mainKeyword: string;
  estimatedVolume: number;
  estimatedGrowth: number;
  competitionLevel: "baixa" | "média" | "alta";
  viralPotential: number;
  discoveredAt: string;
  status: TrendStatus;
  source: string;
  externalUrl?: string;
}

export interface Competitor {
  id: string;
  workspaceId: string;
  projectId: string;
  name: string;
  platform: TrendPlatform;
  url: string;
  niche: string;
  country: string;
  language: string;
  notes: string;
  status: CompetitorStatus;
}

export interface CompetitorInsight {
  id: string;
  competitorId: string;
  contentCount: number;
  averageViews: number;
  topThemes: string[];
  topFormats: string[];
  postingFrequency: string;
  recurringHooks: string[];
  ctas: string[];
}

export interface ContentIdea {
  id: string;
  workspaceId: string;
  projectId: string;
  title: string;
  description: string;
  niche: string;
  personaId?: string;
  sourceType: IdeaSourceType;
  sourceUrl?: string;
  platformOrigin: TrendPlatform | "Manual";
  formatSuggestion: IdeaFormat;
  hook: string;
  angle: string;
  objective: IdeaObjective;
  funnelStage: FunnelStage;
  viralScore: number;
  commercialScore: number;
  difficultyScore: number;
  priorityScore: number;
  status: IdeaStatus;
  tags: string[];
  notes: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface IdeaSource {
  id: string;
  workspaceId: string;
  projectId: string;
  url?: string;
  title: string;
  notes: string;
  platform: TrendPlatform | "Manual";
  niche: string;
}

export interface IdeaEvent {
  id: string;
  ideaId: string;
  event: "ideia criada" | "ideia aprovada" | "ideia descartada" | "ideia transformada" | "ideia editada" | "ideia duplicada";
  actor: string;
  createdAt: string;
}

export type AiProviderType = "openai" | "gemini" | "claude";
export type AiProviderStatus = "active" | "inactive" | "error";
export type PromptStatus = "active" | "draft" | "archived";
export type PromptCategory =
  | "roteiro"
  | "título"
  | "gancho"
  | "carrossel"
  | "artigo"
  | "email"
  | "anúncio"
  | "whatsapp"
  | "descrição youtube"
  | "seo";
export type AiGenerationStatus = "aguardando" | "processando" | "concluído" | "erro";

export interface AiProviderConfig {
  id: string;
  workspaceId: string;
  name: string;
  provider: AiProviderType;
  status: AiProviderStatus;
  defaultModel: string;
  temperature: number;
  maxTokens: number;
  inputCost: number;
  outputCost: number;
}

export interface PromptTemplate {
  id: string;
  workspaceId: string;
  name: string;
  category: PromptCategory;
  description: string;
  systemPrompt: string;
  userPrompt: string;
  provider: AiProviderType;
  model: string;
  status: PromptStatus;
  version: number;
}

export interface AiAgent {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  personality: string;
  objective: string;
  systemPrompt: string;
  provider: AiProviderType;
  model: string;
}

export interface AiGenerationRecord {
  id: string;
  workspaceId: string;
  projectId?: string;
  contentId?: string;
  provider: AiProviderType;
  model: string;
  prompt: string;
  response: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  durationMs: number;
  status: AiGenerationStatus;
  createdAt: string;
}

export interface AiGeneratorRequest {
  generator: PromptCategory | "post";
  niche: string;
  persona?: string;
  objective: string;
  platform?: string;
  quantity?: number;
  format?: string;
  duration?: string;
  size?: string;
  type?: string;
  tone?: string;
}

export type VoiceProviderType = "elevenlabs" | "openai_tts" | "capcut_manual" | "mock";
export type ImageProviderType = "openai_images" | "flux" | "ideogram" | "google_manual" | "mock";
export type MediaStatus = "active" | "inactive" | "error";
export type GenerationJobStatus = "queued" | "processing" | "completed" | "failed";
export type MediaAssetType = "image" | "video" | "audio" | "music" | "thumbnail";
export type MediaAssetSource = "upload" | "ai_generated" | "google" | "stock" | "external_url";
export type VideoFormat = "short" | "reels" | "tiktok" | "youtube_long" | "square" | "horizontal";
export type VideoAspectRatio = "9:16" | "16:9" | "1:1";
export type VideoStatus = "draft" | "generating_assets" | "editing" | "ready_to_render" | "rendering" | "completed" | "failed";
export type MotionType =
  | "none"
  | "zoom_in"
  | "zoom_out"
  | "pan_left"
  | "pan_right"
  | "pan_up"
  | "pan_down"
  | "organic_motion"
  | "random_subtle"
  | "ai_animation";
export type TransitionType = "none" | "fade" | "slide" | "zoom" | "cinematic";
export type SubtitleStyle = "clean" | "popup" | "tiktok" | "documentary" | "bold" | "minimal";
export type MusicMood = "epic" | "emotional" | "suspense" | "calm" | "cinematic" | "energetic" | "religious" | "documentary";

export interface VoiceProviderConfig {
  id: string;
  workspaceId: string;
  name: string;
  provider: VoiceProviderType;
  status: MediaStatus;
  defaultVoiceId: string;
  defaultModel: string;
  costPerCharacter: number;
}

export interface Voice {
  id: string;
  workspaceId: string;
  provider: VoiceProviderType;
  voiceId: string;
  name: string;
  gender: string;
  language: string;
  accent: string;
  style: string;
  previewUrl?: string;
  isFavorite: boolean;
  status: MediaStatus;
}

export interface ImageProviderConfig {
  id: string;
  workspaceId: string;
  name: string;
  provider: ImageProviderType;
  status: MediaStatus;
  defaultModel: string;
  costPerImage: number;
}

export interface MediaAsset {
  id: string;
  workspaceId: string;
  projectId?: string;
  contentId?: string;
  type: MediaAssetType;
  source: MediaAssetSource;
  fileUrl: string;
  thumbnailUrl?: string;
  title: string;
  description: string;
  tags: string[];
  durationSeconds?: number;
  width?: number;
  height?: number;
  sizeBytes?: number;
  createdBy: string;
  createdAt: string;
}

export interface VideoProject {
  id: string;
  workspaceId: string;
  projectId: string;
  contentId?: string;
  title: string;
  format: VideoFormat;
  aspectRatio: VideoAspectRatio;
  durationTarget: number;
  narrationAudioUrl?: string;
  backgroundMusicUrl?: string;
  subtitleEnabled: boolean;
  subtitleStyle: SubtitleStyle;
  visualStyle: string;
  status: VideoStatus;
  renderUrl?: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VideoScene {
  id: string;
  workspaceId: string;
  videoProjectId: string;
  orderIndex: number;
  scriptText: string;
  narrationStart: number;
  narrationEnd: number;
  mediaAssetId?: string;
  imagePrompt: string;
  videoPrompt?: string;
  durationSeconds: number;
  motionType: MotionType;
  transitionType: TransitionType;
  zoomEnabled: boolean;
  organicMotionEnabled: boolean;
  status: GenerationJobStatus;
}

export interface SubtitleSegment {
  id: string;
  workspaceId: string;
  videoProjectId: string;
  startTime: number;
  endTime: number;
  text: string;
  style: SubtitleStyle;
  position: "top" | "center" | "bottom";
}

export interface MusicTrack {
  id: string;
  workspaceId: string;
  title: string;
  source: MediaAssetSource | "ai_placeholder";
  fileUrl: string;
  mood: MusicMood;
  durationSeconds: number;
  isFavorite: boolean;
  createdAt: string;
}

export interface VideoRender {
  id: string;
  workspaceId: string;
  videoProjectId: string;
  renderUrl?: string;
  status: GenerationJobStatus;
  durationSeconds: number;
  fileSize?: number;
  logs: string[];
  errorMessage?: string;
  createdAt: string;
}

export type VisualEffectType =
  | "preto_e_branco"
  | "vintage"
  | "cinematic"
  | "blur_leve"
  | "grain"
  | "vignette"
  | "sharpen"
  | "warm"
  | "cold"
  | "contrast"
  | "brightness";

export interface VisualStylePreset {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  promptPrefix: string;
  promptSuffix: string;
  negativePrompt: string;
  defaultAspectRatio: VideoAspectRatio | "4:5";
  status: MediaStatus;
  createdAt: string;
}

export interface VideoEffect {
  id: string;
  workspaceId: string;
  videoProjectId: string;
  sceneId?: string;
  effectType: VisualEffectType;
  intensity: number;
  appliesTo: "scene" | "video";
  createdAt: string;
}

export interface VideoAiProvider {
  id: string;
  workspaceId: string;
  name: string;
  provider: "runway" | "kling" | "pika" | "veo" | "luma" | "mock";
  status: MediaStatus;
  defaultModel: string;
  costPerGeneration: number;
  createdAt: string;
}

export interface ImageAnimation {
  id: string;
  workspaceId: string;
  videoProjectId: string;
  sceneId: string;
  provider: string;
  inputImageUrl: string;
  prompt: string;
  outputVideoUrl?: string;
  durationSeconds: number;
  cost: number;
  status: GenerationJobStatus;
  errorMessage?: string;
  createdAt: string;
}

export interface AdvancedSubtitleStyle {
  id: string;
  workspaceId: string;
  name: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  textColor: string;
  backgroundColor: string;
  outlineColor: string;
  shadow: boolean;
  position: "top" | "center" | "bottom";
  animation: string;
  createdAt: string;
}

export interface AudioSettings {
  id: string;
  workspaceId: string;
  videoProjectId: string;
  narrationVolume: number;
  musicVolume: number;
  fadeInSeconds: number;
  fadeOutSeconds: number;
  loopMusic: boolean;
  createdAt: string;
}

export interface ThumbnailGeneration {
  id: string;
  workspaceId: string;
  videoProjectId: string;
  provider: ImageProviderType;
  prompt: string;
  style: string;
  textOverlay: string;
  quantity: number;
  imageUrls: string[];
  selectedImageUrl?: string;
  status: GenerationJobStatus;
  cost: number;
  createdAt: string;
}

export interface VideoVersion {
  id: string;
  workspaceId: string;
  videoProjectId: string;
  versionNumber: number;
  renderUrl: string;
  thumbnailUrl?: string;
  settingsSnapshot: Record<string, unknown>;
  createdAt: string;
}

export type VideoRecommendationType = "hook" | "script" | "visual" | "subtitle" | "thumbnail" | "pacing" | "metadata";
export type VideoRecommendationSeverity = "low" | "medium" | "high" | "critical";
export type HookStrength = "fraco" | "medio" | "forte" | "muito_forte";
export type QualityBulkStatus = "aprovado" | "precisa_ajuste" | "critico";

export interface VideoQualityScore {
  id: string;
  workspaceId: string;
  videoProjectId: string;
  overallScore: number;
  hookScore: number;
  scriptScore: number;
  visualScore: number;
  subtitleScore: number;
  thumbnailScore: number;
  retentionScore: number;
  ctaScore: number;
  recommendations: string[];
  createdAt: string;
}

export interface VideoRecommendation {
  id: string;
  workspaceId: string;
  videoProjectId: string;
  type: VideoRecommendationType;
  severity: VideoRecommendationSeverity;
  message: string;
  suggestion: string;
  applied: boolean;
  ignored: boolean;
  createdAt: string;
}

export interface RetentionAnalysis {
  videoProjectId: string;
  first3Seconds: number;
  first10Seconds: number;
  sceneChangeScore: number;
  textDensityScore: number;
  visualVariationScore: number;
  ctaTimingScore: number;
  recommendations: string[];
}

export interface HookAnalysis {
  videoProjectId: string;
  strength: HookStrength;
  score: number;
  improvedVersions: string[];
}

export interface ScriptImprovement {
  videoProjectId: string;
  shorter: string;
  emotional: string;
  curious: string;
  viral: string;
  documentary: string;
}

export interface ScenePacingItem {
  sceneId: string;
  orderIndex: number;
  durationSeconds: number;
  textLength: number;
  mediaType: string;
  motionType: MotionType;
  risk: "baixo" | "medio" | "alto";
  suggestion: string;
}

export interface ThumbnailAnalysis {
  videoProjectId: string;
  contrast: number;
  clarity: number;
  shortText: number;
  emotion: number;
  curiosity: number;
  youtubeCompatibility: number;
  suggestions: string[];
}

export interface SubtitleReadabilityAnalysis {
  videoProjectId: string;
  fontSize: number;
  contrast: number;
  timeOnScreen: number;
  textAmount: number;
  position: number;
  suggestions: string[];
}

export interface PlatformOptimization {
  videoProjectId: string;
  platform: ExportPlatform;
  score: number;
  checklist: Array<{ label: string; done: boolean }>;
  suggestions: string[];
}

export interface VideoVersionComparison {
  videoProjectId: string;
  versionA: string;
  versionB: string;
  scoreA: number;
  scoreB: number;
  improvements: string[];
  differences: string[];
}

export type TrendTopicSource = "internal" | "manual" | "mock_google_trends" | "mock_youtube" | "mock_social";
export type IdeaBankStatus = "idea" | "approved" | "generating" | "produced" | "archived";
export type VideoOpportunityType = "short_version" | "series" | "continuation" | "compilation" | "long_derivative";

export interface TrendTopic {
  id: string;
  category: string;
  language: string;
  title: string;
  description: string;
  trendScore: number;
  source: TrendTopicSource;
  createdAt: string;
}

export interface IdeaBankItem {
  id: string;
  workspaceId: string;
  channelId: string;
  title: string;
  description: string;
  niche: string;
  status: IdeaBankStatus;
  score: number;
  createdAt: string;
}

export interface TopicSuggestion {
  id: string;
  channelId: string;
  niche: string;
  language: string;
  audience: string;
  theme: string;
  title: string;
  hook: string;
  thumbnailIdea: string;
  potentialScore: number;
}

export interface ContentGapRecommendation {
  id: string;
  channelId: string;
  type: "repeated_theme" | "underexplored_niche" | "format_excess" | "missing_shorts" | "missing_long";
  severity: VideoRecommendationSeverity;
  message: string;
  recommendation: string;
}

export interface VideoOpportunity {
  id: string;
  workspaceId: string;
  channelId: string;
  videoProjectId: string;
  type: VideoOpportunityType;
  title: string;
  reason: string;
  score: number;
}

export interface TitleLabResult {
  id: string;
  niche: string;
  title: string;
  hook: string;
  emotionalVersion: string;
  curiousVersion: string;
  viralVersion: string;
  score: number;
}

export interface ThumbLabIdea {
  id: string;
  title: string;
  thumbnailText: string;
  emotion: string;
  style: string;
  score: number;
}

export interface CalendarAiSuggestion {
  id: string;
  channelId: string;
  weekday: string;
  contentType: CalendarContentType;
  title: string;
  templateId: string;
  priority: number;
}

export interface ChannelHealthScore {
  channelId: string;
  overallScore: number;
  consistency: number;
  frequency: number;
  diversity: number;
  quality: number;
  templateUsage: number;
  recommendations: string[];
}

export interface TrackedChannel {
  id: string;
  workspaceId: string;
  name: string;
  niche: string;
  platform: string;
  notes: string;
  createdAt: string;
}

export interface StrategyRecommendation {
  id: string;
  workspaceId: string;
  title: string;
  description: string;
  severity: VideoRecommendationSeverity;
  module: "channels" | "templates" | "credits" | "ideas" | "quality" | "calendar";
  createdAt: string;
}

export type ContentFactoryStatus = "active" | "paused" | "archived";
export type FactoryScheduleFrequency = "hourly" | "daily" | "weekly" | "monthly";
export type FactoryJobStatus = "queued" | "generating" | "review" | "rendering" | "completed" | "failed";
export type FactoryAlertType = "low_credits" | "queue_congested" | "generation_failed" | "review_pending" | "limit_reached";
export type FactoryReviewStatus = "pending" | "approved" | "rejected" | "edited" | "resent";

export interface ContentFactory {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  channelId: string;
  templateId: string;
  status: ContentFactoryStatus;
  language: string;
  defaultVoiceId: string;
  visualStyle: string;
  defaultFormat: MagicVideoFormat;
  defaultDuration: MagicDurationTarget;
  productionFrequency: string;
  qualityGateThreshold: number;
  requireReview: boolean;
  resourcePriority: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductionRule {
  id: string;
  factoryId: string;
  ruleType: string;
  value: string;
  createdAt: string;
}

export interface FactorySchedule {
  id: string;
  factoryId: string;
  frequency: FactoryScheduleFrequency;
  runTime: string;
  timezone: string;
  enabled: boolean;
  createdAt: string;
}

export interface ContentSeries {
  id: string;
  workspaceId: string;
  channelId: string;
  name: string;
  description: string;
  status: ContentFactoryStatus;
  createdAt: string;
}

export interface FactoryQueueJob {
  id: string;
  workspaceId: string;
  factoryId: string;
  title: string;
  status: FactoryJobStatus;
  currentStep: string;
  progress: number;
  estimatedTime: string;
  creditsConsumed: number;
  qualityScore: number;
  createdAt: string;
}

export interface ReviewQueueItem {
  id: string;
  workspaceId: string;
  factoryId: string;
  videoProjectId?: string;
  title: string;
  reason: string;
  qualityScore: number;
  status: FactoryReviewStatus;
  createdAt: string;
}

export interface FactoryTemplate {
  id: string;
  name: string;
  description: string;
  templateId: string;
  defaultRules: string[];
  defaultFrequency: string;
}

export interface FactoryAlert {
  id: string;
  workspaceId: string;
  factoryId?: string;
  type: FactoryAlertType;
  title: string;
  description: string;
  severity: VideoRecommendationSeverity;
  createdAt: string;
}

export type LaunchStatus = "pending" | "in_progress" | "completed" | "error";
export type HealthStatus = "healthy" | "warning" | "critical";
export type SecretStatus = "configured" | "missing" | "invalid";
export type ProviderHealthStatus = "online" | "offline" | "missing_key" | "error";
export type BackupJobType = "database_export" | "assets_export" | "workspace_export" | "full_backup";
export type BackupJobStatus = "queued" | "running" | "completed" | "failed";
export type SecurityEventType = "login" | "failed_login" | "permission_denied" | "api_key_changed" | "workspace_suspended" | "provider_error" | "credit_block" | "admin_action";
export type SeverityLevel = "low" | "medium" | "high" | "critical";
export type DataRequestType = "workspace_export" | "account_export" | "personal_data_download" | "delete_request";
export type DataRequestStatus = "requested" | "processing" | "ready" | "completed" | "rejected";
export type DemoModePolicy = "enabled" | "disabled" | "requires_confirmation";

export interface LaunchChecklistItem {
  id: string;
  label: string;
  status: LaunchStatus;
  owner: string;
  observation: string;
  href: string;
}

export interface EnvironmentVariableStatus {
  key: string;
  status: SecretStatus;
  required: boolean;
  scope: "public" | "server";
  observation: string;
}

export interface ProviderHealthCheck {
  id: string;
  provider: string;
  category: "ai" | "voice" | "assets" | "storage" | "database" | "video";
  status: ProviderHealthStatus;
  latencyMs?: number;
  lastCheckedAt: string;
  message: string;
}

export interface StorageBucketCheck {
  id: string;
  bucket: string;
  exists: boolean;
  policyStatus: HealthStatus;
  uploadAllowed: boolean;
  readAuthorized: boolean;
  maxSizeMb: number;
}

export interface BackupJob {
  id: string;
  workspaceId: string;
  type: BackupJobType;
  status: BackupJobStatus;
  fileUrl?: string;
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface DataRetentionPolicy {
  id: string;
  workspaceId: string;
  tempFilesDays: number;
  failedJobsDays: number;
  logsDays: number;
  deletedAssetsDays: number;
  createdAt: string;
}

export interface SecurityEvent {
  id: string;
  workspaceId: string;
  userId?: string;
  eventType: SecurityEventType;
  severity: SeverityLevel;
  ipAddress: string;
  userAgent: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface RateLimitRule {
  id: string;
  workspaceId: string;
  feature: string;
  limitCount: number;
  windowSeconds: number;
  createdAt: string;
}

export interface ErrorLog {
  id: string;
  workspaceId: string;
  userId?: string;
  module: string;
  message: string;
  stack?: string;
  severity: SeverityLevel;
  metadata: Record<string, unknown>;
  resolved: boolean;
  createdAt: string;
}

export interface SystemHealthCheck {
  id: string;
  name: string;
  status: HealthStatus;
  latencyMs?: number;
  message: string;
}

export interface UserLegalAcceptance {
  id: string;
  userId: string;
  termsVersion: string;
  privacyVersion: string;
  acceptedAt: string;
}

export interface DataRequest {
  id: string;
  workspaceId: string;
  userId: string;
  type: DataRequestType;
  status: DataRequestStatus;
  createdAt: string;
}

export interface SmokeTestStep {
  id: string;
  label: string;
  status: LaunchStatus;
  durationMs: number;
  error?: string;
}

export interface DemoModeSetting {
  workspaceId: string;
  enabled: boolean;
  creditsPolicy: DemoModePolicy;
  exportPolicy: DemoModePolicy;
  providerPolicy: DemoModePolicy;
}

export type SmokeVideoChannel = "Historias Biblicas" | "Estoicismo com Anime" | "Curiosidades Historicas";
export type SmokeVideoFormat = "short_vertical" | "reel_vertical" | "youtube_horizontal";
export type SmokeVideoStatus = "planned" | "generated" | "rendered" | "exported" | "ready_manual_publish" | "failed" | "blocked";
export type SmokeExecutionMode = "real" | "mocked" | "hybrid";
export type SmokeIssueSeverity = "critical" | "high" | "medium" | "low";
export type SmokeQualityDecision = "approved" | "needs_review" | "rejected";

export interface SmokeTestVideoResult {
  id: string;
  channel: SmokeVideoChannel;
  title: string;
  format: SmokeVideoFormat;
  aspectRatio: "9:16" | "16:9";
  durationSeconds: number;
  status: SmokeVideoStatus;
  executionMode: SmokeExecutionMode;
  generationTimeSeconds: number;
  creditsConsumed: number;
  errorsFound: string[];
  qualityScore: number;
  thumbnailScore: number;
  retentionScore: number;
  subtitleScore: number;
  qualityDecision: SmokeQualityDecision;
  renderUrl?: string;
  exportPackageUrl?: string;
}

export interface SmokeTestIssue {
  id: string;
  videoId?: string;
  module: string;
  severity: SmokeIssueSeverity;
  title: string;
  description: string;
  recommendation: string;
}

export interface SmokeModuleValidation {
  module: string;
  status: "approved" | "partial" | "failed" | "mocked";
  observation: string;
}

export type MagicVideoFormat = "shorts" | "reels" | "tiktok" | "youtube_long" | "horizontal" | "vertical" | "square";
export type MagicDurationTarget = "30s" | "60s" | "90s" | "3m" | "5m" | "8m" | "10m" | "custom";
export type MagicNarrativeType =
  | "historia_real"
  | "historia_religiosa"
  | "curiosidade"
  | "documentario"
  | "misterio"
  | "top_5"
  | "top_10"
  | "comparativo"
  | "motivacional"
  | "educacional"
  | "canal_dark"
  | "biografia"
  | "noticias"
  | "roteiro_personalizado";
export type MagicVisualSource = "ai_images" | "manual_upload" | "media_library" | "pexels" | "pixabay" | "unsplash" | "stock_videos" | "mixed";
export type MagicVisualStyle =
  | "realista"
  | "cinematografico"
  | "preto_e_branco"
  | "vintage"
  | "anime"
  | "manga"
  | "documentario"
  | "religioso"
  | "historico"
  | "luxo"
  | "sombrio"
  | "futurista"
  | "infantil"
  | "minimalista";
export type MagicJobStatus =
  | "queued"
  | "generating_script"
  | "generating_voice"
  | "generating_scenes"
  | "generating_images"
  | "generating_subtitles"
  | "selecting_music"
  | "generating_thumbnail"
  | "creating_video_project"
  | "ready_for_editor"
  | "failed"
  | "cancelled";

export interface MagicAdvancedSettings {
  scriptInstructions: string;
  imageInstructions: string;
  forbiddenWords: string;
  targetAudience: string;
  language: string;
  narrationTone: string;
  cta: string;
  sceneCount: number;
  customDurationSeconds?: number;
  customScript?: string;
  useZoom: boolean;
  useOrganicMotion: boolean;
  autoThumbnail: boolean;
  autoMusic: boolean;
  autoSubtitles: boolean;
}

export interface MagicTemplate {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  narrativeType: MagicNarrativeType;
  format: MagicVideoFormat;
  durationTarget: MagicDurationTarget;
  visualStyle: MagicVisualStyle;
  voicePreset: string;
  advancedSettings: Partial<MagicAdvancedSettings>;
  status: "active" | "archived";
  createdAt: string;
}

export type PremiumTemplateCategory =
  | "Canal Dark"
  | "Historias Biblicas"
  | "Estoicismo"
  | "Curiosidades"
  | "Biografias"
  | "Luxo"
  | "Misterios"
  | "Historia"
  | "Motivacional"
  | "Documentario"
  | "Anime Filosofico"
  | "Top 10"
  | "Comparativo de Marcas";
export type PremiumTemplateStatus = "active" | "draft" | "archived" | "inactive";
export type TemplatePackStatus = "active" | "draft" | "archived";

export interface PremiumTemplatePrompts {
  script: string;
  visual: string;
  thumbnail: string;
  title: string;
  description: string;
  caption: string;
  opening: string;
  closing: string;
}

export interface PremiumTemplateScore {
  ease: number;
  estimatedCost: number;
  viralPotential: number;
  monetizationPotential: number;
  visualComplexity: number;
}

export interface PremiumTemplate {
  id: string;
  workspaceId?: string;
  name: string;
  description: string;
  category: PremiumTemplateCategory;
  niche: string;
  language: string;
  visualStyle: MagicVisualStyle;
  narrativeType: MagicNarrativeType;
  defaultVoiceId: string;
  defaultDuration: MagicDurationTarget;
  defaultFormat: MagicVideoFormat;
  scriptPrompt: string;
  imagePromptStyle: string;
  thumbnailPrompt: string;
  subtitleStyle: SubtitleStyle | ViralSubtitleStyle;
  musicMood: MusicMood;
  tags: string[];
  status: PremiumTemplateStatus;
  prompts: PremiumTemplatePrompts;
  topicExamples: string[];
  titleExamples: string[];
  previewImageUrl: string;
  score: PremiumTemplateScore;
  favorite: boolean;
  usageCount: number;
  videosGenerated: number;
  creditsConsumed: number;
  channelsCreated: number;
  completionRate: number;
  isGlobal: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TemplatePack {
  id: string;
  workspaceId?: string;
  name: string;
  description: string;
  category: string;
  templatesCount: number;
  status: TemplatePackStatus;
  createdAt: string;
}

export interface TemplatePackItem {
  id: string;
  workspaceId?: string;
  templatePackId: string;
  templateId: string;
  createdAt: string;
}

export type OnboardingStep =
  | "objective"
  | "niche"
  | "template"
  | "channel"
  | "voice"
  | "visual"
  | "first_video"
  | "processing"
  | "result";
export type OnboardingEventName =
  | "onboarding_started"
  | "template_selected"
  | "channel_created"
  | "first_video_generated"
  | "first_render_completed"
  | "onboarding_completed";

export interface OnboardingProgress {
  id: string;
  workspaceId: string;
  userId: string;
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingEvent {
  id: string;
  workspaceId: string;
  userId: string;
  eventName: OnboardingEventName;
  step: OnboardingStep;
  createdAt: string;
}

export interface ActivationChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  href: string;
}

export interface MagicVideoJob {
  id: string;
  workspaceId: string;
  projectId: string;
  userId: string;
  theme: string;
  format: MagicVideoFormat;
  aspectRatio: VideoAspectRatio;
  durationTarget: number;
  narrativeType: MagicNarrativeType;
  voiceId: string;
  visualStyle: MagicVisualStyle;
  visualSource: MagicVisualSource;
  subtitleEnabled: boolean;
  musicEnabled: boolean;
  autoThumbnail: boolean;
  advancedSettings: MagicAdvancedSettings;
  status: MagicJobStatus;
  progress: number;
  currentStep: string;
  errorMessage?: string;
  videoProjectId?: string;
  costCredits: number;
  createdAt: string;
  updatedAt: string;
}

export interface MagicScenePlan {
  order: number;
  text: string;
  durationSeconds: number;
  visualPrompt: string;
  generatedImageUrl?: string;
  mediaAssetId?: string;
  motionType: MotionType;
  transitionType: TransitionType;
}

export interface MagicCostEstimate {
  textCost: number;
  voiceCost: number;
  imageCost: number;
  thumbnailCost: number;
  renderCost: number;
  totalCredits: number;
}

export interface MagicPipelineResult {
  job: MagicVideoJob;
  script: string;
  scenes: MagicScenePlan[];
  videoProject: VideoProject;
  videoScenes: VideoScene[];
  subtitles: SubtitleSegment[];
  thumbnailUrl?: string;
  logs: string[];
  costEstimate: MagicCostEstimate;
}

export type ViralClipOutputFormat = "shorts" | "reels" | "tiktok" | "horizontal" | "square";
export type ViralClipDurationMode = "15s" | "30s" | "45s" | "60s" | "90s" | "auto" | "custom";
export type ViralClipsQuantity = 1 | 3 | 5 | 10 | 15 | "custom";
export type ViralSourceType = "youtube" | "upload" | "google_drive" | "vimeo" | "tiktok" | "instagram";
export type ViralClipJobStatus =
  | "queued"
  | "downloading_source"
  | "extracting_audio"
  | "transcribing"
  | "analyzing_moments"
  | "generating_clips"
  | "rendering"
  | "completed"
  | "failed"
  | "cancelled";
export type SourceVideoStatus = "queued" | "processing" | "ready" | "failed";
export type TranscriptStatus = "queued" | "processing" | "completed" | "failed";
export type ViralMomentStatus = "suggested" | "approved" | "rejected" | "rendered";
export type ViralClipStatus = "queued" | "rendering" | "completed" | "failed";
export type ViralSubtitleStyle = "tiktok" | "popup" | "word_by_word" | "minimal" | "documentary" | "black_box";
export type ReframeMode = "center_crop" | "blurred_background" | "smart_crop_placeholder" | "split_screen_placeholder" | "original_fit_blur";

export interface ViralClipJob {
  id: string;
  workspaceId: string;
  projectId: string;
  userId: string;
  sourceUrl: string;
  sourceType: ViralSourceType;
  outputFormat: ViralClipOutputFormat;
  aspectRatio: VideoAspectRatio;
  clipDurationMode: ViralClipDurationMode;
  clipDurationSeconds?: number;
  clipsQuantity: number;
  subtitleStyle: ViralSubtitleStyle;
  removeSilence: boolean;
  reframeVertical: boolean;
  reframeMode: ReframeMode;
  rightsConfirmed: boolean;
  status: ViralClipJobStatus;
  progress: number;
  currentStep: string;
  errorMessage?: string;
  estimatedCost: number;
  finalCost?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SourceVideo {
  id: string;
  workspaceId: string;
  projectId: string;
  sourceUrl: string;
  sourceType: ViralSourceType;
  title: string;
  durationSeconds: number;
  thumbnailUrl: string;
  localVideoUrl?: string;
  localAudioUrl?: string;
  transcriptId?: string;
  status: SourceVideoStatus;
  createdAt: string;
}

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

export interface VideoTranscript {
  id: string;
  workspaceId: string;
  sourceVideoId: string;
  provider: "openai_whisper" | "mock";
  language: string;
  fullText: string;
  segments: TranscriptSegment[];
  durationSeconds: number;
  status: TranscriptStatus;
  createdAt: string;
}

export interface ViralMoment {
  id: string;
  workspaceId: string;
  viralClipJobId: string;
  sourceVideoId: string;
  startTime: number;
  endTime: number;
  title: string;
  hook: string;
  reason: string;
  viralScore: number;
  retentionScore: number;
  clarityScore: number;
  transcriptExcerpt: string;
  status: ViralMomentStatus;
  createdAt: string;
}

export interface ViralClip {
  id: string;
  workspaceId: string;
  viralClipJobId: string;
  sourceVideoId: string;
  viralMomentId: string;
  title: string;
  startTime: number;
  endTime: number;
  durationSeconds: number;
  aspectRatio: VideoAspectRatio;
  subtitleStyle: ViralSubtitleStyle;
  reframeMode: ReframeMode;
  renderUrl?: string;
  thumbnailUrl?: string;
  status: ViralClipStatus;
  createdAt: string;
}

export interface ViralCostEstimate {
  processingCost: number;
  transcriptionCost: number;
  analysisCost: number;
  renderCost: number;
  totalCredits: number;
}

export interface ViralClipPipelineResult {
  job: ViralClipJob;
  sourceVideo: SourceVideo;
  transcript: VideoTranscript;
  moments: ViralMoment[];
  clips: ViralClip[];
  logs: string[];
  costEstimate: ViralCostEstimate;
}

export type ChannelType =
  | "dark"
  | "curiosidades"
  | "historia"
  | "religioso"
  | "estoicismo"
  | "motivacional"
  | "luxo"
  | "documentario"
  | "infantil"
  | "anime"
  | "custom";
export type ChannelStatus = "ativo" | "pausado" | "arquivado";
export type CalendarContentType = "video" | "short" | "clip" | "thumbnail" | "script";
export type CalendarStatus = "planejado" | "em_producao" | "pronto" | "publicado" | "cancelado";
export type BulkJobStatus = "queued" | "generating" | "rendering" | "completed" | "failed";
export type QueueJobType = "magic_video" | "viral_clip" | "thumbnail" | "render" | "bulk";
export type ChannelRole = "administrador" | "editor" | "operador" | "visualizador";
export type GoalType = "videos" | "shorts" | "thumbnails" | "clips" | "credits";
export type GoalPeriod = "daily" | "weekly" | "monthly";
export type NotificationStatus = "unread" | "read" | "archived";

export interface Channel {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  niche: string;
  language: string;
  country: string;
  logoUrl?: string;
  bannerUrl?: string;
  channelType: ChannelType;
  visualStyle: string;
  defaultVoiceId: string;
  defaultTemplateId: string;
  defaultVideoFormat: VideoFormat;
  status: ChannelStatus;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChannelTemplate {
  id: string;
  workspaceId: string;
  channelId?: string;
  name: string;
  description: string;
  voiceId: string;
  visualStyle: string;
  durationSeconds: number;
  format: VideoFormat;
  promptSystem: string;
  promptUser: string;
  subtitleStyle: ViralSubtitleStyle | SubtitleStyle;
  thumbnailStyle: string;
  status: "active" | "archived";
  createdAt: string;
}

export interface ContentCalendarItem {
  id: string;
  workspaceId: string;
  channelId: string;
  contentType: CalendarContentType;
  contentId?: string;
  title: string;
  scheduledDate: string;
  status: CalendarStatus;
  notes: string;
  createdAt: string;
}

export interface ProductionPlan {
  id: string;
  workspaceId: string;
  channelId: string;
  videosPerDay: number;
  videosPerWeek: number;
  shortsPerDay: number;
  longVideosPerWeek: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface BulkJob {
  id: string;
  workspaceId: string;
  channelId: string;
  quantity: number;
  contentType: CalendarContentType;
  templateId: string;
  format: VideoFormat;
  durationSeconds: number;
  visualStyle: string;
  status: BulkJobStatus;
  progress: number;
  currentStep: string;
  creditsConsumed: number;
  createdAt: string;
}

export interface QueueJob {
  id: string;
  workspaceId: string;
  channelId?: string;
  userId: string;
  jobType: QueueJobType;
  title: string;
  status: BulkJobStatus | MagicJobStatus | ViralClipJobStatus;
  progress: number;
  currentStep: string;
  estimatedTime: string;
  creditsConsumed: number;
  createdAt: string;
}

export interface ChannelGoal {
  id: string;
  workspaceId: string;
  channelId: string;
  goalType: GoalType;
  target: number;
  period: GoalPeriod;
  currentValue: number;
  createdAt: string;
}

export interface ChannelPermission {
  id: string;
  workspaceId: string;
  channelId: string;
  userId: string;
  role: ChannelRole;
  createdAt: string;
}

export interface OperationNotification {
  id: string;
  workspaceId: string;
  channelId?: string;
  title: string;
  description: string;
  type: "job_completed" | "job_failed" | "low_credits" | "queue_congested";
  status: NotificationStatus;
  createdAt: string;
}

export type AiVideoProviderType = "runway" | "kling" | "pika" | "luma" | "veo" | "mock";
export type AiVideoJobStatus = "queued" | "processing" | "completed" | "failed" | "cancelled";
export type AiVideoAssetSource = "text_to_video" | "image_to_video" | "talking_character" | "intro" | "outro" | "upload";
export type CameraMotion =
  | "static"
  | "slow_zoom"
  | "push_in"
  | "pull_out"
  | "pan_left"
  | "pan_right"
  | "epic_orbit"
  | "documentary_handheld";

export interface AiVideoProviderConfig {
  id: string;
  workspaceId: string;
  name: string;
  provider: AiVideoProviderType;
  apiKeyEncrypted?: string;
  defaultModel: string;
  status: MediaStatus;
  costPerSecond: number;
  costPerGeneration: number;
  maxDurationSeconds: number;
  supportedAspectRatios: VideoAspectRatio[];
  supportsImageToVideo: boolean;
  supportsTextToVideo: boolean;
  supportsTalkingCharacter: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ImageToVideoJob {
  id: string;
  workspaceId: string;
  videoProjectId: string;
  sceneId: string;
  provider: AiVideoProviderType;
  inputImageUrl: string;
  motionPrompt: string;
  durationSeconds: number;
  aspectRatio: VideoAspectRatio;
  outputVideoUrl?: string;
  status: AiVideoJobStatus;
  progress: number;
  cost: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TextToVideoJob {
  id: string;
  workspaceId: string;
  projectId: string;
  provider: AiVideoProviderType;
  prompt: string;
  negativePrompt: string;
  visualStyle: string;
  durationSeconds: number;
  aspectRatio: VideoAspectRatio;
  cameraMotion: CameraMotion;
  quality: "draft" | "standard" | "high";
  outputVideoUrl?: string;
  thumbnailUrl?: string;
  status: AiVideoJobStatus;
  progress: number;
  cost: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IntroOutroGeneration {
  id: string;
  workspaceId: string;
  videoProjectId: string;
  type: "intro" | "outro";
  provider: AiVideoProviderType;
  prompt: string;
  durationSeconds: number;
  aspectRatio: VideoAspectRatio;
  outputVideoUrl?: string;
  status: AiVideoJobStatus;
  cost: number;
  createdAt: string;
}

export interface TalkingCharacterJob {
  id: string;
  workspaceId: string;
  projectId: string;
  inputImageUrl: string;
  characterDescription: string;
  speechText: string;
  voiceId: string;
  provider: AiVideoProviderType;
  durationSeconds: number;
  outputVideoUrl?: string;
  status: AiVideoJobStatus;
  progress: number;
  cost: number;
  errorMessage?: string;
  createdAt: string;
}

export interface AiVideoAsset {
  id: string;
  workspaceId: string;
  projectId?: string;
  videoProjectId?: string;
  source: AiVideoAssetSource;
  title: string;
  provider: AiVideoProviderType;
  thumbnailUrl: string;
  videoUrl: string;
  durationSeconds: number;
  aspectRatio: VideoAspectRatio;
  cost: number;
  createdAt: string;
}

export interface AiVideoPipelineResult {
  job: TextToVideoJob | ImageToVideoJob | TalkingCharacterJob | IntroOutroGeneration;
  asset: AiVideoAsset;
  logs: string[];
}

export type PlanStatus = "active" | "inactive" | "archived";
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled" | "expired";
export type BillingCycle = "monthly" | "yearly";
export type BillingProvider = "placeholder" | "stripe" | "mercado_pago";
export type CreditTransactionType = "monthly_grant" | "purchase" | "usage" | "refund" | "adjustment" | "expiration";
export type BillingEventStatus = "mocked" | "pending" | "processed" | "failed";
export type InvoiceStatus = "draft" | "open" | "paid" | "void" | "uncollectible";
export type PlatformAdminRole = "owner" | "admin" | "support" | "finance";
export type BillingFeature =
  | "generate_script"
  | "generate_voice"
  | "generate_image"
  | "render_video"
  | "export_package"
  | "generate_thumbnail"
  | "viral_clips"
  | "ai_video"
  | "bulk_generation"
  | "create_channel"
  | "create_project"
  | "invite_user"
  | "white_label";

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  includedCredits: number;
  maxWorkspaces: number;
  maxChannels: number;
  maxProjects: number;
  maxTeamMembers: number;
  maxVideosPerMonth: number;
  maxRendersPerMonth: number;
  maxAiVideoGenerations: number;
  maxViralClips: number;
  watermarkEnabled: boolean;
  priorityQueue: boolean;
  whiteLabelEnabled: boolean;
  status: PlanStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  workspaceId: string;
  planId: string;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEndsAt?: string;
  cancelAtPeriodEnd: boolean;
  provider: BillingProvider;
  providerSubscriptionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreditWallet {
  id: string;
  workspaceId: string;
  balance: number;
  monthlyAllowance: number;
  purchasedCredits: number;
  usedThisPeriod: number;
  resetAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreditTransaction {
  id: string;
  workspaceId: string;
  userId?: string;
  type: CreditTransactionType;
  amount: number;
  balanceAfter: number;
  description: string;
  referenceType?: string;
  referenceId?: string;
  createdAt: string;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  bonusCredits: number;
  status: PlanStatus;
  createdAt: string;
}

export interface BillingEvent {
  id: string;
  workspaceId: string;
  provider: BillingProvider;
  eventType: string;
  payload: Record<string, unknown>;
  status: BillingEventStatus;
  createdAt: string;
}

export interface Invoice {
  id: string;
  workspaceId: string;
  subscriptionId: string;
  providerInvoiceId?: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  invoiceUrl?: string;
  paidAt?: string;
  createdAt: string;
}

export interface PlatformAdmin {
  id: string;
  userId: string;
  role: PlatformAdminRole;
  status: "active" | "inactive";
  createdAt: string;
}

export interface FeatureFlag {
  id: string;
  workspaceId?: string;
  featureKey: BillingFeature;
  enabled: boolean;
  limitValue?: number;
  createdAt: string;
}

export interface UsageSnapshot {
  workspaceId: string;
  videosThisMonth: number;
  rendersThisMonth: number;
  aiVideoGenerations: number;
  viralClips: number;
  channels: number;
  projects: number;
  teamMembers: number;
  workspaceSuspended: boolean;
}

export interface FeatureUsageDecision {
  allowed: boolean;
  reason: string;
  code: "ok" | "subscription_inactive" | "credits_insufficient" | "monthly_limit" | "feature_not_in_plan" | "workspace_suspended";
  requiredCredits: number;
  remainingCredits: number;
  watermarkEnabled: boolean;
}

export interface AdminWorkspaceSummary {
  workspaceId: string;
  name: string;
  ownerEmail: string;
  planName: string;
  subscriptionStatus: SubscriptionStatus;
  creditsBalance: number;
  usedThisPeriod: number;
  videosGenerated: number;
  renders: number;
  failedJobs: number;
  estimatedProviderCost: number;
  status: "active" | "suspended";
}

export interface ProviderCostSummary {
  provider: string;
  category: "text" | "voice" | "image" | "render" | "ai_video" | "viral";
  workspaceId: string;
  workspaceName: string;
  usageCount: number;
  creditsCharged: number;
  estimatedCost: number;
}

export type ExportPlatform = "youtube" | "youtube_shorts" | "tiktok" | "instagram_reels" | "facebook_reels";
export type ExportPackageStatus = "draft" | "preparing" | "generating_metadata" | "creating_zip" | "uploading" | "ready" | "downloaded" | "marked_as_published" | "failed";
export type ExportCenterStatus = "pronto para exportar" | "exportado" | "baixado" | "publicado manualmente" | "arquivado";
export type BulkExportJobStatus = "queued" | "preparing" | "ready" | "downloaded" | "failed";
export type VideoMetadataStatus = "draft" | "generated" | "edited" | "approved";

export interface ExportPackage {
  id: string;
  workspaceId: string;
  channelId: string;
  videoProjectId: string;
  title: string;
  targetPlatform: ExportPlatform;
  packageUrl?: string;
  status: ExportPackageStatus;
  createdAt: string;
  updatedAt: string;
}

export interface VideoMetadata {
  id: string;
  workspaceId: string;
  videoProjectId: string;
  platform: ExportPlatform;
  title: string;
  titleVariations: string[];
  description: string;
  hashtags: string[];
  tags: string[];
  pinnedComment: string;
  communityText: string;
  cta: string;
  seoScore: number;
  status: VideoMetadataStatus;
  createdAt: string;
}

export interface PlatformPreset {
  platform: ExportPlatform;
  label: string;
  titleLimit: number;
  descriptionMode: "full" | "short" | "caption";
  requiresThumbnail: boolean;
  hashtagMode: "required" | "recommended" | "optional";
  ctaStyle: string;
}

export interface BulkExportJob {
  id: string;
  workspaceId: string;
  userId: string;
  selectedVideoIds: string[];
  targetPlatform: ExportPlatform;
  status: BulkExportJobStatus;
  packageUrl?: string;
  createdAt: string;
}

export interface ManualPublication {
  id: string;
  workspaceId: string;
  videoProjectId: string;
  exportPackageId: string;
  platform: ExportPlatform;
  publishedUrl?: string;
  publishedAt: string;
  notes?: string;
  createdAt: string;
}

export interface ExportPackageManifest {
  packageName: string;
  files: Array<{ name: string; type: "video" | "thumbnail" | "text" | "json"; url?: string; content?: string }>;
  metadata: VideoMetadata;
  checklist: Array<{ label: string; done: boolean }>;
}

export type AssetProvider = "upload" | "pexels" | "pixabay" | "unsplash" | "internal_ai" | "owned_library";
export type AssetSourceStatus = "active" | "inactive" | "error";
export type AssetType = "image" | "video" | "audio" | "music" | "thumbnail";
export type AssetSourceType = "upload" | "pexels" | "pixabay" | "unsplash" | "ai_image" | "ai_video" | "generated";
export type AssetOrientation = "vertical" | "horizontal" | "square";

export interface AssetSourceConfig {
  id: string;
  workspaceId: string;
  name: string;
  provider: AssetProvider;
  apiKeyEncrypted?: string;
  status: AssetSourceStatus;
  createdAt: string;
}

export interface AssetLibraryItem {
  id: string;
  workspaceId: string;
  projectId?: string;
  channelId?: string;
  type: AssetType;
  source: AssetSourceType;
  title: string;
  description: string;
  tags: string[];
  fileUrl: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  durationSeconds?: number;
  width?: number;
  height?: number;
  fileSize?: number;
  mimeType: string;
  favorite: boolean;
  usageCount: number;
  qualityScore: number;
  hash?: string;
  createdBy: string;
  createdAt: string;
}

export interface AssetCollection {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  thumbnailUrl?: string;
  createdAt: string;
}

export interface AssetCollectionItem {
  id: string;
  workspaceId: string;
  collectionId: string;
  assetId: string;
  createdAt: string;
}

export interface AssetUsage {
  id: string;
  workspaceId: string;
  assetId: string;
  videoProjectId?: string;
  sceneId?: string;
  usedAt: string;
}

export interface ExternalAssetSearchResult {
  id: string;
  provider: AssetProvider;
  type: AssetType;
  title: string;
  thumbnailUrl: string;
  fileUrl: string;
  previewUrl?: string;
  width?: number;
  height?: number;
  durationSeconds?: number;
  author?: string;
  sourceUrl?: string;
}

export interface AssetSearchCacheEntry {
  id: string;
  workspaceId: string;
  provider: AssetProvider;
  query: string;
  results: ExternalAssetSearchResult[];
  createdAt: string;
}
