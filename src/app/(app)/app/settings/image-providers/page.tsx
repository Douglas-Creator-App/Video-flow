import { ProviderSettings } from "@/components/media/provider-settings";
import { ModuleHeader } from "@/components/module-header";

export default function ImageProvidersPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader eyebrow="Media Engine" title="Image Providers" description="OpenAI Images, Flux, Ideogram, Google/manual e mock provider." />
      <ProviderSettings type="image" />
    </div>
  );
}
