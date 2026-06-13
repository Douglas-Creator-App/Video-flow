"use client";

import { useState } from "react";
import { Loader2, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWorkspaceProvider } from "@/components/workspace/workspace-provider";

export function CreateWorkspaceCard() {
  const { refetch, setSelectedWorkspaceId } = useWorkspaceProvider();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function createWorkspace(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Falha ao criar workspace.");
        return;
      }
      setSelectedWorkspaceId(data.workspace.id);
      await refetch();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-primary/20 bg-card/70">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-4 w-4 text-primary" />
          Crie seu workspace
        </CardTitle>
        <CardDescription>
          O workspace é o espaço de trabalho do seu negócio no Video Flow. Dê um nome para começar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex max-w-md flex-col gap-3" onSubmit={createWorkspace}>
          <div className="grid gap-2">
            <Label htmlFor="workspace-name">Nome do workspace</Label>
            <Input
              id="workspace-name"
              placeholder="Ex.: Meu Canal, Minha Agência"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={80}
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button className="w-fit gap-2" disabled={loading || !name.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
            {loading ? "Criando..." : "Criar workspace"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
