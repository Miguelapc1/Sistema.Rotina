import {
  Droplet,
  Brain,
  Dumbbell,
  BookOpen,
  Languages,
  Code,
  Footprints,
  Moon,
  Sun,
  Heart,
  GraduationCap,
  Activity,
  type LucideIcon,
} from "lucide-react";

export const HABIT_ICONS: Record<string, LucideIcon> = {
  droplet: Droplet,
  brain: Brain,
  dumbbell: Dumbbell,
  book: BookOpen,
  languages: Languages,
  code: Code,
  walk: Footprints,
  moon: Moon,
  sun: Sun,
  heart: Heart,
  study: GraduationCap,
  activity: Activity,
};

export const HABIT_ICON_KEYS = Object.keys(HABIT_ICONS);

export function HabitIcon({ name, className }: { name: string; className?: string }) {
  const Icon = HABIT_ICONS[name] ?? Activity;
  return <Icon className={className} />;
}