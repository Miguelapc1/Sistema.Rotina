import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { StatCard, SectionTitle, EmptyState } from "@/components/stat-card";
import { TaskItem } from "@/components/task-item";
import { TaskDialog } from "@/components/task-dialog";
import { HabitIcon } from "@/components/icon-map";
import { useStore, tasksForDate, isTaskDone, habitScheduledOn } from "@/lib/store";
import { toKey, fmt, weekDays, addDays, isSameDay, shortDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/planejamento")({
  head: () => ({
    meta: [
      { title: "Planejamento da semana — Rotina" },
      {
        name: "description",
        content:
          "Planeje a semana inteira: veja tarefas e hábitos de cada dia e equilibre a carga da rotina.",
      },
      { property: "og:title", content: "Planejamento da semana — Rotina" },
      {
        property: "og:description",
        content: "Visão semanal das suas tarefas e hábitos para planejar com calma.",
      },
    ],
  }),
  component: PlanningPage,
});

function PlanningPage() {
  const store = useStore();
  const [cursor, setCursor] = useState(() => new Date());
  const [open, setOpen] = useState(false);
  const [presetDate, setPresetDate] = useState<string | undefined>(undefined);
  const today = useMemo(() => new Date(), []);

  const week = weekDays(cursor, store.settings.firstDayOfWeek);

  const perDay = week.map((day) => {
    const key = toKey(day);
    const tasks = tasksForDate(store.tasks, key);
    const habits = store.habits.filter((h) => habitScheduledOn(h, day));
    const done = tasks.filter((t) => isTaskDone(t, key)).length;
    return { day, key, tasks, habits, done };
  });

  const total = perDay.reduce((a, d) => a + d.tasks.length, 0);
  const totalDone = perDay.reduce((a, d) => a + d.done, 0);
  const busiest = perDay.reduce((a, d) => (d.tasks.length > a.tasks.length ? d : a), perDay[0]!);

  return (
    <AppShell
      title="Planejamento"
      subtitle={`Semana de ${shortDate(week[0]!)} a ${shortDate(week[6]!)}`}
      actions={
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            aria-label="Semana anterior"
            onClick={() => setCursor((d) => addDays(d, -7))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCursor(new Date())}>
            Hoje
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Próxima semana"
            onClick={() => setCursor((d) => addDays(d, 7))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            className="ml-1 gap-2"
            onClick={() => {
              setPresetDate(toKey(cursor));
              setOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Tarefa</span>
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Tarefas na semana" value={total} hint={`${totalDone} concluídas`} />
        <StatCard
          label="Progresso"
          value={`${total ? Math.round((totalDone / total) * 100) : 0}%`}
          hint="Média da semana"
        />
        <StatCard
          label="Dia mais cheio"
          value={fmt(busiest.day, "EEEE")}
          hint={`${busiest.tasks.length} tarefas`}
        />
      </div>

      <SectionTitle title="Semana" hint="Arraste o olhar pelos dias e distribua melhor a carga" />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {perDay.map(({ day, key, tasks, habits, done }) => {
          const isToday = isSameDay(day, today);
          return (
            <section
              key={key}
              className={cn(
                "card-surface flex min-w-0 flex-col p-4",
                isToday && "ring-2 ring-primary/40",
              )}
            >
              <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold capitalize">{fmt(day, "EEEE")}</p>
                  <p className="truncate text-xs text-muted-foreground">{shortDate(day)}</p>
                </div>
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground">
                  {done}/{tasks.length}
                </span>
              </header>

              <div className="mt-3 min-w-0 space-y-2">
                {tasks.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Nenhuma tarefa.</p>
                ) : (
                  tasks.map((task) => <TaskItem key={task.id} task={task} dateKey={key} />)
                )}
              </div>

              {habits.length > 0 ? (
                <div className="mt-3 border-t border-border pt-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Hábitos
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {habits.map((h) => (
                      <li key={h.id} className="flex min-w-0 items-center gap-2 text-xs">
                        <HabitIcon name={h.icon} className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="truncate">{h.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <Button
                variant="ghost"
                size="sm"
                className="mt-3 justify-start gap-2 text-xs text-muted-foreground"
                onClick={() => {
                  setPresetDate(key);
                  setOpen(true);
                }}
              >
                <Plus className="h-3.5 w-3.5" />
                Adicionar
              </Button>
            </section>
          );
        })}
      </div>

      {total === 0 ? (
        <EmptyState
          title="Semana livre"
          description="Aproveite para planejar algo importante ou descansar."
        />
      ) : null}

      <TaskDialog
        open={open}
        onOpenChange={setOpen}
        {...(presetDate ? { defaultDate: presetDate } : {})}
      />
    </AppShell>
  );
}
