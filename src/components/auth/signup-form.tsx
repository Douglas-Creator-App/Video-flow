"use client";

import Link from "next/link";
import { useState } from "react";
import { Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function SignupForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function signUpWithPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (password.length < 8) {
      setMessage("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("As senhas não conferem.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { full_name: fullName }
      }
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      window.location.href = "/dashboard";
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  async function signUpWithGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });
  }

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm">
          Conta criada! Enviamos um email de confirmação para <span className="font-medium">{email}</span>.
          Confirme para acessar o Video Flow.
        </p>
        <Button asChild variant="outline" className="w-full">
          <Link href="/auth/login">Voltar para o login</Link>
        </Button>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={signUpWithPassword}>
      <Button type="button" variant="outline" className="w-full gap-2" onClick={signUpWithGoogle}>
        <Chrome className="h-4 w-4" />
        Cadastrar com Google
      </Button>
      <div className="grid gap-2">
        <Label htmlFor="fullName">Nome completo</Label>
        <Input id="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
      </div>
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
          minLength={8}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="confirmPassword">Confirmar senha</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
          minLength={8}
        />
      </div>
      {message ? <p className="text-sm text-destructive">{message}</p> : null}
      <Button className="w-full" disabled={loading}>
        {loading ? "Criando conta..." : "Criar conta"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link className="text-primary hover:underline" href="/auth/login">
          Entrar
        </Link>
      </p>
    </form>
  );
}
