"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { SimulationViewer } from "@/components/simulation/SimulationViewer";
import { RiskReport } from "@/components/simulation/RiskReport";
import { DeliverableViewer } from "@/components/simulation/DeliverableViewer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, MessageSquare, Zap } from "lucide-react";
import type { SimulationReport } from "@/types";
import type { Deliverable } from "@/types/deliverables";

type Tab = "simulation" | "report" | "build";

export default function SimulationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<Tab>("simulation");
  const [report, setReport] = useState<SimulationReport | null>(null);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [projectBudget, setProjectBudget] = useState<number | undefined>();
  const [projectTimeline, setProjectTimeline] = useState<number | undefined>();

  useEffect(() => {
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
        if (simulation?.deliverables?.length > 0) {
          setDeliverables(simulation.deliverables);
        }
      })
      .catch(() => null);
  }, [id]);

  const handleSimulationComplete = (completedReport: SimulationReport) => {
    setReport(completedReport);
    setTimeout(() => setActiveTab("report"), 1500);
  };

  const tabs = [
    { id: "simulation" as Tab, label: "Agent Simulation", icon: MessageSquare, enabled: true },
    { id: "report" as Tab, label: "Risk Report", icon: FileText, enabled: !!report },
    { id: "build" as Tab, label: "Build & Deliver", icon: Zap, enabled: !!report, highlight: true },
  ];

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
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => tab.enabled && setActiveTab(tab.id)}
              disabled={!tab.enabled}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                activeTab === tab.id
                  ? tab.highlight
                    ? "bg-emerald-600 text-white"
                    : "bg-indigo-600 text-white"
                  : tab.highlight && tab.enabled
                  ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                  : "text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === "build" && deliverables.length > 0 && (
                <span className="ml-1 w-2 h-2 rounded-full bg-emerald-400" />
              )}
              {tab.id === "report" && report && (
                <span className="ml-1 w-2 h-2 rounded-full bg-indigo-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === "simulation" && (
          <div className="h-full max-w-4xl mx-auto w-full">
            <SimulationViewer simulationId={id} onComplete={handleSimulationComplete} />
          </div>
        )}

        {activeTab === "report" && (
          <div className="max-w-4xl mx-auto px-6 py-8 w-full">
            {report ? (
              <>
                <RiskReport
                  report={report}
                  projectBudget={projectBudget}
                  projectTimeline={projectTimeline}
                />
                <div className="mt-8 p-6 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-emerald-900">Ready to build?</p>
                    <p className="text-sm text-emerald-700 mt-0.5">
                      Your AI team will now produce the actual logo, website, and marketing materials.
                    </p>
                  </div>
                  <Button
                    onClick={() => setActiveTab("build")}
                    className="bg-emerald-600 hover:bg-emerald-700 gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Build It
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-zinc-500">
                Run the simulation first to generate a risk report.
              </div>
            )}
          </div>
        )}

        {activeTab === "build" && (
          <div className="max-w-5xl mx-auto px-6 py-8 w-full">
            <DeliverableViewer
              simulationId={id}
              existingDeliverables={deliverables}
              onExecutionStart={() => setDeliverables([])}
            />
          </div>
        )}
      </div>
    </div>
  );
}
