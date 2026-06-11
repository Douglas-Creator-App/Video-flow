import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <CardTitle className="text-2xl">Entrar no Video Flow</CardTitle>
            <CardDescription>Email/senha, Google, confirmação de email e recuperação prontos para Supabase Auth.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <Button asChild variant="ghost" className="mt-2 w-full">
            <Link href="/dashboard">Entrar com dados mockados</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
