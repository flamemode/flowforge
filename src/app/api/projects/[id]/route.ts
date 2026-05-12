import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const TIMEOUT_MS = 10_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), ms)
    ),
  ]);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  try {
    const [authResult, projectResult] = await withTimeout(
      Promise.all([
        supabase.auth.getUser(),
        supabase.from("generated_projects").select("*").eq("id", id).single(),
      ]) as Promise<[Awaited<ReturnType<typeof supabase.auth.getUser>>, { data: Record<string, unknown> | null }]>,
      TIMEOUT_MS
    );

    const user = authResult.data.user;
    const project = projectResult.data;

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!project || project.user_id !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const filesQuery = supabase
      .from("generated_files")
      .select("id, path, language, created_at")
      .eq("project_id", id)
      .order("path");

    const { data: files } = await withTimeout(filesQuery as unknown as Promise<{ data: unknown[] | null }>, TIMEOUT_MS);

    return NextResponse.json({ project, files: files ?? [] });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("timed out") || msg.includes("ETIMEDOUT")) {
      return NextResponse.json({ error: "Database request timed out. Please try again." }, { status: 504 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  try {
    const { data: { user } } = await withTimeout(supabase.auth.getUser(), TIMEOUT_MS);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { error } = await supabase
      .from("generated_projects")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("timed out") || msg.includes("ETIMEDOUT")) {
      return NextResponse.json({ error: "Database request timed out. Please try again." }, { status: 504 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
