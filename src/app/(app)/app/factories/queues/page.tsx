import { FactoryQueuesDashboard } from "@/components/factories/content-factory-panels";

export default function FactoryQueuesPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-primary">Content Factory</p>
        <h1 className="font-display text-3xl font-bold">Factory Queue</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Fila de producao automatica com progresso, falhas, tempo estimado, creditos e regeneracao assistida.
        </p>
      </div>
      <FactoryQueuesDashboard />
    </div>
  );
}
