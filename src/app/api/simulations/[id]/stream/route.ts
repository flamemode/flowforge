import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runSimulation } from "@/lib/agents/orchestrator";
import type { SimulationEvent } from "@/lib/agents/orchestrator";
import type { Project } from "@/types";

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

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Fetch simulation + project
  const { data: simulation, error } = await supabase
    .from("simulations")
    .select("*, projects(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !simulation) {
    return new Response("Simulation not found", { status: 404 });
  }

  if (simulation.status === "completed") {
    return new Response("Simulation already completed", { status: 409 });
  }

  const project = simulation.projects as Project;

  // Mark simulation as running
  await supabase
    .from("simulations")
    .update({ status: "running" })
    .eq("id", id);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function sendEvent(event: SimulationEvent) {
        const data = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(data));
      }

      try {
        let messageBuffer: Array<{
          simulation_id: string;
          round: number;
          agent_role: string;
          content: string;
          message_type: string;
        }> = [];

        const report = await runSimulation({
          project,
          simulationId: id,
          onEvent: async (event: SimulationEvent) => {
            sendEvent(event);

            if (event.type === "message") {
              const msg = event.data as {
                simulation_id: string;
                round: number;
                agent_role: string;
                content: string;
                message_type: string;
              };
              messageBuffer.push({
                simulation_id: msg.simulation_id,
                round: msg.round,
                agent_role: msg.agent_role,
                content: msg.content,
                message_type: msg.message_type,
              });

              // Batch insert every 5 messages
              if (messageBuffer.length >= 5) {
                await supabase
                  .from("simulation_messages")
                  .insert(messageBuffer);
                messageBuffer = [];
              }

              // Update current round
              await supabase
                .from("simulations")
                .update({ current_round: msg.round })
                .eq("id", id);
            }

            if (event.type === "conflict") {
              const conflicts = event.data as Array<{
                between: string[];
                description: string;
                severity: string;
              }>;
              await supabase.from("simulation_conflicts").insert(
                conflicts.map((c) => ({
                  simulation_id: id,
                  round: 0,
                  involved_roles: c.between,
                  description: c.description,
                  severity: c.severity,
                }))
              );
            }
          },
        });

        // Flush remaining messages
        if (messageBuffer.length > 0) {
          await supabase.from("simulation_messages").insert(messageBuffer);
        }

        // Calculate risk score
        const riskScore = 100 - report.success_probability;

        // Save report
        await supabase.from("simulation_reports").insert({
          simulation_id: id,
          project_id: project.id,
          overall_risk_level: report.overall_risk_level,
          success_probability: report.success_probability,
          executive_summary: report.executive_summary,
          risks: report.risks,
          recommendations: report.recommendations,
          revised_timeline_weeks: report.revised_timeline_weeks,
          revised_budget_multiplier: report.revised_budget_multiplier,
          process_improvements: report.process_improvements,
          agent_performance: report.agent_performance,
        });

        // Mark simulation complete
        await supabase
          .from("simulations")
          .update({
            status: "completed",
            risk_score: riskScore,
            success_probability: report.success_probability,
            completed_at: new Date().toISOString(),
          })
          .eq("id", id);
      } catch (err) {
        sendEvent({ type: "error", data: { message: String(err) } });

        await supabase
          .from("simulations")
          .update({ status: "failed" })
          .eq("id", id);
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
