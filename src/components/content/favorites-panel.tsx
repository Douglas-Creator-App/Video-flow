import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { contentItems, favorites, keywords, personas, projects } from "@/lib/mock-data";

export function FavoritesPanel() {
  const items = favorites.map((favorite) => {
    if (favorite.entityType === "project") {
      const source = projects.find((item) => item.id === favorite.entityId);
      return { id: favorite.id, type: favorite.entityType, title: source?.name ?? "Projeto", description: source?.description ?? "Projeto favorito" };
    }

    if (favorite.entityType === "content") {
      const source = contentItems.find((item) => item.id === favorite.entityId);
      return { id: favorite.id, type: favorite.entityType, title: source?.title ?? "Conteúdo", description: source?.description ?? "Conteúdo favorito" };
    }

    if (favorite.entityType === "keyword") {
      const source = keywords.find((item) => item.id === favorite.entityId);
      return { id: favorite.id, type: favorite.entityType, title: source?.word ?? "Palavra-chave", description: source?.category ?? "Palavra-chave favorita" };
    }

    const source = personas.find((item) => item.id === favorite.entityId);
    return { id: favorite.id, type: favorite.entityType, title: source?.name ?? "Persona", description: source?.profession ?? "Persona favorita" };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-4 w-4 text-primary" />
          Favoritos
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-md border p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-sm font-medium">{item.title}</p>
              <Badge>{item.type}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
