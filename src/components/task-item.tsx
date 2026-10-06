import { useState } from "react";
import { Clock, MoreVertical, Pencil, Trash2, Flag } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isTaskDone, useStore } from "@/lib/store";
import type { Task } from "@/lib/types";
import { TaskDialog } from "@/components/task-dialog";
import { toast } from "sonner";

const priorityStyles: Record<Task["priority"], string> = {
  baixa: "text-muted-foreground",
  normal: "text-primary",
  alta: "text-warning",
  urgente: "text-destructive",
};

export function TaskItem({ task, dateKey }: { task: Task; dateKey: string }) {
  const { toggleTask, deleteTask, categories } = useStore();
  const [editing, setEditing] = useState(false);
  const done = isTaskDone(task, dateKey);
  const category = categories.find((c) => c.id === task.categoryId);

  return (
    <>
      <div
        className={cn(
          "group grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 rounded-xl border border-border bg-card px-3 py-3 transition-colors sm:px-4",
          done && "opacity-60",
        )}
      >
        <Checkbox
          checked={done}
          onCheckedChange={() => toggleTask(task.id, dateKey)}
          aria-label={`Marcar ${task.title} como concluída`}
          className="mt-0.5 h-5 w-5 shrink-0"
        />

        <div className="min-w-0">
          <p className={cn("truncate text-sm font-medium", done && "line-through")}>{task.title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {task.time ? (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {task.time}
                {task.duration ? ` · ${task.duration}min` : ""}
              </span>
            ) : null}
            {category ? (
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: category.color }}
                  aria-hidden
                />
                {category.name}
              </span>
            ) : null}
            <span className={cn("inline-flex items-center gap-1", priorityStyles[task.priority])}>
              <Flag className="h-3 w-3" />
              {task.priority}
            </span>
          </div>
          {task.notes ? (
            <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{task.notes}</p>
          ) : null}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="Ações da tarefa">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditing(true)}>
              <Pencil className="mr-2 h-4 w-4" /> Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                deleteTask(task.id);
                toast.success("Tarefa excluída.");
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <TaskDialog open={editing} onOpenChange={setEditing} task={task} />
    </>
  );
}