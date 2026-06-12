import { Clapperboard } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Clapperboard className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <CardTitle className="text-2xl">Criar conta no Video Flow</CardTitle>
            <CardDescription>Cadastre-se com email e senha ou com sua conta Google.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <SignupForm />
        </CardContent>
      </Card>
    </main>
  );
}
