import { FactoryDetail } from "@/components/factories/content-factory-panels";

export default async function FactoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-primary">Content Factory</p>
        <h1 className="font-display text-3xl font-bold">Factory Detail</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Configuracao, regras, agenda, fila, quality gate e resource manager da automacao selecionada.
        </p>
      </div>
      <FactoryDetail factoryId={id} />
    </div>
  );
}
