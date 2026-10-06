import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { HABIT_ICON_KEYS, HabitIcon } from "@/components/icon-map";
import { HABIT_COLORS, type Habit, type HabitFrequencyType } from "@/lib/types";
import { cn } from "@/lib/utils";

const WEEK = ["D", "S", "T", "Q", "Q", "S", "S"];

export function HabitDialog({
  open,
  onOpenChange,
  habit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  habit?: Habit | null;
}) {
  const { categories, addHabit, updateHabit } = useStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("activity");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "saude");
  const [color, setColor] = useState(HABIT_COLORS[0]!);
  const [freq, setFreq] = useState<HabitFrequencyType>("diario");
  const [days, setDays] = useState<number[]>([]);
  const [timesPerWeek, setTimesPerWeek] = useState("3");
  const [goal, setGoal] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    if (!open) return;
    if (habit) {
      setName(habit.name);
      setDescription(habit.description ?? "");
      setIcon(habit.icon);
      setCategoryId(habit.categoryId);
      setColor(habit.color);
      setFreq(habit.frequency.type);
      setDays(habit.frequency.days ?? []);
      setTimesPerWeek(String(habit.frequency.timesPerWeek ?? 3));
      setGoal(habit.goal ?? "");
      setTime(habit.time ?? "");
    } else {
      setName("");
      setDescription("");
      setIcon("activity");
      setCategoryId(categories[0]?.id ?? "saude");
      setColor(HABIT_COLORS[0]!);
      setFreq("diario");
      setDays([]);
      setTimesPerWeek("3");
      setGoal("");
      setTime("");
    }
  }, [open, habit, categories]);

  const submit = () => {
    if (!name.trim()) {
      toast.error("Dê um nome para o hábito.");
      return;
    }
    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      icon,
      categoryId,
      color,
      frequency: {
        type: freq,
        days: freq === "dias" ? days : undefined,
        timesPerWeek: freq === "semanal" ? Number(timesPerWeek) || 3 : undefined,
      },
      goal: goal.trim() || undefined,
      time: time || undefined,
    };
    if (habit) {
      updateHabit(habit.id, payload);
      toast.success("Hábito atualizado.");
    } else {
      addHabit(payload);
      toast.success("Hábito criado.");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{habit ? "Editar hábito" : "Novo hábito"}</DialogTitle>
          <DialogDescription>
            Escolha frequência e meta para acompanhar sua consistência.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="habit-name">Nome</Label>
            <Input
              id="habit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Beber 2L de água"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="habit-desc">Descrição</Label>
            <Textarea
              id="habit-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Por que esse hábito importa para você?"
            />
          </div>

          <div className="space-y-2">
            <Label>Ícone</Label>
            <div className="flex flex-wrap gap-2">
              {HABIT_ICON_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  aria-label={`Ícone ${key}`}
                  aria-pressed={icon === key}
                  onClick={() => setIcon(key)}
                  className={cn(
                    "grid h-10 w-10 place-items-center rounded-xl border transition-colors",
                    icon === key
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-accent",
                  )}
                >
                  <HabitIcon name={key} className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cor de identificação</Label>
            <div className="flex flex-wrap gap-2">
              {HABIT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label="Selecionar cor"
                  aria-pressed={color === c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-9 w-9 rounded-full border-2 transition-transform",
                    color === c ? "border-foreground scale-105" : "border-transparent",
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Frequência</Label>
              <Select value={freq} onValueChange={(v) => setFreq(v as HabitFrequencyType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Frequência" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diario">Todos os dias</SelectItem>
                  <SelectItem value="dias">Dias específicos</SelectItem>
                  <SelectItem value="semanal">Vezes por semana</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {freq === "dias" ? (
            <div className="flex flex-wrap gap-2">
              {WEEK.map((d, i) => (
                <button
                  key={i}
                  type="button"
                  aria-pressed={days.includes(i)}
                  onClick={() =>
                    setDays((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]))
                  }
                  className={cn(
                    "h-10 w-10 rounded-full border text-sm font-medium transition-colors",
                    days.includes(i)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:bg-accent",
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          ) : null}

          {freq === "semanal" ? (
            <div className="space-y-2">
              <Label htmlFor="habit-times">Vezes por semana</Label>
              <Input
                id="habit-times"
                type="number"
                min="1"
                max="7"
                value={timesPerWeek}
                onChange={(e) => setTimesPerWeek(e.target.value)}
              />
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="habit-goal">Meta</Label>
              <Input
                id="habit-goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Ex.: 20 páginas"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="habit-time">Horário (opcional)</Label>
              <Input
                id="habit-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={submit}>{habit ? "Salvar" : "Criar hábito"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}