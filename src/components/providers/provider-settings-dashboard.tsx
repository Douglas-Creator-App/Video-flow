"use client";

import { useEffect, useState } from "react";
import { Activity, Bot, ImageIcon, KeyRound, Mic, Play, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SelectField } from "@/components/ui/select-field";

type ProviderCheck = { provider: string; type: string; configured: boolean; status: string; env: string; masked_key?: string | null };

export function ProviderSettingsDashboard() {
  const [checks, setChecks] = useState<ProviderCheck[]>([]);
  const [type, setType] = useState("text");
  const [message, setMessage] = useState("");

  async function load() {
    const response = await fetch("/api/providers/status", { cache: "no-store" });
    const data = await response.json();
    setChecks(data.checks ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function testProvider() {
    setMessage("Testando provider...");
    const response = await fetch("/api/providers/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, prompt: "Crie um título curto para um vídeo de teste.", text: "Teste de voz Video Flow." })
    });
    const data = await response.json();
    setMessage(response.ok ? `OK em ${data.duration_ms}ms` : data.error ?? "Falha no teste.");
    await load();
  }

  return (
    <div className="space-y-4">
      <Card className="border-primary/15 bg-card/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-primary" />Providers seguros</CardTitle>
          <CardDescription>Chaves ficam apenas no backend. Esta tela mostra status mascarado, teste real e falhas claras.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[240px_180px_1fr]">
          <SelectField value={type} onChange={(event) => setType(event.target.value)}>
            {["text", "metadata", "tts", "image", "thumbnail", "video", "transcription", "moderation"].map((item) => <option key={item} value={item}>{item}</option>)}
          </SelectField>
          <Button onClick={testProvider} className="gap-2"><Play className="h-4 w-4" />Testar</Button>
          {message ? <div className="rounded-md border border-primary/20 bg-primary/5 p-2 text-sm text-muted-foreground">{message}</div> : null}
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {checks.map((item) => <ProviderCard key={`${item.type}-${item.provider}`} item={item} />)}
      </div>
    </div>
  );
}

function ProviderCard({ item }: { item: ProviderCheck }) {
  const Icon = item.type === "tts" ? Mic : item.type === "image" ? ImageIcon : item.type === "video" ? Video : item.type === "storage" ? Activity : Bot;
  return (
    <Card className="border-primary/10 bg-secondary/35">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base"><Icon className="h-4 w-4 text-primary" />{item.provider}</CardTitle>
            <CardDescription>{item.env} {item.masked_key ? `- ${item.masked_key}` : ""}</CardDescription>
          </div>
          <Badge>{item.status}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{item.configured ? "Configurado no backend." : "Chave ausente. Jobs reais devem falhar com erro claro."}</p>
      </CardContent>
    </Card>
  );
}
