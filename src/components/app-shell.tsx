import { Cloud } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Sun as SunIcon,
  Moon as MoonIcon,
  CalendarDays,
  CheckSquare,
  Flame,
  BarChart3,
  LayoutGrid,
  Settings as SettingsIcon,
  Sunrise,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  mobile?: boolean;
}

export const NAV: NavItem[] = [
  { to: "/", label: "Hoje", icon: Sunrise, mobile: true },
  { to: "/tarefas", label: "Tarefas", icon: CheckSquare, mobile: true },
  { to: "/habitos", label: "Hábitos", icon: Flame, mobile: true },
  { to: "/calendario", label: "Calendário", icon: CalendarDays, mobile: true },
  { to: "/planejamento", label: "Planejamento", icon: LayoutGrid },
  { to: "/estatisticas", label: "Estatísticas", icon: BarChart3, mobile: true },
  { to: "/configuracoes", label: "Configurações", icon: SettingsIcon },
  { to: "/entrar", label: "Conta na nuvem", icon: Cloud },
];

function ThemeToggle() {
  const { settings, updateSettings } = useStore();
  const dark = settings.theme === "dark";
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={dark ? "Ativar modo claro" : "Ativar modo escuro"}
      onClick={() => updateSettings({ theme: dark ? "light" : "dark" })}
      className="rounded-full"
    >
      {dark ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
    </Button>
  );
}

export function AppShell({
  title,
  subtitle,
  actions,
  children,
  aside,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  aside?: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 lg:flex">
        <div className="flex items-center gap-2 px-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Flame className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Rotina</p>
            <p className="truncate text-xs text-muted-foreground">Painel pessoal</p>
          </div>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const active =
              item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <Link
          to="/habitos/como-funcionam"
          className="rounded-lg px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Como funcionam meus hábitos
        </Link>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
          <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-4 sm:px-6">
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
              {subtitle ? (
                <p className="truncate text-sm text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {actions}
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 pt-6 pb-28 sm:px-6 lg:pb-12">
          {aside ? (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="min-w-0 space-y-6">{children}</div>
              <div className="min-w-0 space-y-6">{aside}</div>
            </div>
          ) : (
            <div className="space-y-6">{children}</div>
          )}
        </main>
      </div>

      {/* Bottom nav mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <ul className="flex items-stretch">
          {NAV.filter((i) => i.mobile).map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <li key={item.to} className="flex-1">
                <Link
                  to={item.to}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] font-medium transition-colors",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
          <li className="flex-1">
            <Link
              to="/configuracoes"
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] font-medium transition-colors",
                pathname.startsWith("/configuracoes") ? "text-primary" : "text-muted-foreground",
              )}
            >
              <SettingsIcon className="h-5 w-5" />
              <span className="truncate">Ajustes</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}