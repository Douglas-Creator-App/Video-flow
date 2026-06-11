"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Film, ImageIcon, Mic, Plus, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/ui/select-field";
import { projects, videoProjects } from "@/lib/mock-data";

export function VideoWorkspace() {
  const [title, setTitle] = useState("Novo video a partir de roteiro");
  const [format, setFormat] = useState("reels");

  return (
    <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
      <Card className="border-primary/25 bg-[linear-gradient(135deg,rgb(24_24_24/.96),rgb(10_10_10/.98))]">
        <CardHeader>
          <Badge className="w-fit">Magic first</Badge>
          <CardTitle className="flex items-center gap-2 pt-2">
            <Wand2 className="h-4 w-4 text-primary" />
            Criar video completo
          </CardTitle>
          <CardDescription>Use o Magic Mode para gerar roteiro, voz, cenas, imagens, legendas, thumbnail e abrir direto no editor.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild className="w-full gap-2">
            <Link href="/app/magic">
              <Wand2 className="h-4 w-4" />
              Abrir Magic Mode
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <div className="grid grid-cols-3 gap-2">
            {["Roteiro", "Assets", "Editor"].map((item) => (
              <div key={item} className="rounded-md border border-primary/15 bg-primary/5 p-2 text-center text-xs text-primary">{item}</div>
            ))}
          </div>
          <Field label="Roteiro"><SelectField><option>Checklist de publicacao em 60 segundos</option></SelectField></Field>
          <Field label="Projeto"><SelectField>{projects.map((project) => <option key={project.id}>{project.name}</option>)}</SelectField></Field>
          <Field label="Titulo"><Input value={title} onChange={(event) => setTitle(event.target.value)} /></Field>
          <Field label="Formato"><SelectField value={format} onChange={(event) => setFormat(event.target.value)}>{["short", "reels", "tiktok", "youtube_long"].map((item) => <option key={item}>{item}</option>)}</SelectField></Field>
          <Field label="Voz"><SelectField><option>Alloy - OpenAI TTS</option><option>Mock Deep</option></SelectField></Field>
          <Field label="Estilo visual"><SelectField>{["cinematografico", "realista", "documental", "luxo", "sombrio"].map((item) => <option key={item}>{item}</option>)}</SelectField></Field>
          <Button variant="outline" className="w-full gap-2" disabled><Plus className="h-4 w-4" />Criacao manual: persistencia pendente</Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {videoProjects.map((video) => (
          <Card key={video.id} className="border-primary/10 bg-card/75 transition hover:border-primary/25">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>{video.title}</CardTitle>
                  <CardDescription>{video.format} - {video.aspectRatio} - {video.durationTarget}s</CardDescription>
                </div>
                <Badge>{video.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Mic className="h-4 w-4" />voz</span>
                <span className="flex items-center gap-1"><ImageIcon className="h-4 w-4" />cenas</span>
                <span className="flex items-center gap-1"><Film className="h-4 w-4" />render</span>
              </div>
              <Button asChild className="w-full">
                <Link href={`/app/videos/${video.id}/editor`}>Abrir editor</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/app/videos/${video.id}/thumbnails`}>Gerar thumbnail</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid gap-2"><Label>{label}</Label>{children}</div>;
}
