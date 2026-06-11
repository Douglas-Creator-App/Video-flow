"use client";

import { useState } from "react";
import { Loader2, Save, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/ui/select-field";
import type { AiGeneratorRequest, PromptCategory } from "@/lib/types";

export function AiGeneratorPanel({
  title,
  description,
  generator,
  formats
}: {
  title: string;
  description: string;
  generator: PromptCategory | "post";
  formats: string[];
}) {
  const [form, setForm] = useState<AiGeneratorRequest>({
    generator,
    niche: "Marketing",
    persona: "Gestor de conteúdo",
    objective: "lead_generation",
    platform: "Instagram Reels",
    quantity: 3,
    format: formats[0],
    tone: "consultivo e direto"
  });
  const [status, setStatus] = useState<"idle" | "aguardando" | "processando" | "concluído" | "erro">("idle");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");

  async function generate() {
    setStatus("aguardando");
    setError("");
    setResponse("");
    await new Promise((resolve) => setTimeout(resolve, 250));
    setStatus("processando");

    const result = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    const data = await result.json();
    if (!result.ok) {
      setStatus("erro");
      setError(data.error ?? "Falha ao gerar conteúdo.");
      return;
    }

    setStatus("concluído");
    setResponse(data.response);
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
      <Card className="border-primary/20 bg-gradient-to-br from-card to-secondary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Nicho">
            <Input value={form.niche} onChange={(event) => setForm({ ...form, niche: event.target.value })} />
          </Field>
          <Field label="Persona">
            <Input value={form.persona} onChange={(event) => setForm({ ...form, persona: event.target.value })} />
          </Field>
          <Field label="Objetivo">
            <SelectField value={form.objective} onChange={(event) => setForm({ ...form, objective: event.target.value })}>
              {["awareness", "engagement", "lead_generation", "sales", "authority", "education", "retention"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </SelectField>
          </Field>
          <Field label="Plataforma">
            <Input value={form.platform} onChange={(event) => setForm({ ...form, platform: event.target.value })} />
          </Field>
          <Field label="Formato / Tipo / Tamanho">
            <SelectField value={form.format} onChange={(event) => setForm({ ...form, format: event.target.value })}>
              {formats.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </SelectField>
          </Field>
          <Field label="Quantidade">
            <Input
              type="number"
              min={1}
              max={10}
              value={form.quantity}
              onChange={(event) => setForm({ ...form, quantity: Number(event.target.value) })}
            />
          </Field>
          <Field label="Tom">
            <Input value={form.tone} onChange={(event) => setForm({ ...form, tone: event.target.value })} />
          </Field>
          <Button className="w-full gap-2" onClick={generate} disabled={status === "processando" || status === "aguardando"}>
            {status === "processando" || status === "aguardando" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Gerar com IA
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>Resultado</CardTitle>
              <CardDescription>Histórico, custo e persistência estão previstos no schema Supabase.</CardDescription>
            </div>
            <Badge>{status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? <p className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">{error}</p> : null}
          <pre className="min-h-[420px] whitespace-pre-wrap rounded-md border border-white/5 bg-background/80 p-4 text-sm text-foreground">
            {response || "Configure OPENAI_API_KEY no backend e clique em gerar."}
          </pre>
          <Button variant="outline" className="gap-2" disabled={!response}>
            <Save className="h-4 w-4" />
            Salvar na biblioteca
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
