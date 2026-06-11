import { CheckCircle2, Database, Gauge, Route, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ModuleHeader } from "@/components/module-header";

const routeRows = [
  ["/", "Completa", "Redireciona/porta de entrada simples."],
  ["/auth/login", "Parcial", "Email/senha e Google no UI; depende de Supabase configurado."],
  ["/auth/reset-password", "Parcial", "Fluxo Supabase presente; depende de ambiente real."],
  ["/auth/confirm-email", "Parcial", "Tela de confirmacao; callback existe."],
  ["/dashboard", "Mockada", "Dashboard SaaS com dados mockados."],
  ["/projetos", "Parcial", "CRUD em estado local/mock, sem persistencia real conectada."],
  ["/nichos", "Parcial", "Gestao visual com mocks."],
  ["/personas", "Parcial", "Gestao visual com mocks."],
  ["/palavras-chave", "Parcial", "Biblioteca e filtros mockados."],
  ["/biblioteca", "Parcial", "Biblioteca central com mocks."],
  ["/busca", "Parcial", "Busca global em arrays locais."],
  ["/conteudo", "Parcial", "Superficie placeholder/infra."],
  ["/ideias", "Parcial", "Pagina legada alem de /app/ideas."],
  ["/publicacoes", "Vazia", "PlaceholderPage."],
  ["/ia-agents", "Vazia", "PlaceholderPage."],
  ["/configuracoes/*", "Parcial", "Perfil/workspace/usuarios/permissoes/branding existem, majoritariamente mock."],
  ["/app/trends", "Mockada", "Radar de tendencias mockado."],
  ["/app/competitors", "Mockada", "Concorrentes e insights mockados."],
  ["/app/ideas", "Mockada", "Banco de ideias, kanban e geracao local mockada."],
  ["/app/ai", "Parcial", "Admin panels para providers/prompts/agents."],
  ["/app/ai/titles", "Hibrida", "Chama backend OpenAI se houver key; sem key falha."],
  ["/app/ai/hooks", "Hibrida", "Mesmo padrao do AI generator."],
  ["/app/ai/scripts", "Hibrida", "Mesmo padrao do AI generator."],
  ["/app/ai/carousels", "Hibrida", "Mesmo padrao do AI generator."],
  ["/app/ai/posts", "Hibrida", "Mesmo padrao do AI generator."],
  ["/app/ai/articles", "Hibrida", "Mesmo padrao do AI generator."],
  ["/app/ai/emails", "Hibrida", "Mesmo padrao do AI generator."],
  ["/app/ai/whatsapp", "Hibrida", "Mesmo padrao do AI generator."],
  ["/app/playground", "Parcial", "UI de playground; persistencia real nao conectada."],
  ["/app/settings/voice-providers", "Mockada", "Configuracao visual; chave nao e persistida."],
  ["/app/settings/image-providers", "Mockada", "Configuracao visual; chave nao e persistida."],
  ["/app/settings/video-providers", "Mockada", "Providers Runway/Kling/Mock em UI."],
  ["/app/voices", "Mockada", "Biblioteca de vozes em mock-data."],
  ["/app/media-library", "Parcial", "Midia e assets IA em mocks."],
  ["/app/videos", "Parcial", "Workspace de videos e entrada Magic first."],
  ["/app/videos/[id]/editor", "Parcial", "Editor visual; sem drag and drop real; render mock."],
  ["/app/videos/[id]/thumbnails", "Mockada/Hibrida", "API gera fallback; OpenAI Images se key existir."],
  ["/app/magic", "Mockada/Hibrida", "Pipeline completo em mock/fallback; nao persiste em Supabase real."],
  ["/app/magic/history", "Mockada", "Historico vindo de mock-data."],
  ["/app/magic/[id]", "Mockada", "Progresso estatico baseado em mock-data."],
  ["/app/viral-clips", "Mockada", "Nao baixa video real; gera source/transcript/moments mockados."],
  ["/app/viral-clips/[id]/review", "Mockada", "Ajustes visuais e render placeholder."],
  ["/app/viral-clips/library", "Mockada", "Biblioteca de cortes mockada."],
  ["/app/channels", "Mockada", "Operacao multi-canal baseada em arrays locais."],
  ["/app/channels/[id]", "Mockada", "Dashboard por canal em mock-data."],
  ["/app/channels/[id]/library", "Mockada", "Biblioteca por canal agregada de mocks."],
  ["/app/calendar", "Mockada", "Calendario editorial sem persistencia."],
  ["/app/production-plan", "Mockada", "Planos de producao mockados."],
  ["/app/bulk-generation", "Mockada", "Bulk jobs visuais, sem fila real."],
  ["/app/queue", "Mockada", "Fila operacional mockada."],
  ["/app/channel-templates", "Mockada", "Templates de canal mockados."],
  ["/app/analytics", "Mockada", "Graficos/metricas visuais mockados."],
  ["/app/operations", "Mockada", "Central de operacoes mockada."],
  ["/app/notifications", "Mockada", "Alertas mockados."],
  ["/app/ai-video", "Mockada", "Text-to-video gera asset placeholder."],
  ["/app/ai-video/history", "Mockada", "Historico de video IA em mock-data."],
  ["/app/talking-scenes", "Mockada", "Personagem falante via provider mock."],
];

const tableRows = [
  ["user_profiles", "Parcial", "Schema pronto; UI usa dados mockados."],
  ["workspaces", "Parcial", "Base multi-tenant pronta; workspace switcher mock."],
  ["roles, permissions, role_permissions, workspace_users", "Parcial", "Modelo granular pronto; enforcement real depende de Supabase/app auth."],
  ["audit_logs", "Parcial", "Triggers prontos; auth login/logout nao registra real ainda."],
  ["projects, niches, personas, keywords", "Parcial", "Usadas por UI, mas com mocks."],
  ["tags, content_folders, content_items, content_item_tags, favorites", "Parcial", "Biblioteca estruturada; persistencia nao conectada na UI."],
  ["trends, competitors, competitor_insights, content_ideas, idea_scores, idea_sources, idea_events", "Mockada", "Fase 3 opera em mock-data."],
  ["ai_providers, prompt_templates, ai_generations, ai_generation_jobs, ai_agents, playground_messages, ai_credit_usage", "Parcial", "Schema robusto; APIs salvam pouco/nao persistem."],
  ["voice_providers, voices, audio_generations", "Hibrida", "TTS usa OpenAI real se key existir, fallback mock."],
  ["image_providers, image_generations", "Hibrida", "Images usa OpenAI real se key existir, fallback mock."],
  ["media_assets, video_projects, video_scenes, subtitle_segments, music_tracks, video_renders, media_usage_logs", "Parcial", "Editor e media usam mocks; render placeholder."],
  ["visual_style_presets, video_effects, video_ai_providers, image_animations, subtitle_styles, audio_settings, thumbnail_generations, video_versions", "Mockada", "Fase 6 pronta em schema/UI, sem persistencia real."],
  ["magic_templates, magic_video_jobs", "Mockada", "Pipeline automatico retorna objetos, nao grava no banco."],
  ["source_videos, video_transcripts, viral_clip_jobs, viral_moments, viral_clips", "Mockada", "Cortes virais seguros, sem download/transcricao real."],
  ["channels, channel_templates, content_calendar, production_plans, bulk_jobs, channel_goals, channel_permissions, operation_notifications", "Mockada", "Operacao multi-canal em UI mockada."],
  ["ai_video_providers, image_to_video_jobs, text_to_video_jobs, intro_outro_generations, talking_character_jobs, ai_video_assets", "Mockada", "Video IA via mock provider."],
];

const integrations = [
  ["OpenAI Responses", "Parcial/real", "Backend /api/ai/generate chama OpenAI se OPENAI_API_KEY existir."],
  ["OpenAI TTS", "Hibrida", "Real se OPENAI_API_KEY existir; fallback mock."],
  ["OpenAI Images", "Hibrida", "Real se OPENAI_API_KEY existir; fallback SVG/mock."],
  ["Whisper", "Nao implementada", "Somente estrutura de video_transcripts/mock transcript."],
  ["ElevenLabs", "Nao implementada", "Aparece como provider previsto/inativo."],
  ["Runway/Kling/Pika/Luma/Veo", "Mockada", "Somente provider config e placeholder."],
  ["Supabase Auth", "Parcial/real", "Clients e telas existem; depende de env/projeto real."],
  ["Supabase DB/RLS", "Schema real", "71 tabelas, RLS e policies no SQL."],
  ["Supabase Storage", "Nao implementada", "URLs de midia sao placeholders locais."],
];

const apiRows = [
  ["/api/ai/generate", "Hibrida", "OpenAI real se key existir; sem persistencia de generation."],
  ["/api/media/tts", "Hibrida", "OpenAI TTS real/fallback."],
  ["/api/media/images", "Hibrida", "OpenAI Images real/fallback."],
  ["/api/media/thumbnails", "Hibrida", "Gera thumbnails por OpenAI Images/fallback."],
  ["/api/media/render", "Mockada", "Retorna /media/mock-render.mp4."],
  ["/api/magic/jobs", "Mockada", "Preview e pipeline automatico sem fila real."],
  ["/api/magic/jobs/[id]", "Mockada", "Detalhe vindo de mock-data."],
  ["/api/viral-clips/jobs", "Mockada", "Valida URL e cria pipeline seguro mock."],
  ["/api/viral-clips/jobs/[id]", "Mockada", "Detalhe mockado."],
  ["/api/viral-clips/jobs/[id]/render", "Mockada", "Renderiza clips placeholder."],
  ["/api/ai-video/jobs", "Mockada", "Text/image/talking/intro/outro via mock provider."],
  ["/auth/callback", "Parcial/real", "Troca code por sessao Supabase."],
];

const featureRows = [
  ["Multi-tenant/RLS", "Parcial", "Schema forte; UI ainda usa mock-data."],
  ["Autenticacao", "Parcial", "Supabase Auth preparado; login mock tambem existe."],
  ["Permissoes", "Parcial", "Role map e policies existem; app UI nao valida tudo."],
  ["Dashboard", "Mockado", "Dados estaticos."],
  ["Projetos/Nichos/Personas/Biblioteca/Tags/Busca", "Parcial", "CRUD/local e filtros; sem Supabase real na UI."],
  ["Tendencias/Concorrentes/Ideias/Scores/Kanban", "Mockado", "Sem APIs externas."],
  ["AI Engine/Prompts/Agents/Playground", "Parcial", "OpenAI real em geradores; admin/playground mock/parcial."],
  ["Voz/Imagem/Media", "Hibrido", "OpenAI real possivel; bibliotecas mockadas."],
  ["Editor/Thumbnails/Legendas/Efeitos", "Parcial", "UI rica, render e persistencia mock."],
  ["Magic Mode", "Mockado/Hibrido", "Pipeline funcional em memoria; voz/imagem podem chamar OpenAI fallback."],
  ["Viral Clips", "Mockado", "Nao baixa/transcreve real; compliance correto."],
  ["Channels/Calendario/Bulk", "Mockado", "Operacional visual completo."],
  ["AI Video", "Mockado", "Provider mock; estrutura plugavel."],
];

const scoreRows = [
  ["Arquitetura", 82, "Muito ampla, modular e com schema forte; falta separar mock/persistencia."],
  ["Backend", 48, "APIs existem, mas poucas gravam no banco ou rodam filas reais."],
  ["Frontend", 76, "Muitas telas completas visualmente; varias ainda mockadas."],
  ["UX", 72, "Boa cobertura operacional; sidebar ficou extensa e precisa hierarquia."],
  ["IA", 38, "OpenAI real somente em geradores/texto/media; video/viral mock."],
  ["Video", 42, "Editor e assets existem; render real ausente."],
  ["Editor", 55, "Timeline e paineis existem; falta drag/drop real e media persistence."],
  ["Escalabilidade", 61, "Schema e RLS bons; faltam jobs/queues/storage/rate limit reais."],
];

const roadmap = [
  ["Pronto", "Schema multi-tenant amplo, RLS, rotas, UI premium, mocks cobrindo todas as fases, APIs seguras sem chaves no frontend."],
  ["Precisa terminar", "Persistencia Supabase na UI, storage real, filas reais, gravação de jobs/logs/custos, permissões por rota/acao."],
  ["Mockado", "Magic pipeline, Viral Clips, Channels operations, AI Video providers, render engine, analytics, notifications."],
  ["Falta para producao", "Autenticacao obrigatoria, migrations versionadas, seed consistente, testes, rate limit, credit balance, observabilidade, storage, webhooks/jobs workers."],
];

export default function SystemAuditPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="System Audit"
        title="Auditoria completa do Video Flow"
        description="Diagnostico tecnico do estado atual do projeto em 8 de junho de 2026. Nenhuma funcionalidade nova foi avaliada como producao sem evidencia de persistencia, filas ou providers reais."
      />

      <section className="grid gap-3 md:grid-cols-4">
        <Metric icon={Route} label="Paginas" value="61" />
        <Metric icon={Database} label="Tabelas" value="71" />
        <Metric icon={Gauge} label="API routes" value="11" />
        <Metric icon={ShieldAlert} label="Policies RLS" value="148" />
      </section>

      <AuditSection title="Resumo executivo" description="Estado geral por fase">
        <div className="grid gap-3 md:grid-cols-2">
          {[
            ["Fase 1", "Parcial", "Base SaaS, auth, roles, workspaces e dashboard existem; dados ainda mockados."],
            ["Fase 2", "Parcial", "Projetos, nichos, personas, biblioteca, tags e busca existem em UI/local state."],
            ["Fase 3", "Mockada", "Tendencias, concorrentes, ideias, scores e kanban sem integrações externas."],
            ["Fase 4", "Hibrida", "OpenAI real para geradores; providers/prompts/agents majoritariamente mock/parcial."],
            ["Fase 5", "Hibrida", "TTS/images podem ser reais; media/video/render base em mock."],
            ["Fase 6", "Parcial", "Editor avancado e thumbnails existem; falta render real/drag-drop/persistencia."],
            ["Fase 7", "Mockada/Hibrida", "Magic Mode completo visualmente; pipeline em memoria/fallback."],
            ["Fase 8", "Mockada", "Cortes virais seguros, sem download/transcricao/render real."],
            ["Fase 9", "Mockada", "Operacao multi-canal visual; sem jobs reais."],
            ["Fase 10", "Mockada", "AI Video plugavel; mock provider apenas."],
          ].map(([phase, status, note]) => <Row key={phase} left={phase} status={status} note={note} />)}
        </div>
      </AuditSection>

      <AuditSection title="1. Rotas existentes" description="Todas as rotas de pagina classificadas por maturidade">
        <Table rows={routeRows} headers={["Rota", "Status", "Observacao"]} />
      </AuditSection>

      <AuditSection title="2. Banco de dados" description="71 tabelas, 70 indices, 157 referencias/FKs, 148 policies, 71 tabelas com RLS, 99 triggers, 69 tabelas em realtime">
        <Table rows={tableRows} headers={["Tabela/grupo", "Uso", "Observacao"]} />
      </AuditSection>

      <AuditSection title="3. Integracoes" description="Classificacao real, mockada, incompleta ou nao implementada">
        <Table rows={integrations} headers={["Integracao", "Status", "Observacao"]} />
      </AuditSection>

      <AuditSection title="4. APIs" description="API routes, auth callback e ausencia de edge functions/server actions">
        <Table rows={apiRows} headers={["Endpoint", "Status", "Observacao"]} />
        <p className="mt-3 text-sm text-muted-foreground">Edge Functions: nenhuma encontrada no workspace atual. Server Actions: nenhuma encontrada.</p>
      </AuditSection>

      <AuditSection title="5. Providers" description="IA, voz, imagem e video">
        <div className="grid gap-3 md:grid-cols-4">
          <ProviderCard title="IA Texto" items={["OpenAI: parcial/real", "Gemini: preparado, nao conectado", "Claude: preparado, nao conectado"]} />
          <ProviderCard title="Voz" items={["OpenAI TTS: hibrido", "ElevenLabs: inativo/mock", "Mock Voice: ativo"]} />
          <ProviderCard title="Imagem" items={["OpenAI Images: hibrido", "Flux/Ideogram: previsto", "Mock Images: ativo"]} />
          <ProviderCard title="Video" items={["Runway/Kling/Pika/Luma/Veo: configuracao mock", "Mock Video: ativo"]} />
        </div>
      </AuditSection>

      <AuditSection title="6. Funcionalidades" description="Completo, parcial, mockado ou nao implementado">
        <Table rows={featureRows} headers={["Funcionalidade", "Status", "Observacao"]} />
      </AuditSection>

      <AuditSection title="7. Magic Mode" description="Percentual real estimado: 46%">
        <Checklist items={[
          ["Pipeline", "Mockado funcional em memoria"],
          ["Geracao", "Cria objetos e cenas; nao persiste no banco"],
          ["Cenas", "Split e prompts funcionais/fallback"],
          ["Voz", "OpenAI TTS se key existir; fallback mock"],
          ["Imagens", "OpenAI Images se key existir; fallback mock"],
          ["Thumbnail", "Fallback/API funcional"],
          ["Render", "Placeholder mock"],
        ]} />
      </AuditSection>

      <AuditSection title="8. Editor" description="Percentual real estimado: 55%">
        <Checklist items={[
          ["Timeline", "Visual e reordenacao por botoes; sem drag and drop real"],
          ["Cenas", "Adicionar, duplicar, remover e editar localmente"],
          ["Substituicao de imagem", "Geracao via API/fallback; sem storage real"],
          ["Legendas", "Painel e estilos mockados"],
          ["Audio", "Painel de configuracao mock"],
          ["Preview", "Chama render mock"],
          ["Render", "Retorna arquivo placeholder"],
        ]} />
      </AuditSection>

      <AuditSection title="9. Video Engine" description="Classificacao de recursos de video IA">
        <Table rows={[
          ["Text to video", "Mockado", "API gera asset /media/mock-render.mp4"],
          ["Image to video", "Mockado", "Botao no editor chama provider mock"],
          ["Talking character", "Mockado", "Pagina e API existem; sem provider real"],
          ["Intro", "Mockado", "Geracao placeholder"],
          ["Outro", "Mockado", "Geracao placeholder"],
        ]} headers={["Recurso", "Status", "Observacao"]} />
      </AuditSection>

      <AuditSection title="10. Seguranca" description="RLS, auth, permissoes, criptografia e exposicao de chaves">
        <Checklist items={[
          ["RLS", "Cobertura ampla: 71 tabelas com RLS."],
          ["Autenticacao", "Supabase Auth preparado; muitas telas app nao bloqueiam sessao neste estado."],
          ["Roles/permissoes", "Schema e rolePermissions existem; enforcement de UI/API ainda parcial."],
          ["Criptografia", "Campos api_key_encrypted existem; rotina real de criptografia nao encontrada."],
          ["Chaves", "OPENAI_API_KEY e server-side; NEXT_PUBLIC Supabase anon e esperado."],
          ["Vulnerabilidades", "APIs mock nao validam usuario/workspace real; rate limit nao implementado; credit balance nao bloqueia."],
        ]} />
      </AuditSection>

      <AuditSection title="11. Performance" description="Gargalos provaveis">
        <Checklist items={[
          ["Queries", "Sem queries reais na maioria da UI; risco deslocado para futura persistencia."],
          ["Componentes pesados", "Paineis grandes em um unico arquivo: magic-mode, operation-cards, ai-video-panels."],
          ["Paginas lentas", "Build falhou na coleta nesta execucao; investigar .next/dev server/stale modules."],
          ["Renderizacoes", "Muitos estados locais e arrays completos; ok para mocks, ruim para dados reais sem paginacao."],
          ["Gargalos", "Sidebar com muitos itens; listas sem virtualizacao; sem React Query em fluxos mockados."],
        ]} />
      </AuditSection>

      <AuditSection title="12. Codigo morto" description="Componentes, tabelas, APIs e hooks nao usados ou pouco usados">
        <Checklist items={[
          ["PlaceholderPage", "Usado apenas por Publicacoes e IA Agents."],
          ["content-repository/registerAuditLog", "Pouco conectados aos fluxos principais."],
          ["Tabelas nao utilizadas diretamente", "A maioria das 71 tabelas nao e acessada por queries reais na UI."],
          ["APIs nao persistentes", "Magic/Viral/AI Video retornam payloads, mas nao gravam no banco."],
          ["Hooks custom", "Nenhum hook custom relevante encontrado."],
        ]} />
      </AuditSection>

      <AuditSection title="13. Erros" description="Bugs, warnings, build, tipagem e runtime">
        <Checklist items={[
          ["Typecheck", "Passou: tsc --noEmit sem erros."],
          ["Build", "Falhou nesta auditoria em Collecting page data com PageNotFoundError para /app/ai-video, /app/ai/articles, /app/ai/carousels, /_not-found e /app/ai-video/history."],
          ["Warnings", "npm informa nova versao disponivel; nao impacta app."],
          ["Runtime conhecido", "Browser interno ja apresentou falhas de sandbox em validacoes anteriores."],
          ["Bug funcional", "Render, viral clips, AI video e filas sao placeholders, apesar de status completed."],
        ]} />
      </AuditSection>

      <AuditSection title="14. Metricas gerais" description="Inventario tecnico medido">
        <div className="grid gap-3 md:grid-cols-4">
          {[
            ["Paginas", "61"],
            ["Componentes", "44"],
            ["Tabelas", "71"],
            ["APIs", "11"],
            ["Integracoes", "9"],
            ["Jobs modelados", "12+"],
            ["Providers", "15+"],
            ["Docs", "10"],
          ].map(([label, value]) => <Metric key={label} icon={Gauge} label={label} value={value} />)}
        </div>
      </AuditSection>

      <AuditSection title="15. Percentual real do projeto" description="Notas de 0 a 100 por dimensao">
        <div className="grid gap-3 md:grid-cols-2">
          {scoreRows.map(([label, score, note]) => <Score key={label as string} label={label as string} score={score as number} note={note as string} />)}
        </div>
        <p className="mt-4 rounded-md border border-primary/20 bg-primary/5 p-3 text-sm text-primary">Percentual geral real estimado: 58/100. O produto tem escopo e UI muito amplos, mas ainda depende fortemente de mocks/fallbacks.</p>
      </AuditSection>

      <AuditSection title="16. Roadmap" description="O que esta pronto, mockado e pendente para producao">
        <Table rows={roadmap} headers={["Grupo", "Diagnostico"]} />
      </AuditSection>
    </div>
  );
}

function AuditSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Card className="border-primary/10">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function Metric({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <Card className="border-primary/10 bg-secondary/40">
      <CardContent className="flex items-center gap-3 p-4">
        <span className="grid h-10 w-10 place-items-center rounded-md border border-primary/20 bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span>
        <div><p className="text-xs text-muted-foreground">{label}</p><p className="font-display text-2xl font-semibold">{value}</p></div>
      </CardContent>
    </Card>
  );
}

function Table({ rows, headers }: { rows: Array<Array<string>>; headers: string[] }) {
  return (
    <div className="overflow-hidden rounded-md border border-white/5">
      <div className="grid bg-secondary/80 text-xs font-semibold uppercase text-muted-foreground" style={{ gridTemplateColumns: `repeat(${headers.length}, minmax(0, 1fr))` }}>
        {headers.map((header) => <div key={header} className="p-3">{header}</div>)}
      </div>
      {rows.map((row, index) => (
        <div key={`${row[0]}-${index}`} className="grid border-t border-white/5 text-sm" style={{ gridTemplateColumns: `repeat(${headers.length}, minmax(0, 1fr))` }}>
          {row.map((cell, cellIndex) => <div key={`${cell}-${cellIndex}`} className="p-3 text-muted-foreground first:font-medium first:text-foreground">{cellIndex === 1 ? <Badge>{cell}</Badge> : cell}</div>)}
        </div>
      ))}
    </div>
  );
}

function Row({ left, status, note }: { left: string; status: string; note: string }) {
  return <div className="rounded-md border border-white/5 bg-secondary/40 p-3"><div className="flex items-center justify-between gap-3"><p className="font-semibold">{left}</p><Badge>{status}</Badge></div><p className="mt-2 text-sm text-muted-foreground">{note}</p></div>;
}

function ProviderCard({ title, items }: { title: string; items: string[] }) {
  return <Card className="bg-secondary/35"><CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent className="space-y-2">{items.map((item) => <p key={item} className="text-sm text-muted-foreground">{item}</p>)}</CardContent></Card>;
}

function Checklist({ items }: { items: Array<[string, string]> }) {
  return <div className="grid gap-2 md:grid-cols-2">{items.map(([label, note]) => <div key={label} className="flex gap-3 rounded-md border border-white/5 bg-secondary/40 p-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><div><p className="font-medium">{label}</p><p className="text-sm text-muted-foreground">{note}</p></div></div>)}</div>;
}

function Score({ label, score, note }: { label: string; score: number; note: string }) {
  return (
    <div className="rounded-md border border-white/5 bg-secondary/40 p-3">
      <div className="flex items-center justify-between"><p className="font-semibold">{label}</p><Badge>{score}/100</Badge></div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-background"><div className="h-full rounded-full bg-primary" style={{ width: `${score}%` }} /></div>
      <p className="mt-2 text-sm text-muted-foreground">{note}</p>
    </div>
  );
}
