"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signInWithGoogle() {
    setLoading(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-sm flex-col items-center justify-center gap-6 px-6">
      <h1 className="text-xl font-semibold tracking-tight">team-tasks 로그인</h1>
      <Button
        type="button"
        onClick={signInWithGoogle}
        disabled={loading}
        className="w-full"
      >
        {loading ? "이동 중…" : "Google로 로그인"}
      </Button>
      {error && (
        <p className="text-sm text-destructive">에러: {error}</p>
      )}
    </main>
  );
}
