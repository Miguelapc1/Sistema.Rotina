import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Flame, Pencil, Trash2, MoreVertical, HelpCircle } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SectionTitle, EmptyState, StatCard } from "@/components/stat-card";
import { HabitDialog } from "@/components/habit-dialog";
import { HabitIcon } from "@/components/icon-map";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore, streakFor, bestStreakFor, completionRate } from "@/lib/store";
import { toKey, monthDays, fmt } from "@/lib/date-utils";
import type { Habit } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/habitos/")({
  head: () => ({
    meta: [
      { title: "Hábitos — Rotina" },
      {
        name: "description",
        content: "Acompanhe seus hábitos diários com sequências, taxa de conclusão e mapa do mês.",
      },
      { property: "og:title", content: "Hábitos — Rotina" },
      { property: "og:description", content: "Sequências e consistência dos seus hábitos." },
    ],
  }),
  component: HabitsPage,
});

function HabitsPage() {
  const store = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);
  const today = useMemo(() => new Date(), []);
  const key = toKey(today);
  const days = useMemo(() => monthDays(today), [today]);

  const doneToday = store.habits.filter((h) => (store.habitLogs[h.id] ?? []).includes(key)).length;
  const bestStreak = store.habits.reduce(
    (acc, h) => Math.max(acc, bestStreakFor(store.habitLogs[h.id] ?? [])),
    0,
  );

  return (
    <AppShell
      title="Meus hábitos"
      subtitle={`${store.habits.length} hábitos · ${doneToday} concluídos hoje`}
      actions={
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Novo hábito</span>
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Hábitos ativos" value={store.habits.length} />
        <StatCard label="Concluídos hoje" value={`${doneToday}/${store.habits.length}`} />
        <StatCard label="Melhor sequência" value={`${bestStreak} dias`} icon={Flame} />
      </div>

      <Link
        to="/habitos/como-funcionam"
        className="card-surface flex items-center gap-3 p-4 text-sm transition-colors hover:bg-accent/40"
      >
        <HelpCircle className="h-4 w-4 shrink-0 text-primary" />
        <span className="min-w-0">
          <span className="block font-medium">Como funcionam meus hábitos</span>
          <span className="block text-xs text-muted-foreground">
            Entenda sequências, consistência e como marcar cada dia.
          </span>
        </span>
      </Link>

      {store.habits.length === 0 ? (
        <EmptyState title="Nenhum hábito ainda" description="Crie seu primeiro hábito para começar." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {store.habits.map((h) => {
            const logs = store.habitLogs[h.id] ?? [];
            const rate = completionRate(logs, 30, today);
            return (
              <div key={h.id} className="card-surface space-y-3 p-4">
                <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                    style={{ backgroundColor: h.color, color: "var(--background)" }}
                  >
                    <HabitIcon name={h.icon} className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{h.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {h.goal ?? "Sem meta"} {h.time ? `· ${h.time}` : ""}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label={`Ações de ${h.name}`}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditing(h);
                          setOpen(true);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          store.deleteHabit(h.id);
                          toast.success("Hábito excluído");
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Flame className="h-3 w-3 text-primary" /> {streakFor(logs, today)} dias seguidos
                  </span>
                  <span>Melhor: {bestStreakFor(logs)}</span>
                  <span>{rate}% em 30 dias</span>
                </div>
                <Progress value={rate} />

                <div className="flex flex-wrap gap-1">
                  {days.map((d) => {
                    const dk = toKey(d);
                    const active = logs.includes(dk);
                    const isToday = dk === key;
                    return (
                      <button
                        key={dk}
                        type="button"
                        onClick={() => store.toggleHabit(h.id, dk)}
                        aria-label={`${h.name} em ${fmt(d, "d 'de' MMMM")}`}
                        aria-pressed={active}
                        title={fmt(d, "dd/MM")}
                        className={cn(
                          "h-6 w-6 rounded-md border text-[10px] font-medium transition-colors",
                          active
                            ? "border-transparent text-background"
                            : "border-border text-muted-foreground hover:bg-accent",
                          isToday && !active && "ring-1 ring-primary",
                        )}
                        style={active ? { backgroundColor: h.color } : undefined}
                      >
                        {fmt(d, "d")}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <HabitDialog open={open} onOpenChange={setOpen} habit={editing} />
    </AppShell>
  );
}