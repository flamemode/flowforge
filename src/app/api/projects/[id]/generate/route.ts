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

  // Clear any partial files from a previous failed attempt
  await supabase.from("generated_files").delete().eq("project_id", id);

  await supabase
    .from("generated_projects")
    .update({ status: "generating", file_count: 0, completed_at: null })
    .eq("id", id);

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();

      const onEvent = (event: GenerationEvent) => {
        controller.enqueue(enc.encode(sse(event)));
      };

      try {
        const files = await generateProject(project.questionnaire, onEvent);

        // Save files in batches of 20 to avoid Supabase payload size limits
        if (files.length > 0) {
          const BATCH = 20;
          for (let i = 0; i < files.length; i += BATCH) {
            const batch = files.slice(i, i + BATCH).map((f) => ({ ...f, project_id: id }));
            const { error: insertError } = await supabase.from("generated_files").insert(batch);
            if (insertError) {
              console.error(`Failed to save files batch ${i}-${i + BATCH}:`, insertError);
              throw new Error(`Database error saving files: ${insertError.message}`);
            }
          }
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
