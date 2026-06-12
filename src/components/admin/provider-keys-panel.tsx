"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, KeyRound, Loader2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWorkspaceProvider } from "@/components/workspace/workspace-provider";

type ProviderKeyStatus = {
  key_name: string;
  configured: boolean;
  source: "app" | "env" | null;
  masked: string | null;
  updated_at: string | null;
};

const KEY_LABELS: Record<string, { label: string; hint: string }> = {
  OPENAI_API_KEY: { label: "OpenAI", hint: "Roteiros, títulos, imagens e voz (TTS)." },
  ELEVENLABS_API_KEY: { label: "ElevenLabs", hint: "Vozes premium para narração." },
  RUNWAY_API_KEY: { label: "Runway", hint: "Geração de vídeo com IA." },
  KLING_API_KEY: { label: "Kling", hint: "Geração de vídeo com IA." },
  PIKA_API_KEY: { label: "Pika", hint: "Geração de vídeo com IA." },
  VEO_API_KEY: { label: "Veo", hint: "Geração de vídeo com IA (Google)." },
  LUMA_API_KEY: { label: "Luma", hint: "Geração de vídeo com IA." },
  PEXELS_API_KEY: { label: "Pexels", hint: "Banco de fotos e vídeos stock." },
  PIXABAY_API_KEY: { label: "Pixabay", hint: "Banco de fotos e vídeos stock." },
  UNSPLASH_ACCESS_KEY: { label: "Unsplash", hint: "Banco de fotos stock." }
};

export function ProviderKeysPanel() {
  const { currentWorkspace } = useWorkspaceProvider();
  const workspaceId = currentWorkspace?.id ?? "";
  const [keys, setKeys] = useState<ProviderKeyStatus[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/provider-keys?workspace_id=${workspaceId}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error ?? "Falha ao carregar chaves.");
        return;
      }
      setKeys(data.keys ?? []);
      setMessage("");
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveKey(keyName: string, value: string) {
    if (!workspaceId) return;
    setSavingKey(keyName);
    setMessage("");
    try {
      const response = await fetch("/api/admin/provider-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspace_id: workspaceId, key_name: keyName, key_value: value })
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error ?? "Falha ao salvar chave.");
        return;
      }
      setDrafts((prev) => ({ ...prev, [keyName]: "" }));
      setMessage(value ? `${KEY_LABELS[keyName]?.label ?? keyName} salva com sucesso.` : `${KEY_LABELS[keyName]?.label ?? keyName} removida.`);
      await load();
    } finally {
      setSavingKey(null);
    }
  }

  if (!workspaceId) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Selecione um workspace para gerenciar as chaves de API.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-primary/15 bg-card/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" />
            Chaves de API dos provedores
          </CardTitle>
          <CardDescription>
            Cole aqui as chaves dos serviços de IA e mídia. Elas ficam guardadas apenas no backend e nunca são
            expostas ao navegador — esta tela mostra somente uma versão mascarada.
          </CardDescription>
        </CardHeader>
        {message ? (
          <CardContent>
            <div className="rounded-md border border-primary/20 bg-primary/5 p-2 text-sm text-muted-foreground">{message}</div>
          </CardContent>
        ) : null}
      </Card>

      {loading ? (
        <Card>
          <CardContent className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando chaves...
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {keys.map((item) => {
            const meta = KEY_LABELS[item.key_name] ?? { label: item.key_name, hint: "" };
            const draft = drafts[item.key_name] ?? "";
            const saving = savingKey === item.key_name;
            return (
              <Card key={item.key_name} className="border-primary/10 bg-secondary/35">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-base">{meta.label}</CardTitle>
                      <CardDescription>{meta.hint}</CardDescription>
                    </div>
                    {item.configured ? (
                      <Badge className="border-primary/20 bg-primary/10 text-primary">
                        {item.source === "env" ? "via .env" : "configurada"}
                      </Badge>
                    ) : (
                      <Badge className="border-border bg-secondary text-muted-foreground">não configurada</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-2">
                    <Label htmlFor={item.key_name} className="text-xs text-muted-foreground">
                      {item.key_name}
                      {item.masked ? ` · atual: ${item.masked}` : ""}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id={item.key_name}
                        type="password"
                        placeholder={item.configured ? "Colar nova chave para substituir" : "Colar a chave aqui"}
                        value={draft}
                        onChange={(event) => setDrafts((prev) => ({ ...prev, [item.key_name]: event.target.value }))}
                        autoComplete="off"
                      />
                      <Button
                        onClick={() => saveKey(item.key_name, draft.trim())}
                        disabled={saving || !draft.trim()}
                        className="gap-1"
                      >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        Salvar
                      </Button>
                      {item.source === "app" ? (
                        <Button
                          variant="outline"
                          onClick={() => saveKey(item.key_name, "")}
                          disabled={saving}
                          title="Remover chave salva"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
