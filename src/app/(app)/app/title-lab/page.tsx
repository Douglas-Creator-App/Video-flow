import { ModuleHeader } from "@/components/module-header";
import { TitleLabDashboard } from "@/components/studio/youtube-studio-ai-panels";

export default function TitleLabPage() {
  return <div className="space-y-6"><ModuleHeader eyebrow="Title Lab" title="Titulos e ganchos" description="20 titulos, ganchos e versoes emocionais, curiosas e virais com score individual." /><TitleLabDashboard /></div>;
}
