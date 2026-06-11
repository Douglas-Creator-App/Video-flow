"use client";

import { useState } from "react";
import { ImageIcon, Mic, Power, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { imageProviders, voiceProviders } from "@/lib/mock-data";

type ProviderItem = (typeof voiceProviders)[number] | (typeof imageProviders)[number];

export function ProviderSettings({ type }: { type: "voice" | "image" }) {
  const [providers, setProviders] = useState<ProviderItem[]>(type === "voice" ? voiceProviders : imageProviders);
  const Icon = type === "voice" ? Mic : ImageIcon;
  const [name, setName] = useState("");

  function toggleProvider(providerId: string) {
    setProviders((items) => items.map((provider) => (
      provider.id === providerId
        ? { ...provider, status: provider.status === "active" ? "inactive" : "active" }
        : provider
    )));
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[340px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Cadastrar provider</CardTitle>
          <CardDescription>API key fica somente no backend e deve ser criptografada no banco.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Nome</Label>
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Provider customizado" />
          </div>
          <div className="grid gap-2">
            <Label>API Key</Label>
            <Input type="password" placeholder="Nunca expor no frontend" disabled />
          </div>
          <div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-sm text-muted-foreground">
            Credenciais reais devem ser salvas por endpoint server-side com criptografia. Esta tela esta em modo demonstracao.
          </div>
          <Button className="w-full" disabled>Salvar provider: backend seguro pendente</Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {providers.map((provider) => (
          <Card key={provider.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2"><Icon className="h-4 w-4 text-primary" />{provider.name}</CardTitle>
                  <CardDescription>{provider.provider} - {provider.defaultModel}</CardDescription>
                </div>
                <Badge>{provider.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Custo: {"costPerCharacter" in provider ? provider.costPerCharacter : provider.costPerImage}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="gap-2" onClick={() => toggleProvider(provider.id)}>
                  <Power className="h-4 w-4" />Ativar/desativar
                </Button>
                <Button size="sm" variant="outline" className="gap-2" disabled>
                  <Star className="h-4 w-4" />Padrao: persistencia pendente
                </Button>
                {type === "voice" ? <Button size="sm" disabled>Teste real exige provider</Button> : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
