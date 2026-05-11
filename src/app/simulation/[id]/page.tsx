"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { SimulationViewer } from "@/components/simulation/SimulationViewer";
import { RiskReport } from "@/components/simulation/RiskReport";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, MessageSquare } from "lucide-react";
import type { SimulationReport } from "@/types";

type Tab = "simulation" | "report";

export default function SimulationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<Tab>("simulation");
  const [report, setReport] = useState<SimulationReport | null>(null);
  const [projectBudget, setProjectBudget] = useState<number | undefined>();
  const [projectTimeline, setProjectTimeline] = useState<number | undefined>();

  useEffect(() => {
    // Check if simulation is already complete
    fetch(`/api/simulations/${id}`)
      .then((r) => r.json())
      .then(({ simulation }) => {
        if (simulation?.projects) {
          setProjectBudget(simulation.projects.budget);
          setProjectTimeline(simulation.projects.timeline_weeks);
        }
        if (simulation?.simulation_reports?.[0]) {
          setReport(simulation.simulation_reports[0]);
          setActiveTab("report");
        }
      })
      .catch(() => null);
  }, [id]);

  const handleComplete = (completedReport: SimulationReport) => {
    setReport(completedReport);
    setTimeout(() => setActiveTab("report"), 1500);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Navbar />

      <div className="border-b border-zinc-200 bg-white px-6 py-3 flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
        </Button>

        <div className="flex rounded-lg border border-zinc-200 overflow-hidden">
          <button
            onClick={() => setActiveTab("simulation")}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === "simulation"
                ? "bg-indigo-600 text-white"
                : "text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Agent Simulation
          </button>
          <button
            onClick={() => setActiveTab("report")}
            disabled={!report}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              activeTab === "report"
                ? "bg-indigo-600 text-white"
                : "text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            <FileText className="w-4 h-4" />
            Risk Report
            {report && (
              <span className="ml-1 w-2 h-2 rounded-full bg-emerald-400" />
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === "simulation" ? (
          <div className="h-full max-w-4xl mx-auto w-full">
            <SimulationViewer simulationId={id} onComplete={handleComplete} />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto px-6 py-8 w-full">
            {report ? (
              <RiskReport
                report={report}
                projectBudget={projectBudget}
                projectTimeline={projectTimeline}
              />
            ) : (
              <div className="text-center py-20 text-zinc-500">
                Run the simulation first to generate a risk report.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
