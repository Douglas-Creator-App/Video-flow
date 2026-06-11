"use client";

import { useMemo, useState } from "react";
import { Plus, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/ui/select-field";
import { personas as initialPersonas, projects } from "@/lib/mock-data";
import type { Persona } from "@/lib/types";

export function PersonaManager() {
  const [personas, setPersonas] = useState<Persona[]>(initialPersonas);
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [name, setName] = useState("");
  const [profession, setProfession] = useState("");
  const [pain, setPain] = useState("");

  const visiblePersonas = useMemo(
    () => personas.filter((persona) => persona.projectId === projectId),
    [personas, projectId]
  );

  function addPersona() {
    if (!name.trim()) return;

    setPersonas((items) => [
      {
        id: `persona_${Date.now()}`,
        workspaceId: "ws_1",
        projectId,
        name,
        age: 32,
        gender: "Não informado",
        profession,
        pains: pain ? [pain] : [],
        goals: ["Converter melhor com conteúdo"],
        objections: ["Precisa ver prova"],
        desires: ["Clareza e confiança"],
        interests: ["Conteúdo", "Vendas"]
      },
      ...items
    ]);
    setName("");
    setProfession("");
    setPain("");
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Nova persona</CardTitle>
          <CardDescription>Vincule personas diretamente a um projeto.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-5">
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="persona-project">Projeto</Label>
            <SelectField id="persona-project" value={projectId} onChange={(event) => setProjectId(event.target.value)}>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </SelectField>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="persona-name">Nome</Label>
            <Input id="persona-name" value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="persona-profession">Profissão</Label>
            <Input id="persona-profession" value={profession} onChange={(event) => setProfession(event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="persona-pain">Dor principal</Label>
            <Input id="persona-pain" value={pain} onChange={(event) => setPain(event.target.value)} />
          </div>
          <Button className="gap-2 md:col-span-5 md:w-fit" onClick={addPersona}>
            <Plus className="h-4 w-4" />
            Criar persona
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {visiblePersonas.map((persona) => (
          <Card key={persona.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>{persona.name}</CardTitle>
                  <CardDescription>
                    {persona.age} anos · {persona.gender} · {persona.profession}
                  </CardDescription>
                </div>
                <Button size="icon" variant="ghost" aria-label="Favoritar persona">
                  <Star className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <PersonaList title="Dores" items={persona.pains} />
              <PersonaList title="Objetivos" items={persona.goals} />
              <PersonaList title="Objeções" items={persona.objections} />
              <PersonaList title="Desejos" items={persona.desires} />
              <div className="md:col-span-2">
                <p className="mb-2 text-xs font-medium text-muted-foreground">Interesses</p>
                <div className="flex flex-wrap gap-2">
                  {persona.interests.map((item) => (
                    <Badge key={item}>{item}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function PersonaList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted-foreground">{title}</p>
      <ul className="space-y-1 text-sm">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
