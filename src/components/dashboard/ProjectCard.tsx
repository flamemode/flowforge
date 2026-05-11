"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CLIENT_PERSONALITY_LABELS, PROJECT_TYPE_LABELS } from "@/lib/constants";
import type { Project } from "@/types";
import { Clock, DollarSign, Users, Play } from "lucide-react";

interface ProjectCardProps {
  project: Project & {
    simulations?: Array<{
      id: string;
      status: string;
      success_probability: number;
      created_at: string;
    }>;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const latestSim = project.simulations?.[0];
  const hasCompletedSim = latestSim?.status === "completed";

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{project.name}</CardTitle>
            <p className="text-xs text-zinc-500 mt-0.5">
              {PROJECT_TYPE_LABELS[project.project_type] || project.project_type}
            </p>
          </div>
          <Badge variant="secondary" className="text-xs">
            {CLIENT_PERSONALITY_LABELS[project.client_personality]?.split(" ")[0]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-zinc-600 line-clamp-2 mb-4">
          {project.scope_description}
        </p>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <DollarSign className="w-3 h-3" />
            {formatCurrency(project.budget)}
          </div>
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <Clock className="w-3 h-3" />
            {project.timeline_weeks}w
          </div>
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <Users className="w-3 h-3" />
            {project.team_size} people
          </div>
        </div>

        {hasCompletedSim && (
          <div className="flex items-center justify-between mb-4 p-2 bg-zinc-50 rounded-lg">
            <span className="text-xs text-zinc-500">Last simulation</span>
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-semibold ${
                  latestSim.success_probability >= 70
                    ? "text-emerald-600"
                    : latestSim.success_probability >= 50
                    ? "text-amber-600"
                    : "text-red-600"
                }`}
              >
                {latestSim.success_probability}% success
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button asChild size="sm" className="flex-1">
            <Link href={`/simulation/new?projectId=${project.id}`}>
              <Play className="w-3.5 h-3.5" />
              Simulate
            </Link>
          </Button>
          {hasCompletedSim && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/simulation/${latestSim.id}`}>View Report</Link>
            </Button>
          )}
        </div>

        <p className="text-xs text-zinc-400 mt-3">
          Created {formatDate(project.created_at)}
        </p>
      </CardContent>
    </Card>
  );
}
