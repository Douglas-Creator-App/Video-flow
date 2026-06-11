"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function resetPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });

    setMessage(error ? error.message : "Link de recuperação enviado.");
    setLoading(false);
  }

  return (
    <form className="space-y-4" onSubmit={resetPassword}>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
      </div>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      <Button className="w-full" disabled={loading}>
        {loading ? "Enviando..." : "Enviar link"}
      </Button>
      <Link className="block text-center text-sm text-primary hover:underline" href="/auth/login">
        Voltar ao login
      </Link>
    </form>
  );
}
