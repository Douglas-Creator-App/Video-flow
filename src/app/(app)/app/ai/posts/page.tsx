import { AiGeneratorPanel } from "@/components/ai/ai-generator-panel";
import { ModuleHeader } from "@/components/module-header";

export default function AiPostsPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader eyebrow="IA" title="Gerador de posts" description="Posts para Instagram, Facebook, LinkedIn e Threads com CTA e hashtags." />
      <AiGeneratorPanel title="Posts" description="Gere posts para redes sociais com emojis opcionais." generator="post" formats={["Instagram", "Facebook", "LinkedIn", "Threads"]} />
    </div>
  );
}
