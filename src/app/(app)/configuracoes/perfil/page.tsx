import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PerfilPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil</CardTitle>
        <CardDescription>Dados do usuário em user_profiles.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" defaultValue="Daniel Mota" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" defaultValue="daniel@contentengine.ai" />
        </div>
        <Button className="md:w-fit">Salvar perfil</Button>
      </CardContent>
    </Card>
  );
}
