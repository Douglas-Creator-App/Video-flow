import { Bot, Coins, FileText, KeyRound, ListChecks } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const providers = [
  ["OpenAI", "openai", "gpt-5.2", "active"],
  ["Gemini", "gemini", "gemini-pro", "inactive"],
  ["Claude", "claude", "claude-sonnet", "inactive"]
];

const prompts = ["roteiro", "título", "gancho", "carrossel", "artigo", "email", "anúncio", "whatsapp", "descrição youtube", "seo"];
const agents = ["Copywriter", "SEO", "YouTube", "TikTok", "Reels", "Vendas", "WhatsApp", "VSL"];

export function AiAdminPanels() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Panel icon={KeyRound} title="AI Providers" description="Chaves criptografadas e múltiplos provedores por workspace.">
        {providers.map(([name, provider, model, status]) => (
          <Row key={provider} label={name} value={`${provider} · ${model}`} badge={status} />
        ))}
      </Panel>
      <Panel icon={FileText} title="Prompt Engine" description="Templates versionados por categoria, provider e modelo.">
        <div className="flex flex-wrap gap-2">{prompts.map((prompt) => <Badge key={prompt}>{prompt}</Badge>)}</div>
      </Panel>
      <Panel icon={Bot} title="AI Agents" description="Agentes padrão e personalizados para geração e playground.">
        <div className="grid gap-2 md:grid-cols-2">{agents.map((agent) => <Row key={agent} label={agent} value="OpenAI · gpt-5.2" badge="ativo" />)}</div>
      </Panel>
      <Panel icon={Coins} title="Créditos, filas e histórico" description="Controle de tokens, custos, jobs assíncronos e logs completos.">
        <Row label="Hoje" value="12.480 tokens · R$ 4,82" badge="diário" />
        <Row label="Semana" value="68.220 tokens · R$ 25,14" badge="semanal" />
        <Row label="Mês" value="284.900 tokens · R$ 109,70" badge="mensal" />
      </Panel>
      <Panel icon={ListChecks} title="Fila de geração" description="Todas as gerações passam por estados operacionais.">
        {["aguardando", "processando", "concluído", "erro"].map((status) => <Row key={status} label={status} value="Estado suportado" badge="fila" />)}
      </Panel>
    </div>
  );
}

function Panel({ icon: Icon, title, description, children }: { icon: typeof Bot; title: string; description: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Icon className="h-4 w-4 text-primary" />{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}

function Row({ label, value, badge }: { label: string; value: string; badge: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-white/5 p-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{value}</p>
      </div>
      <Badge>{badge}</Badge>
    </div>
  );
}
