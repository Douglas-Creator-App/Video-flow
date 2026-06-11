"use client";

import { useMemo, useState } from "react";
import { Archive, Copy, PenLine, Plus, Star, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/ui/select-field";
import { niches, projects as initialProjects } from "@/lib/mock-data";
import type { Project } from "@/lib/types";

const emptyProject = {
  name: "",
  description: "",
  mainNiche: "Marketing",
  logo: "CE",
  primaryColor: "#0f9f7a",
  language: "pt-BR",
  country: "Brasil"
};

export function ProjectManager() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [form, setForm] = useState(emptyProject);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filteredProjects = useMemo(
    () =>
      projects.filter((project) =>
        [project.name, project.description, project.mainNiche, project.country]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [projects, query]
  );

  function saveProject() {
    if (!form.name.trim()) return;

    if (editingId) {
      setProjects((items) =>
        items.map((project) =>
          project.id === editingId
            ? {
                ...project,
                name: form.name,
                description: form.description,
                mainNiche: form.mainNiche,
                logo: form.logo,
                primaryColor: form.primaryColor,
                language: form.language,
                country: form.country,
                updatedAt: new Date().toISOString().slice(0, 10)
              }
            : project
        )
      );
      setEditingId(null);
    } else {
      setProjects((items) => [
        {
          id: `project_${Date.now()}`,
          workspaceId: "ws_1",
          ...form,
          status: "ativo",
          createdAt: new Date().toISOString().slice(0, 10),
          updatedAt: new Date().toISOString().slice(0, 10)
        },
        ...items
      ]);
    }

    setForm(emptyProject);
  }

  function editProject(project: Project) {
    setEditingId(project.id);
    setForm({
      name: project.name,
      description: project.description,
      mainNiche: project.mainNiche,
      logo: project.logo,
      primaryColor: project.primaryColor,
      language: project.language,
      country: project.country
    });
  }

  function archiveProject(id: string) {
    setProjects((items) =>
      items.map((project) => (project.id === id ? { ...project, status: "arquivado" } : project))
    );
  }

  function duplicateProject(project: Project) {
    setProjects((items) => [
      {
        ...project,
        id: `project_${Date.now()}`,
        name: `${project.name} cópia`,
        status: "ativo",
        createdAt: new Date().toISOString().slice(0, 10),
        updatedAt: new Date().toISOString().slice(0, 10)
      },
      ...items
    ]);
  }

  function deleteProject(id: string) {
    setProjects((items) => items.filter((project) => project.id !== id));
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Editar projeto" : "Criar projeto"}</CardTitle>
          <CardDescription>Persistência prevista em `projects` no Supabase.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="project-name">Nome</Label>
            <Input id="project-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="project-description">Descrição</Label>
            <Input
              id="project-description"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="project-niche">Nicho principal</Label>
            <SelectField id="project-niche" value={form.mainNiche} onChange={(event) => setForm({ ...form, mainNiche: event.target.value })}>
              {niches.filter((niche) => niche.active).map((niche) => (
                <option key={niche.id}>{niche.name}</option>
              ))}
            </SelectField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="project-logo">Logo</Label>
              <Input id="project-logo" value={form.logo} onChange={(event) => setForm({ ...form, logo: event.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="project-color">Cor</Label>
              <Input id="project-color" value={form.primaryColor} onChange={(event) => setForm({ ...form, primaryColor: event.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="project-language">Idioma</Label>
              <Input id="project-language" value={form.language} onChange={(event) => setForm({ ...form, language: event.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="project-country">País</Label>
              <Input id="project-country" value={form.country} onChange={(event) => setForm({ ...form, country: event.target.value })} />
            </div>
          </div>
          <Button className="w-full gap-2" onClick={saveProject}>
            <Plus className="h-4 w-4" />
            {editingId ? "Salvar alterações" : "Criar projeto"}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Input placeholder="Buscar projetos por nome, nicho ou país" value={query} onChange={(event) => setQuery(event.target.value)} />
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredProjects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-md text-sm font-semibold text-white"
                      style={{ backgroundColor: project.primaryColor }}
                    >
                      {project.logo}
                    </div>
                    <div>
                      <CardTitle>{project.name}</CardTitle>
                      <CardDescription>{project.mainNiche}</CardDescription>
                    </div>
                  </div>
                  <Badge>{project.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{project.description}</p>
                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <span>{project.language}</span>
                  <span>{project.country}</span>
                  <span>{project.updatedAt}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" className="gap-2" onClick={() => editProject(project)}>
                    <PenLine className="h-4 w-4" />
                    Editar
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2" onClick={() => archiveProject(project.id)}>
                    <Archive className="h-4 w-4" />
                    Arquivar
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2" onClick={() => duplicateProject(project)}>
                    <Copy className="h-4 w-4" />
                    Duplicar
                  </Button>
                  <Button size="sm" variant="ghost" className="gap-2" aria-label="Favoritar projeto">
                    <Star className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" className="gap-2" onClick={() => deleteProject(project.id)}>
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
