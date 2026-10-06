import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, CheckCircle2, Flame, ListChecks, Sunrise, Sun, Moon } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { StatCard, SectionTitle, EmptyState } from "@/components/stat-card";
import { TaskItem } from "@/components/task-item";
import { TaskDialog } from "@/components/task-dialog";
import { HabitIcon } from "@/components/icon-map";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useStore, tasksForDate, isTaskDone, streakFor, habitScheduledOn } from "@/lib/store";
import { toKey, longDate, greeting } from "@/lib/date-utils";
import { PERIOD_LABEL, type Period } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hoje — Rotina" },
      { name: "description", content: "Veja as tarefas e hábitos do seu dia organizados por período." },
      { property: "og:title", content: "Hoje — Rotina" },
      { property: "og:description", content: "Suas tarefas e hábitos do dia, em um só lugar." },
    ],
  }),
  component: Today,
});

const PERIOD_ICONS = { manha: Sunrise, tarde: Sun, noite: Moon } as const;

function Today() {
  const store = useStore();
  const [open, setOpen] = useState(false);
  const today = useMemo(() => new Date(), []);
  const key = toKey(today);

  const tasks = tasksForDate(store.tasks, key);
  const done = tasks.filter((t) => isTaskDone(t, key));
  const pct = tasks.length ? Math.round((done.length / tasks.length) * 100) : 0;

  const habits = store.habits.filter((h) => habitScheduledOn(h, today));
  const habitsDone = habits.filter((h) => (store.habitLogs[h.id] ?? []).includes(key));

  const periods: Period[] = ["manha", "tarde", "noite"];

  return (
    <AppShell
      title={`${greeting(today)}${store.settings.name ? `, ${store.settings.name}` : ""}!`}
      subtitle={longDate(today)}
      actions={
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nova tarefa</span>
        </Button>
      }
      aside={
        <>
          <div className="card-surface p-4">
            <SectionTitle title="Hábitos de hoje" hint={`${habitsDone.length}/${habits.length} concluídos`} />
            <div className="mt-4 space-y-2">
              {habits.length === 0 ? (
                <p className="text-xs text-muted-foreground">Nenhum hábito para hoje.</p>
              ) : (
                habits.map((h) => {
                  const logs = store.habitLogs[h.id] ?? [];
                  const checked = logs.includes(key);
                  return (
                    <label
                      key={h.id}
                      className="grid cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => store.toggleHabit(h.id, key)}
                        aria-label={`Marcar ${h.name}`}
                      />
                      <span className="min-w-0">
                        <span className="flex items-center gap-2">
                          <span
                            className="grid h-6 w-6 shrink-0 place-items-center rounded-md"
                            style={{ backgroundColor: h.color, color: "var(--background)" }}
                          >
                            <HabitIcon name={h.icon} className="h-3.5 w-3.5" />
                          </span>
                          <span className="truncate text-sm font-medium">{h.name}</span>
                        </span>
                        {h.goal ? (
                          <span className="mt-0.5 block truncate text-xs text-muted-foreground">{h.goal}</span>
                        ) : null}
                      </span>
                      <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                        <Flame className="h-3 w-3 text-primary" />
                        {streakFor(logs, today)}
                      </span>
                    </label>
                  );
                })
              )}
            </div>
            <Link
              to="/habitos"
              className="mt-4 inline-block text-xs font-medium text-primary hover:underline"
            >
              Ver todos os hábitos
            </Link>
          </div>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Tarefas hoje" value={tasks.length} icon={ListChecks} />
        <StatCard label="Concluídas" value={`${done.length}/${tasks.length}`} icon={CheckCircle2} />
        <StatCard label="Hábitos" value={`${habitsDone.length}/${habits.length}`} icon={Flame} />
      </div>

      <div className="card-surface p-4">
        <SectionTitle title="Progresso do dia" hint={`${pct}% concluído`} />
        <Progress value={pct} className="mt-3" />
      </div>

      {periods.map((p) => {
        const list = tasks.filter((t) => t.period === p && !isTaskDone(t, key));
        const Icon = PERIOD_ICONS[p];
        return (
          <section key={p} className="space-y-3">
            <SectionTitle title={PERIOD_LABEL[p]} hint={`${list.length} pendentes`} />
            {list.length === 0 ? (
              <EmptyState title="Nada por aqui" description={`Sem tarefas pendentes na ${PERIOD_LABEL[p].toLowerCase()}.`} />
            ) : (
              <div className="space-y-2">
                {list.map((t) => (
                  <TaskItem key={t.id} task={t} dateKey={key} />
                ))}
              </div>
            )}
            <Icon className="hidden" aria-hidden />
          </section>
        );
      })}

      <section className="space-y-3">
        <SectionTitle title="Concluídas" hint={`${done.length} tarefas`} />
        {done.length === 0 ? (
          <EmptyState title="Nenhuma tarefa concluída ainda" />
        ) : (
          <div className="space-y-2">
            {done.map((t) => (
              <TaskItem key={t.id} task={t} dateKey={key} />
            ))}
          </div>
        )}
      </section>

      <TaskDialog open={open} onOpenChange={setOpen} defaultDate={key} />
    </AppShell>
  );
}
