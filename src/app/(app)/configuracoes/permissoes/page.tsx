import { ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { rolePermissions } from "@/lib/permissions";

export default function PermissoesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Permissões
        </CardTitle>
        <CardDescription>Matriz granular por papel padrão.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        {Object.entries(rolePermissions).map(([role, permissions]) => (
          <div key={role} className="rounded-md border p-4">
            <h2 className="mb-3 text-sm font-semibold">{role}</h2>
            <div className="flex flex-wrap gap-2">
              {permissions.map((permission) => (
                <span key={permission} className="rounded-md bg-secondary px-2 py-1 text-xs text-muted-foreground">
                  {permission}
                </span>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
