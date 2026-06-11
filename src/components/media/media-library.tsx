import { Download, Film, Music, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { aiVideoAssets, mediaAssets, musicTracks } from "@/lib/mock-data";

export function MediaLibrary() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload manual</CardTitle>
          <CardDescription>Imagens, vídeos, áudios, músicas e thumbnails.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="gap-2" disabled><Upload className="h-4 w-4" />Upload: storage pendente</Button>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        {mediaAssets.map((asset) => (
          <Card key={asset.id}>
            <CardHeader><CardTitle>{asset.title}</CardTitle><CardDescription>{asset.type} · {asset.source}</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{asset.description}</p>
              <div className="flex flex-wrap gap-2">{asset.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Film className="h-4 w-4 text-primary" />Vídeos IA</CardTitle><CardDescription>text_to_video, image_to_video, talking_character, intro, outro e upload.</CardDescription></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {aiVideoAssets.map((asset) => (
            <div key={asset.id} className="rounded-md border border-white/5 bg-secondary/40 p-4">
              <Badge>{asset.source}</Badge>
              <p className="mt-3 font-medium">{asset.title}</p>
              <p className="text-sm text-muted-foreground">{asset.durationSeconds}s · {asset.provider} · {asset.cost} créditos</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" disabled>Inserir pendente</Button>
                <Button variant="outline" size="sm" className="gap-2" disabled><Download className="h-4 w-4" />Storage pendente</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Music className="h-4 w-4 text-primary" />Músicas de fundo</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {musicTracks.map((track) => <div key={track.id} className="rounded-md border border-white/5 p-4"><p className="font-medium">{track.title}</p><p className="text-sm text-muted-foreground">{track.mood} · {track.durationSeconds}s</p></div>)}
        </CardContent>
      </Card>
    </div>
  );
}
