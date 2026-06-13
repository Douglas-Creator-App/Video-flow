"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bot,
  BookOpen,
  CalendarDays,
  FolderKanban,
  Gauge,
  KeyRound,
  LayoutDashboard,
  Lightbulb,
  Library,
  Megaphone,
  PenLine,
  PlugZap,
  Scissors,
  Search,
  Settings,
  Bell,
  CreditCard,
  FileArchive,
  Crown,
  Shield,
  TrendingUp,
  Users,
  Wand2
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projetos", label: "Projetos", icon: FolderKanban },
  { href: "/nichos", label: "Nichos", icon: Gauge },
  { href: "/personas", label: "Personas", icon: Users },
  { href: "/palavras-chave", label: "Palavras-chave", icon: Search },
  { href: "/app/trends", label: "Radar Trends", icon: Gauge },
  { href: "/app/channel-insights", label: "Channel Insights", icon: Gauge },
  { href: "/app/topics", label: "Topics", icon: Lightbulb },
  { href: "/app/title-lab", label: "Title Lab", icon: Search },
  { href: "/app/thumb-lab", label: "Thumb Lab", icon: Library },
  { href: "/app/strategist", label: "Strategist", icon: Bot },
  { href: "/app/executive", label: "Executive", icon: LayoutDashboard },
  { href: "/app/growth", label: "Growth Engine", icon: TrendingUp },
  { href: "/app/platform", label: "Platform", icon: PlugZap },
  { href: "/app/insights", label: "Insights", icon: Gauge },
  { href: "/app/competitors", label: "Concorrentes", icon: Search },
  { href: "/app/ideas", label: "Banco de Ideias", icon: Lightbulb },
  { href: "/app/ai", label: "AI Engine", icon: Bot },
  { href: "/app/ai-video", label: "AI Video", icon: Bot },
  { href: "/app/talking-scenes", label: "Talking Scenes", icon: Bot },
  { href: "/app/ai/titles", label: "Gerar Títulos", icon: Bot },
  { href: "/app/ai/scripts", label: "Gerar Roteiros", icon: Bot },
  { href: "/app/playground", label: "Playground", icon: Bot },
  { href: "/app/magic", label: "Magic Mode", icon: Wand2 },
  { href: "/app/templates", label: "Templates", icon: Crown },
  { href: "/app/onboarding", label: "Onboarding", icon: Wand2 },
  { href: "/app/quick-start", label: "Quick Start", icon: Wand2 },
  { href: "/app/quality", label: "Qualidade", icon: Gauge },
  { href: "/app/test-lab", label: "Test Lab", icon: Activity },
  { href: "/app/launch", label: "Launch", icon: Shield },
  { href: "/app/factories", label: "Content Factory", icon: Wand2 },
  { href: "/app/factories/queues", label: "Factory Queue", icon: Gauge },
  { href: "/app/factories/analytics", label: "Factory Analytics", icon: Activity },
  { href: "/app/review-queue", label: "Review Queue", icon: Shield },
  { href: "/app/viral-clips", label: "Viral Clips", icon: Scissors },
  { href: "/app/export-center", label: "Export Center", icon: FileArchive },
  { href: "/app/channels", label: "Channels", icon: Users },
  { href: "/app/calendar", label: "Calendario", icon: CalendarDays },
  { href: "/app/production-plan", label: "Plano de Producao", icon: Gauge },
  { href: "/app/bulk-generation", label: "Bulk Generation", icon: Wand2 },
  { href: "/app/queue", label: "Fila", icon: Gauge },
  { href: "/app/channel-templates", label: "Templates Canal", icon: Library },
  { href: "/app/analytics", label: "Analytics", icon: Gauge },
  { href: "/app/billing", label: "Billing", icon: CreditCard },
  { href: "/app/admin-master", label: "Admin Master", icon: Shield },
  { href: "/app/admin-master/environment", label: "Environment", icon: Settings },
  { href: "/app/admin-master/providers-health", label: "Providers Health", icon: Activity },
  { href: "/app/admin-master/health", label: "System Health", icon: Gauge },
  { href: "/app/admin/logs", label: "Operational Logs", icon: Activity },
  { href: "/app/admin-master/security", label: "Security Center", icon: Shield },
  { href: "/app/admin-master/backups", label: "Backups", icon: FileArchive },
  { href: "/app/admin-master/jobs", label: "Jobs Monitor", icon: Activity },
  { href: "/app/admin-master/errors", label: "Error Logs", icon: Bell },
  { href: "/app/admin-master/smoke-test", label: "Smoke Test", icon: Wand2 },
  { href: "/app/admin-master/costs", label: "Custos", icon: Gauge },
  { href: "/app/operations", label: "Operacoes", icon: LayoutDashboard },
  { href: "/app/notifications", label: "Notificacoes", icon: Bell },
  { href: "/app/docs/production", label: "Docs Producao", icon: BookOpen },
  { href: "/app/settings/data", label: "LGPD / Dados", icon: FileArchive },
  { href: "/app/settings/api-keys", label: "Configuração (API Keys)", icon: KeyRound },
  { href: "/app/settings/providers", label: "Providers Reais", icon: Settings },
  { href: "/app/settings/video-providers", label: "Video Providers", icon: Settings },
  { href: "/app/videos", label: "Videos", icon: Bot },
  { href: "/app/assets", label: "Assets", icon: Library },
  { href: "/app/media-library", label: "Media Library", icon: Library },
  { href: "/app/voices", label: "Vozes", icon: Bot },
  { href: "/ideias", label: "Ideias", icon: Lightbulb },
  { href: "/conteudo", label: "Conteúdo", icon: PenLine },
  { href: "/biblioteca", label: "Biblioteca", icon: Library },
  { href: "/publicacoes", label: "Publicações", icon: Megaphone },
  { href: "/busca", label: "Busca Global", icon: Search },
  { href: "/ia-agents", label: "IA Agents", icon: Bot },
  { href: "/configuracoes/perfil", label: "Configurações", icon: Settings }
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-white/5 bg-background/80 px-4 py-5 backdrop-blur-md lg:block">
      <Link href="/dashboard" className="mb-8 flex min-h-11 items-center gap-3 rounded-md px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/30">
          <BookOpen className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="font-display text-base font-bold text-foreground">
            Video <span className="text-primary">Flow</span>
          </p>
          <p className="text-xs text-muted-foreground">SaaS Workspace</p>
        </div>
      </Link>
      <nav className="space-y-1" aria-label="Principal">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary",
                active && "border border-primary/20 bg-primary/10 text-primary shadow-gold"
              )}
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
