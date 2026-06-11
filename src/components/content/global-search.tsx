"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { contentItems, keywords, personas, projects, tags } from "@/lib/mock-data";

const entities = [
  ...projects.map((item) => ({ type: "projeto", title: item.name, description: item.description, meta: item.mainNiche })),
  ...contentItems.map((item) => ({ type: "conteúdo", title: item.title, description: item.description, meta: item.status })),
  ...personas.map((item) => ({ type: "persona", title: item.name, description: item.profession, meta: item.interests.join(", ") })),
  ...tags.map((item) => ({ type: "tag", title: item.name, description: "Tag global do workspace", meta: item.active ? "ativa" : "inativa" })),
  ...keywords.map((item) => ({ type: "palavra-chave", title: item.word, description: item.category, meta: item.intent }))
];

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("todos");

  const results = useMemo(
    () =>
      entities.filter((item) => {
        const text = [item.title, item.description, item.meta].join(" ").toLowerCase();
        return text.includes(query.toLowerCase()) && (type === "todos" || item.type === type);
      }),
    [query, type]
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Buscar em projetos, conteúdos, personas, tags e palavras-chave" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <SelectField value={type} onChange={(event) => setType(event.target.value)}>
            <option value="todos">Todos os tipos</option>
            <option value="projeto">Projetos</option>
            <option value="conteúdo">Conteúdos</option>
            <option value="persona">Personas</option>
            <option value="tag">Tags</option>
            <option value="palavra-chave">Palavras-chave</option>
          </SelectField>
        </CardContent>
      </Card>
      <div className="grid gap-3">
        {results.map((item) => (
          <Card key={`${item.type}-${item.title}`}>
            <CardContent className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <Badge>{item.type}</Badge>
                <Badge>{item.meta}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
