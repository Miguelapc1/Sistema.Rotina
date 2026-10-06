import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AppData, Category, Habit, Settings, Task } from "./types";
import { buildSeed } from "./seed";
import { toKey, fromKey, addDays } from "./date-utils";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

const STORAGE_KEY = "rotina.app.v1";
const uid = () => Math.random().toString(36).slice(2, 10);

interface StoreValue extends AppData {
  ready: boolean;
  addTask: (t: Omit<Task, "id" | "createdAt" | "completedDates">) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string, dateKey: string) => void;
  addHabit: (h: Omit<Habit, "id" | "createdAt">) => void;
  updateHabit: (id: string, patch: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabit: (habitId: string, dateKey: string) => void;
  addCategory: (name: string, color: string) => void;
  deleteCategory: (id: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  replaceAll: (data: AppData) => void;
  resetAll: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => buildSeed());
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [cloudReady, setCloudReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AppData;
        setData({ ...buildSeed(), ...parsed });
      }
    } catch {
      /* ignora dados corrompidos */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* quota */
    }
  }, [data, ready]);

  // Sincronização com o banco de dados (Lovable Cloud)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: s }) => setUserId(s.session?.user.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user.id ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!ready) return;
    setCloudReady(false);
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const { data: row } = await supabase
        .from("user_data")
        .select("data")
        .eq("user_id", userId)
        .maybeSingle();
      if (cancelled) return;
      if (row?.data && Object.keys(row.data as object).length) {
        setData({ ...buildSeed(), ...(row.data as unknown as AppData) });
      }
      setCloudReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, ready]);

  useEffect(() => {
    if (!userId || !cloudReady) return;
    const t = setTimeout(() => {
      void supabase.from("user_data").upsert({
        user_id: userId,
        data: data as unknown as Json,
        updated_at: new Date().toISOString(),
      });
    }, 800);
    return () => clearTimeout(t);
  }, [data, userId, cloudReady]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", data.settings.theme === "dark");
  }, [data.settings.theme]);

  const mutate = useCallback(
    (fn: (d: AppData) => AppData) => setData((prev) => fn(prev)),
    [],
  );

  const value = useMemo<StoreValue>(
    () => ({
      ...data,
      ready,
      addTask: (t) =>
        mutate((d) => ({
          ...d,
          tasks: [
            ...d.tasks,
            { ...t, id: uid(), createdAt: new Date().toISOString(), completedDates: [] },
          ],
        })),
      updateTask: (id, patch) =>
        mutate((d) => ({
          ...d,
          tasks: d.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      deleteTask: (id) => mutate((d) => ({ ...d, tasks: d.tasks.filter((t) => t.id !== id) })),
      toggleTask: (id, dateKey) =>
        mutate((d) => ({
          ...d,
          tasks: d.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  completedDates: t.completedDates.includes(dateKey)
                    ? t.completedDates.filter((x) => x !== dateKey)
                    : [...t.completedDates, dateKey],
                }
              : t,
          ),
        })),
      addHabit: (h) =>
        mutate((d) => ({
          ...d,
          habits: [...d.habits, { ...h, id: uid(), createdAt: new Date().toISOString() }],
        })),
      updateHabit: (id, patch) =>
        mutate((d) => ({
          ...d,
          habits: d.habits.map((h) => (h.id === id ? { ...h, ...patch } : h)),
        })),
      deleteHabit: (id) =>
        mutate((d) => {
          const logs = { ...d.habitLogs };
          delete logs[id];
          return { ...d, habits: d.habits.filter((h) => h.id !== id), habitLogs: logs };
        }),
      toggleHabit: (habitId, dateKey) =>
        mutate((d) => {
          const current = d.habitLogs[habitId] ?? [];
          const next = current.includes(dateKey)
            ? current.filter((x) => x !== dateKey)
            : [...current, dateKey];
          return { ...d, habitLogs: { ...d.habitLogs, [habitId]: next } };
        }),
      addCategory: (name, color) =>
        mutate((d) => ({
          ...d,
          categories: [...d.categories, { id: uid(), name, color }],
        })),
      deleteCategory: (id) =>
        mutate((d) => ({ ...d, categories: d.categories.filter((c) => c.id !== id) })),
      updateSettings: (patch) =>
        mutate((d) => ({ ...d, settings: { ...d.settings, ...patch } })),
      replaceAll: (next) => setData(next),
      resetAll: () => setData(buildSeed()),
    }),
    [data, ready, mutate],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore precisa estar dentro de StoreProvider");
  return ctx;
}

export function useCategory(id: string): Category {
  const { categories } = useStore();
  return (
    categories.find((c) => c.id === id) ?? { id, name: "Sem categoria", color: "var(--muted-foreground)" }
  );
}

/* ---------- helpers de tarefas ---------- */

export function occursOn(task: Task, dateKey: string): boolean {
  if (dateKey < task.date) return false;
  const date = fromKey(dateKey);
  switch (task.repeat.type) {
    case "diario":
      return true;
    case "dias":
      return (task.repeat.days ?? []).includes(date.getDay());
    case "semanal":
      return date.getDay() === fromKey(task.date).getDay();
    case "mensal":
      return date.getDate() === fromKey(task.date).getDate();
    default:
      return dateKey === task.date;
  }
}

export const isTaskDone = (task: Task, dateKey: string) => task.completedDates.includes(dateKey);

export function tasksForDate(tasks: Task[], dateKey: string) {
  return tasks
    .filter((t) => occursOn(t, dateKey))
    .sort((a, b) => (a.time ?? "99:99").localeCompare(b.time ?? "99:99"));
}

export function habitScheduledOn(habit: Habit, date: Date) {
  if (habit.frequency.type === "dias") return (habit.frequency.days ?? []).includes(date.getDay());
  return true;
}

export function streakFor(dates: string[], reference = new Date()) {
  const set = new Set(dates);
  let streak = 0;
  let cursor = reference;
  if (!set.has(toKey(cursor))) cursor = addDays(cursor, -1);
  while (set.has(toKey(cursor))) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function bestStreakFor(dates: string[]) {
  const sorted = [...dates].sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of sorted) {
    if (prev && toKey(addDays(fromKey(prev), 1)) === d) run++;
    else run = 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}

export function completionRate(dates: string[], days = 30, reference = new Date()) {
  const set = new Set(dates);
  let hits = 0;
  for (let i = 0; i < days; i++) if (set.has(toKey(addDays(reference, -i)))) hits++;
  return Math.round((hits / days) * 100);
}