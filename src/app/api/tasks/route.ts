import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TablesInsert } from "@/lib/supabase/database.types";

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const mine = searchParams.get("mine") === "true";

  let query = supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (mine) {
    query = query.eq("assignee_id", user.id);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ tasks: data });
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Partial<TablesInsert<"tasks">>;

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title || title.length > 120) {
    return NextResponse.json(
      { error: "title is required (1~120 chars)" },
      { status: 400 },
    );
  }

  const status = body.status ?? "todo";
  if (status !== "todo" && status !== "done") {
    return NextResponse.json(
      { error: "status must be 'todo' or 'done'" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      title,
      status,
      assignee_id: body.assignee_id ?? user.id,
      created_by: user.id,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ task: data }, { status: 201 });
}
