"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { CLIENT_PERSONALITY_LABELS, PROJECT_TYPE_LABELS } from "@/lib/constants";
import { ArrowLeft, Zap } from "lucide-react";

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    client_type: "",
    project_type: "",
    budget: "",
    timeline_weeks: "",
    team_size: "3",
    client_personality: "",
    scope_description: "",
    special_requirements: "",
  });

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      name: form.name,
      client_type: form.client_type,
      project_type: form.project_type,
      budget: Number(form.budget),
      timeline_weeks: Number(form.timeline_weeks),
      team_size: Number(form.team_size),
      client_personality: form.client_personality,
      scope_description: form.scope_description,
      special_requirements: form.special_requirements || undefined,
    };

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const { error: err } = await res.json();
      setError(err || "Failed to create project");
      setLoading(false);
      return;
    }

    const { project } = await res.json();

    // Create simulation and redirect to it
    const simRes = await fetch("/api/simulations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_id: project.id }),
    });

    if (!simRes.ok) {
      const { error: err } = await simRes.json();
      setError(err || "Failed to create simulation");
      setLoading(false);
      return;
    }

    const { simulation } = await simRes.json();
    router.push(`/simulation/${simulation.id}`);
  };

  const isValid =
    form.name &&
    form.client_type &&
    form.project_type &&
    form.budget &&
    form.timeline_weeks &&
    form.client_personality &&
    form.scope_description.length >= 10;

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar />

      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4" />
              Back to dashboard
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-zinc-900">
            New Project Simulation
          </h1>
          <p className="text-zinc-500 mt-1">
            Fill in your project details and we&apos;ll run a full AI simulation
            to predict risks and conflicts.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project basics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Project Basics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Project name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Acme Corp Rebrand"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="client_type">Client type</Label>
                  <Input
                    id="client_type"
                    placeholder="e.g. SaaS startup, e-commerce brand"
                    value={form.client_type}
                    onChange={(e) => set("client_type", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Project type</Label>
                  <Select
                    value={form.project_type}
                    onValueChange={(v) => set("project_type", v)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PROJECT_TYPE_LABELS).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Budget & Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Budget & Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="budget">Budget (USD)</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="45000"
                    min="1000"
                    value={form.budget}
                    onChange={(e) => set("budget", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="timeline_weeks">Timeline (weeks)</Label>
                  <Input
                    id="timeline_weeks"
                    type="number"
                    placeholder="8"
                    min="1"
                    max="104"
                    value={form.timeline_weeks}
                    onChange={(e) => set("timeline_weeks", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="team_size">Team size</Label>
                  <Input
                    id="team_size"
                    type="number"
                    placeholder="3"
                    min="1"
                    max="50"
                    value={form.team_size}
                    onChange={(e) => set("team_size", e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client profile */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Client Personality</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                <Label>Client personality profile</Label>
                <Select
                  value={form.client_personality}
                  onValueChange={(v) => set("client_personality", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select personality type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CLIENT_PERSONALITY_LABELS).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-zinc-400">
                  This heavily influences simulation outcomes. Be honest.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Scope */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Project Scope</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="scope_description">
                  Describe the project scope
                </Label>
                <Textarea
                  id="scope_description"
                  placeholder="e.g. Full brand identity redesign including logo, brand guidelines, and a 5-page marketing website. Client wants Shopify integration for their product catalog..."
                  rows={4}
                  value={form.scope_description}
                  onChange={(e) => set("scope_description", e.target.value)}
                  required
                />
                <p className="text-xs text-zinc-400">
                  More detail = more accurate simulation. Include any known
                  requirements, integrations, or constraints.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="special_requirements">
                  Special requirements{" "}
                  <span className="text-zinc-400">(optional)</span>
                </Label>
                <Textarea
                  id="special_requirements"
                  placeholder="e.g. Must integrate with existing HubSpot CRM. Client has a strict launch date tied to a trade show..."
                  rows={2}
                  value={form.special_requirements}
                  onChange={(e) => set("special_requirements", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={!isValid || loading}
              size="lg"
              className="flex-1 gap-2"
            >
              <Zap className="w-5 h-5" />
              {loading ? "Creating simulation..." : "Run Simulation"}
            </Button>
            <Button type="button" variant="outline" size="lg" asChild>
              <Link href="/dashboard">Cancel</Link>
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
