import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: project } = await supabase
    .from("generated_projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Only fetch paths + metadata, not content — content is fetched per-file when selected
  const { data: files, error: filesError } = await supabase
    .from("generated_files")
    .select("id, path, language, created_at")
    .eq("project_id", id)
    .order("path");

  if (filesError) {
    console.error("generated_files query error:", filesError);
  }

  return NextResponse.json({
    project,
    files: files ?? [],
    _debug: { filesError: filesError?.message ?? null, fileCount: files?.length ?? 0 },
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("generated_projects")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
