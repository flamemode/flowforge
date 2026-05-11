import { anthropic, CLAUDE_MODEL } from "@/lib/anthropic";
import { AGENT_ORDER, PROJECT_PHASES, SIMULATION_ROUNDS } from "@/lib/constants";
import {
  getAgentSystemPrompt,
  getConflictDetectionPrompt,
  getReportGenerationPrompt,
} from "./prompts";
import type {
  AgentRole,
  ConflictDetected,
  Project,
  ProjectPhase,
  SimulationMessage,
  SimulationReport,
} from "@/types";

export interface SimulationEvent {
  type: "message" | "conflict" | "phase_change" | "complete" | "error";
  data: unknown;
}

export interface RunSimulationOptions {
  project: Project;
  simulationId: string;
  onEvent: (event: SimulationEvent) => void | Promise<void>;
}

export async function runSimulation({
  project,
  simulationId,
  onEvent,
}: RunSimulationOptions): Promise<SimulationReport> {
  const allMessages: Array<{ round: number; role: AgentRole; content: string }> = [];
  const allConflicts: ConflictDetected[] = [];

  for (let round = 1; round <= SIMULATION_ROUNDS; round++) {
    const phase = PROJECT_PHASES[round - 1] as ProjectPhase;

    await onEvent({ type: "phase_change", data: { round, phase } });

    const roundMessages: SimulationMessage[] = [];

    // Determine which agents participate in this phase
    const activeAgents = getAgentsForPhase(phase);

    // Build conversation history for context
    const conversationHistory = buildConversationHistory(allMessages);

    for (const agentRole of activeAgents) {
      const systemPrompt = getAgentSystemPrompt(agentRole, project);

      const userMessage = buildAgentPrompt(
        phase,
        round,
        conversationHistory,
        roundMessages,
        agentRole
      );

      try {
        const response = await anthropic.messages.create({
          model: CLAUDE_MODEL,
          max_tokens: 600,
          system: systemPrompt,
          messages: [{ role: "user", content: userMessage }],
        });

        const content =
          response.content[0].type === "text" ? response.content[0].text : "";

        const messageType = detectMessageType(content);

        const message: SimulationMessage = {
          id: `${simulationId}-r${round}-${agentRole}`,
          simulation_id: simulationId,
          round,
          agent_role: agentRole,
          content,
          message_type: messageType,
          created_at: new Date().toISOString(),
        };

        roundMessages.push(message);
        allMessages.push({ round, role: agentRole, content });

        await onEvent({ type: "message", data: message });
      } catch (error) {
        await onEvent({
          type: "error",
          data: { round, agentRole, error: String(error) },
        });
      }
    }

    // Run conflict detection after each round
    if (roundMessages.length >= 2) {
      const conflicts = await detectConflicts(phase, round, roundMessages);
      if (conflicts.length > 0) {
        allConflicts.push(...conflicts);
        await onEvent({ type: "conflict", data: conflicts });
      }
    }
  }

  // Generate final report
  const report = await generateReport(
    project,
    simulationId,
    allMessages,
    allConflicts
  );

  await onEvent({ type: "complete", data: report });

  return report;
}

function getAgentsForPhase(phase: ProjectPhase): AgentRole[] {
  const phaseAgents: Record<ProjectPhase, AgentRole[]> = {
    kickoff: ["project_manager", "client_liaison", "account_manager"],
    discovery: [
      "client_liaison",
      "creative_director",
      "copywriter",
      "developer",
    ],
    planning: ["project_manager", "developer", "creative_director"],
    design: ["creative_director", "copywriter", "client_liaison"],
    development: ["developer", "project_manager", "qa_tester"],
    review: ["qa_tester", "creative_director", "client_liaison"],
    delivery: ["account_manager", "project_manager", "client_liaison"],
    retrospective: AGENT_ORDER,
  };
  return phaseAgents[phase] || AGENT_ORDER;
}

function buildConversationHistory(
  allMessages: Array<{ round: number; role: AgentRole; content: string }>
): string {
  if (allMessages.length === 0) return "No previous discussion.";

  const recent = allMessages.slice(-12);
  return recent
    .map((m) => `[${m.role.toUpperCase()}]: ${m.content}`)
    .join("\n\n");
}

function buildAgentPrompt(
  phase: ProjectPhase,
  round: number,
  conversationHistory: string,
  roundMessages: SimulationMessage[],
  currentAgent: AgentRole
): string {
  const currentRoundContext =
    roundMessages.length > 0
      ? roundMessages
          .map((m) => `[${m.agent_role.toUpperCase()}]: ${m.content}`)
          .join("\n\n")
      : "You are the first to speak in this phase.";

  return `PROJECT SIMULATION — Phase: ${phase.toUpperCase()} (Round ${round} of ${SIMULATION_ROUNDS})

PREVIOUS ROUNDS CONTEXT:
${conversationHistory}

CURRENT PHASE DISCUSSION SO FAR:
${currentRoundContext}

As ${currentAgent.replace(/_/g, " ")}, provide your analysis and input for the ${phase} phase. Remember to:
- Respond directly to points raised by colleagues if relevant
- Raise your specific concerns and risks for this phase
- Ask critical questions or make specific recommendations
- Be authentic to your professional role and perspective

Your response:`;
}

function detectMessageType(
  content: string
): SimulationMessage["message_type"] {
  const lower = content.toLowerCase();
  if (lower.includes("concern") || lower.includes("risk") || lower.includes("worried") || lower.includes("flag"))
    return "concern";
  if (lower.includes("?") && (lower.includes("what") || lower.includes("how") || lower.includes("who") || lower.includes("when")))
    return "question";
  if (lower.includes("conflict") || lower.includes("disagree") || lower.includes("pushback"))
    return "conflict";
  if (lower.includes("recommend") || lower.includes("decision") || lower.includes("we should") || lower.includes("I propose"))
    return "decision";
  return "statement";
}

async function detectConflicts(
  phase: ProjectPhase,
  round: number,
  messages: SimulationMessage[]
): Promise<ConflictDetected[]> {
  const prompt = getConflictDetectionPrompt(
    phase,
    round,
    messages.map((m) => ({ role: m.agent_role, content: m.content }))
  );

  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return [];

    const parsed = JSON.parse(jsonMatch[0]);
    return (parsed.conflicts || []).map(
      (c: { between: AgentRole[]; description: string; severity: string }) => ({
        between: c.between as AgentRole[],
        description: c.description,
        severity: c.severity as ConflictDetected["severity"],
      })
    );
  } catch {
    return [];
  }
}

async function generateReport(
  project: Project,
  simulationId: string,
  allMessages: Array<{ round: number; role: AgentRole; content: string }>,
  allConflicts: ConflictDetected[]
): Promise<SimulationReport> {
  const prompt = getReportGenerationPrompt(
    project,
    allMessages,
    allConflicts.map((c) => ({
      description: c.description,
      severity: c.severity,
    }))
  );

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 3000,
    messages: [{ role: "user", content: prompt }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "{}";
  const jsonMatch = text.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    return buildFallbackReport(simulationId, project.id);
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      id: `report-${simulationId}`,
      simulation_id: simulationId,
      project_id: project.id,
      executive_summary: parsed.executive_summary || "",
      success_probability: parsed.success_probability || 70,
      overall_risk_level: parsed.overall_risk_level || "medium",
      risks: (parsed.risks || []).map(
        (r: Record<string, unknown>, i: number) => ({
          id: `risk-${i}`,
          simulation_id: simulationId,
          ...r,
        })
      ),
      recommendations: parsed.recommendations || [],
      revised_timeline_weeks: parsed.revised_timeline_weeks || project.timeline_weeks,
      revised_budget_multiplier: parsed.revised_budget_multiplier || 1.0,
      process_improvements: parsed.process_improvements || [],
      agent_performance: parsed.agent_performance || [],
      created_at: new Date().toISOString(),
    };
  } catch {
    return buildFallbackReport(simulationId, project.id);
  }
}

function buildFallbackReport(
  simulationId: string,
  projectId: string
): SimulationReport {
  return {
    id: `report-${simulationId}`,
    simulation_id: simulationId,
    project_id: projectId,
    executive_summary:
      "Simulation completed. Report generation encountered an issue — please review the agent conversation logs for insights.",
    success_probability: 70,
    overall_risk_level: "medium",
    risks: [],
    recommendations: [],
    revised_timeline_weeks: 0,
    revised_budget_multiplier: 1.0,
    process_improvements: [],
    agent_performance: [],
    created_at: new Date().toISOString(),
  };
}
