import { AssetAnalytics } from "@/components/assets/asset-library-dashboard";
import { ModuleHeader } from "@/components/module-header";

export default function AssetsAnalyticsPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader eyebrow="Storage Analytics" title="Analytics de armazenamento" description="Total de assets, espaco utilizado, videos, imagens, uploads, assets IA e uso em cenas." />
      <AssetAnalytics />
    </div>
  );
}
