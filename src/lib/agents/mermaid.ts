import type { SimulationReport, Risk } from "@/types";

export function generateProjectFlowchart(
  projectName: string,
  report: SimulationReport
): string {
  const phases = [
    "Kickoff",
    "Discovery",
    "Planning",
    "Design",
    "Development",
    "QA & Review",
    "Delivery",
  ];

  const highRisks = report.risks.filter(
    (r) => r.level === "high" || r.level === "critical"
  );

  let chart = `flowchart TD\n`;
  chart += `    Start([🚀 Project Start]) --> K\n`;

  phases.forEach((phase, i) => {
    const id = phase.replace(/[^a-zA-Z]/g, "");
    const nextId =
      i < phases.length - 1
        ? phases[i + 1].replace(/[^a-zA-Z]/g, "")
        : "End";
    const riskInPhase = getPhaseRisk(phase, highRisks);

    if (riskInPhase) {
      chart += `    ${id}["${phase}\\n⚠️ Risk: ${riskInPhase}"] --> ${nextId}\n`;
      chart += `    style ${id} fill:#fef3c7,stroke:#f59e0b\n`;
    } else {
      chart += `    ${id}["${phase}"] --> ${nextId}\n`;
    }
  });

  chart += `    End([✅ Project Complete])\n`;
  chart += `    style Start fill:#dbeafe,stroke:#3b82f6\n`;
  chart += `    style End fill:#d1fae5,stroke:#10b981\n`;

  return chart;
}

export function generateRiskMatrix(risks: Risk[]): string {
  let chart = `quadrantChart\n`;
  chart += `    title Risk Matrix (Likelihood vs Impact)\n`;
  chart += `    x-axis Low Likelihood --> High Likelihood\n`;
  chart += `    y-axis Low Impact --> High Impact\n`;
  chart += `    quadrant-1 Monitor Closely\n`;
  chart += `    quadrant-2 Critical — Act Now\n`;
  chart += `    quadrant-3 Low Priority\n`;
  chart += `    quadrant-4 Contingency Plan\n`;

  risks.slice(0, 8).forEach((risk) => {
    const x = (risk.likelihood / 100).toFixed(2);
    const y = (risk.impact / 100).toFixed(2);
    const label = risk.title.slice(0, 20);
    chart += `    ${label}: [${x}, ${y}]\n`;
  });

  return chart;
}

export function generateAgentInteractionDiagram(
  messages: Array<{ role: string; round: number }>
): string {
  const roleShort: Record<string, string> = {
    project_manager: "PM",
    client_liaison: "CL",
    creative_director: "CD",
    copywriter: "CW",
    developer: "DEV",
    qa_tester: "QA",
    account_manager: "AM",
  };

  const participants = [
    ...new Set(messages.map((m) => m.role)),
  ];

  let diagram = `sequenceDiagram\n`;
  participants.forEach((p) => {
    diagram += `    participant ${roleShort[p] || p} as ${p.replace(/_/g, " ")}\n`;
  });

  messages.slice(0, 15).forEach((msg, i) => {
    const from = roleShort[msg.role] || msg.role;
    const next = messages[i + 1];
    if (next) {
      const to = roleShort[next.role] || next.role;
      diagram += `    ${from}->>${to}: Round ${msg.round}\n`;
    }
  });

  return diagram;
}

function getPhaseRisk(phase: string, risks: Risk[]): string | null {
  const phaseToCategory: Record<string, string[]> = {
    Kickoff: ["communication", "client_relations"],
    Discovery: ["scope_creep", "client_relations"],
    Planning: ["timeline", "resource"],
    Design: ["scope_creep", "communication"],
    Development: ["technical", "timeline"],
    "QA & Review": ["quality", "timeline"],
    Delivery: ["client_relations", "budget"],
  };

  const categories = phaseToCategory[phase] || [];
  const risk = risks.find((r) => categories.includes(r.category));
  return risk ? risk.title.slice(0, 25) : null;
}
