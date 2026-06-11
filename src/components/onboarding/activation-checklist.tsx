import Link from "next/link";
import { CheckCircle2, Circle, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { activationChecklist } from "@/lib/mock-data";

export function ActivationChecklist() {
  const completed = activationChecklist.filter((item) => item.completed).length;
  const progress = Math.round((completed / activationChecklist.length) * 100);

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Rocket className="h-4 w-4 text-primary" />Ativacao do workspace</CardTitle>
        <CardDescription>{completed}/{activationChecklist.length} passos concluidos para chegar ao primeiro video publicado.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-2 overflow-hidden rounded-full bg-background"><div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} /></div>
        <div className="grid gap-2 md:grid-cols-2">
          {activationChecklist.map((item) => (
            <Link key={item.id} href={item.href} className="flex min-h-11 items-center gap-3 rounded-md border border-white/5 bg-secondary/40 px-3 text-sm transition hover:border-primary/30">
              {item.completed ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
        <Button asChild className="w-full"><Link href="/app/onboarding">Continuar onboarding</Link></Button>
      </CardContent>
    </Card>
  );
}
