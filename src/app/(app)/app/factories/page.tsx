import { FactoriesDashboard } from "@/components/factories/content-factory-panels";

export default function FactoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-primary">Fase 19</p>
        <h1 className="font-display text-3xl font-bold">Content Factory</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Automacao de fabrica de conteudo com templates, filas, quality gate, recursos e revisao humana antes de qualquer publicacao.
        </p>
      </div>
      <FactoriesDashboard />
    </div>
  );
}
