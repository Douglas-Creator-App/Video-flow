"use client";

import Link from "next/link";
import { useState } from "react";
import { Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function signInWithPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    await fetch("/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", entityType: "auth.user", metadata: { provider: "password" } })
    });
    window.location.href = "/dashboard";
  }

  async function signInWithGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });
  }

  return (
    <form className="space-y-4" onSubmit={signInWithPassword}>
      <Button type="button" variant="outline" className="w-full gap-2" onClick={signInWithGoogle}>
        <Chrome className="h-4 w-4" />
        Entrar com Google
      </Button>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>
      {message ? <p className="text-sm text-destructive">{message}</p> : null}
      <Button className="w-full" disabled={loading}>
        {loading ? "Entrando..." : "Entrar"}
      </Button>
      <div className="flex justify-between text-sm">
        <Link className="text-primary hover:underline" href="/auth/reset-password">
          Recuperar senha
        </Link>
        <Link className="text-muted-foreground hover:text-foreground" href="/auth/confirm-email">
          Confirmar email
        </Link>
      </div>
      <p className="text-center text-sm text-muted-foreground">
        Não tem conta?{" "}
        <Link className="text-primary hover:underline" href="/auth/signup">
          Criar conta
        </Link>
      </p>
    </form>
  );
}
