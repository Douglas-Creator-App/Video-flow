"use client";

import { useState } from "react";
import { PenLine, Plus, Power } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { niches as initialNiches } from "@/lib/mock-data";
import type { Niche } from "@/lib/types";

export function NicheManager() {
  const [niches, setNiches] = useState<Niche[]>(initialNiches);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  function saveNiche() {
    if (!name.trim()) return;

    if (editingId) {
      setNiches((items) => items.map((niche) => (niche.id === editingId ? { ...niche, name } : niche)));
      setEditingId(null);
    } else {
      setNiches((items) => [
        { id: `niche_${Date.now()}`, workspaceId: "ws_1", name, isDefault: false, active: true },
        ...items
      ]);
    }

    setName("");
  }

  function toggleNiche(id: string) {
    setNiches((items) => items.map((niche) => (niche.id === id ? { ...niche, active: !niche.active } : niche)));
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Editar nicho" : "Adicionar nicho"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="niche-name">Nome</Label>
            <Input id="niche-name" value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <Button className="w-full gap-2" onClick={saveNiche}>
            <Plus className="h-4 w-4" />
            Salvar nicho
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {niches.map((niche) => (
          <Card key={niche.id} className={!niche.active ? "opacity-60" : undefined}>
            <CardContent className="flex items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-medium">{niche.name}</p>
                <div className="mt-2 flex gap-2">
                  <Badge>{niche.isDefault ? "padrão" : "personalizado"}</Badge>
                  <Badge>{niche.active ? "ativo" : "inativo"}</Badge>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Editar nicho"
                  onClick={() => {
                    setEditingId(niche.id);
                    setName(niche.name);
                  }}
                >
                  <PenLine className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" aria-label="Ativar ou desativar nicho" onClick={() => toggleNiche(niche.id)}>
                  <Power className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
