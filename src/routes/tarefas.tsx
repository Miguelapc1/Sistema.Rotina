import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SectionTitle, EmptyState } from "@/components/stat-card";
import { TaskItem } from "@/components/task-item";
import { TaskDialog } from "@/components/task-dialog";
import { useStore, isTaskDone } from "@/lib/store";
import { toKey } from "@/lib/date-utils";
import type { Task } from "@/lib/types";

export const Route = createFileRoute("/tarefas")({
  head: () => ({
    meta: [
      { title: "Tarefas — Rotina" },
      {
        name: "description",
        content: "Todas as suas tarefas com busca, filtros por categoria e matriz de prioridades.",
      },
      { property: "og:title", content: "Tarefas — Rotina" },
      { property: "og:description", content: "Gerencie tarefas por categoria e prioridade." },
    ],
  }),
  component: TasksPage,
});

const QUADRANTS = [
  { id: "q1", title: "Importante e urgente", hint: "Faça agora", test: (t: Task) => t.important && t.urgent },
  { id: "q2", title: "Importante, não urgente", hint: "Agende", test: (t: Task) => t.important && !t.urgent },
  { id: "q3", title: "Urgente, não importante", hint: "Delegue ou resolva rápido", test: (t: Task) => !t.important && t.urgent },
  { id: "q4", title: "Nem importante, nem urgente", hint: "Deixe para depois", test: (t: Task) => !t.important && !t.urgent },
];

function TasksPage() {
  const { tasks, categories } = useStore();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("todas");
  const key = useMemo(() => toKey(new Date()), []);

  const filtered = tasks
    .filter((t) => t.title.toLowerCase().includes(query.trim().toLowerCase()))
    .filter((t) => category === "todas" || t.categoryId === category)
    .sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? "").localeCompare(b.time ?? ""));

  const pending = filtered.filter((t) => !isTaskDone(t, t.date));
  const completed = filtered.filter((t) => isTaskDone(t, t.date));

  return (
    <AppShell
      title="Tarefas"
      subtitle={`${tasks.length} tarefas cadastradas`}
      actions={
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nova tarefa</span>
        </Button>
      }
    >
      <div className="card-surface grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto]">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar tarefa..."
          aria-label="Buscar tarefa"
        />
        <div className="flex flex-wrap gap-2">
          <Button
            variant={category === "todas" ? "default" : "outline"}
            size="sm"
            onClick={() => setCategory("todas")}
          >
            Todas
          </Button>
          {categories.map((c) => (
            <Button
              key={c.id}
              variant={category === c.id ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory(c.id)}
            >
              {c.name}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="lista">
        <TabsList>
          <TabsTrigger value="lista">Lista</TabsTrigger>
          <TabsTrigger value="matriz">Prioridades</TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="mt-4 space-y-6">
          <section className="space-y-3">
            <SectionTitle title="Pendentes" hint={`${pending.length} tarefas`} />
            {pending.length === 0 ? (
              <EmptyState title="Nenhuma tarefa pendente" />
            ) : (
              <div className="space-y-2">
                {pending.map((t) => (
                  <TaskItem key={t.id} task={t} dateKey={t.date} />
                ))}
              </div>
            )}
          </section>
          <section className="space-y-3">
            <SectionTitle title="Concluídas" hint={`${completed.length} tarefas`} />
            {completed.length === 0 ? (
              <EmptyState title="Nada concluído ainda" />
            ) : (
              <div className="space-y-2">
                {completed.map((t) => (
                  <TaskItem key={t.id} task={t} dateKey={t.date} />
                ))}
              </div>
            )}
          </section>
        </TabsContent>

        <TabsContent value="matriz" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {QUADRANTS.map((q) => {
              const list = filtered.filter(q.test);
              return (
                <div key={q.id} className="card-surface space-y-3 p-4">
                  <SectionTitle title={q.title} hint={q.hint} />
                  {list.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Nenhuma tarefa neste quadrante.</p>
                  ) : (
                    <div className="space-y-2">
                      {list.map((t) => (
                        <TaskItem key={t.id} task={t} dateKey={t.date} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      <TaskDialog open={open} onOpenChange={setOpen} defaultDate={key} />
    </AppShell>
  );
}