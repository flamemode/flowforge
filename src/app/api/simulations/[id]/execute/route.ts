import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { executeProject } from "@/lib/agents/executor";
import type { Project } from "@/types";
import type { Deliverable } from "@/types/deliverables";

export const maxDuration = 300;

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return new Response("Unauthorized", { status: 401 });

  const { data: simulation, error } = await supabase
    .from("simulations")
    .select("*, projects(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !simulation) return new Response("Not found", { status: 404 });

  if (simulation.status !== "completed") {
    return new Response("Simulation must be completed first", { status: 409 });
  }

  const project = simulation.projects as Project;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: unknown) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      }

      try {
        const deliverables = await executeProject({
          project,
          simulationId: id,
          onEvent: async (event) => {
            send(event);
          },
        });

        // Save deliverables to DB
        await supabase.from("deliverables").upsert(
          deliverables.map((d: Deliverable) => ({
            id: d.id,
            simulation_id: d.simulation_id,
            project_id: d.project_id,
            type: d.type,
            title: d.title,
            content: d.content,
            status: d.status,
          }))
        );
      } catch (err) {
        send({ type: "error", data: { message: String(err) } });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
