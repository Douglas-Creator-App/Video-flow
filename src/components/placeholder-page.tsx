import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Base preparada</CardTitle>
          <CardDescription>Esta fase entrega a infraestrutura SaaS e dados mockados.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {["Multi-tenant", "Permissões", "Realtime ready"].map((item) => (
              <div key={item} className="rounded-md border bg-secondary/40 p-4 text-sm font-medium">
                {item}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
