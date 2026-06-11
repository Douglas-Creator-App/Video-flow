import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function WorkspacePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Workspace</CardTitle>
        <CardDescription>Configurações do tenant atual.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="workspace-name">Nome</Label>
          <Input id="workspace-name" defaultValue="Video Flow HQ" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" defaultValue="video-flow-hq" />
        </div>
        <Button className="md:w-fit">Salvar workspace</Button>
      </CardContent>
    </Card>
  );
}
