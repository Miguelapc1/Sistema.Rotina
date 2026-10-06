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
import { Switch } from "@/components/ui/switch";
import { useStore } from "@/lib/store";
import { toKey } from "@/lib/date-utils";
import type { Period, Priority, RepeatType, Task } from "@/lib/types";
import { cn } from "@/lib/utils";

const WEEK = ["D", "S", "T", "Q", "Q", "S", "S"];

function periodFromTime(time: string): Period {
  const hour = Number(time.slice(0, 2) || "9");
  if (hour < 12) return "manha";
  if (hour < 18) return "tarde";
  return "noite";
}

export function TaskDialog({
  open,
  onOpenChange,
  task,
  defaultDate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  task?: Task | null;
  defaultDate?: string;
}) {
  const { categories, addTask, updateTask } = useStore();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(defaultDate ?? toKey(new Date()));
  const [time, setTime] = useState("09:00");
  const [duration, setDuration] = useState("30");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "pessoal");
  const [priority, setPriority] = useState<Priority>("normal");
  const [repeatType, setRepeatType] = useState<RepeatType>("nunca");
  const [repeatDays, setRepeatDays] = useState<number[]>([]);
  const [notes, setNotes] = useState("");
  const [important, setImportant] = useState(false);
  const [urgent, setUrgent] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (task) {
      setTitle(task.title);
      setDate(task.date);
      setTime(task.time ?? "09:00");
      setDuration(String(task.duration ?? 30));
      setCategoryId(task.categoryId);
      setPriority(task.priority);
      setRepeatType(task.repeat.type);
      setRepeatDays(task.repeat.days ?? []);
      setNotes(task.notes ?? "");
      setImportant(task.important);
      setUrgent(task.urgent);
    } else {
      setTitle("");
      setDate(defaultDate ?? toKey(new Date()));
      setTime("09:00");
      setDuration("30");
      setCategoryId(categories[0]?.id ?? "pessoal");
      setPriority("normal");
      setRepeatType("nunca");
      setRepeatDays([]);
      setNotes("");
      setImportant(false);
      setUrgent(false);
    }
  }, [open, task, defaultDate, categories]);

  const submit = () => {
    if (!title.trim()) {
      toast.error("Dê um nome para a tarefa.");
      return;
    }
    const payload = {
      title: title.trim(),
      notes: notes.trim() || undefined,
      date,
      time,
      duration: Number(duration) || 30,
      categoryId,
      priority,
      period: periodFromTime(time),
      repeat: { type: repeatType, days: repeatType === "dias" ? repeatDays : undefined },
      important: important || priority === "alta" || priority === "urgente",
      urgent: urgent || priority === "urgente",
    };
    if (task) {
      updateTask(task.id, payload);
      toast.success("Tarefa atualizada.");
    } else {
      addTask(payload);
      toast.success("Tarefa criada.");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{task ? "Editar tarefa" : "Nova tarefa"}</DialogTitle>
          <DialogDescription>
            Defina horário, categoria e prioridade para organizar sua rotina.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Nome da tarefa</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: Estudar programação"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="task-date">Data</Label>
              <Input id="task-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-time">Horário</Label>
              <Input id="task-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-duration">Duração (min)</Label>
              <Input
                id="task-duration"
                type="number"
                min="5"
                step="5"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
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
              <Label>Prioridade</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger>
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Repetição</Label>
            <Select value={repeatType} onValueChange={(v) => setRepeatType(v as RepeatType)}>
              <SelectTrigger>
                <SelectValue placeholder="Repetição" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nunca">Não repetir</SelectItem>
                <SelectItem value="diario">Todos os dias</SelectItem>
                <SelectItem value="dias">Dias específicos da semana</SelectItem>
                <SelectItem value="semanal">Semanalmente</SelectItem>
                <SelectItem value="mensal">Mensalmente</SelectItem>
              </SelectContent>
            </Select>
            {repeatType === "dias" ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {WEEK.map((d, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-pressed={repeatDays.includes(i)}
                    onClick={() =>
                      setRepeatDays((prev) =>
                        prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i],
                      )
                    }
                    className={cn(
                      "h-10 w-10 rounded-full border text-sm font-medium transition-colors",
                      repeatDays.includes(i)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:bg-accent",
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-notes">Observação</Label>
            <Textarea
              id="task-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalhes, links ou contexto"
              rows={3}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5">
              <span className="text-sm">Importante</span>
              <Switch checked={important} onCheckedChange={setImportant} />
            </label>
            <label className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5">
              <span className="text-sm">Urgente</span>
              <Switch checked={urgent} onCheckedChange={setUrgent} />
            </label>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={submit}>{task ? "Salvar" : "Adicionar tarefa"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}