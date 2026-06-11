import { ReviewQueueDashboard } from "@/components/factories/content-factory-panels";

export default function ReviewQueuePage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-primary">Human Approval</p>
        <h1 className="font-display text-3xl font-bold">Review Queue</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Itens retidos por quality gate ou regra de revisao obrigatoria. O usuario decide aprovar, editar, rejeitar ou reenviar.
        </p>
      </div>
      <ReviewQueueDashboard />
    </div>
  );
}
