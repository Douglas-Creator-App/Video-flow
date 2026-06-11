import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ConfirmEmailPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Confirmação de email</CardTitle>
          <CardDescription>Depois do callback do Supabase, o usuário é direcionado para o workspace ativo.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/dashboard">Ir para o dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
