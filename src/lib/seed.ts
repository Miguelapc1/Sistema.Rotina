import type { AppData } from "./types";
import { toKey, addDays } from "./date-utils";

const uid = () => Math.random().toString(36).slice(2, 10);
const today = new Date();

export const DEFAULT_CATEGORIES = [
  { id: "trabalho", name: "Trabalho", color: "var(--chart-1)" },
  { id: "estudos", name: "Estudos", color: "var(--chart-3)" },
  { id: "pessoal", name: "Pessoal", color: "var(--chart-5)" },
  { id: "casa", name: "Casa", color: "var(--chart-4)" },
  { id: "saude", name: "Saúde", color: "var(--chart-2)" },
  { id: "projetos", name: "Projetos", color: "var(--chart-1)" },
];

export function buildSeed(): AppData {
  const t = toKey(today);
  const task = (
    title: string,
    period: "manha" | "tarde" | "noite",
    time: string,
    categoryId: string,
    priority: "baixa" | "normal" | "alta" | "urgente",
    extra: Partial<{
      notes: string;
      duration: number;
      important: boolean;
      urgent: boolean;
      date: string;
      done: boolean;
      repeat: "nunca" | "diario";
    }> = {},
  ) => ({
    id: uid(),
    title,
    notes: extra.notes,
    date: extra.date ?? t,
    time,
    duration: extra.duration ?? 30,
    categoryId,
    priority,
    period,
    repeat: { type: extra.repeat ?? ("nunca" as const) },
    important: extra.important ?? (priority === "alta" || priority === "urgente"),
    urgent: extra.urgent ?? priority === "urgente",
    completedDates: extra.done ? [extra.date ?? t] : [],
    createdAt: new Date().toISOString(),
  });

  const tasks = [
    task("Estudar programação", "manha", "07:30", "estudos", "alta", {
      duration: 60,
      notes: "Continuar o módulo de React.",
    }),
    task("Revisar projeto pessoal", "manha", "09:00", "projetos", "normal", { duration: 45 }),
    task("Alongar e tomar café com calma", "manha", "06:45", "pessoal", "baixa", { done: true }),
    task("Fazer atividade da faculdade", "tarde", "14:00", "estudos", "urgente", {
      duration: 90,
      notes: "Entrega até sexta.",
    }),
    task("Treinar na academia", "tarde", "17:30", "saude", "alta", { duration: 60 }),
    task("Organizar o quarto", "tarde", "16:00", "casa", "baixa", { done: true }),
    task("Ler 20 páginas", "noite", "21:00", "pessoal", "normal", { repeat: "diario" }),
    task("Planejar o dia seguinte", "noite", "22:00", "pessoal", "normal", { repeat: "diario" }),
    task("Reunião de alinhamento", "manha", "10:30", "trabalho", "alta", {
      date: toKey(addDays(today, 2)),
      duration: 45,
    }),
    task("Comprar itens da casa", "tarde", "15:00", "casa", "normal", {
      date: toKey(addDays(today, 1)),
    }),
    task("Enviar relatório semanal", "manha", "11:00", "trabalho", "urgente", {
      date: toKey(addDays(today, 3)),
    }),
  ];

  const habitDef = (
    name: string,
    icon: string,
    categoryId: string,
    color: string,
    description: string,
    goal: string,
    time?: string,
  ) => ({
    id: uid(),
    name,
    description,
    icon,
    categoryId,
    color,
    frequency: { type: "diario" as const },
    goal,
    time,
    createdAt: new Date().toISOString(),
  });

  const habits = [
    habitDef("Beber 2L de água", "droplet", "saude", "var(--chart-3)", "Hidratação ao longo do dia.", "2L por dia"),
    habitDef("Meditar 10 minutos", "brain", "saude", "var(--chart-5)", "Respiração e foco.", "10 min", "07:00"),
    habitDef("Treinar", "dumbbell", "saude", "var(--chart-2)", "Musculação ou cardio.", "1x por dia", "18:00"),
    habitDef("Ler 20 páginas", "book", "pessoal", "var(--chart-4)", "Leitura antes de dormir.", "20 páginas", "21:30"),
    habitDef("Estudar inglês", "languages", "estudos", "var(--chart-1)", "Prática diária de idioma.", "30 min"),
    habitDef("Estudar programação", "code", "estudos", "var(--chart-1)", "Prática de código.", "1h"),
  ];

  const habitLogs: Record<string, string[]> = {};
  habits.forEach((h, idx) => {
    const dates: string[] = [];
    for (let i = 27; i >= 0; i--) {
      const d = addDays(today, -i);
      const seedish = (i * 7 + idx * 13) % 10;
      if (seedish > 2) dates.push(toKey(d));
    }
    if (idx < 3) dates.push(toKey(today));
    habitLogs[h.id] = Array.from(new Set(dates));
  });

  return {
    tasks,
    habits,
    categories: DEFAULT_CATEGORIES,
    habitLogs,
    settings: {
      theme: "dark",
      firstDayOfWeek: 1,
      timeFormat: "24h",
      notifications: true,
      name: "",
    },
  };
}