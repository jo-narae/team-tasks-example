"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  STATUS_LABEL,
  TASK_STATUSES,
  type Task,
  type TaskStatus,
} from "@/lib/tasks";

type Props = {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
};

export function TaskCard({ task, onEdit, onDelete, onStatusChange }: Props) {
  return (
    <Card className="gap-3 py-4">
      <CardHeader className="px-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium leading-snug break-words">
            {task.title}
          </h3>
          {task.assignee ? (
            <Badge variant="secondary" className="shrink-0">
              {task.assignee}
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      {task.description ? (
        <CardContent className="px-4">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
            {task.description}
          </p>
        </CardContent>
      ) : null}
      <CardFooter className="flex items-center justify-between gap-2 px-4">
        <Select
          value={task.status}
          onValueChange={(v) => onStatusChange(task.id, v as TaskStatus)}
        >
          <SelectTrigger size="sm" className="w-[110px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TASK_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => onEdit(task)}>
            수정
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(task.id)}
          >
            삭제
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
