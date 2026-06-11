import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { users } from "@/lib/mock-data";

export default function UsuariosPage() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Usuários</CardTitle>
          <CardDescription>Membros do workspace atual.</CardDescription>
        </div>
        <Button>Convidar</Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {users.map((user) => (
          <div key={user.id} className="grid gap-3 rounded-md border p-4 md:grid-cols-[1fr_140px_100px] md:items-center">
            <div>
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <Badge className="w-fit">{user.role}</Badge>
            <span className="text-sm text-muted-foreground">{user.status}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
