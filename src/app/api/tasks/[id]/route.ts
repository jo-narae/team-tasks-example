import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TablesUpdate } from "@/lib/supabase/database.types";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Ctx) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ task: data });
}

export async function PATCH(request: Request, { params }: Ctx) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Partial<TablesUpdate<"tasks">>;

  const patch: TablesUpdate<"tasks"> = {};
  if (typeof body.title === "string") {
    const t = body.title.trim();
    if (!t || t.length > 120) {
      return NextResponse.json(
        { error: "title must be 1~120 chars" },
        { status: 400 },
      );
    }
    patch.title = t;
  }
  if (body.status !== undefined) {
    if (body.status !== "todo" && body.status !== "done") {
      return NextResponse.json(
        { error: "status must be 'todo' or 'done'" },
        { status: 400 },
      );
    }
    patch.status = body.status;
  }
  if (body.assignee_id !== undefined) patch.assignee_id = body.assignee_id;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "no fields to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("tasks")
    .update(patch)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ task: data });
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return new NextResponse(null, { status: 204 });
}
