import {
  format,
  parseISO,
  startOfWeek,
  addDays,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";
import { ptBR } from "date-fns/locale";

export const toKey = (d: Date) => format(d, "yyyy-MM-dd");
export const fromKey = (s: string) => parseISO(s);

export const fmt = (d: Date | string, pattern: string) =>
  format(typeof d === "string" ? parseISO(d) : d, pattern, { locale: ptBR });

export const longDate = (d: Date) => fmt(d, "EEEE, d 'de' MMMM");
export const shortDate = (d: Date) => fmt(d, "d 'de' MMM");

export function greeting(d = new Date()) {
  const h = d.getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export function weekDays(reference: Date, weekStartsOn: 0 | 1 = 1) {
  const start = startOfWeek(reference, { weekStartsOn });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function monthDays(reference: Date) {
  return eachDayOfInterval({ start: startOfMonth(reference), end: endOfMonth(reference) });
}

export function lastNDays(n: number, reference = new Date()) {
  return Array.from({ length: n }, (_, i) => addDays(reference, i - (n - 1)));
}

export { isSameDay, addDays, startOfWeek, startOfMonth, endOfMonth };