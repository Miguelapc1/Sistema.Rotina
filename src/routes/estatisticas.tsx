import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Flame, Target, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/app-shell";
import { StatCard, SectionTitle, EmptyState } from "@/components/stat-card";
import { Progress } from "@/components/ui/progress";
import { HabitIcon } from "@/components/icon-map";
import {
  useStore,
  tasksForDate,
  isTaskDone,
  streakFor,
  bestStreakFor,
  completionRate,
} from "@/lib/store";
import { toKey, fmt, lastNDays } from "@/lib/date-utils";

export const Route = createFileRoute("/estatisticas")({
  head: () => ({
    meta: [
      { title: "Estatísticas da rotina — Rotina" },
      {
        name: "description",
        content:
          "Veja gráficos de consistência: conclusão de tarefas, sequências de hábitos e evolução dos últimos 30 dias.",
      },
      { property: "og:title", content: "Estatísticas da rotina — Rotina" },
      {
        property: "og:description",
        content: "Consistência de tarefas e hábitos em gráficos claros.",
      },
    ],
  }),
  component: StatsPage,
});

function StatsPage() {
  const store = useStore();
  const today = useMemo(() => new Date(), []);
  const days = useMemo(() => lastNDays(30, today), [today]);

  const series = days.map((day) => {
    const key = toKey(day);
    const tasks = tasksForDate(store.tasks, key);
    const done = tasks.filter((t) => isTaskDone(t, key)).length;
    const habitsDone = store.habits.filter((h) =>
      (store.habitLogs[h.id] ?? []).includes(key),
    ).length;
    return {
      label: fmt(day, "dd/MM"),
      tarefas: done,
      habitos: habitsDone,
      pct: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
    };
  });

  const totalTasksDone = series.reduce((a, d) => a + d.tarefas, 0);
  const totalHabits = series.reduce((a, d) => a + d.habitos, 0);
  const avgPct = Math.round(series.reduce((a, d) => a + d.pct, 0) / (series.length || 1));

  const habitStats = store.habits
    .map((h) => {
      const logs = store.habitLogs[h.id] ?? [];
      return {
        habit: h,
        streak: streakFor(logs, today),
        best: bestStreakFor(logs),
        rate: completionRate(logs, 30, today),
      };
    })
    .sort((a, b) => b.rate - a.rate);

  const bestStreak = habitStats.reduce((a, h) => Math.max(a, h.best), 0);

  const barData = habitStats.map((h) => ({
    name: h.habit.name,
    valor: h.rate,
    color: h.habit.color,
  }));

  return (
    <AppShell
      title="Estatísticas"
      subtitle="Sua consistência nos últimos 30 dias"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Tarefas concluídas"
          value={totalTasksDone}
          hint="Últimos 30 dias"
          icon={CheckCircle2}
        />
        <StatCard
          label="Hábitos cumpridos"
          value={totalHabits}
          hint="Marcações no período"
          icon={Target}
        />
        <StatCard label="Conclusão média" value={`${avgPct}%`} hint="Por dia" icon={TrendingUp} />
        <StatCard label="Melhor sequência" value={`${bestStreak} dias`} hint="Recorde" icon={Flame} />
      </div>

      <section className="card-surface p-4 sm:p-5">
        <SectionTitle title="Atividade diária" hint="Tarefas e hábitos concluídos por dia" />
        <div className="mt-4 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="gTarefas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gHabitos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                interval={4}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  color: "var(--popover-foreground)",
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="tarefas"
                stroke="var(--chart-1)"
                strokeWidth={2}
                fill="url(#gTarefas)"
              />
              <Area
                type="monotone"
                dataKey="habitos"
                stroke="var(--chart-2)"
                strokeWidth={2}
                fill="url(#gHabitos)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="card-surface p-4 sm:p-5">
        <SectionTitle title="Consistência por hábito" hint="Taxa de conclusão em 30 dias" />
        {barData.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="Nenhum hábito cadastrado" description="Crie hábitos para ver gráficos." />
          </div>
        ) : (
          <div className="mt-4 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  unit="%"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={140}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    color: "var(--popover-foreground)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="valor" radius={[0, 8, 8, 0]} barSize={16}>
                  {barData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <SectionTitle title="Detalhes dos hábitos" hint="Sequência atual, recorde e consistência" />
      <div className="grid gap-4 md:grid-cols-2">
        {habitStats.map(({ habit, streak, best, rate }) => (
          <article key={habit.id} className="card-surface p-4">
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
              <span
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                style={{
                  backgroundColor: `color-mix(in oklch, ${habit.color} 18%, transparent)`,
                  color: habit.color,
                }}
              >
                <HabitIcon name={habit.icon} className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{habit.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  Sequência {streak} · recorde {best}
                </p>
              </div>
              <span className="shrink-0 text-sm font-semibold tabular-nums">{rate}%</span>
            </div>
            <Progress value={rate} className="mt-3 h-2" />
          </article>
        ))}
      </div>
    </AppShell>
  );
}
