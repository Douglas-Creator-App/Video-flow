"use client";

import { useMemo, useState } from "react";
import { Play, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SelectField } from "@/components/ui/select-field";
import { voices } from "@/lib/mock-data";

export function VoiceLibrary() {
  const [provider, setProvider] = useState("all");
  const [language, setLanguage] = useState("all");
  const [favorites, setFavorites] = useState(false);
  const [favoriteVoiceIds, setFavoriteVoiceIds] = useState<string[]>(voices.filter((voice) => voice.isFavorite).map((voice) => voice.id));
  const [previewVoiceId, setPreviewVoiceId] = useState("");

  const filtered = useMemo(
    () => voices.filter((voice) => (provider === "all" || voice.provider === provider) && (language === "all" || voice.language === language) && (!favorites || favoriteVoiceIds.includes(voice.id))),
    [favoriteVoiceIds, favorites, language, provider]
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-4">
          <SelectField value={provider} onChange={(event) => setProvider(event.target.value)}>
            <option value="all">Provider</option>
            <option value="openai_tts">OpenAI TTS</option>
            <option value="elevenlabs">ElevenLabs</option>
            <option value="mock">Mock</option>
          </SelectField>
          <SelectField value={language} onChange={(event) => setLanguage(event.target.value)}>
            <option value="all">Idioma</option>
            <option value="pt-BR">pt-BR</option>
          </SelectField>
          <Button variant={favorites ? "default" : "outline"} onClick={() => setFavorites(!favorites)}>Favoritos</Button>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        {filtered.map((voice) => (
          <Card key={voice.id}>
            <CardHeader>
              <CardTitle>{voice.name}</CardTitle>
              <CardDescription>{voice.gender} · {voice.language} · {voice.style}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-3">
              <Badge>{voice.provider}</Badge>
              <div className="flex gap-2">
                <Button size="icon" variant={previewVoiceId === voice.id ? "default" : "ghost"} aria-label="Preview" onClick={() => setPreviewVoiceId(voice.id)}><Play className="h-4 w-4" /></Button>
                <Button size="icon" variant={favoriteVoiceIds.includes(voice.id) ? "default" : "ghost"} aria-label="Favoritar" onClick={() => setFavoriteVoiceIds((items) => items.includes(voice.id) ? items.filter((item) => item !== voice.id) : [...items, voice.id])}><Star className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
