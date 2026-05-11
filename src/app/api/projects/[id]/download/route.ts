import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import JSZip from "jszip";

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

  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  if (project.status !== "complete") {
    return NextResponse.json({ error: "Project not ready" }, { status: 409 });
  }

  const { data: files } = await supabase
    .from("generated_files")
    .select("path, content")
    .eq("project_id", id);

  if (!files || files.length === 0) {
    return NextResponse.json({ error: "No files found" }, { status: 404 });
  }

  const zip = new JSZip();
  const folderName = project.name.toLowerCase().replace(/\s+/g, "-");
  const folder = zip.folder(folderName)!;

  for (const file of files) {
    const parts = file.path.split("/");
    const fileName = parts.pop()!;
    let target = folder;
    for (const part of parts) {
      target = target.folder(part)!;
    }
    target.file(fileName, file.content);
  }

  const zipBuffer = await zip.generateAsync({ type: "arraybuffer", compression: "DEFLATE" });

  return new NextResponse(zipBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${folderName}.zip"`,
    },
  });
}
