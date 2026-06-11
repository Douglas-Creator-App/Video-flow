import { FactoryAnalyticsDashboard } from "@/components/factories/content-factory-panels";

export default function FactoryAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-primary">Content Factory</p>
        <h1 className="font-display text-3xl font-bold">Factory Analytics</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Producao por factory, consumo de creditos, falhas, sucesso e score medio de qualidade.
        </p>
      </div>
      <FactoryAnalyticsDashboard />
    </div>
  );
}
