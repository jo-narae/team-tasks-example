"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  STATUS_LABEL,
  TASK_STATUSES,
  type Task,
  type TaskDraft,
  type TaskStatus,
} from "@/lib/tasks";

type Props = {
  open: boolean;
  initial?: Task | null;
  defaultStatus?: TaskStatus;
  onClose: () => void;
  onSubmit: (draft: TaskDraft) => void;
};

const EMPTY: TaskDraft = {
  title: "",
  description: "",
  assignee: "",
  status: "todo",
};

export function TaskDialog({
  open,
  initial,
  defaultStatus,
  onClose,
  onSubmit,
}: Props) {
  const [draft, setDraft] = useState<TaskDraft>(EMPTY);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setDraft({
        title: initial.title,
        description: initial.description,
        assignee: initial.assignee,
        status: initial.status,
      });
    } else {
      setDraft({ ...EMPTY, status: defaultStatus ?? "todo" });
    }
  }, [open, initial, defaultStatus]);

  const isEdit = Boolean(initial);
  const canSubmit = draft.title.trim().length > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "일감 수정" : "새 일감"}</DialogTitle>
          <DialogDescription>
            제목·담당자·상태를 정해 일감을 {isEdit ? "수정" : "추가"}합니다.
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!canSubmit) return;
            onSubmit(draft);
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="task-title">제목</Label>
            <Input
              id="task-title"
              value={draft.title}
              onChange={(e) =>
                setDraft((d) => ({ ...d, title: e.target.value }))
              }
              placeholder="예: 로그인 화면 시안 검토"
              autoFocus
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="task-assignee">담당자</Label>
            <Input
              id="task-assignee"
              value={draft.assignee}
              onChange={(e) =>
                setDraft((d) => ({ ...d, assignee: e.target.value }))
              }
              placeholder="이름 (선택)"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="task-status">상태</Label>
            <Select
              value={draft.status}
              onValueChange={(v) =>
                setDraft((d) => ({ ...d, status: v as TaskStatus }))
              }
            >
              <SelectTrigger id="task-status">
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
          </div>
          <div className="grid gap-2">
            <Label htmlFor="task-desc">설명</Label>
            <Textarea
              id="task-desc"
              value={draft.description}
              onChange={(e) =>
                setDraft((d) => ({ ...d, description: e.target.value }))
              }
              placeholder="세부 내용 (선택)"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {isEdit ? "저장" : "추가"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
