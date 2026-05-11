"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Deliverable } from "@/types/deliverables";
import { Download, Eye, Code, Palette, Globe, Megaphone, Loader2 } from "lucide-react";

interface DeliverableViewerProps {
  simulationId: string;
  existingDeliverables?: Deliverable[];
  onExecutionStart?: () => void;
}

const DELIVERABLE_META = {
  logo_svg: { icon: Palette, label: "Brand Logo", color: "#ec4899" },
  brand_guidelines: { icon: Eye, label: "Brand Guidelines", color: "#6366f1" },
  website_html: { icon: Globe, label: "Website", color: "#3b82f6" },
  marketing_strategy: { icon: Megaphone, label: "Marketing Pack", color: "#10b981" },
  social_media_pack: { icon: Megaphone, label: "Social Media", color: "#f59e0b" },
  ad_copy: { icon: Code, label: "Ad Copy", color: "#f97316" },
};

const EXECUTION_STEPS = [
  { key: "logo", label: "Designing logo..." },
  { key: "brand", label: "Writing brand guidelines..." },
  { key: "website", label: "Building website..." },
  { key: "marketing", label: "Creating marketing strategy..." },
];

export function DeliverableViewer({
  simulationId,
  existingDeliverables = [],
  onExecutionStart,
}: DeliverableViewerProps) {
  const [deliverables, setDeliverables] = useState<Deliverable[]>(existingDeliverables);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState("");
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef(false);

  const startExecution = async () => {
    if (streamRef.current) return;
    streamRef.current = true;
    setIsRunning(true);
    setError(null);
    setDeliverables([]);
    onExecutionStart?.();

    try {
      const response = await fetch(`/api/simulations/${simulationId}/execute`, {
        method: "POST",
      });

      if (!response.ok) throw new Error(await response.text());

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
          try {
            const event = JSON.parse(line.slice(6));

            if (event.type === "start" || event.type === "progress") {
              setCurrentStep(event.data.label);
            }
            if (event.type === "deliverable") {
              setDeliverables((prev) => {
                const next = [...prev, event.data as Deliverable];
                if (!activeTab) setActiveTab(event.data.type);
                return next;
              });
            }
            if (event.type === "complete") {
              setIsRunning(false);
              setCurrentStep("");
            }
            if (event.type === "error") {
              setError(event.data.message);
              setIsRunning(false);
            }
          } catch { /* malformed chunk */ }
        }
      }
    } catch (err) {
      setError(String(err));
      setIsRunning(false);
      streamRef.current = false;
    }
  };

  const downloadDeliverable = (d: Deliverable) => {
    const ext = d.type === "logo_svg" ? "svg" : d.type === "website_html" ? "html" : "md";
    const mime = d.type === "logo_svg" ? "image/svg+xml" : d.type === "website_html" ? "text/html" : "text/markdown";
    const blob = new Blob([d.content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${d.type}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeDeliverable = deliverables.find((d) => d.type === activeTab);

  if (deliverables.length === 0 && !isRunning) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl mb-4">⚡</div>
        <h3 className="text-xl font-bold text-zinc-900 mb-2">
          Ready to build the actual deliverables
        </h3>
        <p className="text-zinc-500 max-w-md mb-2">
          Your AI team will now produce real assets — a logo, brand guidelines, a
          working website, and a full marketing strategy.
        </p>
        <p className="text-xs text-zinc-400 mb-8">
          Takes 2–4 minutes · Uses ~$0.50–1.00 in AI credits
        </p>
        <Button onClick={startExecution} size="lg" className="gap-2">
          <Palette className="w-5 h-5" />
          Execute — Build the Project
        </Button>
        {error && (
          <p className="mt-4 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status bar */}
      {isRunning && (
        <div className="flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
          <Loader2 className="w-5 h-5 text-indigo-600 animate-spin flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-indigo-900">{currentStep}</p>
            <div className="flex gap-2 mt-1">
              {EXECUTION_STEPS.map((step) => {
                const done = deliverables.some((d) => {
                  if (step.key === "logo") return d.type === "logo_svg";
                  if (step.key === "brand") return d.type === "brand_guidelines";
                  if (step.key === "website") return d.type === "website_html";
                  if (step.key === "marketing") return d.type === "marketing_strategy";
                  return false;
                });
                return (
                  <span
                    key={step.key}
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      done ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-400"
                    }`}
                  >
                    {step.label.replace("...", "")}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Deliverable tabs */}
      {deliverables.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {deliverables.map((d) => {
            const meta = DELIVERABLE_META[d.type];
            return (
              <button
                key={d.type}
                onClick={() => setActiveTab(d.type)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                  activeTab === d.type
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                }`}
              >
                <meta.icon className="w-4 h-4" />
                {meta.label}
                <Badge variant="success" className="ml-1 text-xs">Done</Badge>
              </button>
            );
          })}
          {isRunning && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-zinc-400 border border-dashed border-zinc-200">
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </div>
          )}
        </div>
      )}

      {/* Deliverable content */}
      {activeDeliverable && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{activeDeliverable.title}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadDeliverable(activeDeliverable)}
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {activeDeliverable.type === "logo_svg" && (
              <div className="space-y-4">
                <div className="flex gap-6">
                  <div className="p-8 bg-white border border-zinc-200 rounded-xl flex items-center justify-center flex-1">
                    <div
                      className="w-48 h-48"
                      dangerouslySetInnerHTML={{ __html: activeDeliverable.content }}
                    />
                  </div>
                  <div className="p-8 bg-zinc-900 border border-zinc-700 rounded-xl flex items-center justify-center flex-1">
                    <div
                      className="w-48 h-48"
                      dangerouslySetInnerHTML={{ __html: activeDeliverable.content }}
                    />
                  </div>
                </div>
                <details className="text-xs">
                  <summary className="cursor-pointer text-zinc-500 hover:text-zinc-700">View SVG code</summary>
                  <pre className="mt-2 p-3 bg-zinc-50 rounded-lg overflow-x-auto text-zinc-700 text-xs">
                    {activeDeliverable.content}
                  </pre>
                </details>
              </div>
            )}

            {activeDeliverable.type === "website_html" && (
              <div className="space-y-4">
                <iframe
                  srcDoc={activeDeliverable.content}
                  className="w-full h-[600px] rounded-xl border border-zinc-200"
                  sandbox="allow-scripts"
                  title="Website Preview"
                />
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    How to publish your website for free
                  </h4>
                  <ol className="space-y-3 text-sm text-blue-800">
                    <li className="flex gap-3">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                      <span>Click <strong>Download</strong> above to save the <code className="bg-blue-100 px-1 rounded">website_html.html</code> file to your computer.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                      <span>Go to <strong>netlify.com/drop</strong> — no account needed. Drag and drop your HTML file onto the page.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                      <span>Netlify gives you a live URL instantly (e.g. <code className="bg-blue-100 px-1 rounded">random-name.netlify.app</code>). Share it with anyone.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                      <span><strong>Want a custom domain?</strong> Sign up for a free Netlify account, connect your domain (bought at Namecheap or GoDaddy for ~$10/year), and point it to your site in Netlify&apos;s dashboard.</span>
                    </li>
                  </ol>
                  <p className="text-xs text-blue-600 mt-3">Hosting is completely free on Netlify&apos;s free plan for personal and small business sites.</p>
                </div>
              </div>
            )}

            {(activeDeliverable.type === "brand_guidelines" ||
              activeDeliverable.type === "marketing_strategy" ||
              activeDeliverable.type === "social_media_pack" ||
              activeDeliverable.type === "ad_copy") && (
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-zinc-700 font-sans leading-relaxed">
                  {activeDeliverable.content}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
