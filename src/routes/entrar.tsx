import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [
      { title: "Entrar — Rotina" },
      { name: "description", content: "Entre na sua conta para salvar tarefas e hábitos na nuvem." },
      { property: "og:title", content: "Entrar — Rotina" },
      { property: "og:description", content: "Sincronize sua rotina em todos os dispositivos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUserEmail(s?.user.email ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error("E-mail ou senha inválidos");
      else navigate({ to: "/" });
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) toast.error(error.message);
      else if (!data.session) toast.success("Conta criada! Confirme pelo link enviado ao seu e-mail.");
      else navigate({ to: "/" });
    }
    setLoading(false);
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) toast.error("Não foi possível entrar com Google");
  }

  return (
    <AppShell title="Conta na nuvem" subtitle="Sincronize seus dados com o banco de dados">
      <div className="mx-auto max-w-md py-10">
        <div className="rounded-3xl border bg-card p-8 shadow-[var(--shadow-card)]">
          {userEmail ? (
            <div className="space-y-4 text-center">
              <h1 className="text-2xl font-bold">Você está conectado</h1>
              <p className="text-muted-foreground">{userEmail}</p>
              <p className="text-sm text-muted-foreground">Seus dados são salvos automaticamente na nuvem.</p>
              <Button variant="outline" className="w-full" onClick={() => supabase.auth.signOut()}>
                Sair
              </Button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold">{mode === "in" ? "Entrar" : "Criar conta"}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Salve suas tarefas e hábitos na nuvem e acesse de qualquer lugar.
              </p>
              <Button variant="outline" className="mt-6 w-full" onClick={google}>
                Continuar com Google
              </Button>
              <div className="my-5 text-center text-xs text-muted-foreground">ou</div>
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pw">Senha</Label>
                  <Input id="pw" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {mode === "in" ? "Entrar" : "Criar conta"}
                </Button>
              </form>
              <button
                type="button"
                className="mt-4 w-full text-sm text-primary"
                onClick={() => setMode(mode === "in" ? "up" : "in")}
              >
                {mode === "in" ? "Não tem conta? Criar conta" : "Já tem conta? Entrar"}
              </button>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
