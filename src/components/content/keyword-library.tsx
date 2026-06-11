"use client";

import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { keywords, niches, projects } from "@/lib/mock-data";

export function KeywordLibrary() {
  const [projectId, setProjectId] = useState("all");
  const [nicheId, setNicheId] = useState("all");
  const [category, setCategory] = useState("all");

  const categories = Array.from(new Set(keywords.map((keyword) => keyword.category)));
  const filtered = useMemo(
    () =>
      keywords.filter((keyword) => {
        return (
          (projectId === "all" || keyword.projectId === projectId) &&
          (nicheId === "all" || keyword.nicheId === nicheId) &&
          (category === "all" || keyword.category === category)
        );
      }),
    [category, nicheId, projectId]
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-4">
          <Input placeholder="Buscar palavra-chave" />
          <SelectField value={nicheId} onChange={(event) => setNicheId(event.target.value)}>
            <option value="all">Todos os nichos</option>
            {niches.map((niche) => (
              <option key={niche.id} value={niche.id}>
                {niche.name}
              </option>
            ))}
          </SelectField>
          <SelectField value={projectId} onChange={(event) => setProjectId(event.target.value)}>
            <option value="all">Todos os projetos</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </SelectField>
          <SelectField value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all">Todas as categorias</option>
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </SelectField>
        </CardContent>
      </Card>
      <div className="grid gap-4 lg:grid-cols-3">
        {filtered.map((keyword) => (
          <Card key={keyword.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>{keyword.word}</CardTitle>
                  <Badge className="mt-2">{keyword.intent}</Badge>
                </div>
                <Button size="icon" variant="ghost" aria-label="Favoritar palavra-chave">
                  <Star className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-3 text-sm">
              <Metric label="Volume" value={keyword.volume.toLocaleString("pt-BR")} />
              <Metric label="Dificuldade" value={`${keyword.difficulty}/100`} />
              <Metric label="Categoria" value={keyword.category} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
