import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function BrandingPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Branding</CardTitle>
        <CardDescription>Tokens e identidade visual por workspace.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="brand-name">Nome da marca</Label>
          <Input id="brand-name" defaultValue="Video Flow" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="primary-color">Cor primária</Label>
          <Input id="primary-color" defaultValue="#0f9f7a" />
        </div>
        <Button className="md:w-fit">Salvar branding</Button>
      </CardContent>
    </Card>
  );
}
