import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState, SectionTitle } from "@/components/stat-card";
import { TaskItem } from "@/components/task-item";
import { TaskDialog } from "@/components/task-dialog";
import { useStore, tasksForDate, isTaskDone } from "@/lib/store";
import { toKey, fmt, longDate, weekDays, monthDays, addDays, isSameDay } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calendario")({
  head: () => ({
    meta: [
      { title: "Calendário — Rotina" },
      { name: "description", content: "Visualize suas tarefas por dia, semana e mês no calendário." },
      { property: "og:title", content: "Calendário — Rotina" },
      { property: "og:description", content: "Suas tarefas em visão de dia, semana e mês." },
    ],
  }),
  component: CalendarPage,
});

function CalendarPage() {
  const store = useStore();
  const [cursor, setCursor] = useState(() => new Date());
  const [open, setOpen] = useState(false);
  const cursorKey = toKey(cursor);
  const today = useMemo(() => new Date(), []);

  const week = weekDays(cursor, store.settings.firstDayOfWeek);
  const month = monthDays(cursor);
  const dayTasks = tasksForDate(store.tasks, cursorKey);

  return (
    <AppShell
      title="Calendário"
      subtitle={longDate(cursor)}
      actions={
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" aria-label="Anterior" onClick={() => setCursor((d) => addDays(d, -1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCursor(new Date())}>
            Hoje
          </Button>
          <Button variant="outline" size="icon" aria-label="Próximo" onClick={() => setCursor((d) => addDays(d, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button className="ml-1 gap-2" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Tarefa</span>
          </Button>
        </div>
      }
    >
      <Tabs defaultValue="dia">
        <TabsList>
          <TabsTrigger value="dia">Dia</TabsTrigger>
          <TabsTrigger value="semana">Semana</TabsTrigger>
          <TabsTrigger value="mes">Mês</TabsTrigger>
        </TabsList>

        <TabsContent value="dia" className="mt-4 space-y-3">
          <SectionTitle title={fmt(cursor, "EEEE, d 'de' MMMM")} hint={`${dayTasks.length} tarefas`} />
          {dayTasks.length === 0 ? (
            <EmptyState title="Dia livre" description="Nenhuma tarefa agendada." />
          ) : (
            <div className="space-y-2">
              {dayTasks.map((t) => (
                <TaskItem key={t.id} task={t} dateKey={cursorKey} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="semana" className="mt-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
            {week.map((d) => {
              const dk = toKey(d);
              const list = tasksForDate(store.tasks, dk);
              return (
                <div
                  key={dk}
                  className={cn(
                    "card-surface min-w-0 space-y-2 p-3",
                    isSameDay(d, today) && "ring-1 ring-primary",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setCursor(d)}
                    className="w-full text-left"
                  >
                    <p className="text-xs font-semibold uppercase text-muted-foreground">{fmt(d, "EEE")}</p>
                    <p className="text-lg font-semibold tabular-nums">{fmt(d, "d")}</p>
                  </button>
                  <div className="space-y-1.5">
                    {list.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Livre</p>
                    ) : (
                      list.map((t) => {
                        const cat = store.categories.find((c) => c.id === t.categoryId);
                        return (
                          <div
                            key={t.id}
                            className={cn(
                              "truncate rounded-md px-2 py-1.5 text-xs font-medium",
                              isTaskDone(t, dk) && "opacity-60 line-through",
                            )}
                            style={{
                              backgroundColor: `color-mix(in oklab, ${cat?.color ?? "var(--primary)"} 22%, transparent)`,
                            }}
                          >
                            {t.time ? `${t.time} · ` : ""}
                            {t.title}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="mes" className="mt-4">
          <div className="card-surface p-3">
            <p className="mb-3 text-sm font-semibold">{fmt(cursor, "MMMM 'de' yyyy")}</p>
            <div className="grid grid-cols-7 gap-1.5">
              {month.map((d) => {
                const dk = toKey(d);
                const list = tasksForDate(store.tasks, dk);
                return (
                  <button
                    key={dk}
                    type="button"
                    onClick={() => setCursor(d)}
                    className={cn(
                      "min-h-16 rounded-lg border border-border p-1.5 text-left transition-colors hover:bg-accent",
                      dk === cursorKey && "border-primary",
                    )}
                  >
                    <span className="text-xs font-semibold tabular-nums">{fmt(d, "d")}</span>
                    <span className="mt-1 flex flex-wrap gap-0.5">
                      {list.slice(0, 4).map((t) => {
                        const cat = store.categories.find((c) => c.id === t.categoryId);
                        return (
                          <span
                            key={t.id}
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: cat?.color ?? "var(--primary)" }}
                          />
                        );
                      })}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <TaskDialog open={open} onOpenChange={setOpen} defaultDate={cursorKey} />
    </AppShell>
  );
}