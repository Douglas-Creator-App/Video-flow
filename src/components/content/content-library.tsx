"use client";

import { useMemo, useState } from "react";
import { Archive, Copy, FolderInput, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { contentItems as initialItems, projects } from "@/lib/mock-data";
import type { ContentItem, ContentStatus, ContentType } from "@/lib/types";

const contentTypes: ContentType[] = ["Ideia", "Roteiro", "Artigo", "Carrossel", "Vídeo", "Shorts", "Reels", "Email", "Copy", "Anúncio"];
const statuses: ContentStatus[] = ["rascunho", "aprovado", "publicado", "arquivado"];

export function ContentLibrary() {
  const [items, setItems] = useState<ContentItem[]>(initialItems);
  const [projectId, setProjectId] = useState("all");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        const text = [item.title, item.description, item.category, item.tags.join(" ")].join(" ").toLowerCase();
        return (
          text.includes(query.toLowerCase()) &&
          (projectId === "all" || item.projectId === projectId) &&
          (status === "all" || item.status === status) &&
          (type === "all" || item.type === type)
        );
      }),
    [items, projectId, query, status, type]
  );

  function duplicate(item: ContentItem) {
    setItems((current) => [{ ...item, id: `content_${Date.now()}`, title: `${item.title} cópia`, status: "rascunho" }, ...current]);
  }

  function archive(id: string) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, status: "arquivado" } : item)));
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-4">
          <Input placeholder="Buscar conteúdos, tags ou autores" value={query} onChange={(event) => setQuery(event.target.value)} />
          <SelectField value={projectId} onChange={(event) => setProjectId(event.target.value)}>
            <option value="all">Todos os projetos</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </SelectField>
          <SelectField value={type} onChange={(event) => setType(event.target.value)}>
            <option value="all">Todos os tipos</option>
            {contentTypes.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </SelectField>
          <SelectField value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">Todos os status</option>
            {statuses.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </SelectField>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        {filtered.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>
                    {item.type} · {item.category} · {item.author}
                  </CardDescription>
                </div>
                <Badge>{item.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="gap-2">
                  <FolderInput className="h-4 w-4" />
                  Mover
                </Button>
                <Button size="sm" variant="outline" className="gap-2" onClick={() => duplicate(item)}>
                  <Copy className="h-4 w-4" />
                  Duplicar
                </Button>
                <Button size="sm" variant="outline" className="gap-2" onClick={() => archive(item.id)}>
                  <Archive className="h-4 w-4" />
                  Arquivar
                </Button>
                <Button size="sm" variant="ghost" className="gap-2" aria-label="Favoritar conteúdo">
                  <Star className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
