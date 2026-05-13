import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateProject } from "@/lib/generator/generator";
import type { GenerationEvent } from "@/lib/generator/generator";
import { generateMobileProject } from "@/lib/generator/mobile-generator";
import { checkRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { sendGenerationComplete } from "@/lib/email";

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

  // Rate limit: max 5 generations per hour per user
  const rl = checkRateLimit(`generate:${user.id}`, { max: 5, windowMs: 3600_000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many generations. Please wait before trying again.", retry_after_ms: rl.retryAfterMs },
      { status: 429 }
    );
  }

  const { data: project, error: projectError } = await supabase
    .from("generated_projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Block re-generation only if complete AND files actually exist
  if (project.status === "complete") {
    const { count } = await supabase
      .from("generated_files")
      .select("id", { count: "exact", head: true })
      .eq("project_id", id);

    if (count && count > 0) {
      return NextResponse.json({ error: "Already generated" }, { status: 409 });
    }
    // Complete but 0 files = previous failed insert, allow regeneration
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
        const generateFn = project.questionnaire.platform === "mobile" ? generateMobileProject : generateProject;
        const files = await generateFn(project.questionnaire, onEvent);

        // Save files in batches of 20 to avoid Supabase payload size limits
        if (files.length > 0) {
          // Deduplicate by path — keep last occurrence if generator emitted the same path twice
          const seen = new Map<string, typeof files[0]>();
          for (const f of files) seen.set(f.path, f);
          const unique = Array.from(seen.values());

          const BATCH = 20;
          for (let i = 0; i < unique.length; i += BATCH) {
            const batch = unique.slice(i, i + BATCH).map((f) => ({ ...f, project_id: id }));
            const { error: insertError } = await supabase
              .from("generated_files")
              .upsert(batch, { onConflict: "project_id,path", ignoreDuplicates: false });
            if (insertError) {
              logger.error(`Failed to save files batch ${i}-${i + BATCH}`, insertError, { projectId: id, userId: user.id });
              throw new Error(`Database error saving files: ${insertError.message}`);
            }
          }
        }

        await supabase
          .from("generated_projects")
          .update({ status: "complete", file_count: files.length, completed_at: new Date().toISOString() })
          .eq("id", id);

        // Send generation-complete email (fire-and-forget)
        sendGenerationComplete({
          to: user.email ?? "",
          name: user.user_metadata?.full_name ?? null,
          projectName: project.name,
          projectId: id,
        }).catch((err) => logger.error("Failed to send generation email", err, { projectId: id }));
      } catch (err) {
        await supabase
          .from("generated_projects")
          .update({ status: "failed" })
          .eq("id", id);

        logger.error("Generation failed", err, { projectId: id, userId: user.id });

        // Refund the credit since generation failed
        try {
          const admin = createAdminClient();
          await admin.rpc("refund_credit", { user_uuid: user.id });
          logger.info("Credit refunded after generation failure", { projectId: id, userId: user.id });
        } catch (refundErr) {
          logger.error("Failed to refund credit", refundErr, { projectId: id, userId: user.id });
        }

        controller.enqueue(enc.encode(sse({
          type: "error",
          data: { message: String(err) + " Your credit has been refunded." },
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
