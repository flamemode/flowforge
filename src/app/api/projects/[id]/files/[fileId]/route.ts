import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  const { id, fileId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify the project belongs to the user
  const { data: project } = await supabase
    .from("generated_projects")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: file } = await supabase
    .from("generated_files")
    .select("id, path, content, language")
    .eq("id", fileId)
    .eq("project_id", id)
    .single();

  if (!file) return NextResponse.json({ error: "File not found" }, { status: 404 });

  return NextResponse.json({ file });
}
