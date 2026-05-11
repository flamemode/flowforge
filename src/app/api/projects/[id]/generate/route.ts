import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateProject } from "@/lib/generator/generator";
import type { GenerationEvent } from "@/lib/generator/generator";

export const maxDuration = 300;

function sse(event: GenerationEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: project, error: projectError } = await supabase
    .from("generated_projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (project.status === "complete") {
    return NextResponse.json({ error: "Already generated" }, { status: 409 });
  }

  await supabase
    .from("generated_projects")
    .update({ status: "generating" })
    .eq("id", id);

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();

      const onEvent = (event: GenerationEvent) => {
        controller.enqueue(enc.encode(sse(event)));
      };

      try {
        const files = await generateProject(project.questionnaire, onEvent);

        // Save all files to DB
        if (files.length > 0) {
          await supabase.from("generated_files").insert(
            files.map((f) => ({ ...f, project_id: id }))
          );
        }

        await supabase
          .from("generated_projects")
          .update({ status: "complete", file_count: files.length, completed_at: new Date().toISOString() })
          .eq("id", id);
      } catch (err) {
        await supabase
          .from("generated_projects")
          .update({ status: "failed" })
          .eq("id", id);

        controller.enqueue(enc.encode(sse({
          type: "error",
          data: { message: String(err) },
        })));
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
