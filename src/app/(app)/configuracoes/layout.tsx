import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const tabs = [
  ["Perfil", "/configuracoes/perfil"],
  ["Workspace", "/configuracoes/workspace"],
  ["Usuários", "/configuracoes/usuarios"],
  ["Permissões", "/configuracoes/permissoes"],
  ["Branding", "/configuracoes/branding"]
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div>
        <Badge className="mb-3 bg-secondary">Configurações</Badge>
        <h1 className="text-3xl font-semibold tracking-normal">Administração</h1>
      </div>
      <nav className="flex gap-2 overflow-x-auto" aria-label="Configurações">
        {tabs.map(([label, href]) => (
          <Link key={href} href={href} className="min-h-11 rounded-md border bg-card px-4 py-3 text-sm font-medium">
            {label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
