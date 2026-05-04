"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import type { Tables } from "@/lib/supabase/database.types";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Task = Tables<"tasks">;

export default function Home() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    void supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  async function signOut() {
    setSigningOut(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tasks", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "failed to load");
      setTasks(json.tasks ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setError(null);
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.error ?? "failed to create");
      return;
    }
    setTitle("");
    await refresh();
  }

  async function toggleStatus(task: Task) {
    const next = task.status === "todo" ? "done" : "todo";
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "failed to update");
      return;
    }
    await refresh();
  }

  async function removeTask(id: string) {
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "failed to delete");
      return;
    }
    await refresh();
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 md:px-6 md:py-12">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">team-tasks</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            내가 만들거나 내게 배정된 일감만 표시됩니다.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {email ? (
            <>
              <span className="text-sm text-muted-foreground">{email}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                disabled={signingOut}
              >
                {signingOut ? "로그아웃 중…" : "로그아웃"}
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/login")}
            >
              로그인
            </Button>
          )}
        </div>
      </header>

      <form onSubmit={addTask} className="mt-6 flex gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="새 일감 제목"
          maxLength={120}
        />
        <Button type="submit" disabled={!title.trim()}>
          추가
        </Button>
      </form>

      {error && (
        <p className="mt-3 text-sm text-destructive">에러: {error}</p>
      )}

      <section className="mt-8 space-y-2">
        {loading && tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">불러오는 중…</p>
        ) : tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">아직 일감이 없습니다.</p>
        ) : (
          tasks.map((t) => (
            <Card
              key={t.id}
              className="flex flex-row items-center justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p
                  className={
                    t.status === "done"
                      ? "truncate text-sm text-muted-foreground line-through"
                      : "truncate text-sm"
                  }
                >
                  {t.title}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t.status} · {new Date(t.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleStatus(t)}
                >
                  {t.status === "todo" ? "완료" : "되돌리기"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTask(t.id)}
                >
                  삭제
                </Button>
              </div>
            </Card>
          ))
        )}
      </section>
    </main>
  );
}
