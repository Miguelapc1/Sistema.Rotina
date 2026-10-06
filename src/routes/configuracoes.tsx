import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Moon, Plus, RotateCcw, Sun, Trash2, Upload } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SectionTitle } from "@/components/stat-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";
import type { AppData } from "@/lib/types";
import { HABIT_COLORS } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — Rotina" },
      {
        name: "description",
        content:
          "Ajuste tema, início da semana, formato de hora, categorias e faça backup dos seus dados de rotina.",
      },
      { property: "og:title", content: "Configurações — Rotina" },
      {
        property: "og:description",
        content: "Personalize o app e gerencie seus dados de tarefas e hábitos.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const store = useStore();
  const { settings, updateSettings } = store;
  const [newCategory, setNewCategory] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const exportData = () => {
    const payload: AppData = {
      tasks: store.tasks,
      habits: store.habits,
      categories: store.categories,
      habitLogs: store.habitLogs,
      settings: store.settings,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rotina-backup.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup exportado");
  };

  const importData = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as AppData;
      if (!parsed.tasks || !parsed.habits) throw new Error("formato inválido");
      store.replaceAll(parsed);
      toast.success("Dados importados");
    } catch {
      toast.error("Arquivo inválido");
    }
  };

  return (
    <AppShell title="Configurações" subtitle="Personalize o app do seu jeito">
      <section className="card-surface space-y-5 p-4 sm:p-5">
        <SectionTitle title="Perfil" hint="Como você quer ser chamado" />
        <div className="grid gap-2 sm:max-w-sm">
          <Label htmlFor="nome">Seu nome</Label>
          <Input
            id="nome"
            value={settings.name}
            onChange={(e) => updateSettings({ name: e.target.value })}
            placeholder="Seu nome"
          />
        </div>
      </section>

      <section className="card-surface space-y-5 p-4 sm:p-5">
        <SectionTitle title="Aparência e preferências" />

        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium">Tema escuro</p>
            <p className="text-xs text-muted-foreground">Preto profundo, ideal para a noite</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Sun className="h-4 w-4 text-muted-foreground" />
            <Switch
              checked={settings.theme === "dark"}
              onCheckedChange={(v) => updateSettings({ theme: v ? "dark" : "light" })}
              aria-label="Alternar tema escuro"
            />
            <Moon className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>Início da semana</Label>
            <Select
              value={String(settings.firstDayOfWeek)}
              onValueChange={(v) => updateSettings({ firstDayOfWeek: v === "0" ? 0 : 1 })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Segunda-feira</SelectItem>
                <SelectItem value="0">Domingo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Formato de hora</Label>
            <Select
              value={settings.timeFormat}
              onValueChange={(v) => updateSettings({ timeFormat: v === "12h" ? "12h" : "24h" })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24 horas</SelectItem>
                <SelectItem value="12h">12 horas (AM/PM)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium">Lembretes</p>
            <p className="text-xs text-muted-foreground">
              Destaca tarefas e hábitos pendentes do dia
            </p>
          </div>
          <Switch
            checked={settings.notifications}
            onCheckedChange={(v) => updateSettings({ notifications: v })}
            aria-label="Alternar lembretes"
          />
        </div>
      </section>

      <section className="card-surface space-y-4 p-4 sm:p-5">
        <SectionTitle title="Categorias" hint="Organize tarefas e hábitos por contexto" />
        <ul className="flex flex-wrap gap-2">
          {store.categories.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm"
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: c.color }}
              />
              <span className="truncate">{c.name}</span>
              <button
                type="button"
                aria-label={`Excluir categoria ${c.name}`}
                className="text-muted-foreground transition-colors hover:text-destructive"
                onClick={() => {
                  store.deleteCategory(c.id);
                  toast.success("Categoria excluída");
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>

        <form
          className="flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const name = newCategory.trim();
            if (!name) return;
            const color = HABIT_COLORS[store.categories.length % HABIT_COLORS.length]!;
            store.addCategory(name, color);
            setNewCategory("");
            toast.success("Categoria criada");
          }}
        >
          <Input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Nova categoria"
            className="sm:max-w-xs"
          />
          <Button type="submit" className="gap-2">
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        </form>
      </section>

      <section className="card-surface space-y-4 p-4 sm:p-5">
        <SectionTitle title="Meus dados" hint="Tudo fica salvo neste navegador" />
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" onClick={exportData}>
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" />
            Importar
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void importData(file);
              e.target.value = "";
            }}
          />
          <Button
            variant="destructive"
            className="gap-2"
            onClick={() => {
              if (confirm("Restaurar os dados de demonstração? Suas alterações serão perdidas.")) {
                store.resetAll();
                toast.success("Dados redefinidos");
              }
            }}
          >
            <RotateCcw className="h-4 w-4" />
            Redefinir
          </Button>
        </div>
      </section>
    </AppShell>
  );
}
