"use client";

import { useCallback, useEffect, useState } from "react";

export type TaskStatus = "todo" | "doing" | "done";

export const TASK_STATUSES: TaskStatus[] = ["todo", "doing", "done"];

export const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "할 일",
  doing: "진행 중",
  done: "완료",
};

export type Task = {
  id: string;
  title: string;
  description: string;
  assignee: string;
  status: TaskStatus;
  createdAt: number;
  updatedAt: number;
};

export type TaskDraft = {
  title: string;
  description: string;
  assignee: string;
  status: TaskStatus;
};

const STORAGE_KEY = "team-tasks:v1";

function readStorage(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Task[];
  } catch {
    return [];
  }
}

function writeStorage(tasks: Task[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setTasks(readStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeStorage(tasks);
  }, [tasks, hydrated]);

  const addTask = useCallback((draft: TaskDraft) => {
    const now = Date.now();
    setTasks((prev) => [
      ...prev,
      {
        id: newId(),
        title: draft.title.trim(),
        description: draft.description.trim(),
        assignee: draft.assignee.trim(),
        status: draft.status,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  }, []);

  const updateTask = useCallback((id: string, draft: Partial<TaskDraft>) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              ...draft,
              title: draft.title !== undefined ? draft.title.trim() : t.title,
              description:
                draft.description !== undefined
                  ? draft.description.trim()
                  : t.description,
              assignee:
                draft.assignee !== undefined ? draft.assignee.trim() : t.assignee,
              updatedAt: Date.now(),
            }
          : t,
      ),
    );
  }, []);

  const setStatus = useCallback((id: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status, updatedAt: Date.now() } : t,
      ),
    );
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { tasks, hydrated, addTask, updateTask, setStatus, removeTask };
}
