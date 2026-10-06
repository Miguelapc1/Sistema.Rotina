export type Priority = "baixa" | "normal" | "alta" | "urgente";
export type Period = "manha" | "tarde" | "noite";

export type RepeatType = "nunca" | "diario" | "dias" | "semanal" | "mensal";

export interface Repeat {
  type: RepeatType;
  /** 0 = domingo ... 6 = sábado (usado quando type === "dias") */
  days?: number[] | undefined;
}

export interface Task {
  id: string;
  title: string;
  notes?: string | undefined;
  date: string; // yyyy-MM-dd (data inicial)
  time?: string | undefined; // HH:mm
  duration?: number | undefined; // minutos
  categoryId: string;
  priority: Priority;
  period: Period;
  repeat: Repeat;
  important: boolean;
  urgent: boolean;
  completedDates: string[];
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string; // token css var reference
}

export type HabitFrequencyType = "diario" | "dias" | "semanal";

export interface Habit {
  id: string;
  name: string;
  description?: string | undefined;
  icon: string;
  categoryId: string;
  color: string;
  frequency: {
    type: HabitFrequencyType;
    days?: number[] | undefined;
    timesPerWeek?: number | undefined;
  };
  goal?: string | undefined;
  time?: string | undefined;
  createdAt: string;
}

export interface Settings {
  theme: "dark" | "light";
  firstDayOfWeek: 0 | 1;
  timeFormat: "24h" | "12h";
  notifications: boolean;
  name: string;
}

export interface AppData {
  tasks: Task[];
  habits: Habit[];
  categories: Category[];
  habitLogs: Record<string, string[]>;
  settings: Settings;
}

export const PRIORITY_LABEL: Record<Priority, string> = {
  baixa: "Baixa",
  normal: "Normal",
  alta: "Alta",
  urgente: "Urgente",
};

export const PERIOD_LABEL: Record<Period, string> = {
  manha: "Manhã",
  tarde: "Tarde",
  noite: "Noite",
};

export const HABIT_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];