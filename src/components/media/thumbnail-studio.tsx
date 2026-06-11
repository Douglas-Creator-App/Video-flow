"use client";

import { useState } from "react";
import { Download, ImageIcon, RefreshCcw, Save, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/ui/select-field";
import { thumbnailGenerations } from "@/lib/mock-data";

const presets = ["YouTube viral", "Documentário", "Canal dark", "História", "Religião", "Curiosidade", "Comparativo", "Luxo", "Mistério", "Batalha/versus"];

export function ThumbnailStudio({ videoId }: { videoId: string }) {
  const initial = thumbnailGenerations.find((item) => item.videoProjectId === videoId) ?? thumbnailGenerations[0];
  const [prompt, setPrompt] = useState(initial.prompt);
  const [style, setStyle] = useState(initial.style);
  const [textOverlay, setTextOverlay] = useState(initial.textOverlay);
  const [images, setImages] = useState<string[]>(initial.imageUrls);
  const [selected, setSelected] = useState(initial.selectedImageUrl ?? initial.imageUrls[0]);
  const [status, setStatus] = useState(initial.status);
  const [message, setMessage] = useState("");

  async function generate() {
    setStatus("processing");
    setMessage("");
    try {
      const result = await fetch("/api/media/thumbnails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_project_id: videoId, prompt, style, text_overlay: textOverlay, quantity: 6 })
      });
      const data = await result.json();
      if (!result.ok) throw new Error(data.error ?? "Falha ao gerar thumbnails.");
      setStatus(data.status);
      setMessage(data.warning ?? "Thumbnails geradas.");
      if (data.image_urls?.length) {
        setImages(data.image_urls);
        setSelected(data.selected_image_url);
      }
    } catch (error) {
      setStatus("failed");
      setMessage(error instanceof Error ? error.message : "Falha ao gerar thumbnails.");
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
      <Card className="border-primary/20 bg-gradient-to-br from-card to-secondary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Wand2 className="h-4 w-4 text-primary" />Thumbnail AI</CardTitle>
          <CardDescription>Gera 6 variações por padrão com fallback mockado.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Prompt"><Input value={prompt} onChange={(event) => setPrompt(event.target.value)} /></Field>
          <Field label="Estilo"><SelectField value={style} onChange={(event) => setStyle(event.target.value)}>{presets.map((preset) => <option key={preset}>{preset}</option>)}</SelectField></Field>
          <Field label="Texto da thumbnail"><Input value={textOverlay} onChange={(event) => setTextOverlay(event.target.value)} /></Field>
          <Button className="w-full gap-2" onClick={generate}><ImageIcon className="h-4 w-4" />Gerar thumbnails</Button>
          <Badge>{status}</Badge>
          {message ? <p className="rounded-md border border-primary/20 bg-primary/5 p-3 text-sm text-muted-foreground">{message}</p> : null}
        </CardContent>
      </Card>
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          {images.map((image, index) => (
            <Card key={`${image}-${index}`} className={selected === image ? "border-primary/50" : undefined}>
              <CardContent className="space-y-3 p-4">
                <div className="grid aspect-video place-items-center overflow-hidden rounded-md bg-primary/10 text-center text-primary">
                  {image.startsWith("data:") ? <img src={image} alt={`Thumbnail ${index + 1}`} className="h-full w-full object-cover" /> : <span>Thumbnail {index + 1}</span>}
                </div>
                <Button variant={selected === image ? "default" : "outline"} className="w-full" onClick={() => setSelected(image)}>Selecionar</Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader><CardTitle>Ações</CardTitle><CardDescription>Salvar, baixar ou regenerar a thumbnail principal.</CardDescription></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button className="gap-2" disabled><Save className="h-4 w-4" />Salvar: storage pendente</Button>
            {selected.startsWith("data:") ? (
              <Button variant="outline" className="gap-2" asChild><a href={selected} download="video-flow-thumbnail.png"><Download className="h-4 w-4" />Baixar thumbnail</a></Button>
            ) : (
              <Button variant="outline" className="gap-2" disabled><Download className="h-4 w-4" />Baixar: arquivo pendente</Button>
            )}
            <Button variant="outline" className="gap-2" onClick={generate}><RefreshCcw className="h-4 w-4" />Regenerar</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid gap-2"><Label>{label}</Label>{children}</div>;
}
