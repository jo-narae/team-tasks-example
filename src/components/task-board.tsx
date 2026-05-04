"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { TaskCard } from "@/components/task-card";
import { TaskDialog } from "@/components/task-dialog";
import {
  STATUS_LABEL,
  TASK_STATUSES,
  useTasks,
  type Task,
  type TaskDraft,
  type TaskStatus,
} from "@/lib/tasks";

type DialogState =
  | { mode: "closed" }
  | { mode: "create"; status: TaskStatus }
  | { mode: "edit"; task: Task };

export function TaskBoard() {
  const { tasks, hydrated, addTask, updateTask, setStatus, removeTask } =
    useTasks();
  const [dialog, setDialog] = useState<DialogState>({ mode: "closed" });

  const grouped = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = { todo: [], doing: [], done: [] };
    for (const t of tasks) map[t.status].push(t);
    for (const s of TASK_STATUSES) {
      map[s].sort((a, b) => b.updatedAt - a.updatedAt);
    }
    return map;
  }, [tasks]);

  const close = () => setDialog({ mode: "closed" });

  const handleSubmit = (draft: TaskDraft) => {
    if (dialog.mode === "create") {
      addTask(draft);
    } else if (dialog.mode === "edit") {
      updateTask(dialog.task.id, draft);
    }
    close();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">팀 일감 보드</h1>
          <p className="text-sm text-muted-foreground">
            로그인 없이 브라우저에 저장되는 단순한 칸반.
          </p>
        </div>
        <Button onClick={() => setDialog({ mode: "create", status: "todo" })}>
          + 새 일감
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {TASK_STATUSES.map((status) => {
          const items = grouped[status];
          return (
            <section
              key={status}
              className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-3"
            >
              <header className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold">
                    {STATUS_LABEL[status]}
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {items.length}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDialog({ mode: "create", status })}
                >
                  + 추가
                </Button>
              </header>
              <div className="flex min-h-[60px] flex-col gap-3">
                {!hydrated ? (
                  <p className="px-1 py-6 text-center text-xs text-muted-foreground">
                    불러오는 중…
                  </p>
                ) : items.length === 0 ? (
                  <p className="px-1 py-6 text-center text-xs text-muted-foreground">
                    아직 일감이 없습니다.
                  </p>
                ) : (
                  items.map((t) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      onEdit={(task) => setDialog({ mode: "edit", task })}
                      onDelete={removeTask}
                      onStatusChange={setStatus}
                    />
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>

      <TaskDialog
        open={dialog.mode !== "closed"}
        initial={dialog.mode === "edit" ? dialog.task : null}
        defaultStatus={dialog.mode === "create" ? dialog.status : undefined}
        onClose={close}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
