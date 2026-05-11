"use client";

import { useEffect, useRef, useState } from "react";
import { MessageBubble } from "./MessageBubble";
import { AgentAvatar } from "@/components/agents/AgentAvatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AGENTS, PROJECT_PHASES, SIMULATION_ROUNDS } from "@/lib/constants";
import type { SimulationMessage, SimulationReport, AgentRole, ProjectPhase } from "@/types";
import { AlertTriangle, CheckCircle, Zap } from "lucide-react";

interface SimulationViewerProps {
  simulationId: string;
  onComplete: (report: SimulationReport) => void;
}

type SimulationEvent =
  | { type: "message"; data: SimulationMessage }
  | { type: "conflict"; data: Array<{ between: AgentRole[]; description: string; severity: string }> }
  | { type: "phase_change"; data: { round: number; phase: ProjectPhase } }
  | { type: "complete"; data: SimulationReport }
  | { type: "error"; data: { message: string } };

export function SimulationViewer({ simulationId, onComplete }: SimulationViewerProps) {
  const [messages, setMessages] = useState<SimulationMessage[]>([]);
  const [conflicts, setConflicts] = useState<Array<{ description: string; severity: string }>>([]);
  const [currentPhase, setCurrentPhase] = useState<string>("kickoff");
  const [currentRound, setCurrentRound] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeAgent, setActiveAgent] = useState<AgentRole | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<boolean>(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startSimulation = async () => {
    if (streamRef.current) return;
    streamRef.current = true;
    setIsRunning(true);
    setError(null);

    try {
      const response = await fetch(`/api/simulations/${simulationId}/stream`, {
        method: "POST",
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(err);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const event = JSON.parse(jsonStr) as SimulationEvent;
            handleEvent(event);
          } catch {
            // malformed SSE chunk
          }
        }
      }
    } catch (err) {
      setError(String(err));
      setIsRunning(false);
      streamRef.current = false;
    }
  };

  function handleEvent(event: SimulationEvent) {
    switch (event.type) {
      case "phase_change":
        setCurrentPhase(event.data.phase);
        setCurrentRound(event.data.round);
        setActiveAgent(null);
        break;
      case "message":
        setActiveAgent(event.data.agent_role);
        setMessages((prev) => [...prev, event.data]);
        break;
      case "conflict":
        setConflicts((prev) => [...prev, ...event.data]);
        break;
      case "complete":
        setIsRunning(false);
        setIsComplete(true);
        setActiveAgent(null);
        onComplete(event.data);
        break;
      case "error":
        setError(event.data.message);
        setIsRunning(false);
        break;
    }
  }

  const progress = (currentRound / SIMULATION_ROUNDS) * 100;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-zinc-200 p-4 bg-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                isRunning
                  ? "bg-green-500 animate-pulse"
                  : isComplete
                  ? "bg-indigo-500"
                  : "bg-zinc-300"
              }`}
            />
            <span className="font-semibold text-zinc-900">
              {isComplete
                ? "Simulation Complete"
                : isRunning
                ? `Running — ${currentPhase.replace(/_/g, " ").toUpperCase()} phase`
                : "Ready to simulate"}
            </span>
            {currentRound > 0 && (
              <Badge variant="secondary">
                Round {currentRound} / {SIMULATION_ROUNDS}
              </Badge>
            )}
          </div>
          {conflicts.length > 0 && (
            <Badge variant="danger">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {conflicts.length} conflict{conflicts.length > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex gap-1 mt-2">
          {PROJECT_PHASES.map((phase, i) => (
            <div
              key={phase}
              className={`flex-1 text-center text-xs py-1 rounded ${
                i + 1 < currentRound
                  ? "bg-indigo-100 text-indigo-700 font-medium"
                  : i + 1 === currentRound
                  ? "bg-indigo-600 text-white font-semibold"
                  : "text-zinc-400"
              }`}
            >
              {phase}
            </div>
          ))}
        </div>
      </div>

      {/* Active agents indicator */}
      {isRunning && (
        <div className="border-b border-zinc-200 px-4 py-2 bg-zinc-50 flex items-center gap-2">
          <span className="text-xs text-zinc-500">Agents:</span>
          <div className="flex gap-1">
            {Object.keys(AGENTS).map((role) => (
              <div
                key={role}
                className={`transition-all ${
                  activeAgent === role ? "scale-110" : "opacity-40"
                }`}
              >
                <AgentAvatar role={role as AgentRole} size="sm" />
              </div>
            ))}
          </div>
          {activeAgent && (
            <span className="text-xs text-zinc-600 ml-2">
              <span className="font-medium">
                {AGENTS[activeAgent]?.name}
              </span>{" "}
              is thinking...
            </span>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && !isRunning && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">
              Ready to simulate your project
            </h3>
            <p className="text-zinc-500 mb-6 max-w-md">
              7 AI agents will analyze your project across all phases, detect
              risks, and generate a comprehensive report.
            </p>
            <Button onClick={startSimulation} size="lg">
              <Zap className="w-5 h-5" />
              Start Simulation
            </Button>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isNew={i === messages.length - 1}
          />
        ))}

        {isRunning && activeAgent && (
          <div className="flex gap-3 p-4 rounded-xl bg-zinc-50 border border-zinc-200 animate-pulse">
            <AgentAvatar role={activeAgent} size="md" />
            <div className="flex-1">
              <div className="h-3 bg-zinc-200 rounded w-1/4 mb-2" />
              <div className="h-3 bg-zinc-200 rounded w-3/4 mb-1" />
              <div className="h-3 bg-zinc-200 rounded w-1/2" />
            </div>
          </div>
        )}

        {isComplete && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-200">
            <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0" />
            <p className="text-indigo-800 font-medium">
              Simulation complete! Scroll down to view the full risk report.
            </p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
